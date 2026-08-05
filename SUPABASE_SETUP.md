# Supabase Setup Instructions

## לתקן את Demo Mode Announcements

### Option 1: Run via Supabase CLI (במהלך ייצור)
```bash
supabase db push
```

### Option 2: Run manually via Supabase Web Console (עכשיו)

1. Go to https://app.supabase.com
2. Select your project: **neve-oved** (dpcubpggkogcdgqxugke)
3. Go to **SQL Editor** (בצד שמאל)
4. Click **New query**
5. Copy & paste את הקוד מ-`supabase/migrations/0005_fix_demo_mode.sql`
6. Click **Run**

### What this does:
- ✅ Relaxes RLS policies ל-allow demo mode
- ✅ משבית את ה-committee-only restriction
- ✅ מפעילה Realtime publication ל-announcements

### After running the migration:

1. **Go back to the app** (http://localhost:3000/admin)
2. **Create a test announcement** - it should now save to localStorage
3. **Go to home** (http://localhost:3000) - announcement should appear

### If it still doesn't work:

Check in Supabase SQL Editor:
```sql
SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5;
```

If announcements are there but not showing in the app:
- Problem is with RLS (data exists but RLS blocks read)
- Or with hook logic (not querying DB correctly)

## Realtime Verification

To test if Realtime is working:
1. Open home page in two browser windows
2. Create announcement in admin in one window
3. Should appear instantly in the other window

If not working: Realtime subscription might not be set up correctly (check browser console for connection errors).
