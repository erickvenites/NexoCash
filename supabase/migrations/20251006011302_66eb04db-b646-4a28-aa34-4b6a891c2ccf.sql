-- Fix SECURITY DEFINER view issue
-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.household_member_profiles;

-- Recreate as SECURITY INVOKER (default) with proper filtering
CREATE VIEW public.household_member_profiles AS 
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

-- Grant SELECT to authenticated users (view now respects RLS on underlying tables)
GRANT SELECT ON public.household_member_profiles TO authenticated;