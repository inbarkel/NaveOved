-- Resident requests/inquiries to the committee ("פניות לועד").

CREATE TABLE IF NOT EXISTS committee_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  response text,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE committee_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON committee_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON committee_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- is_committee_member() is defined in 0008_fix_user_roles_recursion.sql
CREATE POLICY "Committee can view all requests"
  ON committee_requests FOR SELECT
  USING (is_committee_member(auth.uid()));

CREATE POLICY "Committee can update requests"
  ON committee_requests FOR UPDATE
  USING (is_committee_member(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_committee_requests_user_id ON committee_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_committee_requests_status ON committee_requests(status);
