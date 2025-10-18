import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ Sem header na tela de auth
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}