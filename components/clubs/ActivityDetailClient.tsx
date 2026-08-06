'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, MapPin, User, Edit2, Trash2, X } from 'lucide-react';
import type { ClubEvent } from '@/lib/demo-data';
import { getIcon } from '@/lib/icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ActivityDetailActions } from '@/components/clubs/ActivityDetailActions';
import { ActivityParticipants } from '@/components/clubs/ActivityParticipants';
import {
  applyOverride,
  saveActivityOverride,
  deleteActivityById,
  findCustomActivity,
  getEffectiveDeadline,
  type ActivityOverride,
} from '@/lib/activity-overrides';
import { useIsCommittee } from '@/lib/use-committee-role';

function ActivityMedia({ event }: { event: ClubEvent }) {
  if (event.image) {
    return <Image src={event.image} alt={event.title} fill sizes="100vw" className="object-cover" />;
  }
  const Icon = getIcon(event.iconKey);
  return <Icon className="w-16 h-16 text-primary/40" aria-hidden />;
}

export function ActivityDetailClient({
  baseEvent,
  eventId,
  basePath,
}: {
  baseEvent: ClubEvent | null;
  eventId: string;
  basePath: '/activities' | '/clubs';
}) {
  const router = useRouter();
  const { isCommittee: isAdmin } = useIsCommittee();
  const [event, setEvent] = useState<ClubEvent | null>(baseEvent);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<ActivityOverride>({});
  const [useCustomDeadline, setUseCustomDeadline] = useState(false);

  useEffect(() => {
    if (baseEvent) {
      setEvent(applyOverride(baseEvent));
    } else {
      const custom = findCustomActivity(eventId);
      if (custom) {
        setEvent(applyOverride(custom));
      } else {
        setNotFoundState(true);
      }
    }
  }, [baseEvent, eventId]);

  const openEditForm = () => {
    if (!event) return;
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      time: event.time,
      price: event.price,
      priceAmount: event.priceAmount,
      instructorName: event.instructorName,
      instructorPhone: event.instructorPhone,
      registrationDeadline: event.registrationDeadline,
      image: event.image,
    });
    setUseCustomDeadline(!!event.registrationDeadline);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    if (!event) return;
    if (!form.title?.trim()) {
      alert('שם הפעילות לא יכול להיות ריק');
      return;
    }
    const updates: ActivityOverride = {
      ...form,
      registrationDeadline: useCustomDeadline ? form.registrationDeadline : undefined,
    };
    saveActivityOverride(event.id, updates);
    setEvent({ ...event, ...updates });
    setShowEditForm(false);
  };

  const handleDelete = () => {
    if (!event) return;
    deleteActivityById(event.id);
    router.push(basePath);
  };

  if (notFoundState) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-lg font-bold">הפעילות לא נמצאה</p>
        <button
          onClick={() => router.push(basePath)}
          className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold"
        >
          חזרה לרשימה
        </button>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const ageLabel = event.ageMinYears
    ? event.ageMaxYears
      ? `גילאי ${event.ageMinYears}–${event.ageMaxYears}`
      : `גיל ${event.ageMinYears}+`
    : null;

  const effectiveDeadline = getEffectiveDeadline(event);
  const registrationClosed = effectiveDeadline ? new Date() > effectiveDeadline : false;

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-bg)] flex items-center justify-center">
        <ActivityMedia event={event} />
        <button
          onClick={() => router.push(basePath)}
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow-soft)]"
        >
          חזרה
        </button>
      </div>

      <div className="px-4 py-5 space-y-5">
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={openEditForm}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm font-semibold transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              עריכה
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              מחיקה
            </button>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-2xl font-bold">{event.title}</h1>
            <span className="text-[11px] font-semibold rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">
              {event.kind}
            </span>
            {event.isExternal && (
              <span className="text-[11px] font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                מחוץ למושב
              </span>
            )}
            {ageLabel && (
              <span className="text-[11px] font-semibold rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">
                {ageLabel}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-secondary mt-1.5">{event.price}</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{event.description}</p>

        <div className="space-y-2 text-sm">
          {event.eventDate ? (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0" aria-hidden />
              {new Date(event.eventDate).toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0" aria-hidden />
              {event.daysOfWeek.join(', ')} · {event.time}
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" aria-hidden />
            {event.instructorName} · {event.instructorPhone}
          </div>
        </div>

        {!event.isExternal && effectiveDeadline && (
          <p className={`text-sm font-semibold ${registrationClosed ? 'text-urgent' : 'text-muted-foreground'}`}>
            {registrationClosed
              ? 'ההרשמה נסגרה'
              : `ניתן להירשם עד ${effectiveDeadline.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        )}

        {!event.isExternal && (
          <>
            <ProgressBar registered={event.registered} minRequired={event.minRequired} maxCapacity={event.maxCapacity} />

            <ActivityDetailActions event={event} registrationClosed={registrationClosed} />

            <ActivityParticipants eventId={event.id} priceAmount={event.priceAmount || 0} />
          </>
        )}
      </div>

      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-sans text-xl font-bold">עריכת פעילות</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">שם הפעילות</label>
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">תיאור</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">קישור לתמונה</label>
                <input
                  type="text"
                  value={form.image || ''}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                  dir="ltr"
                />
                {form.image && (
                  <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden bg-surface-2">
                    <Image src={form.image} alt="" fill sizes="100vw" className="object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">שעה</label>
                <input
                  type="text"
                  value={form.time || ''}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">מיקום</label>
                <input
                  type="text"
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">מחיר (תצוגה)</label>
                <input
                  type="text"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder='לדוגמה: "כניסה חופשית" או "80 ₪ לחודש"'
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">תאריך סיום הרשמה</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomDeadline(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      !useCustomDeadline ? 'bg-primary text-white border-primary' : 'border-[var(--color-border)] text-muted-foreground'
                    }`}
                  >
                    יום הפעילות (ברירת מחדל)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomDeadline(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      useCustomDeadline ? 'bg-primary text-white border-primary' : 'border-[var(--color-border)] text-muted-foreground'
                    }`}
                  >
                    תאריך מותאם
                  </button>
                </div>
                {useCustomDeadline && (
                  <input
                    type="date"
                    value={form.registrationDeadline?.slice(0, 10) || ''}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">איש קשר</label>
                <input
                  type="text"
                  value={form.instructorName || ''}
                  onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">טלפון</label>
                <input
                  type="text"
                  value={form.instructorPhone || ''}
                  onChange={(e) => setForm({ ...form, instructorPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
            >
              שמירה
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl p-6 space-y-4">
            <h2 className="font-sans text-lg font-bold">מחיקת פעילות</h2>
            <p className="text-sm text-muted-foreground">
              האם למחוק את &quot;{event.title}&quot;? הפעולה הזו תסיר את הפעילות מהרשימה.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold border border-[var(--color-border)] hover:bg-surface-2 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                מחיקה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
