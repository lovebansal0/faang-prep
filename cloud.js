// cloud.js — optional Postgres-backed sync. No-op until you configure an API URL + sync key.
// It mirrors ALL customizable localStorage stores (status, per-problem status,
// annotations incl. code+images, notes, custom questions, custom topics, streak
// activity, done-timestamps, theme) to your sync server, and pulls them on load.
(function () {
  const KEYS = ['faang_v3','faang_pstate','faang_annot','faang_notes','faang_cq','faang_ct','faang_done_ts','faang_activity','faang_theme'];
  const CFG_API = 'faang_api', CFG_KEY = 'faang_sync_key';

  function cfg() { return { api: localStorage.getItem(CFG_API), key: localStorage.getItem(CFG_KEY) }; }
  function configured() { const { api, key } = cfg(); return !!(api && key); }

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

  async function cloudPush() {
    const { api, key } = cfg();
    if (!api || !key) return;
    const blob = {};
    KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) blob[k] = v; });
    setDot('sync');
    try {
      const r = await fetch(`${api}/api/data/${encodeURIComponent(key)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: blob })
      });
      setDot(r.ok ? 'on' : 'err');
    } catch (e) { setDot('err'); }
  }

  async function cloudPull() {
    const { api, key } = cfg();
    if (!api || !key) return false;
    setDot('sync');
    try {
      const r = await fetch(`${api}/api/data/${encodeURIComponent(key)}`);
      if (!r.ok) { setDot('err'); return false; }
      const j = await r.json();
      setDot('on');
      if (j && j.data) {
        pulling = true;
        Object.entries(j.data).forEach(([k, v]) => { if (KEYS.includes(k)) localStorage.setItem(k, v); });
        pulling = false;
        return true;
      }
      return false;
    } catch (e) { setDot('err'); return false; }
  }

  // auto-push on any change to a tracked key
  const _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (k, v) { _set(k, v); if (KEYS.includes(k)) schedulePush(); };

  // public API
  window.cloud = {
    cfg, configured,
    connect(api, key) {
      api = (api || '').trim().replace(/\/+$/, '');
      key = (key || '').trim();
      if (!api || !key) { toast('Enter both API URL and sync key.'); return; }
      localStorage.setItem(CFG_API, api);
      localStorage.setItem(CFG_KEY, key);
      this.sync(true);
    },
    disconnect() { localStorage.removeItem(CFG_API); localStorage.removeItem(CFG_KEY); setDot('off'); toast('Cloud sync disconnected.'); },
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
