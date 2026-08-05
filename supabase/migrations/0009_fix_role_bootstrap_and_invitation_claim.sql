-- Fixes found while testing the real onboarding flow end-to-end:
--
-- 1. user_roles had a stray, undocumented "Super admins can view roles"
--    policy that still subqueried user_roles from itself (same recursion
--    bug 0008 fixed elsewhere) - it was redundant with the already-fixed
--    "Committee members can view all roles" policy, so it's dropped. The
--    basic "Users can view their own roles" policy was also missing
--    entirely, so it's re-added.
--
-- 2. committee_invitations had no policy letting a brand-new (not yet
--    committee) user UPDATE their own invitation row to claim it - only
--    existing committee members could write to the table, a chicken-and-
--    egg problem since claiming the invitation is exactly what makes them
--    a committee member. The public "anyone can view invitation status by
--    phone" policy had also gone missing (only the committee-manage policy
--    existed), so a fresh user's invitation lookup silently returned no
--    rows even for a real, pending invitation.
--
-- 3. user_roles had no INSERT policy at all, so no user - resident or
--    committee - could ever get their first role assigned during
--    onboarding; the insert was silently rejected by RLS. The new INSERT
--    policy only allows self-assigning 'resident' unconditionally, or
--    'committee' only if the user has just claimed a matching invitation -
--    it deliberately does NOT allow inserting 'super_admin', which must
--    still be granted manually by an existing super_admin.

DROP POLICY IF EXISTS "Super admins can view roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view invitation status by phone" ON committee_invitations;
CREATE POLICY "Anyone can view invitation status by phone"
  ON committee_invitations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can claim their own pending invitation" ON committee_invitations;
CREATE POLICY "Users can claim their own pending invitation"
  ON committee_invitations FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (claimed_by_user_id = auth.uid() AND status = 'claimed');

DROP POLICY IF EXISTS "Users can self-assign initial role" ON user_roles;
CREATE POLICY "Users can self-assign initial role"
  ON user_roles FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      role = 'resident'
      OR (
        role = 'committee'
        AND EXISTS (
          SELECT 1 FROM committee_invitations
          WHERE claimed_by_user_id = auth.uid()
          AND status = 'claimed'
        )
      )
    )
  );
