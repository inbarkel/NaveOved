import { supabase } from './supabase-client';

export interface Dependent {
  id: string;
  full_name: string;
  birth_date: string;
  gender?: string;
}

function getLocalProfile(): { dependents?: Dependent[]; [key: string]: unknown } {
  try {
    return JSON.parse(localStorage.getItem('user_profile') || '{}');
  } catch {
    return {};
  }
}

function saveLocalProfile(profile: Record<string, unknown>) {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

export async function getDependents(userId: string): Promise<Dependent[]> {
  if (!supabase) {
    return getLocalProfile().dependents || [];
  }
  const { data, error } = await supabase
    .from('dependents')
    .select('id, full_name, birth_date, gender')
    .eq('profile_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error loading dependents:', error);
    return [];
  }
  return data || [];
}

export async function addDependent(
  userId: string,
  fullName: string,
  birthDate: string,
  gender?: string
): Promise<Dependent> {
  if (!supabase) {
    const profile = getLocalProfile();
    const newDependent: Dependent = { id: Date.now().toString(), full_name: fullName, birth_date: birthDate, gender };
    profile.dependents = [...(profile.dependents || []), newDependent];
    saveLocalProfile(profile);
    return newDependent;
  }
  const { data, error } = await supabase
    .from('dependents')
    .insert({ profile_id: userId, full_name: fullName, birth_date: birthDate, gender })
    .select('id, full_name, birth_date, gender')
    .single();
  if (error) throw error;
  return data;
}

export async function removeDependent(userId: string, dependentId: string): Promise<void> {
  if (!supabase) {
    const profile = getLocalProfile();
    profile.dependents = (profile.dependents || []).filter((d) => d.id !== dependentId);
    saveLocalProfile(profile);
    return;
  }
  const { error } = await supabase.from('dependents').delete().eq('id', dependentId).eq('profile_id', userId);
  if (error) throw error;
}
