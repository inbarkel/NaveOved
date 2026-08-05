import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { announcementId } = await request.json();

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Demo mode: just return success without inserting
      return NextResponse.json({
        success: true,
        message: 'Demo mode: notification job recorded',
        demo: true,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Insert notification job
    const { data, error } = await supabase
      .from('notification_jobs')
      .insert({
        announcement_id: announcementId,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
      message: 'Notification sent successfully',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
