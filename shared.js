// shared.js — state + rendering for discipline pages.
// Uses the SAME localStorage keys as the main tracker, so progress is unified.

// ── state (shared with index.html) ──
let state={}; try{state=JSON.parse(localStorage.getItem('faang_v3')||'{}');}catch{}
let pstate={}; try{pstate=JSON.parse(localStorage.getItem('faang_pstate')||'{}');}catch{}
let customQs={}; try{customQs=JSON.parse(localStorage.getItem('faang_cq')||'{}');}catch{}
function save(){localStorage.setItem('faang_v3',JSON.stringify(state));}
function savePS(){localStorage.setItem('faang_pstate',JSON.stringify(pstate));}

function status(id){return state[id]||'pending';}
function toggle(id,val){state[id]=state[id]===val?'pending':val;save();renderAll();}
function lcSlug(n){return n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function pkey(tid,q){return tid+'::'+(q.id?('cq'+q.id):(q.lc?('lc'+q.lc):lcSlug(q.n)));}
function pstatus(k){return pstate[k]||'pending';}
function togglePQ(k,val){pstate[k]=pstate[k]===val?'pending':val;savePS();renderAll();}
function topicQStats(t){
  let done=0,rev=0,total=0;
  (t.qs||[]).forEach(q=>{total++;const s=pstate[pkey(t.id,q)];if(s==='done')done++;else if(s==='revisit')rev++;});
  (customQs[t.id]||[]).forEach(q=>{total++;const s=pstate[pkey(t.id,q)];if(s==='done')done++;else if(s==='revisit')rev++;});
  return {done,rev,total,attempted:done+rev};
}

// ── per-problem annotations (code + design image), shared key with main tracker ──
let annot={}; try{annot=JSON.parse(localStorage.getItem('faang_annot')||'{}');}catch{}
const pnames={}; let annotKey=null;
function saveAnnot(){try{localStorage.setItem('faang_annot',JSON.stringify(annot));}catch(e){showToast('⚠ Storage full — try a smaller image or an image URL.');}}
function hasAnnot(k){const a=annot[k];return !!(a&&(a.code||a.img));}
function openAnnot(k){
  annotKey=k;const a=annot[k]||{};
  document.getElementById('annot-name').textContent=pnames[k]||'Problem';
  document.getElementById('annot-code').value=a.code||'';
  document.getElementById('annot-img-url').value='';
  renderAnnotPreview(a.img);
  document.getElementById('annot-modal').style.display='flex';
}
function renderAnnotPreview(img){const p=document.getElementById('annot-preview');p.innerHTML=img?`<img src="${img}" alt="design">`:'No image yet — upload a diagram or paste a URL.';}
function annotCodeInput(v){if(!annotKey)return;annot[annotKey]=annot[annotKey]||{};annot[annotKey].code=v;saveAnnot();}
function annotSetImgUrl(){const u=document.getElementById('annot-img-url').value.trim();if(!u||!annotKey)return;annot[annotKey]=annot[annotKey]||{};annot[annotKey].img=u;saveAnnot();renderAnnotPreview(u);}
function annotUpload(input){
  const f=input.files&&input.files[0];if(!f||!annotKey)return;
  const reader=new FileReader();
  reader.onload=e=>{const im=new Image();im.onload=()=>{
    const max=900;let w=im.width,h=im.height;if(w>max){h=Math.round(h*max/w);w=max;}
    const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);
    const data=c.toDataURL('image/jpeg',0.72);annot[annotKey]=annot[annotKey]||{};annot[annotKey].img=data;saveAnnot();renderAnnotPreview(data);
  };im.src=e.target.result;};
  reader.readAsDataURL(f);
}
function annotClear(){if(!annotKey)return;delete annot[annotKey];saveAnnot();closeAnnotModal();renderAll();}
function closeAnnotModal(){document.getElementById('annot-modal').style.display='none';annotKey=null;}
function annotDone(){if(annotKey&&annot[annotKey]&&!annot[annotKey].code&&!annot[annotKey].img){delete annot[annotKey];saveAnnot();}closeAnnotModal();renderAll();}

