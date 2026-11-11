import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Demo mode: the app runs entirely on built-in demo data and local storage.
// It turns on when the keys are missing, or when NEXT_PUBLIC_DEMO_MODE=true
// (use this for a portfolio deployment so it never depends on a database
// that might be paused).
const forceDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const supabase = !forceDemo && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
