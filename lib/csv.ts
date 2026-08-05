export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const allRows = [headers, ...rows];
  const csv = allRows.map((r) => r.map(escapeCsvCell).join(",")).join("\n");
  // ﻿ (BOM) ensures Excel פותח את הקובץ בקידוד UTF-8 נכון עם עברית.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(cell: string | number): string {
  const value = String(cell);
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface RegistrationsCsvRow {
  title: string;
  kind: string;
  registered: number;
  minRequired: number;
  maxCapacity?: number | null;
}

export function exportRegistrationsCSV(events: RegistrationsCsvRow[]) {
  downloadCSV(
    "נרשמים.csv",
    ["חוג/פעילות", "סוג", "נרשמו", "מינימום", "מקסימום"],
    events.map((e) => [e.title, e.kind, e.registered, e.minRequired, e.maxCapacity ?? ""])
  );
}
