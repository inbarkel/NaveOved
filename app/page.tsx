'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hero } from "@/components/feed/Hero";
import { QuickActions } from "@/components/feed/QuickActions";
import { WeekRota } from "@/components/feed/WeekRota";
import { AnnouncementList } from "@/components/feed/AnnouncementList";
import { GallerySection } from "@/components/community/GallerySection";
import { Card } from "@/components/ui/Card";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { DEMO_CLUBS } from "@/lib/demo-data";
import { applyOverride, getDeletedActivityIds } from "@/lib/activity-overrides";
import { getIcon } from "@/lib/icons";
import { AlertCircle, Clock, MapPin } from "lucide-react";

export default function HomePage() {
  const { announcements, isLoading } = useAnnouncements();
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [nearestActivity, setNearestActivity] = useState<ReturnType<typeof applyOverride> | null>(null);

  useEffect(() => {
    const deletedIds = getDeletedActivityIds();
    const now = new Date();
    const upcoming = DEMO_CLUBS.filter(
      (e) =>
        e.kind === "פעילות" &&
        !e.isExternal &&
        !deletedIds.includes(e.id) &&
        e.status !== "cancelled" &&
        e.eventDate &&
        new Date(e.eventDate) >= now
    ).sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());

    setNearestActivity(upcoming[0] ? applyOverride(upcoming[0]) : null);
  }, []);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) {
        setStatusLoading(false);
        return;
      }

      try {
        if (!supabase) {
          // Demo mode: check localStorage
          const profile = localStorage.getItem('user_profile');
          if (profile) {
            const parsed = JSON.parse(profile);
            setUserStatus(parsed.status || 'active');
            setFirstName(parsed.full_name?.split(' ')[0] || null);
          }
          setStatusLoading(false);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('status, full_name')
          .eq('id', user.id)
          .single();

        setUserStatus(data?.status || 'active');
        setFirstName(data?.full_name?.split(' ')[0] || null);
      } catch (err) {
        console.error('Error fetching user status:', err);
        setUserStatus('active');
      } finally {
        setStatusLoading(false);
      }
    };

    fetchUserStatus();
  }, [user]);

  return (
    <div>
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <div className="rise" style={{ ["--i" as string]: 0 }}>
          <Hero />
        </div>
        {firstName && <p className="text-xl font-extrabold">שלום {firstName}</p>}

        {/* Status Banner */}
        {userStatus === 'pending' && !statusLoading && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3">
            <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-bold">הרישום ממתין לאישור</p>
              <p className="text-sm text-foreground/80">הוועד בודק את הבקשה שלך. ברגע שיאשר, תקבלי גישה מלאה.</p>
            </div>
          </div>
        )}

        {userStatus === 'rejected' && !statusLoading && (
          <div className="flex items-start gap-3 rounded-2xl border border-urgent/50 bg-[color-mix(in_srgb,var(--color-urgent)_8%,var(--color-surface))] px-4 py-3">
            <AlertCircle className="w-5 h-5 text-urgent shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-bold">הבקשה נדחתה</p>
              <p className="text-sm text-foreground/80">
                הוועד לא אישר את בקשת הרישום. <Link href="/more/requests" className="font-semibold underline">כתבו לוועד</Link> כדי להבין למה.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="rise" style={{ ["--i" as string]: 1 }}>
              <WeekRota />
            </div>

            <section aria-labelledby="board-heading" className="rise" style={{ ["--i" as string]: 3 }}>
              <h2 id="board-heading" className="mb-2.5 text-lg font-extrabold">לוח הודעות הוועד</h2>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">טוען הודעות...</div>
              ) : announcements.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">אין הודעות כרגע.</div>
              ) : (
                <AnnouncementList announcements={announcements} />
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:col-span-5">
            <div className="rise" style={{ ["--i" as string]: 2 }}>
              <QuickActions />
            </div>

            <section aria-labelledby="next-heading" className="rise space-y-2.5" style={{ ["--i" as string]: 4 }}>
              <div className="flex items-baseline justify-between">
                <h2 id="next-heading" className="text-lg font-extrabold">הפעילות הבאה</h2>
                <Link href="/activities" className="text-sm font-semibold text-primary hover:underline">
                  כל הפעילויות
                </Link>
              </div>
              {nearestActivity ? (
                <Link href={`/activities/${nearestActivity.id}`} className="press block">
                  <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--rota-violet)_16%,transparent)] text-[var(--rota-violet)]">
                      {(() => {
                        const Icon = getIcon(nearestActivity.iconKey);
                        return <Icon className="h-6 w-6" aria-hidden />;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{nearestActivity.title}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {new Date(nearestActivity.eventDate!).toLocaleDateString("he-IL", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · <bdi dir="ltr">{nearestActivity.time}</bdi>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {nearestActivity.location}
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">אין פעילויות קרובות כרגע.</p>
              )}
            </section>
          </aside>
        </div>

        <GallerySection />
      </div>
    </div>
  );
}
