import { useAuth } from '@/src/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AppTabsLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // ✅ Proteger rotas autenticadas
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)');
    }
  }, [session, loading]);

  // Se não estiver autenticado, não renderiza nada
  if (!session) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ✅ Sem header nas tabs
        tabBarStyle: {
          backgroundColor: '#1a1f2e',
          borderTopColor: '#374151',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="households"
        options={{
          tabBarLabel: 'Famílias',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Rota dinâmica expenses - oculta das tabs */}
      <Tabs.Screen
        name="expenses"
        options={{
          href: null, // ✅ Não aparece na barra de tabs
        }}
      />
    </Tabs>
  );
}