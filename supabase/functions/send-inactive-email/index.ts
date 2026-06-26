// supabase/functions/send-inactive-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  // Only allow POST requests for execution
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing environment variables: RESEND_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500 }
    )
  }

  // Create Supabase Admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Get profiles where last_active_at is older than 7 days and email has not been sent
    // We also fetch email by querying the auth.users using supabase admin API
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, last_active_at')
      .lt('last_active_at', sevenDaysAgo)
      .eq('inactive_email_sent', false)

    if (profileError) throw profileError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No inactive users found.' }), { status: 200 })
    }

    const results = []

    for (const profile of profiles) {
      // 2. Fetch user's email from Supabase Auth admin API
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id)
      
      if (userError || !user || !user.email) {
        console.error(`Failed to get email for user ${profile.id}:`, userError)
        continue
      }

      const email = user.email
      const name = profile.name || 'Value User'

      // 3. Send email via Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Spendly <noreply@spendly.in>', // Update with your verified domain
          to: [email],
          subject: 'We miss you on Spendly! 👋',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4fd1c5;">Hey ${name},</h2>
              <p>We noticed you haven't logged in to <strong>Spendly</strong> in the last 7 days.</p>
              <p>Tracking your daily expenses and savings is key to maintaining healthy financial habits. Don't let your streaks drop!</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://seville02.github.io/spendly-pwa/" style="background-color: #4fd1c5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Launch Spendly</a>
              </div>
              <p>See you soon,<br>The Spendly Team</p>
            </div>
          `
        })
      })

      if (emailResponse.ok) {
        // 4. Mark email as sent in profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ inactive_email_sent: true })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`Failed to update profile for ${profile.id}:`, updateError)
        }
        results.push({ userId: profile.id, email, status: 'sent' })
      } else {
        const errorText = await emailResponse.text()
        console.error(`Failed to send email to ${email}:`, errorText)
        results.push({ userId: profile.id, email, status: 'failed', error: errorText })
      }
    }

    return new Response(JSON.stringify({ results }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
