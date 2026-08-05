import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { DEMO_ANNOUNCEMENTS } from '@/lib/demo-data';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  urgent: boolean;
  createdAt: string;
  created_at?: string;
  created_by?: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAnnouncements = async () => {
      try {
        // Always check localStorage first (for announcements created by admin in demo/fallback mode)
        const localAnnouncements = localStorage.getItem('demo_announcements');
        if (localAnnouncements) {
          try {
            const parsed = JSON.parse(localAnnouncements);
            const announcements = parsed.map((a: any) => ({
              ...a,
              createdAt: a.created_at || a.createdAt,
            }));
            if (mounted) {
              setAnnouncements(announcements);
              setIsLoading(false);
            }
            return;
          } catch {
            // Fall through to Supabase or demo data
          }
        }

        // If Supabase is not configured, use demo data
        if (!supabase) {
          if (mounted) {
            setAnnouncements(DEMO_ANNOUNCEMENTS);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (mounted) {
          if (error || !data || data.length === 0) {
            // Fall back to demo data if Supabase fails or returns empty
            setAnnouncements(DEMO_ANNOUNCEMENTS);
          } else {
            // Map Supabase data to match component expectations
            setAnnouncements(data.map((a: any) => ({
              ...a,
              createdAt: a.created_at,
            })));
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          // Fall back to demo data on error
          setAnnouncements(DEMO_ANNOUNCEMENTS);
          setIsLoading(false);
        }
      }
    };

    fetchAnnouncements();

    // Subscribe to real-time updates only if Supabase is configured
    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const channel = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setAnnouncements((prev) => [payload.new as Announcement, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements((prev) =>
              prev.filter((a) => a.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as Announcement) : a))
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  return { announcements, isLoading };
}
