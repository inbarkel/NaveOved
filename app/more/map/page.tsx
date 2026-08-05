import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function MapPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <Link href="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronRight className="w-4 h-4" aria-hidden />
        חזרה
      </Link>
      <h1 className="font-sans text-2xl font-bold">מפה</h1>

      <Card className="p-4 flex items-center gap-3">
        <div className="rounded-xl bg-surface-2 p-2.5 shrink-0">
          <MapPin className="w-5 h-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">פוריה נווה עובד</p>
          <p className="text-xs text-muted-foreground">מועצה אזורית עמק הירדן</p>
        </div>
      </Card>

      <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-surface-2">
        <Image
          src="/images/map.jpeg"
          alt="מפת פוריה נווה עובד"
          fill
          className="object-cover"
        />
      </div>

      <a
        href="https://www.google.com/maps/search/?api=1&query=%D7%A4%D7%95%D7%A8%D7%99%D7%94+%D7%A0%D7%95%D7%95%D7%94+%D7%A2%D7%95%D7%91%D7%93"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" aria-hidden />
          פתיחה ב-Google Maps
        </span>
      </a>
    </div>
  );
}
