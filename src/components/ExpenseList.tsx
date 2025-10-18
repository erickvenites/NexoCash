import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { categoryConfig } from '../utils/categories';
import { EmptyState } from './EmptyState';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onNewExpense?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  onNewExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Nenhum gasto encontrado"
        description="Comece adicionando seu primeiro gasto para começar a controlar suas despesas."
        actionLabel={onNewExpense ? "Adicionar Primeiro Gasto" : undefined}
        onAction={onNewExpense}
      />
    );
  }

  const renderItem = ({ item }: { item: Expense }) => {
    const categoryInfo = categoryConfig[item.category as keyof typeof categoryConfig];
    const IconName = categoryInfo.icon;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: categoryInfo.color + '20' }
            ]}>
              <Feather name={IconName} size={20} color={categoryInfo.color} />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.metaContainer}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                  <Text style={[styles.category, { color: categoryInfo.color }]}>
                    {categoryInfo.label}
                  </Text>
                </View>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.date}>
                  {format(new Date(item.date), "dd 'de' MMMM", { locale: ptBR })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rightContent}>
            <Text style={styles.amount}>
              R$ {item.amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(item)}
          >
            <Feather name="edit-2" size={16} color="#00d4ff" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(item.id)}
          >
            <Feather name="trash-2" size={16} color="#ff3366" />
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.cardGlow, { backgroundColor: categoryInfo.color }]} />
      </View>
    );
  };

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  card: {
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  infoContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  date: {
    fontSize: 12,
    color: '#b4b4c8',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#00d4ff10',
    borderColor: '#00d4ff30',
  },
  editButtonText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff336610',
    borderColor: '#ff336630',
  },
  deleteButtonText: {
    color: '#ff3366',
    fontSize: 13,
    fontWeight: '600',
  },
  cardGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.4,
  },
});