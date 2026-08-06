/**
 * דאטה-דמה לשלב השלד העיצובי בלבד (שלב 2 בתוכנית).
 * הצורה תואמת בכוונה למבנה הטבלאות המתוכנן ב-Supabase כדי שהחלפה ל-hooks אמיתיים
 * (שלב 3 ואילך) תהיה קלה — לא שינוי מבנה, רק מקור הנתונים.
 */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  urgent: boolean;
  createdAt: string;
}

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "💧 תקלת מים ברחוב הזית",
    body: "צוות המושב בדרך לטפל בתקלה. עדכון נוסף יפורסם כאן ברגע שהמים יחזרו.",
    urgent: true,
    createdAt: "2026-08-02T07:40:00",
  },
  {
    id: "a2",
    title: "🦟 ריסוס יתושים ביום רביעי",
    body: "ריסוס מתוכנן בשטחים הציבוריים בין 06:00–08:00. מומלץ לא לשהות בחוץ בשעות אלו.",
    urgent: false,
    createdAt: "2026-08-01T18:10:00",
  },
  {
    id: "a3",
    title: "📢 ישיבת ועד פתוחה",
    body: "ביום שלישי הקרוב בשעה 20:00 במזכירות. כל התושבים מוזמנים להשתתף.",
    urgent: false,
    createdAt: "2026-07-30T09:00:00",
  },
  {
    id: "a4",
    title: "🌳 עץ נפל בגן השעשועים",
    body: "עץ גדול נפל באמש בגלל הרוח החזקה. השטח סגור עד לניקוי. צרו זהירות!",
    urgent: true,
    createdAt: "2026-07-29T22:15:00",
  },
  {
    id: "a5",
    title: "📅 רישום לחוגים סתיו 2026",
    body: "רישום קדם לחוגים לסתיו פתוח כבר! בחרו את החוגים שלכם וקבלו הנחה מוקדמת של 10%.",
    urgent: false,
    createdAt: "2026-07-28T10:00:00",
  },
];

export interface ClubEvent {
  id: string;
  kind: "חוג" | "פעילות";
  title: string;
  description: string;
  iconKey: string;
  image?: string;
  ageMinYears?: number;
  ageMaxYears?: number;
  price: string; // תצוגה: "80 ₪ לילד", "כניסה חופשית"
  priceAmount?: number; // רק לפעילויות ששילם: מחיר לאדם בשקלים (להכפלה בכמות משתתפים)
  daysOfWeek: string[];
  time: string;
  location: string;
  instructorName: string;
  instructorPhone: string;
  registered: number;
  minRequired: number;
  maxCapacity?: number;
  eventDate?: string; // ISO datetime לפעילויות בלבד (תאריך מסוים)
  startDate?: string; // ISO date לחוגים בלבד (תאריך התחלת החוג)
  endDate?: string; // ISO date לחוגים בלבד (תאריך סיום החוג)
  status?: "active" | "cancelled" | "postponed"; // סטטוס של הפעילות
  rescheduledTo?: string; // תאריך חדש אם הדחו
  isExternal?: boolean; // פעילות מחוץ למושב - הצגה בלבד, בלי הרשמה/תשלום/מינימום
  registrationDeadline?: string; // ISO datetime; אם לא הוגדר, ברירת המחדל היא eventDate (יום הפעילות עצמו)
}

