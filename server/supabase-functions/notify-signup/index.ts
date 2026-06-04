// Supabase Edge Function: notify-signup
// Emails YOU when a new user signs up (pending approval), via Resend.
//
// Setup (one time):
//   1. Free Resend account → get an API key (https://resend.com).
//   2. Install Supabase CLI, then from the repo:
//        supabase functions deploy notify-signup --no-verify-jwt
//   3. Set secrets:
//        supabase secrets set RESEND_API_KEY=re_xxx OWNER_EMAIL=you@example.com FROM_EMAIL=onboarding@resend.dev
//   4. Supabase Dashboard → Database → Webhooks → "Create a new hook":
//        table: profiles · events: INSERT · type: Supabase Edge Function · function: notify-signup
//
// Now every new signup creates a pending profile row → fires this hook → emails you.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const email = payload?.record?.email ?? "(unknown)";

    const RESEND = Deno.env.get("RESEND_API_KEY");
    const OWNER  = Deno.env.get("OWNER_EMAIL");
    const FROM   = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    if (!RESEND || !OWNER) return new Response("Missing RESEND_API_KEY / OWNER_EMAIL", { status: 500 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: OWNER,
        subject: `FAANG Prep — new signup pending: ${email}`,
        html: `<p>New user <b>${email}</b> requested access to your prep tracker.</p>
               <p>To approve: Supabase → Table Editor → <code>profiles</code> → set <code>approved = true</code>, or run:</p>
               <pre>update profiles set approved = true where email = '${email}';</pre>
               <p>To deny, just leave it (or delete the row).</p>`
      })
    });
    return new Response(await res.text(), { status: res.ok ? 200 : 500 });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
