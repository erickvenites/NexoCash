-- Fix infinite recursion in household_members and households RLS policies
-- by using SECURITY DEFINER functions instead of direct table references

-- Drop problematic policies
DROP POLICY IF EXISTS "Membros podem ver membros de suas famílias" ON household_members;
DROP POLICY IF EXISTS "Criador da família vira admin automaticamente" ON household_members;
DROP POLICY IF EXISTS "Membros podem ver suas famílias" ON households;

-- Create SECURITY DEFINER function to check if user is member of a household
CREATE OR REPLACE FUNCTION public.is_household_member(_household_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = _household_id
    AND user_id = _user_id
  );
$$;

-- Recreate household_members SELECT policy using the function
CREATE POLICY "Membros podem ver membros de suas famílias"
ON household_members
FOR SELECT
USING (is_household_member(household_id, auth.uid()));

-- Recreate household_members INSERT policy
-- Allow users to insert themselves, or admins to add others
CREATE POLICY "Criador da família vira admin automaticamente"
ON household_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR is_household_admin(household_id, auth.uid())
);

-- Recreate households SELECT policy using the function
CREATE POLICY "Membros podem ver suas famílias"
ON households
FOR SELECT
USING (is_household_member(id, auth.uid()));