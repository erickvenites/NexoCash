import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Expense } from '../types';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({ expenses }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const difference = currentTotal - lastTotal;
    const percentChange = lastTotal > 0 ? ((difference / lastTotal) * 100) : 0;

    const avgExpense = currentMonthExpenses.length > 0
      ? currentTotal / currentMonthExpenses.length
      : 0;

    return {
      currentTotal,
      lastTotal,
      difference,
      percentChange,
      avgExpense,
      count: currentMonthExpenses.length,
    };
  }, [expenses]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mês Atual</Text>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.value}>R$ {stats.currentTotal.toFixed(2)}</Text>
            <Text style={styles.subtitle}>{stats.count} gastos</Text>
          </View>
          <Feather name="dollar-sign" size={32} color="#3b82f6" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comparação c/ Mês Anterior</Text>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.value}>
              {stats.percentChange > 0 ? '+' : ''}
              {stats.percentChange.toFixed(1)}%
            </Text>
            <Text style={styles.subtitle}>
              R$ {Math.abs(stats.difference).toFixed(2)}
            </Text>
          </View>
          <Feather
            name={stats.percentChange >= 0 ? "trending-up" : "trending-down"}
            size={32}
            color={stats.percentChange >= 0 ? "#ef4444" : "#10b981"}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Média por Gasto</Text>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.value}>R$ {stats.avgExpense.toFixed(2)}</Text>
            <Text style={styles.subtitle}>este mês</Text>
          </View>
          <Feather name="dollar-sign" size={32} color="#10b981" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
