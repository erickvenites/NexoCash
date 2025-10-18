import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { categoryConfig } from '../utils/categories';

export interface FilterState {
  category: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  minAmount: string;
  maxAmount: string;
}

interface ExpenseFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      category: 'all',
      startDate: undefined,
      endDate: undefined,
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount;

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Feather name="filter" size={20} color="#ffffff" />
          <Text style={styles.toggleText}>
            Filtros {hasActiveFilters ? `(${activeFiltersCount})` : ''}
          </Text>
          <Feather 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#a1a1aa" 
          />
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity onPress={handleReset} style={styles.clearButton}>
            <Feather name="x" size={16} color="#a1a1aa" />
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.category}
                onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
                style={styles.picker}
                dropdownIconColor="#a1a1aa"
              >
                <Picker.Item label="Todas" value="all" color="#ffffff" />
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Picker.Item key={key} label={config.label} value={key} color="#ffffff" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data Inicial</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Feather name="calendar" size={16} color="#a1a1aa" />
              <Text style={styles.dateButtonText}>
                {filters.startDate ? format(filters.startDate, 'dd/MM/yy') : 'Selecionar'}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={filters.startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) {
                    onFiltersChange({ ...filters, startDate: date });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data Final</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Feather name="calendar" size={16} color="#a1a1aa" />
              <Text style={styles.dateButtonText}>
                {filters.endDate ? format(filters.endDate, 'dd/MM/yy') : 'Selecionar'}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={filters.endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) {
                    onFiltersChange({ ...filters, endDate: date });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Min R$</Text>
              <TextInput
                style={styles.input}
                value={filters.minAmount}
                onChangeText={(text) => onFiltersChange({ ...filters, minAmount: text })}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#71717a"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Max R$</Text>
              <TextInput
                style={styles.input}
                value={filters.maxAmount}
                onChangeText={(text) => onFiltersChange({ ...filters, maxAmount: text })}
                keyboardType="decimal-pad"
                placeholder="9999"
                placeholderTextColor="#71717a"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
  },
  clearText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  content: {
    marginTop: 16,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});