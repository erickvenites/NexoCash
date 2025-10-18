-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar função para atualizar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de famílias/grupos
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Criar tabela de membros das famílias
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Criar tabela de gastos no banco
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies para Profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies para Households
CREATE POLICY "Membros podem ver suas famílias"
  ON public.households FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários autenticados podem criar famílias"
  ON public.households FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins podem atualizar família"
  ON public.households FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar família"
  ON public.households FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies para Household Members
CREATE POLICY "Membros podem ver membros de suas famílias"
  ON public.household_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Criador da família vira admin automaticamente"
  ON public.household_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_members.household_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem remover membros"
  ON public.household_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id 
        AND hm.user_id = auth.uid() 
        AND hm.role = 'admin'
    )
  );

-- RLS Policies para Expenses
CREATE POLICY "Membros podem ver gastos de suas famílias"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = expenses.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem criar gastos para suas famílias"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = expenses.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar seus próprios gastos"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios gastos"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_household_members_user ON public.household_members(user_id);
CREATE INDEX idx_expenses_household ON public.expenses(household_id);
CREATE INDEX idx_expenses_user ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date DESC);