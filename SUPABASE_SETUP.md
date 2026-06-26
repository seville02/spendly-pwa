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
