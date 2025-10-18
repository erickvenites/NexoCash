import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// ... (Suas variáveis de ambiente)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
// ...

// ⬇️ Inicialização Condicional ⬇️
let storage: any = {};
if (typeof window !== 'undefined') {
  // Estamos no navegador (Web) ou em um ambiente de cliente (Mobile).
  storage = AsyncStorage;
} else {
  // Estamos no lado do servidor (SSR/SSG).
  // Use um mock de armazenamento vazio para evitar o erro, pois a sessão
  // real será carregada no cliente.
  storage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Usa o AsyncStorage se estiver no cliente, ou o mock se estiver no servidor
      storage: storage,
      persistSession: true,
      autoRefreshToken: true,
    },
    // ...
  }
);
// ⬆️ Inicialização Condicional ⬆️