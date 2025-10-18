-- Fix 1: Restrict profiles table to prevent email harvesting
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a view for household members to see each other's basic info (no emails)
CREATE OR REPLACE VIEW public.household_member_profiles AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.avatar_url
FROM profiles p
INNER JOIN household_members hm ON hm.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM household_members my_households
  WHERE my_households.household_id = hm.household_id
  AND my_households.user_id = auth.uid()
);

GRANT SELECT ON public.household_member_profiles TO authenticated;

-- Fix 2: Create security definer function for role checking (without changing enum)
CREATE OR REPLACE FUNCTION public.is_household_admin(
  _household_id uuid,
  _user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = _household_id
    AND user_id = _user_id
    AND role = 'admin'
  );
$$;

-- Fix 3: Update RLS policies to use explicit table references
DROP POLICY IF EXISTS "Admins podem remover membros" ON public.household_members;
CREATE POLICY "Admins can remove members"
ON public.household_members
FOR DELETE
TO authenticated
USING (
  public.is_household_admin(household_members.household_id, auth.uid())
);

DROP POLICY IF EXISTS "Admins podem atualizar família" ON public.households;
CREATE POLICY "Admins can update household"
ON public.households
FOR UPDATE
TO authenticated
USING (
  public.is_household_admin(households.id, auth.uid())
);

DROP POLICY IF EXISTS "Admins podem deletar família" ON public.households;
CREATE POLICY "Admins can delete household"
ON public.households
FOR DELETE
TO authenticated
USING (
  public.is_household_admin(households.id, auth.uid())
);