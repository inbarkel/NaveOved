-- Fix: RLS policies on user_roles subquery user_roles itself, causing
-- "infinite recursion detected in policy for relation user_roles" (42P17)
-- on every read/write anywhere that checks committee/admin status (profiles
-- updates, dependents inserts, useIsCommittee, etc).
--
-- Standard fix: move the role check into a SECURITY DEFINER function, which
-- runs as the function owner and so does not re-trigger RLS on user_roles
-- when queried from within a user_roles (or any other) policy.

CREATE OR REPLACE FUNCTION is_committee_member(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = uid
    AND role IN ('committee', 'super_admin')
    AND revoked_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION is_super_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = uid
    AND role = 'super_admin'
    AND revoked_at IS NULL
  );
$$;

-- user_roles: replace the two self-referencing policies
DROP POLICY IF EXISTS "Committee members can view all roles" ON user_roles;
CREATE POLICY "Committee members can view all roles"
  ON user_roles
  FOR SELECT
  USING (is_committee_member(auth.uid()));

DROP POLICY IF EXISTS "Super admin can manage roles" ON user_roles;
CREATE POLICY "Super admin can manage roles"
  ON user_roles
  FOR ALL
  USING (is_super_admin(auth.uid()));

-- profiles: same underlying issue (subquerying user_roles indirectly
-- re-triggers the recursive policy above), switch to the helper too
DROP POLICY IF EXISTS "Committee can view all profiles" ON profiles;
CREATE POLICY "Committee can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_committee_member(auth.uid()));

DROP POLICY IF EXISTS "Committee can update all profiles" ON profiles;
CREATE POLICY "Committee can update all profiles"
  ON profiles
  FOR UPDATE
  USING (is_committee_member(auth.uid()));

-- committee_invitations: same pattern
DROP POLICY IF EXISTS "Committee members can manage invitations" ON committee_invitations;
CREATE POLICY "Committee members can manage invitations"
  ON committee_invitations
  FOR ALL
  USING (is_committee_member(auth.uid()));

-- announcements: same pattern
DROP POLICY IF EXISTS "Committee members can manage announcements" ON announcements;
CREATE POLICY "Committee members can manage announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (is_committee_member(auth.uid()));

DROP POLICY IF EXISTS "Committee members can update announcements" ON announcements;
CREATE POLICY "Committee members can update announcements"
  ON announcements
  FOR UPDATE
  USING (is_committee_member(auth.uid()));

DROP POLICY IF EXISTS "Committee members can delete announcements" ON announcements;
CREATE POLICY "Committee members can delete announcements"
  ON announcements
  FOR DELETE
  USING (is_committee_member(auth.uid()));

DROP POLICY IF EXISTS "Committee members can view notification jobs" ON notification_jobs;
CREATE POLICY "Committee members can view notification jobs"
  ON notification_jobs
  FOR SELECT
  USING (is_committee_member(auth.uid()));

-- registrations / refund_receipts: same pattern (guarded — migration 0006
-- may not have run yet in every environment)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registrations') THEN
    DROP POLICY IF EXISTS "Committee members can view all registrations" ON registrations;
    CREATE POLICY "Committee members can view all registrations"
      ON registrations FOR SELECT
      USING (is_committee_member(auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refund_receipts') THEN
    DROP POLICY IF EXISTS "Committee members can view all refund receipts" ON refund_receipts;
    CREATE POLICY "Committee members can view all refund receipts"
      ON refund_receipts FOR SELECT
      USING (is_committee_member(auth.uid()));

    DROP POLICY IF EXISTS "Committee members can create refund receipts" ON refund_receipts;
    CREATE POLICY "Committee members can create refund receipts"
      ON refund_receipts FOR INSERT
      WITH CHECK (is_committee_member(auth.uid()));
  END IF;
END $$;
