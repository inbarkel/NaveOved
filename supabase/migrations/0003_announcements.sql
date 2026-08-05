-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  urgent boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view announcements
CREATE POLICY "Anyone can view announcements"
  ON announcements
  FOR SELECT
  USING (true);

-- Only committee members can insert/update/delete
CREATE POLICY "Committee members can manage announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

CREATE POLICY "Committee members can update announcements"
  ON announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

CREATE POLICY "Committee members can delete announcements"
  ON announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

-- Create notification_jobs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- pending, sent, failed
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;

-- Only committee members can view
CREATE POLICY "Committee members can view notification jobs"
  ON notification_jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_urgent ON announcements(urgent DESC) WHERE urgent = true;
CREATE INDEX IF NOT EXISTS idx_notification_jobs_announcement_id ON notification_jobs(announcement_id);
