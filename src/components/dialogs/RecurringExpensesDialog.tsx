import { categoryConfig, ExpenseCategory } from '@/src/utils/categories';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BaseModal } from '../Modal';

interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  day_of_month: number;
  is_active: boolean;
}

interface RecurringExpensesDialogProps {
  visible: boolean;
  onClose: () => void;
  expenses: RecurringExpense[];
  onAdd: (data: Omit<RecurringExpense, 'id' | 'is_active'>) => void;
  onToggle: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
}

export const RecurringExpensesDialog: React.FC<RecurringExpensesDialogProps> = ({
  visible,
  onClose,
  expenses,
  onAdd,
  onToggle,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'outros' as ExpenseCategory,
    day_of_month: '1',
  });

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    const day = parseInt(formData.day_of_month);
    if (day < 1 || day > 31) {
      Alert.alert('Erro', 'Dia do mês deve estar entre 1 e 31');
      return;
    }

    onAdd({
      description: formData.description,
      amount,
      category: formData.category,
      day_of_month: day,
    });

    setFormData({
      description: '',
      amount: '',
      category: 'outros',
      day_of_month: '1',
    });
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Despesas Recorrentes"
      description="Configure gastos fixos mensais (aluguel, contas, assinaturas, etc)"
    >
      <View style={recurringStyles.container}>
        {/* Formulário */}
        <View style={recurringStyles.form}>
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Descrição</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Aluguel do apartamento"
              placeholderTextColor="#6b7280"
            />
          </View>

          <View style={recurringStyles.row}>
            <View style={[modalStyles.field, { flex: 1 }]}>
              <Text style={modalStyles.label}>Valor (R$)</Text>
              <TextInput
                style={modalStyles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="decimal-pad"
                placeholder="1500.00"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={[modalStyles.field, { flex: 1 }]}>
              <Text style={modalStyles.label}>Dia do Mês</Text>
              <TextInput
                style={modalStyles.input}
                value={formData.day_of_month}
                onChangeText={(text) => setFormData({ ...formData, day_of_month: text })}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Categoria</Text>
            <View style={modalStyles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                style={modalStyles.picker}
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Picker.Item key={key} label={config.label} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={recurringStyles.addButton}
            onPress={handleSubmit}
          >
            <Text style={recurringStyles.addButtonText}>Adicionar Despesa</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de despesas */}
        <View style={recurringStyles.list}>
          <Text style={recurringStyles.listTitle}>
            {expenses.length} {expenses.length === 1 ? 'Despesa Cadastrada' : 'Despesas Cadastradas'}
          </Text>

          {expenses.length === 0 ? (
            <Text style={recurringStyles.emptyText}>
              Nenhuma despesa recorrente cadastrada ainda
            </Text>
          ) : (
            expenses.map((expense) => {
              const config = categoryConfig[expense.category as keyof typeof categoryConfig];
              const IconName = config?.icon || 'repeat';

              return (
                <View
                  key={expense.id}
                  style={[
                    recurringStyles.item,
                    !expense.is_active && recurringStyles.itemInactive,
                  ]}
                >
                  <View style={recurringStyles.itemContent}>
                    <Feather name={IconName} size={20} color={config?.color} />
                    <View style={recurringStyles.itemInfo}>
                      <Text style={recurringStyles.itemTitle}>
                        {expense.description}
                      </Text>
                      <Text style={recurringStyles.itemSubtitle}>
                        R$ {expense.amount.toFixed(2)} • Dia {expense.day_of_month} de cada mês
                      </Text>
                    </View>
                  </View>

                  <View style={recurringStyles.itemActions}>
                    <TouchableOpacity
                      onPress={() => onToggle(expense.id, expense.is_active)}
                      style={recurringStyles.toggleButton}
                    >
                      <Feather
                        name={expense.is_active ? 'toggle-right' : 'toggle-left'}
                        size={24}
                        color={expense.is_active ? '#10b981' : '#6b7280'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(expense.id)}>
                      <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </BaseModal>
  );
};

const recurringStyles = StyleSheet.create({
  container: {
    gap: 24,
  },
  form: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 32,
  },
  item: {
    backgroundColor: '#0a0e1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInactive: {
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    padding: 4,
  },
});

const modalStyles = StyleSheet.create({
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#374151', // Um cinza escuro
    },
    // ⬇️ ESTILOS DO PICKER ADICIONADOS AQUI ⬇️
    pickerContainer: {
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden', // Importante para que a borda funcione no Android/iOS
        backgroundColor: '#ffffff',
    },
    picker: {
        // Estilo específico do componente Picker, pode ser simples
        height: 40,
        width: '100%',
    },
    // ⬆️ ESTILOS DO PICKER ADICIONADOS AQUI ⬆️
    input: {
        height: 40,
        borderColor: '#d1d5db', // Um cinza claro para a borda
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#ffffff',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        gap: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    cancelButton: {
        backgroundColor: '#e5e7eb', // Cinza claro
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#10b981', // Verde
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
});