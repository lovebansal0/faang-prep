// cloud.js — optional Postgres-backed sync. No-op until you configure an API URL + sync key.
// It mirrors ALL customizable localStorage stores (status, per-problem status,
// annotations incl. code+images, notes, custom questions, custom topics, streak
// activity, done-timestamps, theme) to your sync server, and pulls them on load.
(function () {
  const KEYS = ['faang_v3','faang_pstate','faang_annot','faang_notes','faang_cq','faang_ct','faang_done_ts','faang_activity','faang_theme'];
  const CFG_API = 'faang_api', CFG_KEY = 'faang_sync_key';

  const CFG_ANON = 'faang_api_key';
  function cfg() { return { api: localStorage.getItem(CFG_API), key: localStorage.getItem(CFG_KEY), anon: localStorage.getItem(CFG_ANON) }; }
  function configured() { const { api, key } = cfg(); return !!(api && key); }
  // Supabase mode = a supabase.co URL + an anon key (talks to its REST API directly,
  // no custom server needed). Otherwise it uses the bundled Express server's /api/data.
  function isSupabase() { const { api, anon } = cfg(); return !!(anon && /supabase\.co/i.test(api || '')); }
  // prefer the logged-in user's token (so RLS can scope data to auth.uid()); fall back to anon
  function bearer(anon) {
    try { const s = JSON.parse(localStorage.getItem('faang_sb_session') || 'null'); if (s && s.access_token && s.expires_at * 1000 > Date.now()) return s.access_token; } catch (e) {}
    return anon;
  }

  let pulling = false, pushTimer = null;

  function toast(msg) { try { (window.showToast || (()=>{}))(msg); } catch (e) {} }
  function setDot(state) { // state: 'on' | 'off' | 'sync' | 'err'
    const d = document.getElementById('cloud-dot');
    if (d) d.dataset.state = state;
  }

  function schedulePush() {
    if (!configured() || pulling) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(cloudPush, 1500);
  }

  function collectBlob() {
    const blob = {};
    KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) blob[k] = v; });
    return blob;
  }
  function applyBlob(data) {
    pulling = true;
    Object.entries(data).forEach(([k, v]) => { if (KEYS.includes(k)) localStorage.setItem(k, v); });
    pulling = false;
  }

  async function cloudPush() {
    const { api, key, anon } = cfg();
    if (!api || !key) return;
    const blob = collectBlob();
    setDot('sync');
    try {
      let r;
      if (isSupabase()) {
        // PostgREST upsert into user_data (on conflict user_id)
        r = await fetch(`${api}/rest/v1/user_data`, {
          method: 'POST',
          headers: {
            apikey: anon, Authorization: `Bearer ${bearer(anon)}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify([{ user_id: key, data: blob, updated_at: new Date().toISOString() }])
        });
      } else {
        r = await fetch(`${api}/api/data/${encodeURIComponent(key)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: blob })
        });
      }
      setDot(r.ok ? 'on' : 'err');
    } catch (e) { setDot('err'); }
  }

  async function cloudPull() {
    const { api, key, anon } = cfg();
    if (!api || !key) return false;
    setDot('sync');
    try {
      let data = null;
      if (isSupabase()) {
        const r = await fetch(`${api}/rest/v1/user_data?user_id=eq.${encodeURIComponent(key)}&select=data`, {
          headers: { apikey: anon, Authorization: `Bearer ${bearer(anon)}` }
        });
        if (!r.ok) { setDot('err'); return false; }
        const rows = await r.json();
        data = Array.isArray(rows) && rows.length ? rows[0].data : null;
      } else {
        const r = await fetch(`${api}/api/data/${encodeURIComponent(key)}`);
        if (!r.ok) { setDot('err'); return false; }
        const j = await r.json();
        data = j && j.data;
      }
      setDot('on');
      if (data && typeof data === 'object') { applyBlob(data); return true; }
      return false;
    } catch (e) { setDot('err'); return false; }
  }

  // auto-push on any change to a tracked key
  const _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (k, v) { _set(k, v); if (KEYS.includes(k)) schedulePush(); };

  // public API
  window.cloud = {
    cfg, configured,
    connect(api, key, anon) {
      api = (api || '').trim().replace(/\/+$/, '');
      key = (key || '').trim();
      anon = (anon || '').trim();
      if (!api || !key) { toast('Enter both API URL and sync key.'); return; }
      localStorage.setItem(CFG_API, api);
      localStorage.setItem(CFG_KEY, key);
      if (anon) localStorage.setItem(CFG_ANON, anon); else localStorage.removeItem(CFG_ANON);
      this.sync(true);
    },
    disconnect() { localStorage.removeItem(CFG_API); localStorage.removeItem(CFG_KEY); localStorage.removeItem(CFG_ANON); setDot('off'); toast('Cloud sync disconnected.'); },
    isSupabase,
    async sync(pullFirst) {
      if (!configured()) return;
      if (pullFirst) {
        const got = await cloudPull();
        if (got && window.reloadFromStorage) window.reloadFromStorage();
        toast(got ? '☁️ Pulled your data from the cloud.' : '☁️ Connected — pushing local data.');
        if (!got) await cloudPush(); // first device: seed the cloud
      } else {
        await cloudPush();
        toast('☁️ Pushed to cloud.');
      }
    },
    push: cloudPush, pull: cloudPull
  };

  // pull on load
  window.addEventListener('DOMContentLoaded', async () => {
    setDot(configured() ? 'on' : 'off');
    if (configured()) {
      const got = await cloudPull();
      if (got && window.reloadFromStorage) window.reloadFromStorage();
    }
  });
})();
