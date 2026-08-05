'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hero } from "@/components/feed/Hero";
import { QuickActions } from "@/components/feed/QuickActions";
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
import { Trash2 } from "lucide-react";

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
      <Hero />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {firstName && (
          <p className="font-sans text-xl font-bold">שלום {firstName}</p>
        )}

        {/* Status Banner */}
        {userStatus === 'pending' && !statusLoading && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border border-amber-200 dark:border-amber-800">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">⏳ הרישום ממתין לאישור</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">הוועד שלנו בודק את הבקשה שלך. תקבל הודעה כשהוא יאשר אותך.</p>
            </div>
          </div>
        )}

        {userStatus === 'rejected' && !statusLoading && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950/30 px-4 py-3 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">❌ הבקשה נדחתה</p>
              <p className="text-sm text-red-800 dark:text-red-200">יוצא כי הוועד דחה את בקשת הרישום שלך. <a href="/more" className="underline hover:no-underline">צור קשר</a> כדי לדעת יותר.</p>
            </div>
          </div>
        )}

        <QuickActions />

        <div className="space-y-2">
          <div className="contrast-surface flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <Trash2 className="w-5 h-5 text-primary shrink-0" aria-hidden />
            <span>
              פינוי אשפה: <span className="font-semibold">ימי ראשון, שלישי וחמישי</span>
            </span>
          </div>
          <div className="contrast-surface flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <Trash2 className="w-5 h-5 text-secondary shrink-0" aria-hidden />
            <span>
              פינוי גזם: <span className="font-semibold">שני וחמישי</span>
            </span>
          </div>
        </div>

        <section>
          <h2 className="font-sans text-lg font-bold mb-3">לוח הודעות הועד</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">טוען הודעות...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">אין הודעות עדיין</div>
          ) : (
            <AnnouncementList announcements={announcements} />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold">הפעילות הקרובה</h2>
            <Link href="/activities" className="text-sm font-semibold text-primary hover:underline">
              לכל הפעילויות
            </Link>
          </div>
          {nearestActivity ? (
            <Link href={`/activities/${nearestActivity.id}`} className="block">
              <Card className="p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
                <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
                  {(() => {
                    const Icon = getIcon(nearestActivity.iconKey);
                    return <Icon className="w-6 h-6 text-primary" aria-hidden />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{nearestActivity.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    {new Date(nearestActivity.eventDate!).toLocaleDateString("he-IL", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {nearestActivity.time}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    {nearestActivity.location}
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">אין פעילויות קרובות כרגע</p>
          )}
        </section>

        <GallerySection />
      </div>
    </div>
  );
}
