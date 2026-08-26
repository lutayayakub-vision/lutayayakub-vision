/*
# Fix infinite recursion in profiles RLS policy

The `profiles_select_admin` policy queries `profiles` from within a policy
on `profiles`, causing infinite recursion. Replace it with a SECURITY
DEFINER function that bypasses RLS to check the admin role.
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- Create a SECURITY DEFINER function that checks if the current user is an admin
-- This runs with the owner's privileges, bypassing RLS, so no recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Re-create the admin SELECT policy using the function instead of a subquery
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());
