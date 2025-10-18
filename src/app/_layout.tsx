import { AuthProvider } from '@/src/contexts/AuthContext';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,  // ✅ Remove TODOS os headers
          animation: 'fade',    // Transição suave
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(app)" 
          options={{ headerShown: false }} 
        />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}