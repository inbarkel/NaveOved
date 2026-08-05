import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GallerySection } from "@/components/community/GallerySection";

export default function GalleryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <GallerySection />
    </div>
  );
}
