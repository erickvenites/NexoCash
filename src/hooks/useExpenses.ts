// src/hooks/useExpenses.ts (Versão Completa)

import { useCallback, useEffect, useState } from 'react'; // Adicionamos useCallback
import { supabase } from '../integrations/supabase/client';
import { Expense } from '../types'; // Ajuste o caminho conforme seu projeto
import { toast } from '../utils/toast'; // Ajuste o caminho conforme seu projeto

interface UseExpensesResult {
  expenses: Expense[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export const useExpenses = (householdId: string): UseExpensesResult => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Função de busca envolta em useCallback para estabilidade do useEffect
  const fetchExpenses = useCallback(async () => {
    try {
      // Definimos loading/refreshing no início
      if (expenses.length === 0) setLoading(true);
      setRefreshing(true);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      toast.error('Erro ao carregar despesas');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [householdId]);

  // Função de refresh é um wrapper para o fetch
  const refresh = async () => {
    // Não é estritamente necessário definir setRefreshing(true) aqui, 
    // pois já está dentro de fetchExpenses, mas ajuda na clareza.
    await fetchExpenses(); 
  };

  // 2. useEffect para a carga inicial e Realtime
  useEffect(() => {
    // Chamada inicial (agora feita pelo useCallback)
    fetchExpenses();

    // Lógica de Inscrição em Tempo Real (Realtime)
    const channel = supabase
      .channel(`expenses_changes_${householdId}`) // Nome do canal único
      .on(
        'postgres_changes',
        {
          event: '*', // 'INSERT', 'UPDATE', 'DELETE'
          schema: 'public',
          table: 'expenses',
          filter: `household_id=eq.${householdId}`,
        },
        // 🚨 Ação ao receber uma mudança em tempo real 🚨
        () => {
          // Quando uma mudança ocorre, chamamos o fetch novamente para atualizar o estado
          fetchExpenses(); 
        }
      )
      .subscribe(); // Não se esqueça de chamar o subscribe!

    // 3. Função de Limpeza (Cleanup)
    // É essencial desinscrever (unsubscribe) o canal quando o componente desmonta
    // para evitar vazamentos de memória e múltiplas chamadas.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, fetchExpenses]); // Adicionamos fetchExpenses às dependências do useEffect

  return { expenses, loading, refreshing, refresh };
};