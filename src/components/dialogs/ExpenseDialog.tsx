import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { categoryConfig, ExpenseCategory } from '@/src/utils/categories';
import { BaseModal } from '../Modal';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseFormData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface ExpenseDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormData & { receipt_url?: string }) => void;
  expense?: Expense | null;
  householdId: string;
}

export const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  visible,
  onClose,
  onSave,
  expense,
  householdId,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    category: 'outros',
    date: new Date().toISOString().split('T')[0],
  });
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category as ExpenseCategory,
        date: expense.date,
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: 'outros',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [expense, visible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    onSave({
      ...formData,
      receipt_url: receiptUri || undefined,
    });
    
    onClose();
    setReceiptUri(null);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={expense ? 'Editar Gasto' : 'Novo Gasto'}
      description="Preencha os dados do gasto"
    >
      <View style={modalStyles.form}>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Descrição</Text>
          <TextInput
            style={modalStyles.input}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Ex: Almoço no restaurante"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Valor (R$)</Text>
          <TextInput
            style={modalStyles.input}
            value={formData.amount.toString()}
            onChangeText={(text) => {
              const value = parseFloat(text) || 0;
              setFormData({ ...formData, amount: value });
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#6b7280"
          />
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

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Data</Text>
          <TextInput
            style={modalStyles.input}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Recibo (opcional)</Text>
          <TouchableOpacity style={modalStyles.imageButton} onPress={pickImage}>
            <Feather name="paperclip" size={20} color="#3b82f6" />
            <Text style={modalStyles.imageButtonText}>
              {receiptUri ? 'Alterar Imagem' : 'Anexar Recibo'}
            </Text>
          </TouchableOpacity>
          {receiptUri && (
            <View style={modalStyles.imagePreview}>
              <Feather name="image" size={16} color="#10b981" />
              <Text style={modalStyles.imagePreviewText}>Imagem anexada</Text>
            </View>
          )}
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.cancelButton]}
            onPress={onClose}
          >
            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.submitButton]}
            onPress={handleSubmit}
            disabled={uploading}
          >
            <Text style={modalStyles.submitButtonText}>
              {uploading ? 'Enviando...' : expense ? 'Salvar' : 'Adicionar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};

const modalStyles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  pickerContainer: {
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 12,
    gap: 8,
  },
  imageButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  imagePreviewText: {
    color: '#10b981',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#374151',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
