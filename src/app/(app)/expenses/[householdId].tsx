import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetProgressCard } from '@/src/components/BudgetProgressCard';
import { ExpenseCard } from '@/src/components/ExpenseCard';
import { ExpenseChart } from '@/src/components/ExpenseChart';
import { ExpenseFilters, FilterState } from '@/src/components/ExpenseFilters';
import { ExpenseList } from '@/src/components/ExpenseList';
import { ExpenseStats } from '@/src/components/ExpenseStats';
import { BudgetGoalsDialog } from '@/src/components/dialogs/BudgetGoalsDialog';
import { ExpenseDialog } from '@/src/components/dialogs/ExpenseDialog';
import { MembersDialog } from '@/src/components/dialogs/MembersDialog';
import { ProfileDialog } from '@/src/components/dialogs/ProfileDialog';
import { RecurringExpensesDialog } from '@/src/components/dialogs/RecurringExpensesDialog';
import { useExpenses } from '@/src/hooks/useExpenses';
import { supabase } from '@/src/integrations/supabase/client';
import { Expense, ExpenseFormData } from '@/src/types';
import { categoryConfig } from '@/src/utils/categories';
import { toast } from '@/src/utils/toast';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';

const ExpensesPage: React.FC = () => {
  const { householdId } = useLocalSearchParams<{ householdId: string }>(); 
  const router = useRouter();

  if (!householdId) {
    router.back(); 
    return null;
  }

  const { expenses, loading, refreshing, refresh } = useExpenses(householdId);
  
  const [householdName, setHouseholdName] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  
  const [expenseDialogVisible, setExpenseDialogVisible] = useState(false);
  const [membersDialogVisible, setMembersDialogVisible] = useState(false);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
  const [recurringDialogVisible, setRecurringDialogVisible] = useState(false);
  
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    startDate: undefined,
    endDate: undefined,
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    fetchAllData();
  }, [householdId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchHousehold(),
      fetchMembers(),
      fetchBudgetGoals(),
      fetchRecurringExpenses(),
      fetchCurrentUser(),
    ]);
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: member } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      setCurrentUser({ ...user, ...profile });
      setCurrentUserRole(member?.role || 'member');
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const fetchHousehold = async () => {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('name')
        .eq('id', householdId)
        .single();

      if (error) throw error;
      if (data) setHouseholdName(data.name);
    } catch (error) {
      toast.error('Erro ao carregar família');
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          role,
          household_member_profiles:profiles!household_members_user_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('household_id', householdId);

      if (error) throw error;
      if (data) setMembers(data);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
    }
  };

  const fetchBudgetGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .select('*')
        .eq('household_id', householdId);

      if (error) throw error;
      if (data) setBudgetGoals(data);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    }
  };

  const fetchRecurringExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRecurringExpenses(data);
    } catch (error) {
      console.error('Erro ao buscar despesas recorrentes:', error);
    }
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(grouped).sort(([, a], [, b]) => b - a)[0];
    return topCategory
      ? { category: topCategory[0], amount: topCategory[1] }
      : null;
  }, [expenses]);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    }).length;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.category !== 'all' && expense.category !== filters.category) {
        return false;
      }
      if (filters.startDate && new Date(expense.date) < filters.startDate) {
        return false;
      }
      if (filters.endDate && new Date(expense.date) > filters.endDate) {
        return false;
      }
      if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      return true;
    });
  }, [expenses, filters]);

  const handleSave = async (data: ExpenseFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingExpense.id);

        if (error) throw error;
        toast.success('Gasto atualizado!');
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({ ...data, household_id: householdId, user_id: user.id });

        if (error) throw error;
        toast.success('Gasto adicionado!');
      }
      
      setExpenseDialogVisible(false);
      setEditingExpense(null);
      refresh();
    } catch (error) {
      toast.error('Erro ao salvar gasto');
      console.error(error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseDialogVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('expenses').delete().eq('id', id);
              if (error) throw error;
              
              toast.success('Gasto removido!');
              refresh();
            } catch (error) {
              toast.error('Erro ao remover gasto');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleNewExpense = () => {
    setEditingExpense(null);
    setExpenseDialogVisible(true);
  };

  const handleAddBudgetGoal = async (data: { category: string; monthly_limit: number }) => {
    try {
      const { error } = await supabase
        .from('budget_goals')
        .insert({
          household_id: householdId,
          category: data.category,
          monthly_limit: data.monthly_limit,
        });

      if (error) throw error;
      toast.success('Meta adicionada!');
      fetchBudgetGoals();
    } catch (error) {
      toast.error('Erro ao adicionar meta');
      console.error(error);
    }
  };

  const handleDeleteBudgetGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Meta removida!');
      fetchBudgetGoals();
    } catch (error) {
      toast.error('Erro ao remover meta');
      console.error(error);
    }
  };

  const handleAddRecurring = async (data: any) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .insert({
          household_id: householdId,
          ...data,
          is_active: true,
        });

      if (error) throw error;
      toast.success('Despesa recorrente adicionada!');
      fetchRecurringExpenses();
    } catch (error) {
      toast.error('Erro ao adicionar despesa recorrente');
      console.error(error);
    }
  };

  const handleToggleRecurring = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentState ? 'Desativada' : 'Ativada');
      fetchRecurringExpenses();
    } catch (error) {
      toast.error('Erro ao atualizar');
      console.error(error);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Despesa recorrente removida!');
      fetchRecurringExpenses();
    } catch (error) {
      toast.error('Erro ao remover');
      console.error(error);
    }
  };

  const handleInviteMember = async (email: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profile) {
        toast.error('Usuário não encontrado');
        return;
      }

      const { error } = await supabase
        .from('household_members')
        .insert({
          household_id: householdId,
          user_id: profile.id,
          role: 'member',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Usuário já é membro');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Membro adicionado!');
      fetchMembers();
    } catch (error) {
      toast.error('Erro ao adicionar membro');
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Membro removido!');
      fetchMembers();
    } catch (error) {
      toast.error('Erro ao remover membro');
      console.error(error);
    }
  };

  const handleSaveProfile = async (data: { full_name: string; email: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Perfil atualizado!');
      fetchCurrentUser();
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    }
  };

  const topCategoryInfo = expensesByCategory
    ? categoryConfig[expensesByCategory.category as keyof typeof categoryConfig]
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{householdName}</Text>
            <Text style={styles.subtitle}>{expenses.length} gastos registrados</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.headerButtons}
          contentContainerStyle={styles.headerButtonsContent}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setMembersDialogVisible(true)}
          >
            <Feather name="users" size={16} color="#a1a1aa" />
            <Text style={styles.headerButtonText}>
              {members.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setProfileDialogVisible(true)}
          >
            <Feather name="user" size={16} color="#a1a1aa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setBudgetDialogVisible(true)}
          >
            <Feather name="target" size={16} color="#a1a1aa" />
            <Text style={styles.headerButtonText}>Metas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setRecurringDialogVisible(true)}
          >
            <Feather name="repeat" size={16} color="#a1a1aa" />
            <Text style={styles.headerButtonText}>Fixas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              refresh();
              fetchAllData();
            }}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        <View style={styles.section}>
          <ExpenseCard
            title="Total de Gastos"
            value={`R$ ${totalExpenses.toFixed(2)}`}
            icon="dollar-sign"
            iconColor="#3b82f6"
          />
          <ExpenseCard
            title="Categoria Mais Gasta"
            value={topCategoryInfo ? topCategoryInfo.label : 'Nenhuma'}
            icon={topCategoryInfo?.icon || 'trending-down'}
            iconColor={topCategoryInfo?.color || '#71717a'}
          />
          <ExpenseCard
            title="Gastos Este Mês"
            value={thisMonthExpenses.toString()}
            icon="calendar"
            iconColor="#10b981"
          />
        </View>

        {budgetGoals.length > 0 && (
          <BudgetProgressCard expenses={expenses} budgetGoals={budgetGoals} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise Detalhada</Text>
          <ExpenseStats expenses={expenses} />
        </View>

        {expenses.length > 0 && (
          <View style={styles.section}>
            <ExpenseChart expenses={expenses} />
          </View>
        )}

        <ExpenseFilters filters={filters} onFiltersChange={setFilters} />

        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              Seus Gastos
              {filteredExpenses.length !== expenses.length &&
                ` (${filteredExpenses.length})`}
            </Text>
          </View>
          <ExpenseList
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNewExpense={handleNewExpense}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleNewExpense}>
        <Feather name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      <ExpenseDialog
        visible={expenseDialogVisible}
        onClose={() => {
          setExpenseDialogVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleSave}
        expense={editingExpense}
        householdId={householdId}
      />

      <MembersDialog
        visible={membersDialogVisible}
        onClose={() => setMembersDialogVisible(false)}
        members={members}
        currentUserId={currentUser?.id || null}
        isAdmin={currentUserRole === 'admin'}
        onInvite={handleInviteMember}
        onRemove={handleRemoveMember}
      />

      <ProfileDialog
        visible={profileDialogVisible}
        onClose={() => setProfileDialogVisible(false)}
        onSave={handleSaveProfile}
        profile={{
          full_name: currentUser?.full_name || '',
          email: currentUser?.email || '',
        }}
      />

      <BudgetGoalsDialog
        visible={budgetDialogVisible}
        onClose={() => setBudgetDialogVisible(false)}
        goals={budgetGoals}
        onAdd={handleAddBudgetGoal}
        onDelete={handleDeleteBudgetGoal}
      />

      <RecurringExpensesDialog
        visible={recurringDialogVisible}
        onClose={() => setRecurringDialogVisible(false)}
        expenses={recurringExpenses}
        onAdd={handleAddRecurring}
        onToggle={handleToggleRecurring}
        onDelete={handleDeleteRecurring}
      />
    </SafeAreaView>
  );
};

export default ExpensesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  headerButtons: {
    maxHeight: 40,
  },
  headerButtonsContent: {
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  listHeader: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});