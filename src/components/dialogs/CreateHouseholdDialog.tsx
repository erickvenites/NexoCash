import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../utils/toast';
import { BaseModal } from '../Modal';

const householdSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().trim().max(500, 'Descrição muito longa').optional(),
});

interface CreateHouseholdDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateHouseholdDialog: React.FC<CreateHouseholdDialogProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      householdSchema.parse(formData);
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: formData.name,
          description: formData.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success('Família criada com sucesso!');
      setFormData({ name: '', description: '' });
      onSuccess();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error('Erro ao criar família');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Criar Nova Família"
      description="Crie um novo grupo para gerenciar despesas compartilhadas"
    >
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome da Família</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Família Silva"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Despesas compartilhadas da família"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Criando...' : 'Criar Família'}
          </Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
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
  textArea: {
    minHeight: 100,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});