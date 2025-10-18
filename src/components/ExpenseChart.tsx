import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { categoryConfig } from '../utils/categories';

const screenWidth = Dimensions.get('window').width;

interface ExpenseChartProps {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const categoryData = useMemo(() => {
    if (expenses.length === 0) return [];

    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([category, amount]) => ({
      name: categoryConfig[category as keyof typeof categoryConfig]?.label || category,
      population: amount,
      color: categoryConfig[category as keyof typeof categoryConfig]?.color || '#71717a',
      legendFontColor: '#a1a1aa',
      legendFontSize: 11,
    }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    if (expenses.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const grouped = expenses.reduce((acc, expense) => {
      try {
        const month = format(new Date(expense.date), 'MMM', { locale: ptBR });
        acc[month] = (acc[month] || 0) + expense.amount;
      } catch (error) {
        console.error('Erro ao formatar data:', error);
      }
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(grouped).slice(-6);
    
    if (entries.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }
    
    return {
      labels: entries.map(([month]) => month),
      datasets: [{ 
        data: entries.map(([, total]) => total),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      }],
    };
  }, [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  const chartConfig = {
    backgroundColor: '#0a0a0a',
    backgroundGradientFrom: '#0a0a0a',
    backgroundGradientTo: '#0a0a0a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#27272a',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
  };

  return (
    <View style={styles.container}>
      {/* Gráfico de Pizza - Categorias */}
      {categoryData.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Gastos por Categoria</Text>
          </View>
          <PieChart
            data={categoryData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
            hasLegend={true}
          />
        </View>
      )}

      {/* Gráfico de Barras - Evolução Mensal */}
      {monthlyData.datasets[0].data.some(val => val > 0) && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Evolução Mensal</Text>
          </View>
          <BarChart
            data={monthlyData}
            width={screenWidth - 64}
            height={200}
            yAxisLabel="R$"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero
            withInnerLines={true}
            segments={4}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  chart: {
    borderRadius: 12,
  },
});