const HEBREW_DAY_TO_ICS: Record<string, string> = {
  ראשון: "SU",
  שני: "MO",
  שלישי: "TU",
  רביעי: "WE",
  חמישי: "TH",
  שישי: "FR",
  שבת: "SA",
};

export interface DownloadIcsInput {
  title: string;
  location: string;
  instructorName: string;
  instructorPhone: string;
  daysOfWeek: string[];
}

export function downloadICS(event: DownloadIcsInput) {
  const byDays = event.daysOfWeek
    .map((d) => HEBREW_DAY_TO_ICS[d])
    .filter(Boolean)
    .join(",");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:איש קשר: ${event.instructorName} ${event.instructorPhone}`,
    byDays ? `RRULE:FREQ=WEEKLY;BYDAY=${byDays}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
