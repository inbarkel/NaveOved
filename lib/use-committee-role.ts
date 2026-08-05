'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase-client';

/**
 * Single source of truth for "is this person allowed to see committee-only UI".
 * Real mode: checks the user_roles table (server-enforced via RLS too).
 * Demo mode (no Supabase configured): falls back to demo_user.is_admin in localStorage.
 * Never trust localStorage alone when Supabase is configured — it's client-editable.
 */
export function useIsCommittee(): { isCommittee: boolean; isLoading: boolean } {
  const { user, isLoading: authLoading } = useAuth();
  const [isCommittee, setIsCommittee] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const check = async () => {
      if (!supabase) {
        try {
          const demoUser = JSON.parse(localStorage.getItem('demo_user') || 'null');
          if (!cancelled) setIsCommittee(demoUser?.is_admin === true);
        } catch (e) {
          console.error('Error parsing demo_user:', e);
          if (!cancelled) setIsCommittee(false);
        }
        if (!cancelled) setIsLoading(false);
        return;
      }

      if (!user) {
        if (!cancelled) {
          setIsCommittee(false);
          setIsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .in('role', ['committee', 'super_admin']);

      if (!cancelled) {
        if (error) {
          console.error('Error checking committee role:', error);
          setIsCommittee(false);
        } else {
          setIsCommittee(Boolean(data && data.length > 0));
        }
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    check();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isCommittee, isLoading };
}
