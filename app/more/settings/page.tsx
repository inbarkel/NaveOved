'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { getDependents, addDependent as addDependentRemote, removeDependent as removeDependentRemote, type Dependent } from '@/lib/dependents';

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const formatDateHebrewDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = hebrewMonths[date.getMonth()];
    const year = date.getFullYear();
    const dayName = hebrewDays[date.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [newDependentName, setNewDependentName] = useState('');
  const [newDependentBirthDate, setNewDependentBirthDate] = useState('');
  const [newDependentGender, setNewDependentGender] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      if (!supabase) {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
          const profile = JSON.parse(saved);
          setFullName(profile.full_name || '');
          setBirthDate(profile.birth_date || '');
          setGender(profile.gender || '');
        }
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, birth_date, gender')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      if (data) {
        setFullName(data.full_name || '');
        setBirthDate(data.birth_date || '');
        setGender(data.gender || '');
      }
    };

    const loadDependentsList = async () => {
      const deps = await getDependents(user.id);
      setDependents(deps);
    };

    loadProfile();
    loadDependentsList();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (!supabase) {
        const saved = localStorage.getItem('user_profile');
        const existing = saved ? JSON.parse(saved) : {};
        localStorage.setItem(
          'user_profile',
          JSON.stringify({ ...existing, id: user.id, full_name: fullName, birth_date: birthDate, gender })
        );
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName, birth_date: birthDate, gender })
          .eq('id', user.id);
        if (error) throw error;
      }
      setSaveMessage('✓ הפרטים נשמרו בהצלחה');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveMessage('❌ שגיאה בשמירה');
    } finally {
      setIsSaving(false);
    }
  };

  const addDependent = async () => {
    if (!user) return;
    if (!newDependentName || !newDependentBirthDate) {
      setSaveMessage('❌ נא למלא את שם הילד ותאריך הלידה');
      return;
    }
    try {
      const newDependent = await addDependentRemote(user.id, newDependentName, newDependentBirthDate, newDependentGender);
      setDependents([...dependents, newDependent]);
      setNewDependentName('');
      setNewDependentBirthDate('');
      setNewDependentGender('');
    } catch (err) {
      console.error('Error adding dependent:', err);
      setSaveMessage('❌ שגיאה בהוספת הילד');
    }
  };

  const removeDependent = async (id: string) => {
    if (!user) return;
    try {
      await removeDependentRemote(user.id, id);
      setDependents(dependents.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Error removing dependent:', err);
      setSaveMessage('❌ שגיאה במחיקת הילד');
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <Link href="/more" className="flex items-center gap-2 text-primary mb-6 hover:opacity-80">
        <ChevronRight className="w-4 h-4 rotate-180" />
        חזרה
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">הגדרות אישיות</h1>

      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${saveMessage.includes('✓') ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* פרטים אישיים */}
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">פרטים</h2>

        <div>
          <label className="block text-sm font-semibold mb-2">שם מלא</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="שם מלא"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">תאריך לידה</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            lang="he-IL"
            placeholder="dd/mm/yyyy"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">מין</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">בחר...</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
            <option value="other">אחר</option>
          </select>
        </div>
      </div>

      {/* ילדים */}
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">משפחה</h2>
        <p className="text-sm text-muted-foreground">הוסף ילדים כדי לקבל המלצות לפעילויות מותאמות</p>

        {dependents.length > 0 && (
          <div className="space-y-2 mb-4">
            {dependents.map((child) => (
              <Card key={child.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{child.full_name}</p>
                  <p className="text-xs text-muted-foreground">גיל {calculateAge(child.birth_date)} • {formatDateShort(child.birth_date)}</p>
                </div>
                <button
                  onClick={() => removeDependent(child.id)}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                  aria-label="מחק ילד"
                >
                  <Trash2 className="w-4 h-4 text-urgent" />
                </button>
              </Card>
            ))}
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-semibold">הוסף ילד</p>

          <input
            type="text"
            value={newDependentName}
            onChange={(e) => setNewDependentName(e.target.value)}
            placeholder="שם הילד"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <input
            type="date"
            value={newDependentBirthDate}
            onChange={(e) => setNewDependentBirthDate(e.target.value)}
            lang="he-IL"
            placeholder="dd/mm/yyyy"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <select
            value={newDependentGender}
            onChange={(e) => setNewDependentGender(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">בחר מין</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
            <option value="other">אחר</option>
          </select>

          <button
            onClick={addDependent}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            הוסף ילד
          </button>
        </div>
      </div>

      {/* כפתור שמירה */}
      <button
        onClick={saveProfile}
        disabled={isSaving}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSaving ? 'שמירה...' : 'שמור שינויים'}
      </button>
    </div>
  );
}
