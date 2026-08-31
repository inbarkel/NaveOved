import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * "Keepalive" route — called on a schedule by Vercel Cron (see vercel.json).
 *
 * Supabase's free tier auto-pauses a project after 7 days with no API
 * activity. This route just touches the database with a trivial read so
 * that never happens again. It does nothing else and changes no data.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron sends this header automatically; if CRON_SECRET is set,
  // require it so randoms can't trigger the route from the public URL.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: true, demo: true, message: 'No Supabase configured, nothing to ping' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error } = await supabase.from('contacts').select('id').limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
}
