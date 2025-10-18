import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/integrations/supabase/client';
import { toast } from '@/src/utils/toast';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  fullName: z.string().trim().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
});

const signInSchema = z.object({
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // ✅ Se já estiver logado, redireciona
  useEffect(() => {
    if (session) {
      router.replace('/(app)/households');
    }
  }, [session]);

  const handleSignUp = async () => {
    try {
      const validatedData = signUpSchema.parse({ email, password, fullName });
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: { full_name: validatedData.fullName },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Conta criada com sucesso!');
        // O AuthContext vai redirecionar automaticamente
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const validatedData = signInSchema.parse({ email, password });
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        // O AuthContext vai redirecionar automaticamente
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Feather name="dollar-sign" size={64} color="#3b82f6" />
          <Text style={styles.title}>Gotham Expenses</Text>
          <Text style={styles.subtitle}>Gerencie suas despesas em família</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, !isSignUp && styles.tabActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>
                Entrar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isSignUp && styles.tabActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.field}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="João Silva"
                  placeholderTextColor="#6b7280"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? isSignUp
                    ? 'Criando...'
                    : 'Entrando...'
                  : isSignUp
                  ? 'Criar Conta'
                  : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0a0e1a',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
  },
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
