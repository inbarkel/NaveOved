// Demo mode only (no database): sample resident requests for the admin dashboard,
// merged with anything residents submitted from /more/requests in this browser.

export interface DemoRequest {
  id: string;
  name?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  response: string | null;
  created_at: string;
}

const ADMIN_KEY = 'demo_admin_requests';
const RESIDENT_KEY = 'committee_requests';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const SEEDS: DemoRequest[] = [
  {
    id: 'demo-r1',
    name: 'דנה לוי',
    subject: 'פנס רחוב לא דולק ברחוב הזית',
    message: 'הפנס מול בית 14 לא דולק כבר שבוע, והרחוב חשוך בערב. אפשר לטפל?',
    status: 'open',
    response: null,
    created_at: daysAgo(1),
  },
  {
    id: 'demo-r2',
    name: 'אורי כהן',
    subject: 'שימוש במועדון ליום הולדת',
    message: 'אנחנו רוצים לקיים יום הולדת לילד במועדון ביום שישי. מה התהליך וכמה זה עולה?',
    status: 'in_progress',
    response: 'בודקים זמינות ונחזור אליכם עד סוף השבוע.',
    created_at: daysAgo(3),
  },
  {
    id: 'demo-r3',
    name: 'מירב שמש',
    subject: 'תודה על הגדרת הפח החדש',
    message: 'רק רציתי להגיד תודה על הפח הכתום החדש בכניסה, זה עשה סדר.',
    status: 'resolved',
    response: 'שמחים לשמוע, תודה על המשוב.',
    created_at: daysAgo(8),
  },
];

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function loadDemoRequests(): DemoRequest[] {
  const own = read<DemoRequest[]>(ADMIN_KEY) ?? SEEDS;
  const resident = read<DemoRequest[]>(RESIDENT_KEY) ?? [];
  const known = new Set(own.map((r) => r.id));
  return [...own, ...resident.filter((r) => !known.has(r.id))].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function saveDemoRequests(list: DemoRequest[]) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(list));
    // Keep the resident's own view in sync for requests they submitted.
    const resident = read<DemoRequest[]>(RESIDENT_KEY);
    if (resident) {
      const byId = new Map(list.map((r) => [r.id, r]));
      localStorage.setItem(
        RESIDENT_KEY,
        JSON.stringify(resident.map((r) => (byId.has(r.id) ? { ...r, status: byId.get(r.id)!.status, response: byId.get(r.id)!.response } : r)))
      );
    }
  } catch {
    // storage unavailable: nothing to persist
  }
}
