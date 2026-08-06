-- Important phone numbers ("מספרי טלפון חשובים"), editable by the committee
-- instead of hardcoded in the page.

CREATE TABLE IF NOT EXISTS contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contacts"
  ON contacts FOR SELECT
  USING (true);

-- is_committee_member() is defined in 0008_fix_user_roles_recursion.sql
CREATE POLICY "Committee can manage contacts"
  ON contacts FOR ALL
  USING (is_committee_member(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category, sort_order);

INSERT INTO contacts (category, name, phone, sort_order) VALUES
  ('המושב', 'מזכירות המושב', '04-6750042', 1),
  ('המושב', 'אבישג - יו״ר הועד', '054-6388485', 2),
  ('המושב', 'עליזה - מנהלת הקהילה', '050-7799947', 3),
  ('מכולות', 'מכולת נווה עובד - דוד', '054-4450372', 1),
  ('מכולות', 'ניני פיצוצייה', '050-8552505', 2),
  ('שירותי רפואה', 'טיפת חלב', '04-6752043', 1),
  ('שירותי רפואה', 'מרפאה', '04-6750843', 2),
  ('מועצה', 'קב״ט - משרד', '04-6757640', 1),
  ('מועצה', 'קב״ט - סלולרי', '050-6272609', 2),
  ('בית חולים פוריה', 'דלפק קבלה (מיון כללי)', '04-6652886', 1),
  ('בית חולים פוריה', 'דלפק קבלה (חלופי)', '04-6652889', 2),
  ('בית חולים פוריה', 'מוקד מיון יולדות', '04-6652920', 3),
  ('חירום כללי', 'משטרה', '100', 1),
  ('חירום כללי', 'אמבולנס', '101', 2),
  ('חירום כללי', 'מכבי אש', '102', 3);
