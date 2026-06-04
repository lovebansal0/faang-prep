// auth.js — Supabase Auth login gate (REAL auth: Supabase verifies credentials server-side).
// Reuses the cloud-sync config (Supabase URL + anon key) from localStorage. To lock the
// site on a BRAND-NEW device / for everyone, paste your anon key into ANON_FALLBACK below
// (the Supabase anon key is safe to expose in frontend WHEN Row Level Security is enabled).
(function () {
  const URL_FALLBACK  = 'https://bxtqwyxtdlknwdjflrnl.supabase.co';
  const ANON_FALLBACK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHF3eXh0ZGxrbndkamZscm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTYxNDIsImV4cCI6MjA5NjA5MjE0Mn0.O1SJVbr__XdrmTAgaZd7n9tIi8O3i8MF7Q_zHb0UJcY';

  const SUPABASE_URL = (localStorage.getItem('faang_api') || URL_FALLBACK).replace(/\/+$/, '');
  const ANON = localStorage.getItem('faang_api_key') || ANON_FALLBACK;
  const SESSION_KEY = 'faang_sb_session';

  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
  function valid(s) { return s && s.access_token && s.expires_at && (s.expires_at * 1000 > Date.now() + 5000); }

  // sign-out is always available (even when already signed in)
  window.signOut = function () { localStorage.removeItem(SESSION_KEY); location.reload(); };

  if (valid(getSession())) return; // already signed in — let the page render

  let mode = 'login'; // or 'signup'

  const ov = document.createElement('div');
  ov.id = 'auth-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:radial-gradient(900px 500px at 70% -10%,#11202c,#0d1620 60%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';

  function render() {
    const noCfg = !ANON;
    ov.innerHTML = `
      <div style="background:#14202e;border:1px solid #30485c;border-radius:16px;padding:30px 28px;max-width:380px;width:100%;box-shadow:0 22px 60px rgba(0,0,0,.55)">
        <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#34d399);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">🔐</div>
        <h2 style="color:#e3edf2;font-size:18px;margin:0 0 4px;text-align:center;letter-spacing:-.02em">${mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p style="color:#7d97a8;font-size:12px;margin:0 0 18px;text-align:center;line-height:1.5">FAANG+ Prep Tracker — private access</p>
        ${noCfg ? `<p style="color:#fbbf24;font-size:11px;background:rgba(251,191,36,.1);border:1px solid #fbbf2455;border-radius:8px;padding:8px 10px;margin-bottom:12px;line-height:1.5">Auth not configured on this device. Paste your Supabase anon key in <b>auth.js</b> (ANON_FALLBACK) to enable, or use the link below.</p>` : ''}
        <input id="auth-email" type="email" placeholder="Email" autocomplete="username"
          style="width:100%;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none;margin-bottom:10px">
        <input id="auth-pw" type="password" placeholder="Password" autocomplete="current-password"
          style="width:100%;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none">
        <div id="auth-err" style="color:#f87171;font-size:12px;min-height:16px;margin:9px 0 0"></div>
        <button id="auth-btn" style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#34d399);color:#06121c;font-size:14px;font-weight:700;cursor:pointer">${mode === 'login' ? 'Sign in' : 'Sign up'}</button>
        <p style="text-align:center;margin:14px 0 0;font-size:12px;color:#587286">
          ${mode === 'login' ? `No account? <a href="#" id="auth-switch" style="color:#38bdf8;text-decoration:none">Create one</a>` : `Have an account? <a href="#" id="auth-switch" style="color:#38bdf8;text-decoration:none">Sign in</a>`}
        </p>
      </div>`;
    wire();
  }

  function err(m) { const e = document.getElementById('auth-err'); if (e) e.textContent = m; }

  async function submit() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-pw').value;
    if (!email || !pw) { err('Enter email and password.'); return; }
    if (!ANON) { err('Auth not configured (no anon key).'); return; }
    err('');
    const path = mode === 'login' ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';
    try {
      const r = await fetch(`${SUPABASE_URL}${path}`, {
        method: 'POST',
        headers: { apikey: ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });
      const j = await r.json();
      if (mode === 'signup' && r.ok && !j.access_token) {
        err(''); ov.querySelector('h2').textContent = 'Check your email';
        document.getElementById('auth-err').style.color = '#34d399';
        err('Account created. Confirm via the email link, then sign in.');
        mode = 'login'; return;
      }
      if (r.ok && j.access_token) {
        const sess = {
          access_token: j.access_token, refresh_token: j.refresh_token,
          expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)),
          user: j.user
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        // UNIFY auth + sync: point cloud sync at this account automatically, then pull your data
        try {
          localStorage.setItem('faang_api', SUPABASE_URL);
          if (ANON) localStorage.setItem('faang_api_key', ANON);
          if (sess.user && sess.user.id) localStorage.setItem('faang_sync_key', sess.user.id);
        } catch (e) {}
        ov.remove();
        if (window.cloud && window.cloud.sync) window.cloud.sync(true); // pull this user's progress
      } else {
        err(j.error_description || j.msg || j.error || 'Authentication failed.');
      }
    } catch (e) { err('Network error reaching Supabase.'); }
  }

  function wire() {
    document.getElementById('auth-btn').addEventListener('click', submit);
    ['auth-email', 'auth-pw'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
    const sw = document.getElementById('auth-switch');
    if (sw) sw.addEventListener('click', e => { e.preventDefault(); mode = mode === 'login' ? 'signup' : 'login'; render(); });
  }

  function mount() { document.body.appendChild(ov); render(); document.getElementById('auth-email')?.focus(); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
