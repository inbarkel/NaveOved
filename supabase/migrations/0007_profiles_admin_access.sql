-- Ensure RLS is enabled on profiles (safe no-op if already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Residents can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Residents can update their own profile (name, birth date, gender, phone)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Residents can create their own profile row (onboarding)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Committee/super_admin can view every profile (admin dashboard user list)
DROP POLICY IF EXISTS "Committee can view all profiles" ON profiles;
CREATE POLICY "Committee can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
      AND revoked_at IS NULL
    )
  );

-- Committee/super_admin can update any profile (approve/reject residency, status changes)
DROP POLICY IF EXISTS "Committee can update all profiles" ON profiles;
CREATE POLICY "Committee can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
      AND revoked_at IS NULL
    )
  );
