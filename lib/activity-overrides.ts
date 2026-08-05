import type { ClubEvent } from './demo-data';

const OVERRIDES_KEY = 'activity_overrides';
const DELETED_KEY = 'deleted_activities';
const CUSTOM_KEY = 'custom_activities';

export type ActivityOverride = Partial<
  Pick<
    ClubEvent,
    | 'title'
    | 'description'
    | 'location'
    | 'time'
    | 'daysOfWeek'
    | 'price'
    | 'priceAmount'
    | 'instructorName'
    | 'instructorPhone'
    | 'registrationDeadline'
  >
>;

export function getActivityOverrides(): Record<string, ActivityOverride> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveActivityOverride(id: string, updates: ActivityOverride) {
  const all = getActivityOverrides();
  all[id] = { ...all[id], ...updates };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
}

export function getDeletedActivityIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteActivityById(id: string) {
  const ids = getDeletedActivityIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  }
}

export function isActivityDeleted(id: string): boolean {
  return getDeletedActivityIds().includes(id);
}

export function applyOverride<T extends ClubEvent>(event: T): T {
  const overrides = getActivityOverrides();
  const override = overrides[event.id];
  return override ? { ...event, ...override } : event;
}

export function getEffectiveDeadline(event: ClubEvent): Date | null {
  if (event.registrationDeadline) {
    return event.registrationDeadline.includes('T')
      ? new Date(event.registrationDeadline)
      : new Date(event.registrationDeadline + 'T23:59:59');
  }
  if (event.eventDate) return new Date(event.eventDate);
  return null;
}

export function getCustomActivities(): ClubEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addCustomActivity(event: ClubEvent) {
  const all = getCustomActivities();
  all.push(event);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
}

export function findCustomActivity(id: string): ClubEvent | undefined {
  return getCustomActivities().find((a) => a.id === id);
}
