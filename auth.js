// auth.js — Supabase Auth login gate with OWNER-APPROVAL.
// Anyone can sign up, but stays PENDING until the owner approves them (profiles.approved).
// Real auth: Supabase verifies credentials server-side. Source is public, so this gates the
// normal experience + protects synced data via RLS (a hard file-wall needs Cloudflare Access).
(function () {
  const URL_FALLBACK  = 'https://bxtqwyxtdlknwdjflrnl.supabase.co';
  const ANON_FALLBACK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHF3eXh0ZGxrbndkamZscm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTYxNDIsImV4cCI6MjA5NjA5MjE0Mn0.O1SJVbr__XdrmTAgaZd7n9tIi8O3i8MF7Q_zHb0UJcY';

  const SUPABASE_URL = (localStorage.getItem('faang_api') || URL_FALLBACK).replace(/\/+$/, '');
  const ANON = localStorage.getItem('faang_api_key') || ANON_FALLBACK;
  const SESSION_KEY = 'faang_sb_session';

  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
  function valid(s) { return s && s.access_token && s.expires_at && (s.expires_at * 1000 > Date.now() + 5000); }
  window.signOut = function () { localStorage.removeItem(SESSION_KEY); location.reload(); };

  const sess0 = getSession();
  if (valid(sess0) && sess0.approved === true) return; // approved & signed in → render the page

  let mode = 'login';

  const ov = document.createElement('div');
  ov.id = 'auth-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:radial-gradient(900px 500px at 70% -10%,#11202c,#0d1620 60%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
  const card = s => `<div style="background:#14202e;border:1px solid #30485c;border-radius:16px;padding:30px 28px;max-width:380px;width:100%;box-shadow:0 22px 60px rgba(0,0,0,.55);text-align:center">${s}</div>`;

  function renderLogin() {
    ov.innerHTML = card(`
      <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#34d399);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">🔐</div>
      <h2 style="color:#e3edf2;font-size:18px;margin:0 0 4px;letter-spacing:-.02em">${mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <p style="color:#7d97a8;font-size:12px;margin:0 0 18px;line-height:1.5">FAANG+ Prep Tracker — private access${mode === 'signup' ? '<br>New accounts need owner approval before access.' : ''}</p>
      <input id="auth-email" type="email" placeholder="Email" autocomplete="username" style="width:100%;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none;margin-bottom:10px">
      <input id="auth-pw" type="password" placeholder="Password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" style="width:100%;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none">
      <div id="auth-err" style="color:#f87171;font-size:12px;min-height:16px;margin:9px 0 0"></div>
      <button id="auth-btn" style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#34d399);color:#06121c;font-size:14px;font-weight:700;cursor:pointer">${mode === 'login' ? 'Sign in' : 'Sign up'}</button>
      <p style="margin:14px 0 0;font-size:12px;color:#587286">${mode === 'login' ? `No account? <a href="#" id="auth-switch" style="color:#38bdf8;text-decoration:none">Request access</a>` : `Have an account? <a href="#" id="auth-switch" style="color:#38bdf8;text-decoration:none">Sign in</a>`}</p>`);
    const btn = document.getElementById('auth-btn'); btn.addEventListener('click', submit);
    ['auth-email', 'auth-pw'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
    document.getElementById('auth-switch').addEventListener('click', e => { e.preventDefault(); mode = mode === 'login' ? 'signup' : 'login'; renderLogin(); });
    document.getElementById('auth-email').focus();
  }

  function renderPending(email) {
    ov.innerHTML = card(`
      <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#fbbf24,#fb923c);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">⏳</div>
      <h2 style="color:#e3edf2;font-size:18px;margin:0 0 6px;letter-spacing:-.02em">Pending approval</h2>
      <p style="color:#7d97a8;font-size:12px;margin:0 0 18px;line-height:1.6">Your account <b style="color:#e3edf2">${email || ''}</b> is awaiting approval. You'll get access once the owner approves you. Check back later.</p>
      <button onclick="signOut()" style="width:100%;padding:10px;border:1px solid #30485c;border-radius:9px;background:#1b2c3c;color:#7d97a8;font-size:13px;cursor:pointer">Sign out</button>`);
  }

  function renderMsg(title, msg, ok) {
    ov.innerHTML = card(`
      <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#34d399);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">📧</div>
      <h2 style="color:#e3edf2;font-size:18px;margin:0 0 6px">${title}</h2>
      <p style="color:#7d97a8;font-size:12px;margin:0 0 18px;line-height:1.6">${msg}</p>
      <button onclick="location.reload()" style="width:100%;padding:10px;border:none;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#34d399);color:#06121c;font-weight:700;font-size:13px;cursor:pointer">Back to sign in</button>`);
  }

  function err(m) { const e = document.getElementById('auth-err'); if (e) e.textContent = m; }

  async function isApproved(sess) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${sess.user.id}&select=approved`, {
        headers: { apikey: ANON, Authorization: `Bearer ${sess.access_token}` }
      });
      if (!r.ok) return false;
      const rows = await r.json();
      return Array.isArray(rows) && rows.length && rows[0].approved === true;
    } catch (e) { return false; }
  }

  function finishLogin(sess) {
    try {
      localStorage.setItem('faang_api', SUPABASE_URL);
      localStorage.setItem('faang_api_key', ANON);
      if (sess.user && sess.user.id) localStorage.setItem('faang_sync_key', sess.user.id);
    } catch (e) {}
    ov.remove();
    if (window.cloud && window.cloud.sync) window.cloud.sync(true); // pull this user's data
  }

  async function submit() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-pw').value;
    if (!email || !pw) { err('Enter email and password.'); return; }
    err('');
    const path = mode === 'login' ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';
    try {
      const r = await fetch(`${SUPABASE_URL}${path}`, {
        method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });
      const j = await r.json();
      if (mode === 'signup') {
        if (r.ok) { renderMsg('Request received', 'Your account was created and is now <b>pending owner approval</b>. You\'ll be able to sign in once approved.'); return; }
        err(j.error_description || j.msg || j.error || 'Sign-up failed.'); return;
      }
      if (r.ok && j.access_token) {
        const sess = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)), user: j.user };
        const ok = await isApproved(sess);
        sess.approved = ok;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        if (ok) finishLogin(sess); else renderPending(sess.user && sess.user.email);
      } else {
        err(j.error_description || j.msg || j.error || 'Authentication failed.');
      }
    } catch (e) { err('Network error reaching Supabase.'); }
  }

  function init() {
    document.body.appendChild(ov);
    if (valid(sess0)) {
      // signed in but not confirmed-approved → verify against the server
      renderPending(sess0.user && sess0.user.email);
      isApproved(sess0).then(ok => {
        if (ok) { sess0.approved = true; localStorage.setItem(SESSION_KEY, JSON.stringify(sess0)); finishLogin(sess0); }
        else renderPending(sess0.user && sess0.user.email);
      });
    } else {
      renderLogin();
    }
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