export const DEMO_CLUBS: ClubEvent[] = [
  {
    id: "c1",
    kind: "חוג",
    title: "התעמלות בוקר לגיל השלישי",
    description:
      "שיעור התעמלות מותאם לגיל השלישי - חיזוק, גמישות ושיווי משקל, בקצב נעים ובליווי מדריכה מוסמכת. מתאים לכל רמת כושר.",
    iconKey: "dumbbell",
    ageMinYears: 60,
    price: "80 ₪ לחודש",
    priceAmount: 80,
    daysOfWeek: ["ראשון", "שלישי", "חמישי"],
    time: "08:00–09:00",
    location: "מועדון הוותיקים",
    instructorName: "רונית לוי",
    instructorPhone: "050-1234567",
    registered: 14,
    minRequired: 8,
    maxCapacity: 20,
    startDate: "2026-09-01",
    endDate: "2027-07-31",
  },
  {
    id: "c2",
    kind: "חוג",
    title: "כדורגל ילדים",
    description: "חוג כדורגל שכיף ומקצועי כאחד - עבודה על טכניקה, עבודת צוות ומשחק הוגן. נדרשים נעלי ספורט וביגוד נוח.",
    iconKey: "ball",
    ageMinYears: 6,
    ageMaxYears: 9,
    price: "150 ₪ לחודש",
    priceAmount: 150,
    daysOfWeek: ["שני", "רביעי"],
    time: "16:30–17:30",
    location: "מגרש הספורט",
    instructorName: "דני כהן",
    instructorPhone: "052-7654321",
    registered: 5,
    minRequired: 8,
    maxCapacity: 16,
    startDate: "2026-09-01",
    endDate: "2027-07-31",
  },
  {
    id: "c3",
    kind: "פעילות",
    title: "ערב קולנוע קהילתי",
    description: "הקרנת סרט משפחתי תחת כיפת השמיים על מדשאת המועדון. כיסאות מתקפלים מומלצים, כיבוד קל יוגש במקום.",
    iconKey: "party",
    price: "כניסה חופשית",
    daysOfWeek: ["שישי"],
    time: "20:30",
    location: "מדשאת המועדון",
    instructorName: "הוועד",
    instructorPhone: "*2555",
    registered: 22,
    minRequired: 10,
    eventDate: "2026-08-08T20:30:00",
    status: "active",
  },
  {
    id: "c4",
    kind: "פעילות",
    title: "טיול משפחתי להר תבור",
    description: "טיול נעים בהר תבור עם תצפית על הכנרת. מתאים לכל הגילאים. נא להביא מים ומצעים.",
    iconKey: "hiking",
    ageMinYears: 3,
    price: "50 ₪ לאדם",
    priceAmount: 50,
    daysOfWeek: ["שני"],
    time: "09:00",
    location: "שער הר תבור",
    instructorName: "גלעד שור",
    instructorPhone: "050-5555555",
    registered: 8,
    minRequired: 5,
    maxCapacity: 30,
    eventDate: "2026-08-10T09:00:00",
    status: "active",
  },
  {
    id: "c5",
    kind: "פעילות",
    title: "הרצאה: בריאות וטיפול טבעי",
    description: "הרצאה מעניינת על שיטות רפואה טבעית וטיפול כולל. מנחה: ד״ר מירי לביא.",
    iconKey: "heart",
    price: "כניסה חופשית",
    daysOfWeek: ["שלישי"],
    time: "19:00",
    location: "מזכירות המושב",
    instructorName: "ד״ר מירי לביא",
    instructorPhone: "050-6666666",
    registered: 12,
    minRequired: 8,
    eventDate: "2026-08-06T19:00:00",
    status: "active",
  },
  {
    id: "c6",
    kind: "פעילות",
    title: "סדנת דיג לילדים",
    description: "סדנת דיג בחוף ההר. נלמד על דג ודיגים מקומיים, וננסה לתפוס דג! זהו חוויה אמיתית.",
    iconKey: "fishing",
    ageMinYears: 7,
    ageMaxYears: 14,
    price: "80 ₪ לילד",
    priceAmount: 80,
    daysOfWeek: ["חמישי"],
    time: "15:00",
    location: "חוף המוקדש לדיג",
    instructorName: "שלום דג",
    instructorPhone: "050-7777777",
    registered: 6,
    minRequired: 4,
    maxCapacity: 12,
    eventDate: "2026-08-15T15:00:00",
    status: "active",
  },
  {
    id: "c7",
    kind: "פעילות",
    title: "סדנת צילום בטבע (בוטל)",
    description: "סדנת צילום שבטבע (בוטלה לרעות מזג אוויר).",
    iconKey: "camera",
    price: "60 ₪ לנכנס",
    priceAmount: 60,
    daysOfWeek: ["שני"],
    time: "10:00",
    location: "גן החן",
    instructorName: "רן צילום",
    instructorPhone: "050-8888888",
    registered: 0,
    minRequired: 5,
    eventDate: "2026-07-28T10:00:00",
    status: "cancelled",
  },
  {
    id: "c7a",
    kind: "פעילות",
    title: "סדנת צילום בטבע - מועד חדש",
    description: "סדנת צילום בטבע - אותה סדנה בתאריך חדש.",
    iconKey: "camera",
    price: "60 ₪ לנכנס",
    priceAmount: 60,
    daysOfWeek: ["חמישי"],
    time: "10:00",
    location: "גן החן",
    instructorName: "רן צילום",
    instructorPhone: "050-8888888",
    registered: 3,
    minRequired: 5,
    eventDate: "2026-08-21T10:00:00",
    status: "postponed",
    rescheduledTo: "2026-08-21",
  },
  {
    id: "ext1",
    kind: "פעילות",
    title: "יריד אומנים בעמק הירדן",
    description: "יריד אומנים ומלאכת יד אזורי, עם דוכני אוכל ומופעים לילדים. מתקיים במרכז המבקרים האזורי.",
    iconKey: "map",
    price: "כניסה חופשית",
    daysOfWeek: [],
    time: "17:00",
    location: "מרכז המבקרים, עמק הירדן",
    instructorName: "המועצה האזורית עמק הירדן",
    instructorPhone: "04-6758111",
    registered: 0,
    minRequired: 0,
    eventDate: "2026-08-14T17:00:00",
    status: "active",
    isExternal: true,
  },
  {
    id: "ext2",
    kind: "פעילות",
    title: "מופע מוזיקה באמפי טבריה",
    description: "ערב הופעות חי באמפיתיאטרון טבריה, נוף לכנרת. מומלץ להגיע מוקדם ולהביא כיסאות מתקפלים.",
    iconKey: "music",
    price: "90 ₪ לכרטיס",
    daysOfWeek: [],
    time: "20:00",
    location: "אמפי טבריה",
    instructorName: "עיריית טבריה",
    instructorPhone: "04-6728888",
    registered: 0,
    minRequired: 0,
    eventDate: "2026-08-20T20:00:00",
    status: "active",
    isExternal: true,
  },
];

