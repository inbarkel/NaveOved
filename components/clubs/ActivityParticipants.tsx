'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useIsCommittee } from '@/lib/use-committee-role';

interface Registration {
  event_id: string;
  user_id: string;
  participant_kind: 'self' | 'dependent' | 'other';
  dependent_id: string | null;
  custom_name?: string;
  participant_name?: string;
  amount_paid: number;
  paid_at: string;
  status?: string;
}

function getParticipantDisplayName(reg: Registration): string {
  if (reg.participant_name) return reg.participant_name;
  if (reg.custom_name) return reg.custom_name;
  return reg.participant_kind === 'self' ? 'הורה' : reg.participant_kind === 'dependent' ? 'ילד/ה' : 'אחר';
}

function getParticipantIcon(kind: Registration['participant_kind']): string {
  return kind === 'dependent' ? '👧' : kind === 'other' ? '🧑' : '👤';
}

export function ActivityParticipants({ eventId, priceAmount = 0 }: { eventId: string; priceAmount?: number }) {
  const { user } = useAuth();
  const { isCommittee: isAdmin } = useIsCommittee();
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    // Load registrations for this event
    let stored = localStorage.getItem('registrations');
    let allRegs: Registration[] = [];

    try {
      allRegs = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error parsing registrations:', e);
      allRegs = [];
    }

    // Add demo registrations if none exist for this event
    const existingCount = allRegs.filter((r: Registration) => r.event_id === eventId).length;
    if (existingCount === 0 && isAdmin) {
      const demoRegs: Registration[] = [
        {
          event_id: eventId,
          user_id: 'user1',
          participant_kind: 'self',
          dependent_id: null,
          participant_name: 'מיכל לוי',
          amount_paid: priceAmount,
          paid_at: new Date().toISOString(),
          status: 'confirmed',
        },
        {
          event_id: eventId,
          user_id: 'user2',
          participant_kind: 'self',
          dependent_id: null,
          participant_name: 'רון גבאי',
          amount_paid: priceAmount,
          paid_at: new Date().toISOString(),
          status: 'confirmed',
        },
        {
          event_id: eventId,
          user_id: 'user3',
          participant_kind: 'dependent',
          dependent_id: 'dep1',
          participant_name: 'יובל גבאי',
          amount_paid: priceAmount,
          paid_at: new Date().toISOString(),
          status: 'confirmed',
        },
      ];
      allRegs = [...allRegs, ...demoRegs];
      localStorage.setItem('registrations', JSON.stringify(allRegs));
      console.log('Demo registrations created for event:', eventId);
    }

    const eventRegs = allRegs.filter((r: Registration) => r.event_id === eventId);
    setRegistrations(eventRegs);
  }, [eventId, priceAmount, isAdmin]);

  const handleCancel = (index: number) => {
    if (!confirm('לבטל את ההרשמה של המשתתף הזה?')) return;
    const updated = [...registrations];
    updated[index].status = 'cancelled';
    setRegistrations(updated);

    const stored = localStorage.getItem('registrations');
    const allRegs = stored ? JSON.parse(stored) : [];
    const updatedAll = allRegs.map((r: Registration) =>
      r.event_id === eventId && r.user_id === registrations[index].user_id
        ? { ...registrations[index], status: 'cancelled' }
        : r
    );
    localStorage.setItem('registrations', JSON.stringify(updatedAll));
  };

  const handleRefund = (index: number) => {
    const updated = [...registrations];
    updated[index].status = 'refunded';
    setRegistrations(updated);

    const stored = localStorage.getItem('registrations');
    const allRegs = stored ? JSON.parse(stored) : [];
    const updatedAll = allRegs.map((r: Registration) =>
      r.event_id === eventId && r.user_id === registrations[index].user_id
        ? { ...registrations[index], status: 'refunded' }
        : r
    );
    localStorage.setItem('registrations', JSON.stringify(updatedAll));
  };

  if (!isAdmin || registrations.length === 0) {
    return null;
  }

  const stats = {
    confirmed: registrations.filter(r => r.status === 'confirmed' || !r.status).length,
    refunded: registrations.filter(r => r.status === 'refunded').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
      <h2 className="font-sans text-lg font-bold mb-4">👥 משתתפים ({registrations.length})</h2>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-100">
        <p>רשומים: <strong>{stats.confirmed}</strong> | זיכויים: <strong>{stats.refunded}</strong> | בוטלו: <strong>{stats.cancelled}</strong></p>
      </div>

      <div className="overflow-x-auto bg-surface rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-right font-semibold">משתתף</th>
              <th className="px-4 py-3 text-right font-semibold">סכום</th>
              <th className="px-4 py-3 text-right font-semibold">סטטוס</th>
              <th className="px-4 py-3 text-right font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, idx) => (
              <tr key={idx} className="border-b border-[var(--color-border)] hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  {getParticipantIcon(reg.participant_kind)} {getParticipantDisplayName(reg)}
                </td>
                <td className="px-4 py-3">{reg.amount_paid > 0 ? `${reg.amount_paid} ₪` : 'חינם'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    reg.status === 'refunded' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    reg.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {reg.status === 'refunded' ? 'זוכה' :
                     reg.status === 'cancelled' ? 'בוטל' : 'רשום'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(reg.status === 'confirmed' || !reg.status) && reg.amount_paid > 0 && (
                      <button
                        onClick={() => handleRefund(idx)}
                        className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        title="החזר כספי"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {(reg.status === 'confirmed' || !reg.status) && (
                      <button
                        onClick={() => handleCancel(idx)}
                        className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                        title="בטל הרשמה"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
