import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { useAuth } from '@/src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { session, loading } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Se estiver autenticado, vai para households
  if (session) {
    return <Redirect href="/(app)/households" />;
  }

  // Se NÃO estiver autenticado, vai para login
  return <Redirect href="/(auth)" />;
}