// ── theme ──
function applyTheme(t){document.body.classList.toggle('light',t==='light');const b=document.getElementById('theme-toggle');if(b)b.textContent=t==='light'?'☀️':'🌙';}
function toggleTheme(){const n=document.body.classList.contains('light')?'dark':'light';localStorage.setItem('faang_theme',n);applyTheme(n);}

// ── toast ──
function showToast(m){const e=document.getElementById('toast');if(!e)return;e.textContent=m;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500);}

// ── collapse ──
const collapsed=new Set();
function toggleWeek(w){collapsed.has(w)?collapsed.delete(w):collapsed.add(w);renderAll();}
function toggleProbs(id){const p=document.getElementById('pp-'+id);const b=document.getElementById('pb-'+id);if(!p||!b)return;const o=p.classList.toggle('open');b.textContent=(o?'▾':'▸')+' '+b.dataset.label;}

// ── card (mirrors main tracker) ──
const _CI={G:['Google','#4285f4'],M:['Meta','#1877f2'],A:['Amazon','#ff9900'],Ms:['Microsoft','#00a4ef'],Ub:['Uber','#9b9b9b']};
function card(t){
  const sec=S[t.s]||{label:t.s,color:'#888'},st=status(t.id),qCount=t.qs?t.qs.length:0;
  const qs=topicQStats(t);
  const noun=['dsa','mcr','query'].includes(t.s)?'problems':'questions';
  const label=`${qs.total} ${noun}${qs.attempted?` · ✓${qs.done}${qs.rev?` ↻${qs.rev}`:''}`:''}`;
  const pqBtns=(k,ps,nm)=>{pnames[k]=nm;return`<span class="pq-btns"><button class="pq-btn annot ${hasAnnot(k)?'on':''}" title="Add code / design image" onclick="event.stopPropagation();openAnnot('${k}')">✎</button><button class="pq-btn done ${ps==='done'?'on':''}" title="Done" onclick="event.stopPropagation();togglePQ('${k}','done')">✓</button><button class="pq-btn rev ${ps==='revisit'?'on':''}" title="Revisit" onclick="event.stopPropagation();togglePQ('${k}','revisit')">↻</button></span>`;};
  const probsHtml=qCount?`
    <button class="probs-toggle" id="pb-${t.id}" data-label="${label}" onclick="toggleProbs('${t.id}')">▸ ${label}</button>
    <div class="probs-panel" id="pp-${t.id}">${t.qs.map(q=>{
      const href=q.lc?`https://leetcode.com/problems/${lcSlug(q.n)}/`:q.link||null;
      const nameEl=href?`<a class="prob-name" href="${href}" target="_blank" rel="noopener">${q.n}${q.lc?` <span class="prob-lc">#${q.lc}</span>`:' <span class="prob-lc">↗</span>'}</a>`:`<span class="prob-name">${q.n}</span>`;
      const _co=q.co&&q.co.length?`<span class="prob-co">${q.co.map(c=>{const d=_CI[c]||[c,'#888'];return`<span class="co-tag" title="${d[0]}" style="background:${d[1]}22;color:${d[1]}">${c}</span>`;}).join('')}</span>`:'';
      const k=pkey(t.id,q),ps=pstatus(k),rc=ps==='done'?'pdone':ps==='revisit'?'previsit':'';
      return`<div class="prob-row ${rc}"><span class="diff ${q.d}">${q.d}</span>${nameEl}${_co}${pqBtns(k,ps,q.n)}</div>`;
    }).join('')}</div>`:'';
  return`<div class="topic-card ${st}" style="border-left-color:${sec.color}33">
    <div class="card-top"><div class="sec-dot" style="background:${sec.color};box-shadow:0 0 6px ${sec.color}77"></div><div class="card-title">${t.t}</div></div>
    <div class="card-meta">
      <span class="mtag" style="color:${sec.color};border-color:${sec.color}44;background:${sec.color}11">${sec.label}</span>
      <span class="mtag">~${t.h}h</span>
      <span class="mtag">${t.w<=28?'Wk '+t.w:t.w===29?'CTO':'—'}</span>
      ${qs.attempted?`<span class="mtag qstat">📊 ${qs.attempted}/${qs.total}<b style="color:var(--done)"> ${qs.done}✓</b>${qs.rev?`<b style="color:var(--revisit)"> ${qs.rev}↻</b>`:''}</span>`:''}
    </div>
    <div class="card-btns">
      <button class="cbtn done-btn ${st==='done'?'on':''}" onclick="toggle('${t.id}','done')">✓ Done</button>
      <button class="cbtn rev-btn ${st==='revisit'?'on':''}" onclick="toggle('${t.id}','revisit')">↻ Revisit</button>
    </div>${probsHtml}
  </div>`;
}

// ── render a discipline page ──
// DISCIPLINE = array of section keys; set on each page before calling renderAll()
let DISCIPLINE=[];
function disciplineTopics(){return T.filter(t=>DISCIPLINE.includes(t.s));}
function renderAll(){
  const list=disciplineTopics();
  // summary
  const done=list.filter(t=>state[t.id]==='done').length;
  const rev=list.filter(t=>state[t.id]==='revisit').length;
  const hrs=list.reduce((s,t)=>s+t.h,0);
  const pct=list.length?Math.round(done/list.length*100):0;
  const sEl=document.getElementById('summary');
  if(sEl)sEl.innerHTML=`
    <div class="sum-pill"><span class="n">${list.length}</span><span class="l">Topics</span></div>
    <div class="sum-pill"><span class="n" style="color:var(--done)">${done}</span><span class="l">Done</span></div>
    <div class="sum-pill"><span class="n" style="color:var(--revisit)">${rev}</span><span class="l">Revisit</span></div>
    <div class="sum-pill"><span class="n">${pct}%</span><span class="l">Complete</span></div>
    <div class="sum-pill"><span class="n">~${hrs}h</span><span class="l">Est. effort</span></div>`;
  const barEl=document.getElementById('sum-bar-fill');if(barEl)barEl.style.width=pct+'%';
  // group by week
  const byWeek={};list.forEach(t=>(byWeek[t.w]=byWeek[t.w]||[]).push(t));
  const cEl=document.getElementById('content');
  if(!list.length){cEl.innerHTML='<p style="color:var(--muted2);padding:40px;text-align:center">No topics in this discipline.</p>';return;}
  cEl.innerHTML=Object.entries(byWeek).sort(([a],[b])=>+a-+b).map(([w,ts])=>{
    const dw=ts.filter(t=>state[t.id]==='done').length;
    const isC=collapsed.has(+w);
    const wl=+w<=16?`Week ${w}`:+w<=24?`S${+w-16}`:+w<=28?`M5·W${+w-24}`:'CTO';
    return`<div class="week-group">
      <div class="week-hdr" onclick="toggleWeek(${w})">
        <span class="wk-badge">${wl}</span>
        <span class="wk-label">${(typeof WK!=='undefined'&&WK[w])?WK[w]:(MONTH?MONTH(+w):'')}</span>
        <span class="wk-prog">${dw}/${ts.length}</span>
        <span class="wk-toggle">${isC?'▶':'▼'}</span>
      </div>
      <div class="week-body ${isC?'closed':''}"><div class="topic-grid">${ts.map(card).join('')}</div></div>
    </div>`;
  }).join('');
}

applyTheme(localStorage.getItem('faang_theme')||'dark');

// ── study references footer (shared across discipline pages) ──
(function(){
  const R={
    '🧮 DSA & Coding':[['LeetCode','https://leetcode.com/'],['NeetCode (150 / Blind 75)','https://neetcode.io/practice'],['Grokking the Coding Interview','https://www.designgurus.io/course/grokking-the-coding-interview'],['AlgoMonster','https://algo.monster/'],['CSES Problem Set','https://cses.fi/problemset/'],['VisuAlgo','https://visualgo.net/']],
    '🏛 System Design (HLD)':[['System Design Primer','https://github.com/donnemartin/system-design-primer'],['Grokking the System Design Interview','https://www.designgurus.io/course/grokking-the-system-design-interview'],['ByteByteGo (Alex Xu)','https://bytebytego.com/'],['Puneet Patwari Vault (93 Q&A)','https://www.puneetpatwari.in/vault'],['Layrs (HLD/LLD canvas)','https://layrs.me/'],['High Scalability','http://highscalability.com/']],
    '🧩 LLD / OOD':[['Refactoring.Guru','https://refactoring.guru/design-patterns'],['Awesome Low-Level Design','https://github.com/ashishps1/awesome-low-level-design'],['kumaransg / LLD','https://github.com/kumaransg/LLD'],['UML class diagrams (Baeldung)','https://www.baeldung.com/cs/uml-class-diagram']],
    '⚙️ Concurrency & Backend':[['Baeldung — Java Concurrency','https://www.baeldung.com/java-concurrency'],['Redis Docs','https://redis.io/docs/'],['Apache Kafka Docs','https://kafka.apache.org/documentation/'],['Confluent Blog','https://www.confluent.io/blog/'],['Google SRE Books','https://sre.google/books/']],
    '💬 Behavioral & Career':[['StaffEng','https://staffeng.com/guides/'],['Levels.fyi','https://www.levels.fyi/'],['Amazon Leadership Principles','https://www.amazon.jobs/content/en/our-workplace/leadership-principles'],['Google Eng Practices','https://google.github.io/eng-practices/'],['Design Docs at Google','https://www.industrialempathy.com/posts/design-docs-at-google/']],
    '🎤 Practice & Tools':[['Scaler (mock interviews)','https://www.scaler.com/mock-interview/'],['InterviewBit Mock Interview','https://www.interviewbit.com/mock-interview/'],['Pramp (free peer mocks)','https://www.pramp.com/'],['interviewing.io','https://interviewing.io/'],['Excalidraw','https://excalidraw.com/'],['LeetCode Discuss','https://leetcode.com/discuss/interview-question/'],['Claude API docs','https://docs.anthropic.com/en/docs/build-with-claude/overview']],
    '📄 Foundational Papers':[['MapReduce — Google (2004)','https://research.google/pubs/pub62/'],['Google File System (2003)','https://research.google/pubs/pub51/'],['Bigtable — Google (2006)','https://research.google/pubs/pub27898/'],['Dynamo — Amazon (2007)','https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'],['Spanner — Google (2012)','https://research.google/pubs/pub39966/'],['Raft consensus (2014)','https://raft.github.io/raft.pdf'],['Paxos Made Simple — Lamport','https://lamport.azurewebsites.net/pubs/paxos-simple.pdf'],['Time, Clocks & Ordering — Lamport','https://lamport.azurewebsites.net/pubs/time-clocks.pdf'],['Kafka — LinkedIn (2011)','https://notes.stephenholiday.com/Kafka.pdf'],['Scaling Memcache — Facebook','https://research.facebook.com/publications/scaling-memcache-at-facebook/']]
  };
  function mount(){
    const sec=document.createElement('section');sec.className='refs';sec.id='refs';
    sec.innerHTML='<h2>📚 Study References</h2><p class="refs-sub">The resources this plan draws from — bookmark these.</p><div class="refs-grid">'+
      Object.entries(R).map(([cat,links])=>`<div class="ref-col"><h3>${cat}</h3>${links.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</div>`).join('')+
      '</div>';
    document.body.appendChild(sec);
  }
  if(document.body)mount(); else document.addEventListener('DOMContentLoaded',mount);
})();
