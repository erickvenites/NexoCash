-- Fix SECURITY DEFINER view issue by recreating as SECURITY INVOKER
-- This ensures the view respects RLS policies of the querying user

DROP VIEW IF EXISTS public.household_member_profiles;

CREATE VIEW public.household_member_profiles
WITH (security_invoker = true)
AS
SELECT DISTINCT 
  p.id,
  p.full_name,
  p.avatar_url
FROM profiles p
INNER JOIN household_members hm ON hm.user_id = p.id
WHERE EXISTS (
  SELECT 1 
  FROM household_members my_households 
  WHERE my_households.household_id = hm.household_id 
    AND my_households.user_id = auth.uid()
);

-- Grant SELECT to authenticated users (view now respects RLS through SECURITY INVOKER)
GRANT SELECT ON public.household_member_profiles TO authenticated;