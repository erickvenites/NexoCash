-- Add new tables for enhanced functionality

-- Table for budget goals per category
CREATE TABLE IF NOT EXISTS public.budget_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL CHECK (monthly_limit > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, category)
);

-- Enable RLS on budget_goals
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;

-- Budget goals policies
CREATE POLICY "Membros podem ver metas de sua família"
ON public.budget_goals
FOR SELECT
USING (public.is_household_member(household_id, auth.uid()));

CREATE POLICY "Admins podem criar metas"
ON public.budget_goals
FOR INSERT
WITH CHECK (public.is_household_admin(household_id, auth.uid()));

CREATE POLICY "Admins podem atualizar metas"
ON public.budget_goals
FOR UPDATE
USING (public.is_household_admin(household_id, auth.uid()));

CREATE POLICY "Admins podem deletar metas"
ON public.budget_goals
FOR DELETE
USING (public.is_household_admin(household_id, auth.uid()));

-- Table for recurring expenses
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on recurring_expenses
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Recurring expenses policies
CREATE POLICY "Membros podem ver despesas recorrentes"
ON public.recurring_expenses
FOR SELECT
USING (public.is_household_member(household_id, auth.uid()));

CREATE POLICY "Membros podem criar despesas recorrentes"
ON public.recurring_expenses
FOR INSERT
WITH CHECK (
  public.is_household_member(household_id, auth.uid()) 
  AND created_by = auth.uid()
);

CREATE POLICY "Admins podem atualizar despesas recorrentes"
ON public.recurring_expenses
FOR UPDATE
USING (public.is_household_admin(household_id, auth.uid()));

CREATE POLICY "Criadores podem deletar suas despesas recorrentes"
ON public.recurring_expenses
FOR DELETE
USING (created_by = auth.uid() OR public.is_household_admin(household_id, auth.uid()));

-- Add receipt_url column to expenses for storing receipt images
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts - FIX: cast UUID to text for comparison
CREATE POLICY "Membros podem ver recibos de sua família"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] IN (
    SELECT household_id::text 
    FROM household_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Membros podem fazer upload de recibos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] IN (
    SELECT household_id::text 
    FROM household_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar recibos que enviaram"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts'
  AND owner_id::text = auth.uid()::text
);

-- Trigger for updating updated_at on budget_goals
CREATE TRIGGER update_budget_goals_updated_at
BEFORE UPDATE ON public.budget_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updating updated_at on recurring_expenses
CREATE TRIGGER update_recurring_expenses_updated_at
BEFORE UPDATE ON public.recurring_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();