export interface TownBoardItem {
  id: string;
  category: "job" | "committee_notice";
  title: string;
  body: string;
  contactPhone?: string;
}

export const DEMO_TOWN_BOARD: TownBoardItem[] = [
  {
    id: "t1",
    category: "committee_notice",
    title: "עדכון תקציב ועד לשנת 2026",
    body: "המסמך המלא זמין לעיון במזכירות. שאלות ניתן להפנות לוועד.",
  },
  {
    id: "t2",
    category: "job",
    title: "מכרז לאספקת שירותי גינון לשטחים הציבוריים",
    body: "המכרז פתוח להגשות עד סוף החודש. מסמכי המכרז זמינים במזכירות.",
    contactPhone: "050-9998877",
  },
];

export interface ResidentItem {
  id: string;
  title: string;
  body: string;
  contactPhone?: string;
  createdAt: string;
  resolvedAt?: string; // תאריך שהמשתמש סימן ✓
  lastRenewedAt?: string; // תאריך ה-renewal האחרון
  itemType?: "lost" | "found"; // רק לאבידות ומציאות
}

export const DEMO_RENTALS: ResidentItem[] = [
  {
    id: "r1",
    title: "מגרש פנוי להשכרה לגינון",
    body: "כ-200 מ״ר בקצה הרחוב המערבי, מתאים לגינת ירק קהילתית.",
    contactPhone: "052-4443322",
    createdAt: "2026-08-02T10:00:00",
  },
  {
    id: "r2",
    title: "דירה להשכרה בקומה 2",
    body: "דירת 2 חדרים, מעודכנת, קרוב לשביל. זמינה מ-1 בספטמבר.",
    contactPhone: "050-1111111",
    createdAt: "2026-07-25T14:30:00",
  },
];

// יד שנייה
export const DEMO_SECONDHAND: ResidentItem[] = [
  {
    id: "s1",
    title: "דוד מים חשמלי בחינם",
    body: "דוד מים חשמלי שעבד מצוין, כמעט לא בשימוש. רוצים להעביר לבית חדש.",
    contactPhone: "054-2222222",
    createdAt: "2026-08-01T09:15:00",
  },
  {
    id: "s2",
    title: "רהיטים - שולחן ו-4 כיסאות",
    body: "סט רהיטים עץ מעץ איכותי. בתנאי טוב מאוד, מחפשים בית חדש.",
    contactPhone: "052-3333333",
    createdAt: "2026-07-28T16:45:00",
    resolvedAt: "2026-08-03T11:00:00", // סימנו ✓
  },
];

