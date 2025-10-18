-- Adjust RLS policies to avoid recursion and allow creators to read/insert immediately

-- household_members: replace SELECT policy to avoid self-reference
DROP POLICY IF EXISTS "Membros podem ver membros de suas famílias" ON public.household_members;
CREATE POLICY "Membros podem ver membros de suas famílias"
ON public.household_members
FOR SELECT
USING (
  -- user can see their own membership rows
  user_id = auth.uid()
  OR
  -- household creator can see all members of their households
  EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.id = household_id AND h.created_by = auth.uid()
  )
);

-- household_members: replace INSERT policy to avoid self-reference to admin function
DROP POLICY IF EXISTS "Criador da família vira admin automaticamente" ON public.household_members;
CREATE POLICY "Criador da família pode adicionar membros (inclui a si)"
ON public.household_members
FOR INSERT
WITH CHECK (
  -- users can add themselves
  user_id = auth.uid()
  OR
  -- household creator can add members
  EXISTS (
    SELECT 1 FROM public.households h
    WHERE h.id = household_id AND h.created_by = auth.uid()
  )
);

-- households: allow creator to view their own households even before membership exists
DROP POLICY IF EXISTS "Membros podem ver suas famílias" ON public.households;
CREATE POLICY "Membros podem ver suas famílias"
ON public.households
FOR SELECT
USING (
  -- creator can always see
  created_by = auth.uid()
  OR
  -- any member can see via membership
  public.is_household_member(id, auth.uid())
);
