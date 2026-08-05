"use client";

import { useEffect, useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { loadItems, saveItems } from "@/lib/community-storage";
import { useIsCommittee } from "@/lib/use-committee-role";

const STORAGE_KEY = "community_gallery";

const DEMO_PHOTOS = [
  { id: 1, title: "ערב קיץ קהילתי", alt: "תושבים בערב קיץ" },
  { id: 2, title: "מקום ירוק", alt: "גן קהילתי" },
];

export function GallerySection() {
  const { isCommittee: isAdmin } = useIsCommittee();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", file: null as File | null });
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPhotos(loadItems(STORAGE_KEY, DEMO_PHOTOS));
  }, []);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.file) {
      setMessage("כותרת ותמונה הם שדות חובה");
      return;
    }

    const updated = [...photos, { id: Date.now(), title: formData.title, alt: formData.title }];
    setPhotos(updated);
    saveItems(STORAGE_KEY, updated);
    setMessage("✓ התמונה נוספה לגלריה");
    setFormData({ title: "", file: null });
    setShowForm(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-sans text-lg font-bold">גלריית קהילה</h2>
        <p className="text-sm text-muted-foreground">תמונות מאירועים וחוויות קהילתיות</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("✓") ? "bg-green-100/50 text-green-700" : "bg-red-100/50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square rounded-2xl bg-surface-2 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-semibold text-muted-foreground">{photo.title}</p>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוסף תמונה
        </button>
      )}

      {isAdmin && showForm && (
        <form onSubmit={handleAddPhoto} className="bg-surface rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">כותרת</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="למשל: ערב קיץ קהילתי"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">תמונה</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-background text-sm"
            />
            {formData.file && <p className="text-xs text-muted-foreground mt-1">✓ {formData.file.name}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90">
              הוספה
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 text-primary border border-primary rounded-lg font-semibold hover:bg-primary/10"
            >
              ביטול
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