// אבידות ומציאות
export const DEMO_LOSTFOUND: ResidentItem[] = [
  {
    id: "lf1",
    title: "מפתחות עם תג כחול",
    body: "אבדו מפתחות בחזקה בסביב האולם. תג כחול עם מסגרת מטאל.",
    contactPhone: "050-4444444",
    createdAt: "2026-08-02T12:00:00",
    itemType: "lost",
  },
  {
    id: "lf2",
    title: "ארנק עם מסמכים",
    body: "מצאתי ארנק עם מסמכים ברחוב הזית. בעל, אנא צור קשר.",
    contactPhone: "052-5555555",
    createdAt: "2026-07-30T17:20:00",
    resolvedAt: "2026-08-02T10:30:00", // סימנו ✓
    itemType: "found",
  },
];

// רעיונות והצבעות
export const DEMO_IDEAS: ResidentItem[] = [
  {
    id: "id1",
    title: "הוספת ספסלים בגן השעשועים",
    body: "האם כולם בעד הוספת ספסלים בגן השעשועים? חשוב לנו שתושבים יוכלו לשבת ולהנות.",
    createdAt: "2026-07-26T13:00:00",
  },
  {
    id: "id2",
    title: "קורס דיגיטל לתושבים מבוגרים",
    body: "מי היה מעוניין בקורס זום/וואטסאפ/תמונות? הרבה מבוגרים רוצים ללמוד.",
    createdAt: "2026-07-22T09:30:00",
  },
];

// עסקים מקומיים
export const DEMO_BUSINESSES: ResidentItem[] = [
  {
    id: "b1",
    title: "יוני - אלקטריקאי",
    body: "אלקטריקאי מקצועי, עובד בזהירות וציות בטיחות. מחירים הוגנים.",
    contactPhone: "050-6666666",
    createdAt: "2026-07-20T11:00:00",
  },
  {
    id: "b2",
    title: "תיקיות מתנות - רוני",
    body: "אני עושה תיקיות מתנות בהתאמה אישית לאירועים. יוצר/ת עם תשומת לב.",
    contactPhone: "054-7777777",
    createdAt: "2026-08-01T15:45:00",
  },
];

export type RentalItem = ResidentItem;

export const QUICK_ACTIONS = [
  { label: "מספרי טלפון", href: "/more/contacts", iconKey: "phone" },
  { label: "חירום", href: "/more/emergency", iconKey: "shield" },
  { label: "וואטסאפ", href: "https://chat.whatsapp.com/Dsqwm62i1EoJvL38y9niB4", iconKey: "megaphone" },
];

export interface ServiceContact {
  id: string;
  name: string;
  phone: string;
  category: "office" | "clinic" | "emergency" | "leadership" | "hospital";
}

export const SERVICE_CONTACTS: ServiceContact[] = [
  // משדרות
  { id: "s1", name: "משטרה", phone: "100", category: "emergency" },
  { id: "s2", name: "אמבולנס", phone: "101", category: "emergency" },
  { id: "s3", name: "מכבי אש", phone: "102", category: "emergency" },
  // בית חולים צפון (פוריה)
  { id: "s4", name: "דלפק קבלה (ריפואי כללי)", phone: "04-6652886", category: "hospital" },
  { id: "s5", name: "דלפק קבלה (חלופי)", phone: "04-6652889", category: "hospital" },
  { id: "s6", name: "מוקד מיון יולדות", phone: "04-6652920", category: "hospital" },
  // מזכירות ומנהלה
  { id: "s7", name: "מזכירות המושב", phone: "04-6750042", category: "office" },
  { id: "s8", name: "קב״ט המועצה - קובי אלברט", phone: "04-6757640", category: "office" },
  { id: "s9", name: "קב״ט המועצה - סלולרי", phone: "050-6272609", category: "office" },
  // קלینקה וטיפול
  { id: "s10", name: "טיפת חלב", phone: "04-6752043", category: "clinic" },
  { id: "s11", name: "מרפאה", phone: "04-6750843", category: "clinic" },
  // הנהגה
  { id: "s12", name: "אבישג - יו״ר הועד", phone: "054-6388485", category: "leadership" },
  { id: "s13", name: "עליזה - מנהלת הקהילה", phone: "050-7799947", category: "leadership" },
];
