import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseModal } from '../Modal';

interface ProfileDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { full_name: string; email: string }) => void;
  profile: { full_name: string; email: string };
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  visible,
  onClose,
  onSave,
  profile,
}) => {
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile, visible]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Meu Perfil"
      description="Atualize suas informações pessoais"
    >
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(formData.full_name)}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholder="João Silva"
            placeholderTextColor="#71717a"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.email}
            editable={false}
          />
          <Text style={styles.helpText}>
            O email não pode ser alterado
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
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
  disabledInput: {
    opacity: 0.5,
  },
  helpText: {
    fontSize: 12,
    color: '#71717a',
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
    borderColor: '#27272a',
  },
  cancelButtonText: {
    color: '#a1a1aa',
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