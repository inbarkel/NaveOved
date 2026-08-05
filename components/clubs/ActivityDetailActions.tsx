"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ClubEvent } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { getDependents, type Dependent } from "@/lib/dependents";

interface Registration {
  event_id: string;
  user_id: string;
  participant_kind: "self" | "dependent" | "other";
  dependent_id: string | null;
  custom_name?: string;
  participant_name: string;
  amount_paid: number;
  paid_at: string;
  status?: string;
}

export function ActivityDetailActions({
  event,
  registrationClosed = false,
}: {
  event: ClubEvent;
  registrationClosed?: boolean;
}) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selfChecked, setSelfChecked] = useState(true);
  const [checkedDependentIds, setCheckedDependentIds] = useState<string[]>([]);
  const [otherNames, setOtherNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (showModal && user) {
      loadDependents();
      setSelfChecked(true);
      setOtherNames([]);
    }
  }, [showModal, user]);

  useEffect(() => {
    loadMyRegistrations();
  }, [user, event.id]);

  const loadMyRegistrations = () => {
    if (!user) return;
    try {
      const stored = localStorage.getItem("registrations");
      const allRegistrations: Registration[] = stored ? JSON.parse(stored) : [];
      const mine = allRegistrations.filter(
        (r) => r.event_id === event.id && r.user_id === user.id && r.status !== "cancelled"
      );
      setMyRegistrations(mine);
    } catch (err) {
      console.error("Error loading my registrations:", err);
    }
  };

  const handleCancelRegistration = () => {
    if (!confirm("לבטל את ההרשמה שלך לפעילות זו?")) return;
    try {
      const stored = localStorage.getItem("registrations");
      const allRegistrations: Registration[] = stored ? JSON.parse(stored) : [];
      const updated = allRegistrations.map((r) =>
        r.event_id === event.id && r.user_id === user?.id ? { ...r, status: "cancelled" } : r
      );
      localStorage.setItem("registrations", JSON.stringify(updated));
      setMyRegistrations([]);
    } catch (err) {
      console.error("Error cancelling registration:", err);
      alert("שגיאה בביטול ההרשמה");
    }
  };

  const loadDependents = async () => {
    if (!user) return;
    try {
      const deps = await getDependents(user.id);
      setDependents(deps);
      setCheckedDependentIds(deps.map((d) => d.id));
    } catch (err) {
      console.error("Error loading dependents:", err);
    }
  };

  const toggleDependent = (id: string, checked: boolean) => {
    setCheckedDependentIds((prev) => (checked ? [...prev, id] : prev.filter((depId) => depId !== id)));
  };

  const handleAddOther = () => {
    if (totalParticipantCount < 8) {
      setOtherNames([...otherNames, ""]);
    }
  };

  const handleRemoveOther = (index: number) => {
    setOtherNames(otherNames.filter((_, i) => i !== index));
  };

  const handleOtherNameChange = (index: number, value: string) => {
    const updated = [...otherNames];
    updated[index] = value;
    setOtherNames(updated);
  };

  const totalParticipantCount = (selfChecked ? 1 : 0) + checkedDependentIds.length + otherNames.length;

  const getTotalPrice = () => {
    const priceAmount = event.priceAmount || 0;
    return priceAmount * totalParticipantCount;
  };

  const getParticipantLabels = () => {
    const labels: string[] = [];
    if (selfChecked) labels.push(user?.user_metadata?.full_name || "אני");
    for (const id of checkedDependentIds) {
      const dep = dependents.find((d) => d.id === id);
      if (dep) labels.push(dep.full_name);
    }
    for (const name of otherNames) {
      if (name.trim()) labels.push(name.trim());
    }
    return labels;
  };

  const handleRegister = async () => {
    if (!user) {
      alert("אנא התחבר קודם");
      return;
    }

    if (totalParticipantCount === 0) {
      alert("אנא בחר לפחות משתתף אחד");
      return;
    }

    if (otherNames.some((n) => !n.trim())) {
      alert("אנא מלא שם לכל משתתף נוסף, או הסר את השורה הריקה");
      return;
    }

    if (event.price !== "כניסה חופשית") {
      setShowPayment(true);
      return;
    }

    await saveRegistrations();
  };

  const handlePaymentComplete = async () => {
    await saveRegistrations();
  };

  const saveRegistrations = async () => {
    setLoading(true);
    try {
      const registrations: Registration[] = [];

      if (selfChecked) {
        registrations.push({
          event_id: event.id,
          user_id: user?.id || "",
          participant_kind: "self",
          dependent_id: null,
          participant_name: user?.user_metadata?.full_name || "אני",
          amount_paid: event.priceAmount || 0,
          paid_at: new Date().toISOString(),
          status: "confirmed",
        });
      }
      for (const id of checkedDependentIds) {
        const dep = dependents.find((d) => d.id === id);
        registrations.push({
          event_id: event.id,
          user_id: user?.id || "",
          participant_kind: "dependent",
          dependent_id: id,
          participant_name: dep?.full_name || "ילד/ה",
          amount_paid: event.priceAmount || 0,
          paid_at: new Date().toISOString(),
          status: "confirmed",
        });
      }
      for (const name of otherNames) {
        if (!name.trim()) continue;
        registrations.push({
          event_id: event.id,
          user_id: user?.id || "",
          participant_kind: "other",
          dependent_id: null,
          custom_name: name.trim(),
          participant_name: name.trim(),
          amount_paid: event.priceAmount || 0,
          paid_at: new Date().toISOString(),
          status: "confirmed",
        });
      }

      const stored = localStorage.getItem("registrations");
      const allRegistrations = stored ? JSON.parse(stored) : [];
      allRegistrations.push(...registrations);
      localStorage.setItem("registrations", JSON.stringify(allRegistrations));

      setRegistered(true);
      loadMyRegistrations();
      setTimeout(() => {
        setShowModal(false);
        setShowPayment(false);
        setSelfChecked(true);
        setOtherNames([]);
        setRegistered(false);
      }, 2000);
    } catch (err) {
      console.error("Error saving registration:", err);
      alert("שגיאה בשמירת ההרשמה");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button disabled className="w-full bg-primary/50 text-white py-3 rounded-lg font-semibold cursor-not-allowed">
        התחברי קודם
      </button>
    );
  }

  if (myRegistrations.length > 0) {
    return (
      <div className="space-y-2">
        <div className="bg-primary/10 rounded-2xl p-4 text-sm">
          <p className="font-semibold text-primary">✓ נרשמת לפעילות זו</p>
          <p className="text-muted-foreground mt-1">
            {myRegistrations.length} משתתפ{myRegistrations.length === 1 ? "" : "ים"}
          </p>
        </div>
        <button
          onClick={handleCancelRegistration}
          className="w-full border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 py-3 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.99] transition-colors"
        >
          בטלי הרשמה
        </button>
      </div>
    );
  }

  if (registrationClosed) {
    return (
      <button disabled className="w-full bg-surface-2 text-muted-foreground py-3 rounded-lg font-semibold cursor-not-allowed">
        ההרשמה נסגרה
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors"
      >
        להירשם
      </button>

      {showModal && !showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-sans text-xl font-bold">הרשמה ל{event.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!registered ? (
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-2xl p-4 space-y-2">
                  <p className="font-semibold text-sm">📍 מקום</p>
                  <p className="text-sm">{event.location}</p>
                </div>

                {event.price !== "כניסה חופשית" && (
                  <div className="bg-surface-2 rounded-2xl p-4 space-y-2">
                    <p className="font-semibold text-sm">💳 סוג התשלום</p>
                    <p className="text-sm text-muted-foreground">
                      {event.kind === "חוג"
                        ? "הוראת קבע חודשית"
                        : "תשלום חד פעמי"}
                    </p>
                  </div>
                )}

                <div className="space-y-3 bg-surface-2 rounded-2xl p-4">
                  <label className="block text-sm font-semibold">👥 משתתפים</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selfChecked}
                        onChange={(e) => setSelfChecked(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      {user?.user_metadata?.full_name || "אני"}
                    </label>
                    {dependents.map((dep) => (
                      <label key={dep.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checkedDependentIds.includes(dep.id)}
                          onChange={(e) => toggleDependent(dep.id, e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        👧 {dep.full_name}
                      </label>
                    ))}
                  </div>

                  {otherNames.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                      {otherNames.map((name, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleOtherNameChange(index, e.target.value)}
                            placeholder="שם המשתתף (בן/בת זוג, אורח/ת...)"
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
                          />
                          <button
                            onClick={() => handleRemoveOther(index)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalParticipantCount < 8 && (
                    <button
                      onClick={handleAddOther}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-dashed border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                    >
                      + הוספת משתתף אחר (בן/בת זוג, אורח/ת)
                    </button>
                  )}
                </div>

                {event.price !== "כניסה חופשית" && (
                  <div className="bg-surface-2 rounded-2xl p-4 space-y-2">
                    <p className="font-semibold text-sm">💰 סכום לתשלום</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {event.priceAmount} ₪ × {totalParticipantCount} משתתפ{totalParticipantCount === 1 ? "" : "ים"}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {getTotalPrice()} ₪
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading || totalParticipantCount === 0}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                >
                  {loading ? "שומרת..." : event.price === "כניסה חופשית" ? "להירשם" : "המשך לתשלום"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <p className="text-lg font-bold text-primary">✓ נרשמת בהצלחה!</p>
                <p className="text-sm text-muted-foreground">ההרשמה שלך בוצעה.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPayment && !registered && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-surface rounded-t-3xl p-6 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-sans text-xl font-bold">תשלום</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-surface-2 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-sm">סך הכל לתשלום</p>
              <p className="text-2xl font-bold text-primary">{getTotalPrice()} ₪</p>
            </div>

            <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">📌 זהו מצב הדגמה</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">התשלום לא נגבה בפועל בשלב זה - ההרשמה מאושרת מיידית.</p>
            </div>

            <div className="space-y-2 bg-surface-2 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-2">משתתפים</p>
              {getParticipantLabels().map((label, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  • {label}
                </p>
              ))}
            </div>

            <button
              onClick={handlePaymentComplete}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.99] transition-colors disabled:bg-primary/50"
            >
              {loading ? "מעבדת..." : "אשרי רישום"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
