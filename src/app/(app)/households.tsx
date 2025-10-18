import { CreateHouseholdDialog } from '@/src/components/dialogs/CreateHouseholdDialog';
import { ProfileDialog } from '@/src/components/dialogs/ProfileDialog';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/integrations/supabase/client';
import { toast } from '@/src/utils/toast';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Household {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const HouseholdsScreen: React.FC = () => {
  const router = useRouter();
  const { signOut, session } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      router.replace('/(auth)');
    }
  }, [session]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser({ ...user, ...profile });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const fetchHouseholds = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('household_members')
        .select('household_id, households(id, name, description, created_at)')
        .eq('user_id', user.id);

      if (error) throw error;

      const householdList = data
        .map((item: any) => item.households)
        .filter(Boolean) as Household[];

      setHouseholds(householdList);
    } catch (error) {
      toast.error('Erro ao carregar famílias');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHouseholds();
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          toast.success('Logout realizado!');
        },
      },
    ]);
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

  const renderHousehold = ({ item }: { item: Household }) => (
    <TouchableOpacity
      style={styles.householdCard}
      onPress={() => router.push(`/(app)/expenses/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Feather name="users" size={20} color="#00d4ff" />
        </View>
        <Text style={styles.householdName}>{item.name}</Text>
        <Feather name="chevron-right" size={20} color="#b4b4c8" />
      </View>
      <Text style={styles.householdDescription}>
        {item.description || 'Sem descrição'}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.dateBadge}>
          <Feather name="calendar" size={12} color="#b4b4c8" />
          <Text style={styles.householdDate}>
            {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
      <View style={styles.cardGlow} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <TouchableOpacity
      style={styles.createCard}
      onPress={() => setCreateDialogVisible(true)}
      activeOpacity={0.8}
    >
      <View style={styles.createIconContainer}>
        <Feather name="plus" size={32} color="#00d4ff" />
      </View>
      <Text style={styles.createTitle}>Criar Nova Família</Text>
      <Text style={styles.createSubtitle}>Comece a gerenciar suas despesas</Text>
    </TouchableOpacity>
  );

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Feather name="home" size={28} color="#00d4ff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Minhas Famílias</Text>
            <Text style={styles.headerSubtitle}>
              {households.length} {households.length === 1 ? 'família' : 'famílias'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setProfileDialogVisible(true)}
          >
            <Feather name="user" size={20} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#ff3366" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={households}
        renderItem={renderHousehold}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#00d4ff"
          />
        }
      />

      <CreateHouseholdDialog
        visible={createDialogVisible}
        onClose={() => setCreateDialogVisible(false)}
        onSuccess={() => {
          setCreateDialogVisible(false);
          fetchHouseholds();
        }}
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
    </SafeAreaView>
  );
};

export default HouseholdsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00d4ff20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00d4ff30',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#b4b4c8',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  list: {
    padding: 16,
  },
  createCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2d2d44',
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  createIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#00d4ff10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00d4ff30',
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  createSubtitle: {
    fontSize: 14,
    color: '#b4b4c8',
  },
  householdCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2d44',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#00d4ff20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00d4ff30',
  },
  householdName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  householdDescription: {
    fontSize: 14,
    color: '#b4b4c8',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16213e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  householdDate: {
    fontSize: 12,
    color: '#b4b4c8',
  },
  cardGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00d4ff',
    opacity: 0.5,
  },
});