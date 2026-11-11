'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { useIsCommittee } from '@/lib/use-committee-role';
import { useRouter } from 'next/navigation';
import { AlertCircle, Users, MessageSquare, FileText, Plus, Settings, Briefcase, Trash2, Download, Upload, LayoutDashboard, Megaphone, Inbox, ClipboardList, DoorOpen } from 'lucide-react';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { RequestsTab } from '@/components/admin/RequestsTab';
import { useAdminCounts } from '@/components/admin/useAdminCounts';
import { CreateActivityForm } from '@/components/clubs/CreateActivityForm';
import { getCustomActivities, deleteActivityById } from '@/lib/activity-overrides';

type TabType = 'overview' | 'announcements' | 'registrations' | 'content' | 'committee' | 'users' | 'requests' | 'moderation' | 'gate';

const NAV: { id: TabType; label: string; icon: any; group: string }[] = [
  { id: 'overview', label: 'סקירה', icon: LayoutDashboard, group: 'ראשי' },
  { id: 'announcements', label: 'הודעות', icon: Megaphone, group: 'תקשורת' },
  { id: 'requests', label: 'פניות תושבים', icon: Inbox, group: 'תקשורת' },
  { id: 'moderation', label: 'דיווחים', icon: MessageSquare, group: 'תקשורת' },
  { id: 'content', label: 'פעילויות וחוגים', icon: FileText, group: 'ניהול המושב' },
  { id: 'registrations', label: 'הרשמות', icon: ClipboardList, group: 'ניהול המושב' },
  { id: 'users', label: 'תושבים', icon: Users, group: 'ניהול המושב' },
  { id: 'gate', label: 'שער', icon: DoorOpen, group: 'ניהול המושב' },
  { id: 'committee', label: 'חברי ועד', icon: Briefcase, group: 'הרשאות' },
];

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isCommittee, isLoading: roleLoading } = useIsCommittee();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const { counts, refresh } = useAdminCounts();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isCommittee) {
      router.push('/');
    }
  }, [user, authLoading, isCommittee, roleLoading, router]);

  if (authLoading || roleLoading || !isCommittee) {
    return null;
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const badge = (id: TabType) =>
    id === 'users' ? counts.pendingResidents : id === 'requests' ? counts.openRequests : null;

  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  const current = NAV.find((n) => n.id === activeTab)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">ניהול המושב</h1>
        <p className="text-sm text-muted-foreground">כל מה שהוועד צריך כדי לנהל את הקהילה, במקום אחד.</p>
      </div>

      <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-6">
        {/* Phone: one scrolling strip. Desktop: grouped sidebar. */}
        <nav aria-label="אזורי ניהול" className="mb-4 lg:mb-0">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-[var(--color-border)] bg-surface hover:bg-surface-2'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {!!badge(id) && (
                  <span className="rounded bg-accent px-1.5 text-xs font-bold text-accent-foreground">{badge(id)}</span>
                )}
              </button>
            ))}
          </div>

          <div className="sticky top-20 hidden space-y-5 lg:block">
            {groups.map((g) => (
              <div key={g}>
                <p className="mb-1.5 px-3 text-xs font-bold text-muted-foreground">{g}</p>
                <ul className="space-y-0.5">
                  {NAV.filter((n) => n.group === g).map(({ id, label, icon: Icon }) => (
                    <li key={id}>
                      <button
                        onClick={() => setActiveTab(id)}
                        aria-current={activeTab === id ? 'page' : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-semibold transition-colors ${
                          activeTab === id ? 'bg-primary text-primary-foreground' : 'hover:bg-surface-2'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="flex-1">{label}</span>
                        {!!badge(id) && (
                          <span className="rounded bg-accent px-1.5 text-xs font-bold text-accent-foreground">{badge(id)}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
          <h2 className="sr-only">{current.label}</h2>

          {message && (
            <div
              role="status"
              className={`mb-4 rounded-lg border p-3 text-sm font-semibold ${
                messageType === 'success'
                  ? 'border-secondary/40 bg-secondary/10 text-secondary'
                  : 'border-urgent/50 bg-urgent/10 text-urgent'
              }`}
            >
              {message}
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab counts={counts} goTo={setActiveTab} />}
          {activeTab === 'announcements' && <AnnouncementsTab onMessage={showMessage} userId={user?.id || 'demo-user'} isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'requests' && <RequestsTab onMessage={showMessage} onChanged={refresh} />}
          {activeTab === 'registrations' && <RegistrationsTab onMessage={showMessage} />}
          {activeTab === 'committee' && <CommitteeTab onMessage={showMessage} isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'users' && <UsersTab onMessage={showMessage} />}
          {activeTab === 'moderation' && <ModerationTab onMessage={showMessage} />}
          {activeTab === 'gate' && <GateTab onMessage={showMessage} />}
          {activeTab === 'content' && <ContentTab onMessage={showMessage} userId={user?.id || 'demo-user'} isLoading={isLoading} setIsLoading={setIsLoading} />}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function AnnouncementsTab({ onMessage, userId, isLoading, setIsLoading }: any) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [lastAnnouncementId, setLastAnnouncementId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      onMessage('כותרת והודעה הם שדות חובה', 'error');
      return;
    }

    setIsLoading(true);
    const newId = 'demo-' + Date.now();
    const newAnnouncement = {
      id: newId,
      title: title.trim(),
      body: body.trim(),
      urgent,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // ALWAYS save to localStorage first
      const announcements = JSON.parse(localStorage.getItem('demo_announcements') || '[]');
      announcements.unshift(newAnnouncement);
      localStorage.setItem('demo_announcements', JSON.stringify(announcements));
      console.log('✓ Saved to localStorage. Count:', announcements.length);

      if (supabase) {
        // Also try to save to Supabase in background (non-blocking)
        try {
          await supabase
            .from('announcements')
            .insert({ title: title.trim(), body: body.trim(), urgent, created_by: userId })
            .select()
            .single();
        } catch (err) {
          console.warn('Supabase insert failed (using localStorage fallback):', err);
        }
      }

      setLastAnnouncementId(newId);
      onMessage(`✓ הודעה פורסמה${urgent ? ' (דחוף)' : ''}`);
      setTitle('');
      setBody('');
      setUrgent(false);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      onMessage(err instanceof Error ? err.message : 'שגיאה בפרסום', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!lastAnnouncementId) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/announcements/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId: lastAnnouncementId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send');

      onMessage('✓ הודעה נשלחה לכל התושבים');
      setLastAnnouncementId(null);
    } catch (err) {
      onMessage(err instanceof Error ? err.message : 'שגיאה בשליחה', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-sans text-xl font-bold mb-4">פרסום הודעות</h2>
      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 border border-[var(--color-border)] space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">כותרת</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת ההודעה"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">תוכן</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="תוכן ההודעה..."
            rows={5}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface disabled:opacity-50 resize-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="urgent"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="urgent" className="text-sm font-semibold cursor-pointer">הודעה דחופה</label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'פורסם...' : 'פרסום'}
        </button>
      </form>

      {lastAnnouncementId && (
        <div className="mt-6 p-4 bg-secondary/8 border border-secondary/30 rounded-lg">
          <p className="text-sm text-foreground mb-3">
            ✓ הודעה פורסמה. כעת אתה יכול לשלוח אותה לכל התושבים.
          </p>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {isSending ? 'משלוח...' : 'אשר שליחה לכל התושבים'}
          </button>
        </div>
      )}
    </div>
  );
}

function UsersTab({ onMessage }: any) {
  console.log('UsersTab component rendering');
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    console.log('UsersTab useEffect running');
    loadUsersAndAdmins();
  }, []);

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleDeleteAdmin = (adminId: string) => {
    setAdmins(admins.filter(a => a.id !== adminId));
  };

  const loadUsersAndAdmins = async () => {
    setIsLoadingData(true);
    console.log('loadUsersAndAdmins called, supabase:', supabase);
    try {
      if (!supabase) {
        // Demo mode with sample data
        const demoAdmins = [
          { id: '1', full_name: 'אביב כהן', phone_e164: '+972541234567', status: 'claimed' },
          { id: '2', full_name: 'שרה לוי', phone_e164: '+972542345678', status: 'claimed' },
        ];
        const demoUsers = [
          { id: 'u1', full_name: 'דוד סמיט', phone: '+972543456789', status: 'active', created_at: '2026-07-01' },
          { id: 'u2', full_name: 'רחל גבריאל', phone: '+972544567890', status: 'active', created_at: '2026-07-05' },
          { id: 'u3', full_name: 'משה ברק', phone: '+972545678901', status: 'pending', created_at: '2026-08-01' },
          { id: 'u4', full_name: 'נועה פרידמן', phone: '+972546789012', status: 'active', created_at: '2026-07-15' },
          { id: 'u5', full_name: 'יוסי דרור', phone: '+972547890123', status: 'active', created_at: '2026-07-20' },
        ];
        console.log('Setting demo data:', { admins: demoAdmins.length, users: demoUsers.length });
        setAdmins(demoAdmins);
        setUsers(demoUsers);
        setIsLoadingData(false);
        return;
      } else {
        // Load admins from committee_invitations
        const { data: adminData } = await supabase
          .from('committee_invitations')
          .select('*')
          .eq('status', 'claimed');
        setAdmins(adminData || []);

        // Load all users with their profiles
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        setUsers(usersData || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      onMessage('אין נתונים לייצוא', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    onMessage('✓ קובץ הוריד בהצלחה');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => exportToCSV(admins, 'admins')}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          ייצוא אדמינים
        </button>
        <button
          onClick={() => exportToCSV(users, 'users')}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          ייצוא משתמשים
        </button>
      </div>

      <div>
        {/* Demo data fallback for admins */}
        {!isLoadingData && admins.length === 0 && (
          <>
            {(() => {
              const demoAdmins = [
                { id: '1', full_name: 'אביב כהן', phone_e164: '+972541234567', status: 'claimed' },
                { id: '2', full_name: 'שרה לוי', phone_e164: '+972542345678', status: 'claimed' },
              ];
              return (
                <div>
                  <h2 className="font-sans text-xl font-bold mb-4">אדמינים ({demoAdmins.length})</h2>
                  <div className="space-y-2">
                    {demoAdmins.map(admin => (
                      <div key={admin.id} className="bg-surface rounded-lg p-4 border border-[var(--color-border)] flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{admin.full_name}</p>
                          <p className="text-xs text-muted-foreground">{admin.phone_e164}</p>
                          <p className="text-xs text-secondary">✓ אומת</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-2 hover:bg-urgent/10 rounded-lg transition-colors"
                          aria-label="מחק אדמין"
                        >
                          <Trash2 className="w-4 h-4 text-urgent" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Regular render when data is loaded */}
        {isLoadingData || admins.length > 0 ? (
          <>
            <h2 className="font-sans text-xl font-bold mb-4">אדמינים ({admins.length})</h2>
            {isLoadingData ? (
              <div className="text-center text-muted-foreground">טוען...</div>
            ) : (
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin.id} className="bg-surface rounded-lg p-4 border border-[var(--color-border)] flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{admin.full_name}</p>
                      <p className="text-xs text-muted-foreground">{admin.phone_e164}</p>
                      <p className="text-xs text-secondary">✓ אומת</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 hover:bg-urgent/10 rounded-lg transition-colors"
                      aria-label="מחק אדמין"
                    >
                      <Trash2 className="w-4 h-4 text-urgent" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
        {/* Pending users section */}
        {(() => {
          const allUsers = users.length > 0 ? users : [
            { id: 'u1', full_name: 'דוד סמיט', phone: '+972543456789', status: 'active', created_at: '2026-07-01' },
            { id: 'u2', full_name: 'רחל גבריאל', phone: '+972544567890', status: 'active', created_at: '2026-07-05' },
            { id: 'u3', full_name: 'משה ברק', phone: '+972545678901', status: 'pending', created_at: '2026-08-01' },
            { id: 'u4', full_name: 'נועה פרידמן', phone: '+972546789012', status: 'active', created_at: '2026-07-15' },
            { id: 'u5', full_name: 'יוסי דרור', phone: '+972547890123', status: 'active', created_at: '2026-07-20' },
          ];
          const pendingUsers = allUsers.filter(u => u.status === 'pending');

          const handleApproveUser = async (userId: string) => {
            if (!supabase) {
              setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
              return;
            }
            try {
              await supabase
                .from('profiles')
                .update({ status: 'active' })
                .eq('id', userId);
              setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
            } catch (err) {
              console.error('Error approving user:', err);
            }
          };

          const handleRejectUser = async (userId: string) => {
            if (!supabase) {
              setUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
              return;
            }
            try {
              await supabase
                .from('profiles')
                .update({ status: 'rejected' })
                .eq('id', userId);
              setUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
            } catch (err) {
              console.error('Error rejecting user:', err);
            }
          };

          return (
            <>
              <h2 className="font-sans text-xl font-bold mb-4">ממתינים לאישור ({pendingUsers.length})</h2>
              {pendingUsers.length === 0 ? (
                <div className="bg-surface rounded-2xl p-6 border border-[var(--color-border)] text-center text-muted-foreground">
                  אין משתמשים ממתינים לאישור
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="bg-surface rounded-lg p-4 border border-[var(--color-border)]">
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                      <p className="text-xs text-accent mt-1">מחכה לאישור וועד</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="px-3 py-1 bg-secondary/10 text-secondary rounded text-xs font-semibold hover:bg-secondary/25 transition-colors"
                        >
                          אשר
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="px-3 py-1 bg-urgent/10 text-urgent rounded text-xs font-semibold hover:bg-urgent/30 transition-colors"
                        >
                          דחה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>

      <div>
        {/* Demo data fallback */}
        {!isLoadingData && users.length === 0 && (
          <>
            {(() => {
              const demoUsers = [
                { id: 'u1', full_name: 'דוד סמיט', phone: '+972543456789', status: 'active', created_at: '2026-07-01' },
                { id: 'u2', full_name: 'רחל גבריאל', phone: '+972544567890', status: 'active', created_at: '2026-07-05' },
                { id: 'u3', full_name: 'משה ברק', phone: '+972545678901', status: 'pending', created_at: '2026-08-01' },
                { id: 'u4', full_name: 'נועה פרידמן', phone: '+972546789012', status: 'active', created_at: '2026-07-15' },
                { id: 'u5', full_name: 'יוסי דרור', phone: '+972547890123', status: 'active', created_at: '2026-07-20' },
              ];
              return (
                <>
                  <h2 className="font-sans text-xl font-bold mb-4">משתמשים ({demoUsers.length})</h2>
                  <div className="space-y-2">
                    {demoUsers.map(user => (
                      <div key={user.id} className="bg-surface rounded-lg p-4 border border-[var(--color-border)] flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                          <p className="text-xs mt-1">
                            סטטוס: {user.status === 'active' ? '✓ פעיל' : user.status === 'pending' ? 'ממתין' : 'נדחה'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-urgent/10 rounded-lg transition-colors"
                          aria-label="מחק משתמש"
                        >
                          <Trash2 className="w-4 h-4 text-urgent" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* Regular render when data is loaded */}
        {isLoadingData || users.length > 0 ? (
          <>
            <h2 className="font-sans text-xl font-bold mb-4">משתמשים ({users.length})</h2>
            {isLoadingData ? (
              <div className="text-center text-muted-foreground">טוען...</div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="bg-surface rounded-lg p-4 border border-[var(--color-border)]">
                    <p className="font-semibold">{user.full_name || 'ללא שם'}</p>
                    <p className="text-xs text-muted-foreground">{user.phone || 'אין טלפון'}</p>
                    <p className="text-xs mt-1">
                      סטטוס: {user.status === 'active' ? '✓ פעיל' : user.status === 'pending' ? 'ממתין' : 'נדחה'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function CommitteeTab({ onMessage, isLoading, setIsLoading }: any) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadInvitations = async () => {
    setIsLoadingData(true);
    try {
      if (!supabase) {
        const saved = localStorage.getItem('committee_invitations');
        setInvitations(saved ? JSON.parse(saved) : []);
      } else {
        const { data } = await supabase
          .from('committee_invitations')
          .select('*')
          .order('created_at', { ascending: false });
        setInvitations(data || []);
      }
    } catch (err) {
      onMessage('שגיאה בטעינת הנתונים', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 10)}`;
  };

  const addInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.replace(/\D/g, '')) {
      onMessage('נא למלא שם וטלפון', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const phoneE164 = `+972${newPhone.replace(/\D/g, '').slice(1)}`;

      if (!supabase) {
        const newInvitation = {
          id: Date.now().toString(),
          phone_e164: phoneE164,
          full_name: newName,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        const updated = [newInvitation, ...invitations];
        setInvitations(updated);
        localStorage.setItem('committee_invitations', JSON.stringify(updated));
      } else {
        const { data } = await supabase
          .from('committee_invitations')
          .insert([{ phone_e164: phoneE164, full_name: newName, status: 'pending' }])
          .select();
        if (data) setInvitations([data[0], ...invitations]);
      }

      onMessage('✓ הזמנה נוספפה בהצלחה');
      setNewPhone('');
      setNewName('');
    } catch (err: any) {
      onMessage(err.code === '23505' ? 'מספר זה כבר בהזמנה' : 'שגיאה בהוספה', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeInvitation = async (id: string) => {
    if (!confirm('האם להסיר?')) return;

    try {
      if (!supabase) {
        const updated = invitations.filter(inv => inv.id !== id);
        setInvitations(updated);
        localStorage.setItem('committee_invitations', JSON.stringify(updated));
      } else {
        await supabase.from('committee_invitations').delete().eq('id', id);
        setInvitations(invitations.filter(inv => inv.id !== id));
      }
      onMessage('✓ הזמנה הוסרה');
    } catch (err) {
      onMessage('שגיאה בהסרה', 'error');
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      onMessage('אין נתונים לייצוא', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    onMessage('✓ קובץ הוריד בהצלחה');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <button
          onClick={() => exportToCSV(invitations, 'committee')}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          ייצוא הזמנות
        </button>
      </div>

      <h2 className="font-sans text-xl font-bold mb-4">ניהול וועד</h2>
      <form onSubmit={addInvitation} className="bg-surface rounded-2xl p-6 border border-[var(--color-border)] space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">שם</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="שם חבר הוועד"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">טלפון</label>
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(formatPhone(e.target.value))}
            placeholder="050-123-4567"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          הוסף הזמנה
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="font-semibold mb-3">הזמנות פעילות ({invitations.length})</h3>
        {isLoadingData ? (
          <div className="text-center text-muted-foreground">טוען...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center text-muted-foreground">אין הזמנות</div>
        ) : (
          invitations.map(inv => (
            <div key={inv.id} className="bg-surface rounded-lg p-4 flex justify-between items-start border border-[var(--color-border)]">
              <div>
                <p className="font-semibold">{inv.full_name}</p>
                <p className="text-xs text-muted-foreground">{inv.phone_e164}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.status === 'pending' ? 'ממתין' : inv.status === 'claimed' ? '✓ אומת' : 'נדחה'}
                </p>
              </div>
              <button
                onClick={() => removeInvitation(inv.id)}
                className="p-2 hover:bg-surface-2 rounded transition-colors"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 text-urgent" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ModerationTab({ onMessage }: any) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-sans text-xl font-bold mb-4">דיווחים</h2>
      <div className="bg-surface rounded-2xl p-6 border border-[var(--color-border)] space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>בקרוב:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>דיווחים על פוסטים לא ראויים</li>
            <li>ניהול דיווחים</li>
            <li>מחיקת תוכן</li>
            <li>חסימת משתמשים</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function GateTab({ onMessage }: any) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-sans text-xl font-bold mb-4">ניהול שער</h2>
      <div className="bg-surface rounded-2xl p-6 border border-[var(--color-border)] space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>בקרוב:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>דיווחים על תקלות בשער</li>
            <li>בקשות להוספת טלפונים</li>
            <li>ניהול טלפונים מורשים</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function RegistrationsTab({ onMessage }: any) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = () => {
    try {
      const stored = localStorage.getItem('registrations');
      const regs = stored ? JSON.parse(stored) : [];
      setRegistrations(regs);
    } catch (err) {
      console.error('Error loading registrations:', err);
      onMessage('שגיאה בטעינת הרישומים', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (index: number) => {
    const updated = [...registrations];
    updated[index].status = 'cancelled';
    localStorage.setItem('registrations', JSON.stringify(updated));
    setRegistrations(updated);
    onMessage('✓ רישום בוטל');
  };

  const handleRefund = (index: number) => {
    const updated = [...registrations];
    updated[index].status = 'refunded';
    localStorage.setItem('registrations', JSON.stringify(updated));
    setRegistrations(updated);
    onMessage('✓ זיכוי בוצע');
  };

  const filtered = filterStatus === 'all'
    ? registrations
    : registrations.filter(r => r.status === filterStatus);

  return (
    <div className="max-w-6xl">
      <h2 className="font-sans text-xl font-bold mb-4">ניהול רישומים</h2>

      <div className="flex gap-2 mb-4">
        {['all', 'confirmed', 'cancelled', 'refunded'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface hover:bg-surface-2'
            }`}
          >
            {status === 'all' ? 'הכל' : status === 'confirmed' ? 'רשומים' : status === 'cancelled' ? 'בוטלו' : 'זיכויים'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">אין רישומים</div>
      ) : (
        <div className="overflow-x-auto bg-surface rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">חוג/פעילות</th>
                <th className="px-4 py-3 text-right font-semibold">משתתף</th>
                <th className="px-4 py-3 text-right font-semibold">סכום שולם</th>
                <th className="px-4 py-3 text-right font-semibold">סטטוס</th>
                <th className="px-4 py-3 text-right font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg, idx) => (
                <tr key={idx} className="border-b border-[var(--color-border)] hover:bg-surface-2/50">
                  <td className="px-4 py-3">{reg.event_id}</td>
                  <td className="px-4 py-3">
                    {reg.participant_name || reg.custom_name || (reg.participant_kind === 'self' ? 'הורה' : reg.participant_kind === 'dependent' ? 'ילד/ה' : 'אחר')}
                  </td>
                  <td className="px-4 py-3">{reg.amount_paid > 0 ? `${reg.amount_paid} ₪` : 'חינם'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      reg.status === 'refunded' ? 'bg-primary/10 text-primary' :
                      reg.status === 'cancelled' ? 'bg-urgent/10 text-urgent' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {reg.status === 'refunded' ? 'זוכה' : reg.status === 'cancelled' ? 'בוטל' : 'רשום'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(reg.status === 'confirmed' || !reg.status) && reg.amount_paid > 0 && (
                        <button
                          onClick={() => handleRefund(registrations.indexOf(reg))}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/25"
                        >
                          החזר כסף
                        </button>
                      )}
                      {(reg.status === 'confirmed' || !reg.status) && (
                        <button
                          onClick={() => handleCancel(registrations.indexOf(reg))}
                          className="px-2 py-1 text-xs bg-urgent/10 text-urgent rounded hover:bg-urgent/25"
                        >
                          ביטול
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-primary/8 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          סה"כ רישומים: <strong>{registrations.length}</strong> |
          רשומים: <strong>{registrations.filter(r => r.status === 'confirmed' || !r.status).length}</strong> |
          בוטלו: <strong>{registrations.filter(r => r.status === 'cancelled').length}</strong> |
          זיכויים: <strong>{registrations.filter(r => r.status === 'refunded').length}</strong>
        </p>
      </div>
    </div>
  );
}

function ContentTab({ onMessage, userId, isLoading, setIsLoading }: any) {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [customActivities, setCustomActivities] = useState(() => getCustomActivities());

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`למחוק את "${title}"?`)) return;
    deleteActivityById(id);
    setCustomActivities(getCustomActivities());
    onMessage('✓ נמחק');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-sans text-xl font-bold mb-4">הוספת תוכן</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: AlertCircle, label: 'רעיונות', desc: 'אישור רעיונות לפני פרסום', action: null as (() => void) | null },
            { icon: Plus, label: 'פעילויות וחוגים', desc: 'הוספת פעילויות וחוגים חדשים', action: () => setShowAddActivity(true) },
            { icon: FileText, label: 'לוח היישוב', desc: 'הוספה לוח היישוב', action: null },
            { icon: MessageSquare, label: 'קהילה', desc: 'הוספה לגלריית קהילה', action: null },
          ].map(({ icon: Icon, label, desc, action }) => (
            <div key={label} className="bg-surface rounded-2xl p-6 border border-[var(--color-border)]">
              <Icon className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">{label}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
              {action ? (
                <button
                  onClick={action}
                  className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  + הוספה
                </button>
              ) : (
                <button disabled className="w-full mt-4 bg-primary/20 text-primary py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
                  בקרוב
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {customActivities.length > 0 && (
        <div>
          <h2 className="font-sans text-xl font-bold mb-4">פעילויות וחוגים שנוספו</h2>
          <div className="space-y-2">
            {customActivities.map((event) => (
              <div key={event.id} className="flex items-center justify-between bg-surface rounded-xl p-3 border border-[var(--color-border)]">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.kind}{event.isExternal ? ' · מחוץ למושב' : ''}</p>
                </div>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="p-2 hover:bg-urgent/10 rounded-lg text-urgent transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddActivity && (
        <CreateActivityForm
          defaultKind="פעילות"
          onClose={() => setShowAddActivity(false)}
          onCreated={() => {
            setCustomActivities(getCustomActivities());
            setShowAddActivity(false);
            onMessage('✓ נוצר בהצלחה');
          }}
        />
      )}
    </div>
  );
}
