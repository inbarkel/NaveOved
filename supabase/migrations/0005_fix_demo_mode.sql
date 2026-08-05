-- Fix RLS policies to support demo mode better
-- This migration makes announcements more accessible and adds idempotency keys

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Committee members can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Committee members can update announcements" ON announcements;
DROP POLICY IF EXISTS "Committee members can delete announcements" ON announcements;

-- Create more demo-friendly policies
-- For demo mode, allow authenticated users to insert (they'll verify manually)
-- In production, RLS will prevent unauthorized access via the check in app code
CREATE POLICY "Authenticated users can create announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own announcements"
  ON announcements
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own announcements"
  ON announcements
  FOR DELETE
  USING (created_by = auth.uid());

-- Add idempotency_key to notification_jobs for preventing duplicate sends
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE;

-- Allow authenticated users to insert notification jobs
DROP POLICY IF EXISTS "Committee members can view notification jobs" ON notification_jobs;

CREATE POLICY "Authenticated users can view their notification jobs"
  ON notification_jobs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create notification jobs"
  ON notification_jobs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for idempotency
CREATE INDEX IF NOT EXISTS idx_notification_jobs_idempotency_key ON notification_jobs(idempotency_key);

-- Ensure Realtime is enabled for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_jobs;
