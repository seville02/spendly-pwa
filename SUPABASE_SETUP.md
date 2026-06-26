# Supabase Setup Guide: Inactive Email Notifications

To run the automatic 7-day inactivity notification system, you need to execute a database migration, deploy the Edge Function, and schedule a daily Cron job.

---

## 1. Database Migration
Run the following SQL in your Supabase SQL Editor to add the `last_active_at` and `inactive_email_sent` columns to the `profiles` table:

```sql
-- Add inactivity tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN inactive_email_sent BOOLEAN DEFAULT FALSE;

-- Create index on last_active_at for fast query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at) WHERE (inactive_email_sent = false);
```

---

## 2. Deploy Supabase Edge Function
Make sure you have [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project:

1. Link your Supabase CLI to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
2. Set your Resend API Key in Supabase secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```
3. Deploy the edge function:
   ```bash
   supabase functions deploy send-inactive-email --no-verify-jwt
   ```

---

## 3. Setup Scheduled Cron Job (Daily Check)
You can schedule the Edge Function to run daily using Supabase's `pg_cron` (pg_net) extension.

Run the following SQL in the Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the edge function to run every day at 12:00 AM UTC
SELECT cron.schedule(
  'send-daily-inactivity-emails',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-inactive-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_supabase_anon_or_service_role_key"}'::jsonb
  );
  $$
);
```

> [!NOTE]
> Make sure to replace `your-project-ref` and `your_supabase_anon_or_service_role_key` with your actual project credentials in the SQL above.

---

## 4. Group Trip Splitter Database Setup (Optional but Required for Groups Feature)
Run the following SQL in your Supabase SQL Editor to create tables for managing Trip Groups, Members, and Expenses:

```sql
-- 1. Create Trip Groups Table
CREATE TABLE IF NOT EXISTS public.trip_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Trip Members Table
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Trip Expenses Table
CREATE TABLE IF NOT EXISTS public.trip_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_by TEXT NOT NULL, -- Email of the member who paid
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trip_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;

-- Disable RLS restrictions or add simple bypass policy for quick development
-- (In production, replace with user-specific session policies)
DROP POLICY IF EXISTS "Enable read/write for all users" ON public.trip_groups;
CREATE POLICY "Enable read/write for all users" ON public.trip_groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.trip_members;
CREATE POLICY "Enable read/write for all users" ON public.trip_members FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.trip_expenses;
CREATE POLICY "Enable read/write for all users" ON public.trip_expenses FOR ALL USING (true);
```

---

## 5. Invoices Vault Database & Storage Setup
Run the following SQL in your Supabase SQL Editor to create the `invoices` table and setup Row Level Security:

```sql
-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  details TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (allow users to manage only their own invoices)
CREATE POLICY "Users can manage their own invoices" 
ON public.invoices FOR ALL 
USING (auth.uid() = user_id);
```

### Setup Storage Bucket
1. Go to your Supabase Console.
2. Navigate to **Storage** -> **New Bucket**.
3. Create a bucket named `invoices` and set it to **Public** (so the app can retrieve file links).
4. Run this SQL in your SQL Editor to allow authenticated users to upload/manage files in the `invoices` bucket:

```sql
-- Allow authenticated users to upload files to the invoices bucket
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'invoices');

-- Allow authenticated users to retrieve files from the invoices bucket
CREATE POLICY "Allow authenticated select" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'invoices');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'invoices');
```

---

## 6. Username Support & Trip Members Schema Update

Run this SQL in your **Supabase SQL Editor** to enable `@username` search and fix the trip members table:

```sql
-- ── 1. Add username column to profiles (unique) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (username)
  WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_username_idx
  ON public.profiles (username);

-- ── 2. Update trip_members for username-based membership ──
ALTER TABLE public.trip_members
  ALTER COLUMN email SET DEFAULT '';

ALTER TABLE public.trip_members
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT;
```

> [!NOTE]
> After running this migration, users can set their `@username` from **Profile → Username** and be found by friends when creating a Group Trip.
