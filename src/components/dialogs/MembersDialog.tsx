import { Feather } from '@expo/vector-icons';
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

interface Member {
  id: string;
  user_id: string;
  role: string;
  household_member_profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface MembersDialogProps {
  visible: boolean;
  onClose: () => void;
  members: Member[];
  currentUserId: string | null;
  isAdmin: boolean;
  onInvite: (email: string) => void;
  onRemove: (memberId: string, userId: string) => void;
}

export const MembersDialog: React.FC<MembersDialogProps> = ({
  visible,
  onClose,
  members,
  currentUserId,
  isAdmin,
  onInvite,
  onRemove,
}) => {
  const [email, setEmail] = useState('');

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInvite = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite um email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    onInvite(email);
    setEmail('');
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Membros da Família"
      description="Gerencie os membros que podem ver e adicionar despesas"
    >
      <View style={memberStyles.container}>
        {/* Formulário de convite */}
        {isAdmin && (
          <View style={memberStyles.form}>
            <Text style={memberStyles.label}>Convidar por Email</Text>
            <View style={memberStyles.inviteRow}>
              <TextInput
                style={[memberStyles.input, { flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@email.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={memberStyles.inviteButton}
                onPress={handleInvite}
              >
                <Text style={memberStyles.inviteButtonText}>Convidar</Text>
              </TouchableOpacity>
            </View>
            <Text style={memberStyles.helpText}>
              O usuário precisa ter uma conta registrada para ser adicionado
            </Text>
          </View>
        )}

        {/* Lista de membros */}
        <View style={memberStyles.list}>
          <Text style={memberStyles.listTitle}>
            {members.length} {members.length === 1 ? 'Membro' : 'Membros'}
          </Text>

          {members.map((member) => (
            <View key={member.id} style={memberStyles.item}>
              <View style={memberStyles.itemContent}>
                <View style={memberStyles.avatar}>
                  <Text style={memberStyles.avatarText}>
                    {getInitials(member.household_member_profiles?.full_name || '')}
                  </Text>
                </View>
                <View style={memberStyles.memberInfo}>
                  <View style={memberStyles.nameRow}>
                    <Text style={memberStyles.memberName}>
                      {member.household_member_profiles?.full_name || 'Usuário'}
                    </Text>
                    {member.user_id === currentUserId && (
                      <Text style={memberStyles.youBadge}>(Você)</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={memberStyles.itemActions}>
                {member.role === 'admin' ? (
                  <View style={memberStyles.adminBadge}>
                    <Feather name="crown" size={12} color="#fbbf24" />
                    <Text style={memberStyles.adminBadgeText}>Admin</Text>
                  </View>
                ) : (
                  <View style={memberStyles.memberBadge}>
                    <Text style={memberStyles.memberBadgeText}>Membro</Text>
                  </View>
                )}
                
                {isAdmin && member.user_id !== currentUserId && (
                  <TouchableOpacity
                    onPress={() => onRemove(member.id, member.user_id)}
                  >
                    <Feather name="trash-2" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </BaseModal>
  );
};

const memberStyles = StyleSheet.create({
  container: {
    gap: 24,
  },
  form: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: 8,
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
  inviteButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
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
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  youBadge: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0e1a',
  },
  memberBadge: {
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  memberBadgeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
