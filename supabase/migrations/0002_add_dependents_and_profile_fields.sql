-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender text; -- 'male', 'female', 'other'

-- Create dependents table
CREATE TABLE IF NOT EXISTS dependents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  gender text, -- 'male', 'female', 'other'
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(profile_id, full_name, birth_date)
);

-- Enable RLS on dependents
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own dependents
CREATE POLICY "Users can view their own dependents"
  ON dependents
  FOR SELECT
  USING (auth.uid() = profile_id);

-- RLS: Users can insert their own dependents
CREATE POLICY "Users can insert their own dependents"
  ON dependents
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- RLS: Users can update their own dependents
CREATE POLICY "Users can update their own dependents"
  ON dependents
  FOR UPDATE
  USING (auth.uid() = profile_id);

-- RLS: Users can delete their own dependents
CREATE POLICY "Users can delete their own dependents"
  ON dependents
  FOR DELETE
  USING (auth.uid() = profile_id);

-- Create committee_invitations table for pre-registered users
CREATE TABLE IF NOT EXISTS committee_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_e164 text NOT NULL UNIQUE, -- e.g., +972541234567
  full_name text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'claimed', 'rejected'
  claimed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '1 year')
);

-- Enable RLS on committee_invitations
ALTER TABLE committee_invitations ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can check if their phone is invited (for signup)
CREATE POLICY "Anyone can view invitation status by phone"
  ON committee_invitations
  FOR SELECT
  USING (true);

-- RLS: Committee members can manage invitations (backend only)
CREATE POLICY "Committee members can manage invitations"
  ON committee_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('committee', 'super_admin')
    )
  );
