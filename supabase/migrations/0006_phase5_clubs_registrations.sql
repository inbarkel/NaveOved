-- Phase 5: Clubs/Activities and Registrations with Refund Policy

-- Update clubs_events table with refund policy
ALTER TABLE clubs_events ADD COLUMN IF NOT EXISTS refund_policy text DEFAULT 'no_refund_for_paid';
ALTER TABLE clubs_events ADD COLUMN IF NOT EXISTS cancellation_notes text;
ALTER TABLE clubs_events ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'activity' CHECK (event_type IN ('club', 'activity'));

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES clubs_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_kind text NOT NULL CHECK (participant_kind IN ('self', 'dependent')),
  dependent_id uuid REFERENCES dependents(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded', 'waitlisted')),
  amount_paid decimal(10, 2),
  paid_at timestamp with time zone,
  refund_eligible_until timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id, participant_kind, dependent_id)
);

-- Create refund_receipts table for audit trail
CREATE TABLE IF NOT EXISTS refund_receipts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  refund_status text NOT NULL DEFAULT 'pending' CHECK (refund_status IN ('pending', 'completed', 'failed')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_receipts ENABLE ROW LEVEL SECURITY;

-- Registrations policies
CREATE POLICY "Users can view their own registrations"
  ON registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Committee members can view all registrations"
  ON registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can register for events"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can cancel their own registrations"
  ON registrations FOR UPDATE
  USING (user_id = auth.uid() AND status != 'refunded');

-- Refund receipts policies
CREATE POLICY "Users can view their own refund receipts"
  ON refund_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = refund_receipts.registration_id
      AND registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Committee members can view all refund receipts"
  ON refund_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

CREATE POLICY "Committee members can create refund receipts"
  ON refund_receipts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_refund_eligible ON registrations(refund_eligible_until) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS idx_refund_receipts_registration_id ON refund_receipts(registration_id);
CREATE INDEX IF NOT EXISTS idx_refund_receipts_status ON refund_receipts(refund_status);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE refund_receipts;
