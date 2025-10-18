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
  View,
} from 'react-native';
import { BaseModal } from '../Modal';

interface BudgetGoal {
  id: string;
  category: string;
  monthly_limit: number;
}

interface BudgetGoalsDialogProps {
  visible: boolean;
  onClose: () => void;
  goals: BudgetGoal[];
  onAdd: (data: { category: string; monthly_limit: number }) => void;
  onDelete: (id: string) => void;
}

export const BudgetGoalsDialog: React.FC<BudgetGoalsDialogProps> = ({
  visible,
  onClose,
  goals,
  onAdd,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    category: 'outros' as ExpenseCategory,
    monthly_limit: '',
  });

  const availableCategories = Object.entries(categoryConfig).filter(
    ([key]) => !goals.some((goal) => goal.category === key)
  );

  const handleSubmit = () => {
    const limit = parseFloat(formData.monthly_limit);
    
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Erro', 'O limite deve ser maior que zero');
      return;
    }

    onAdd({
      category: formData.category,
      monthly_limit: limit,
    });

    setFormData({
      category: availableCategories.length > 1 ? availableCategories[1][0] as ExpenseCategory : 'outros',
      monthly_limit: '',
    });
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Metas de Gastos"
      description="Defina limites mensais para cada categoria de despesa"
    >
      <View style={styles.container}>
        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  style={styles.picker}
                  enabled={availableCategories.length > 0}
                  dropdownIconColor="#a1a1aa"
                >
                  {availableCategories.map(([key, config]) => (
                    <Picker.Item 
                      key={key} 
                      label={config.label} 
                      value={key}
                      color="#ffffff"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Limite Mensal (R$)</Text>
              <TextInput
                style={styles.input}
                value={formData.monthly_limit}
                onChangeText={(text) => setFormData({ ...formData, monthly_limit: text })}
                keyboardType="decimal-pad"
                placeholder="1000.00"
                placeholderTextColor="#71717a"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, availableCategories.length === 0 && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={availableCategories.length === 0}
          >
            <Feather name="plus" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar Meta</Text>
          </TouchableOpacity>
          
          {availableCategories.length === 0 && (
            <Text style={styles.helpText}>
              Todas as categorias já possuem metas definidas
            </Text>
          )}
        </View>

        {/* Lista de metas */}
        <View style={styles.list}>
          <Text style={styles.listTitle}>
            {goals.length} {goals.length === 1 ? 'Meta Configurada' : 'Metas Configuradas'}
          </Text>

          {goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="target" size={48} color="#52525b" />
              <Text style={styles.emptyText}>
                Nenhuma meta configurada ainda
              </Text>
            </View>
          ) : (
            goals.map((goal) => {
              const config = categoryConfig[goal.category as keyof typeof categoryConfig];
              const IconName = config?.icon || 'target';

              return (
                <View key={goal.id} style={styles.item}>
                  <View style={styles.itemContent}>
                    <View style={[styles.itemIcon, { backgroundColor: config?.color + '20' }]}>
                      <Feather name={IconName} size={18} color={config?.color} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>
                        {config?.label || goal.category}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        Limite: R$ {goal.monthly_limit.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        'Excluir meta',
                        'Tem certeza que deseja excluir esta meta?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Excluir', 
                            style: 'destructive',
                            onPress: () => onDelete(goal.id)
                          },
                        ]
                      );
                    }}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  form: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    paddingBottom: 20,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  pickerContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: '#0a0a0a',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#71717a',
    fontSize: 14,
  },
  item: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  deleteButton: {
    padding: 8,
  },
});