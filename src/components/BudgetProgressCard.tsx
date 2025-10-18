import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Expense } from '../types';
import { categoryConfig } from '../utils/categories';

interface BudgetGoal {
  category: string;
  monthly_limit: number;
}

interface BudgetProgressCardProps {
  expenses: Expense[];
  budgetGoals: BudgetGoal[];
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  expenses,
  budgetGoals,
}) => {
  const currentMonthProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgetGoals.map((goal) => {
      const categoryExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category === goal.category &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      });

      const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = (totalSpent / goal.monthly_limit) * 100;
      const isOverBudget = percentage > 100;
      const isNearLimit = percentage > 80 && percentage <= 100;

      return {
        category: goal.category,
        limit: goal.monthly_limit,
        spent: totalSpent,
        percentage: Math.min(percentage, 100),
        isOverBudget,
        isNearLimit,
      };
    });
  }, [expenses, budgetGoals]);

  if (budgetGoals.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="trending-up" size={20} color="#3b82f6" />
        <Text style={styles.title}>Progresso das Metas</Text>
      </View>

      <ScrollView>
        {currentMonthProgress.map((progress) => {
          const config = categoryConfig[progress.category as keyof typeof categoryConfig];
          const IconName = config?.icon || 'more-horizontal';

          return (
            <View key={progress.category} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Feather name={IconName} size={16} color={config?.color} />
                  <Text style={styles.categoryLabel}>{config?.label || progress.category}</Text>
                  {progress.isOverBudget && (
                    <Feather name="alert-triangle" size={16} color="#ef4444" />
                  )}
                </View>
                <Text style={styles.progressAmount}>
                  <Text style={progress.isOverBudget ? styles.overBudget : {}}>
                    R$ {progress.spent.toFixed(2)}
                  </Text>
                  {' / '}
                  R$ {progress.limit.toFixed(2)}
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress.percentage}%`,
                      backgroundColor: progress.isOverBudget
                        ? '#ef4444'
                        : progress.isNearLimit
                        ? '#eab308'
                        : '#3b82f6',
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {progress.isOverBudget && (
                  <Text style={styles.overBudgetText}>
                    {progress.percentage.toFixed(0)}% - Limite ultrapassado!
                  </Text>
                )}
                {progress.isNearLimit && !progress.isOverBudget && (
                  <Text style={styles.nearLimitText}>
                    {progress.percentage.toFixed(0)}% - Próximo do limite
                  </Text>
                )}
                {!progress.isNearLimit && !progress.isOverBudget && (
                  <Text>{progress.percentage.toFixed(0)}% do limite mensal</Text>
                )}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressAmount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  overBudget: {
    color: '#ef4444',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  overBudgetText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  nearLimitText: {
    color: '#eab308',
    fontWeight: '600',
  },
});