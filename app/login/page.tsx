'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Phone, Mail } from 'lucide-react';

const DEMO_OTP = '123456';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 10)}`;
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!supabase) {
        // Demo mode: just show OTP screen
        setError('צריך להיות מחובר לSupabase לגוגל אימות');
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות לגוגל');
      setIsLoading(false);
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.replace(/\D/g, '')) {
      setError('נא להזין מספר טלפון');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Demo mode: show OTP screen for any phone
      setIsOtpSent(true);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת הקוד');
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('נא להזין את הקוד');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (otp !== DEMO_OTP) {
        setError('קוד שגוי');
        setIsLoading(false);
        return;
      }

      const cleanPhone = phone.replace(/\D/g, '');

      if (!supabase) {
        // Demo mode without Supabase - create local session
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          email: `phone_${cleanPhone}@local.app`,
          phone: cleanPhone,
          is_admin: cleanPhone === '5412345678' || cleanPhone === '5423456789' || cleanPhone === '5434567890' || cleanPhone === '5445678901',
        };
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        localStorage.setItem('pending_phone', cleanPhone);
        router.push('/onboarding');
        return;
      }

      // Create temp email and sign up. The password must be deterministic
      // (not random) so that returning users can sign back in with the same
      // credentials - a random password here would only ever work on the
      // very first login and fail every time after.
      const tempEmail = `phone_${cleanPhone}@local.app`;
      const tempPassword = `neve-oved-demo-${cleanPhone}-a8f3`;

      // Try to sign up
      await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
      });

      // Try to sign in (user might already exist)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('Failed to authenticate');
      }

      // Store phone for onboarding
      localStorage.setItem('pending_phone', cleanPhone);

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בביצוע הקוד');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-sans text-3xl font-bold text-primary">פוריה נווה עובד</h1>
          <p className="text-sm text-muted-foreground">
            {isOtpSent ? 'הזן את הקוד שקיבלת' : 'התחברות דרך טלפון'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isOtpSent ? verifyOtp : sendOtp} className="space-y-4">
          {error && (
            <div className="bg-urgent/20 border border-urgent text-urgent rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {!isOtpSent ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">מספר טלפון</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="050-123-4567"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                🔧 דוגמה: 050-123-4567 | קוד: 123456
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">קוד אימות</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="w-full px-4 py-2 text-center text-2xl tracking-widest rounded-lg border border-[var(--color-border)] bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'טוען...' : isOtpSent ? 'אימות' : 'שלח קוד'}
          </button>

          {isOtpSent && (
            <button
              type="button"
              onClick={() => {
                setIsOtpSent(false);
                setOtp('');
              }}
              disabled={isLoading}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              ← חזור לטלפון
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
