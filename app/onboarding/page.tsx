'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

interface Dependent {
  id?: string;
  full_name: string;
  birth_date: string;
}

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [newChild, setNewChild] = useState({ name: '', birthDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // If the user already has a profile, they've already completed
    // onboarding once - skip straight to home instead of asking again.
    const checkExistingProfile = async () => {
      if (!supabase) {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          router.push('/');
          return;
        }
        setCheckingProfile(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        router.push('/');
        return;
      }
      setCheckingProfile(false);
    };

    checkExistingProfile();
  }, [user, authLoading, router]);

  const handleAddChild = () => {
    if (!newChild.name || !newChild.birthDate) {
      setError('נא למלא שם ותאריך לידה');
      return;
    }
    const today = new Date();
    const birth = new Date(newChild.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (age >= 18) {
      setError('ניתן להוסיף רק ילדים מתחת לגיל 18');
      return;
    }
    setDependents([
      ...dependents,
      {
        full_name: newChild.name,
        birth_date: newChild.birthDate,
      },
    ]);
    setNewChild({ name: '', birthDate: '' });
    setError('');
  };

  const handleRemoveChild = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError('נא להזין שם מלא');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!user) throw new Error('אין משתמש מחובר');

      if (!supabase) {
        // Demo mode - save to localStorage
        const demoProfile = {
          id: user.id,
          full_name: fullName,
          status: 'active', // In demo, auto-approve
          birth_date: birthDate,
          gender,
          dependents,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('user_profile', JSON.stringify(demoProfile));
        router.push('/');
        return;
      }

      // Check if this phone is on the committee invitation list - if so,
      // they're pre-approved by the committee and skip residency approval
      const cleanPhoneForInvite = localStorage.getItem('pending_phone');
      let invitation: { id: string } | null = null;
      if (cleanPhoneForInvite) {
        const { data } = await supabase
          .from('committee_invitations')
          .select('id')
          .eq('phone_e164', `+972${cleanPhoneForInvite.slice(1)}`)
          .eq('status', 'pending')
          .maybeSingle();
        invitation = data;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          status: invitation ? 'active' : 'pending',
          birth_date: birthDate || null,
          gender,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Add dependents if any
      if (dependents.length > 0) {
        const dependentsData = dependents.map((dep) => ({
          profile_id: user.id,
          full_name: dep.full_name,
          birth_date: dep.birth_date,
          created_at: new Date().toISOString(),
        }));

        const { error: depsError } = await supabase
          .from('dependents')
          .insert(dependentsData);

        if (depsError) {
          console.error('Dependents error:', depsError);
          // Don't throw - dependents table might not exist yet
          // Just continue
        }
      }

      // Assign role based on the committee invitation check done above
      if (cleanPhoneForInvite) {
        if (invitation) {
          // Update invitation status
          await supabase
            .from('committee_invitations')
            .update({
              status: 'claimed',
              claimed_by_user_id: user.id,
              claimed_at: new Date().toISOString(),
            })
            .eq('id', invitation.id);

          // Create committee role (system-granted via invitation match,
          // so granted_by is left null - there's no specific granting user)
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'committee',
              granted_at: new Date().toISOString(),
            });
        } else {
          // Create resident role for regular users
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'resident',
              granted_at: new Date().toISOString(),
            });
        }
      }

      // Redirect to home
      router.push('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-sans text-3xl font-bold text-primary">ברוכים הבאים! 👋</h1>
          <p className="text-muted-foreground">
            בואו נהכיר אתכם לקהילה שלנו
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-urgent/20 border border-urgent text-urgent rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Your Details */}
          <div className="bg-surface rounded-2xl p-6 space-y-4 border border-[var(--color-border)]">
            <h2 className="font-sans text-lg font-bold">פרטיך</h2>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                שם מלא
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="יוסי כהן"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  תאריך לידה
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={isLoading}
                  lang="he"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  מין
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">בחר...</option>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                  <option value="other">אחר</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family Section */}
          <div className="bg-surface rounded-2xl p-6 space-y-4 border border-[var(--color-border)]">
            <h2 className="font-sans text-lg font-bold">משפחה (אופציונלי)</h2>
            <p className="text-sm text-muted-foreground">
              הוסף ילדים כדי לקבל המלצות לפעילויות מותאמות לגילם
            </p>

            {/* Add Child Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  שם הילד
                </label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  placeholder="שם הילד"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  תאריך לידה
                </label>
                <input
                  type="date"
                  value={newChild.birthDate}
                  onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                  disabled={isLoading}
                  lang="he"
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleAddChild}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                הוסף ילד
              </button>
            </div>

            {/* Children List */}
            {dependents.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm font-semibold text-foreground">הילדים שלך:</p>
                {dependents.map((child, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-2 text-foreground"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{child.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        לידה: {new Date(child.birth_date).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(idx)}
                      disabled={isLoading}
                      className="p-2 hover:bg-surface text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'שומר...' : 'סיים רישום'}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            ❗ חשוב: הרישום שלך ממתין לאישור הוועד. תקבל הודעה כשיאישרו אותך.
          </p>
        </form>
      </div>
    </div>
  );
}
