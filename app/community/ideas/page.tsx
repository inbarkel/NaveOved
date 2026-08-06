"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Plus, Lightbulb, ThumbsUp, ChevronRight } from "lucide-react";
import { loadItems, saveItems } from "@/lib/community-storage";

const IDEAS_KEY = "community_ideas";
const VOTES_KEY = "community_ideas_votes";

const DEMO_IDEAS = [
  { id: 1, title: "אזור צל בגן", description: "להוסיף שמשיות לגן השעשועים", votes: 12 },
  { id: 2, title: "כביש אופניים", description: "נתיב בטוח לרוכבי אופניים", votes: 8 },
];

export default function IdeasPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [ideas, setIdeas] = useState(DEMO_IDEAS);
  const [votes, setVotes] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIdeas(loadItems(IDEAS_KEY, DEMO_IDEAS));
    try {
      const storedVotes = localStorage.getItem(VOTES_KEY);
      if (storedVotes) setVotes(JSON.parse(storedVotes));
    } catch (err) {
      console.error("Error loading votes:", err);
    }
  }, []);

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage("כותרת הרעיון הוא שדה חובה");
      return;
    }

    const updated = [...ideas, { id: Date.now(), title: formData.title, description: formData.description, votes: 0 }];
    setIdeas(updated);
    saveItems(IDEAS_KEY, updated);
    setMessage("✓ הרעיון שלך הועלה לאישור הוועד");
    setFormData({ title: "", description: "" });
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleVote = (id: number) => {
    const updatedVotes = { ...votes, [id]: !votes[id] };
    setVotes(updatedVotes);
    localStorage.setItem(VOTES_KEY, JSON.stringify(updatedVotes));

    const updatedIdeas = ideas.map((idea) =>
      idea.id === id
        ? { ...idea, votes: idea.votes + (votes[id] ? -1 : 1) }
        : idea
    );
    setIdeas(updatedIdeas);
    saveItems(IDEAS_KEY, updatedIdeas);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <div>
        <h1 className="font-sans text-2xl font-bold">הצעות תושבים והצבעות</h1>
        <p className="text-sm text-muted-foreground mt-1">הציעו רעיונות להשבחת המושב והצביעו על הרעיונות שאתם תומכים בהם</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("✓") ? "bg-green-100/50 text-green-700" : "bg-red-100/50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {ideas.map((idea) => (
          <Card key={idea.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-surface-2 p-2 shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{idea.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                <button
                  onClick={() => toggleVote(idea.id)}
                  className={`flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    votes[idea.id]
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {idea.votes}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          הציע רעיון
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddIdea} className="bg-surface rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">כותרת הרעיון</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="למשל: אזור צל בגן"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תיאור</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="למה זה חשוב?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90">
              שלח לאישור
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 text-primary border border-primary rounded-lg font-semibold hover:bg-primary/10"
            >
              ביטול
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center">⏳ הרעיון שלך יופיע כאן כשהוועד יאישור</p>
        </form>
      )}
    </div>
  );
}
