// gate.js — client-side passcode lock for the tracker.
// IMPORTANT: This is PRIVACY, not security. The source is public (GitHub Pages +
// public repo), so a determined person can read/bypass it. For real access control
// use Cloudflare Access in front of the site. You set your own passcode; it is never
// sent anywhere — only a SHA-256 hash is stored locally in your browser.
(function(){
  // If you want to lock the PUBLIC url for EVERYONE on every device, paste the
  // SHA-256 hash of your chosen passcode here (the setup screen prints it for you).
  const GATE_HASH = "";

  const LS_KEY='faang_gate';          // per-device stored hash (if GATE_HASH empty)
  const SESSION='faang_session_ok';   // unlocked for this tab session

  if(sessionStorage.getItem(SESSION)==='1') return; // already unlocked this session

  const effectiveHash = GATE_HASH || localStorage.getItem(LS_KEY) || '';
  const setupMode = !effectiveHash;

  async function sha256(s){
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // build overlay
  const ov=document.createElement('div');
  ov.id='gate-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:radial-gradient(900px 500px at 70% -10%,#11202c,#0d1620 60%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
  ov.innerHTML=`
    <div style="background:#14202e;border:1px solid #30485c;border-radius:16px;padding:30px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#34d399);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">🔒</div>
      <h2 style="color:#e3edf2;font-size:18px;margin:0 0 6px">${setupMode?'Set a passcode':'Locked'}</h2>
      <p style="color:#7d97a8;font-size:12px;margin:0 0 18px;line-height:1.5">${setupMode?'Create a passcode to lock this tracker on this device.':'Enter your passcode to continue.'}</p>
      <input id="gate-input" type="password" placeholder="Passcode" autocomplete="off"
        style="width:100%;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none;text-align:center;letter-spacing:2px">
      ${setupMode?'<input id="gate-input2" type="password" placeholder="Confirm passcode" autocomplete="off" style="width:100%;margin-top:10px;background:#1b2c3c;border:1px solid #30485c;border-radius:9px;color:#e3edf2;padding:11px 13px;font-size:14px;outline:none;text-align:center;letter-spacing:2px">':''}
      <div id="gate-err" style="color:#f87171;font-size:12px;min-height:16px;margin:10px 0 0"></div>
      <button id="gate-btn" style="width:100%;margin-top:8px;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#34d399);color:#fff;font-size:14px;font-weight:700;cursor:pointer">${setupMode?'Set passcode &amp; unlock':'Unlock'}</button>
      <label style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:14px;color:#587286;font-size:11px;cursor:pointer">
        <input id="gate-remember" type="checkbox" checked> Stay unlocked on this device
      </label>
      <p style="color:#3d5163;font-size:10px;margin:14px 0 0;line-height:1.5">Privacy lock only — not real security on a public site.</p>
    </div>`;

  function mount(){document.body.appendChild(ov);document.getElementById('gate-input').focus();}
  if(document.body)mount(); else document.addEventListener('DOMContentLoaded',mount);

  async function submit(){
    const v=document.getElementById('gate-input').value;
    const err=document.getElementById('gate-err');
    if(!v){err.textContent='Enter a passcode.';return;}
    if(setupMode){
      const v2=document.getElementById('gate-input2').value;
      if(v.length<4){err.textContent='Use at least 4 characters.';return;}
      if(v!==v2){err.textContent='Passcodes do not match.';return;}
      const h=await sha256(v);
      localStorage.setItem(LS_KEY,h);
      unlock(true,h);
    }else{
      const h=await sha256(v);
      if(h===effectiveHash){unlock(false);}
      else{err.textContent='Wrong passcode.';document.getElementById('gate-input').value='';}
    }
  }
  function unlock(wasSetup,hash){
    if(document.getElementById('gate-remember')?.checked) sessionStorage.setItem(SESSION,'1');
    ov.remove();
    if(wasSetup){
      // show the hash once so the user can lock the public URL for everyone if they want
      setTimeout(()=>{
        try{
          const tip=document.createElement('div');
          tip.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#14202e;border:1px solid #30485c;color:#7d97a8;padding:10px 14px;border-radius:10px;font-size:11px;max-width:420px;z-index:9999;text-align:center;font-family:monospace';
          tip.innerHTML='Passcode set for this device. To lock the public URL for everyone, paste this hash into gate.js → GATE_HASH:<br><b style="color:#38bdf8;word-break:break-all">'+hash+'</b><br><span style="cursor:pointer;color:#34d399" onclick="this.parentNode.remove()">dismiss</span>';
          document.body.appendChild(tip);
        }catch(e){}
      },400);
    }
  }
  // wire after mount
  setTimeout(()=>{
    const btn=document.getElementById('gate-btn');if(btn)btn.addEventListener('click',submit);
    ['gate-input','gate-input2'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});});
  },50);
})();
