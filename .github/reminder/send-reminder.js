// Sends a FAANG-prep reminder email via Gmail SMTP.
// Run by .github/workflows/reminder.yml on a twice-daily cron.
// Secrets (GitHub → repo Settings → Secrets and variables → Actions):
//   GMAIL_USER, GMAIL_APP_PASSWORD, TO_EMAIL
const nodemailer = require('nodemailer');

// ── plan config ──
const START = new Date(Date.UTC(2026, 6, 23)); // July 23, 2026 (Phase 1, day 1)
const WEEKLY_HOURS = 30, PHASE_HOURS = 45, TOTAL_HOURS = 730;
const TRACKER = 'https://lovebansal0.github.io/faang-prep/';
const PHASE = {
  1:'Arrays, Two Pointers, Sliding Window + Thread Lifecycle + the Sprint Kickoff card (recruiter/OA prep)',
  2:'Binary Search, Stack/Monotonic Stack + SOLID + HLD Foundations + Company-Specific Playbooks',
  3:'Linked Lists, Binary Trees + Synchronization/Locks + your FIRST weekly coding mock',
  4:'BST, Heaps, Tries + Creational Patterns',
  5:'Graphs BFS/DFS, Union Find + JMM & Atomics',
  6:'Topological Sort, Shortest Path + Structural Patterns + FIRST system-design mock',
  7:'Backtracking, Greedy + wait/notify & ThreadPool',
  8:'DP 1D & 2D Grid + Behavioral Patterns + FIRST behavioral mock',
  9:'DP Knapsack & Sequences + Concurrency Deep-Dive + classic concurrency problems',
  10:'DP Advanced, Bit Manipulation + HLD Fundamentals (caching, load balancing, CDN)',
  11:'Segment Tree, Advanced Graphs, Math + HLD Databases & CAP + Domain-Driven Design',
  12:'DSA HARD MARATHON (3 hards/day) + HLD Queues/APIs + LLD Curveballs + 4 DSA mocks',
  13:'LLD Problems I (Parking Lot, Elevator, ATM) + HLD URL Shortener/Rate Limiter/Twitter + SD mock',
  14:'LLD Problems II (Chess, Food Delivery, Uber) + HLD WhatsApp/YouTube/Uber + systemdesign.io set',
  15:'HLD Advanced (Raft, consensus, distributed txns) + HLD mocks + Comp & Negotiation',
  16:'Behavioral (STAR, Amazon LPs, staff stories) + FULL-LOOP mocks + Final Readiness Checklist',
};

function computePhase() {
  const now = new Date();
  const days = Math.floor((now - START) / 86400000); // whole days since start
  if (days < 0) return { notStarted: true, dLeft: Math.ceil(-days) };
  const expectedHours = Math.min(TOTAL_HOURS, ((days + 1) / 7) * WEEKLY_HOURS);
  if (expectedHours >= TOTAL_HOURS) return { done: true };
  const phase = Math.min(16, Math.floor(expectedHours / PHASE_HOURS) + 1);
  return { phase, expectedHours: Math.round(expectedHours), day: days + 1 };
}

function slot() {
  const input = (process.env.INPUT_SLOT || '').trim();
  if (input === 'morning' || input === 'evening') return input;
  return process.env.EVENT_SCHEDULE === '0 2 * * *' ? 'morning' : 'evening';
}

function build(p, isMorning) {
  if (p.notStarted) {
    return {
      subject: `⏳ FAANG prep starts in ${p.dLeft} day${p.dLeft !== 1 ? 's' : ''}`,
      html: `<p>Your plan starts <b>July 23, 2026</b> — ${p.dLeft} day${p.dLeft !== 1 ? 's' : ''} to go.</p><p>Phase 1: Arrays, Two Pointers, Sliding Window + Thread Lifecycle. Warm up with the Sprint Kickoff card.</p><p><a href="${TRACKER}">Open the tracker →</a></p>`
    };
  }
  if (p.done) {
    return {
      subject: `🏆 Plan content complete — mock loops time`,
      html: `<p>You've cleared the plan content. Shift to full-loop mocks, the Weak-Area Sprint (↻ Revisit + 🔁 Due review), and scheduling real interviews.</p><p><a href="${TRACKER}">Open the tracker →</a></p>`
    };
  }
  const focus = PHASE[p.phase] || '';
  if (isMorning) {
    return {
      subject: `📚 Phase ${p.phase} — today's 4h · FAANG prep`,
      html: `<p><b>Good morning.</b> You're around <b>Phase ${p.phase}</b> (day ${p.day}, ~${p.expectedHours}h target at 30h/wk).</p>
             <p><b>Today's focus:</b> ${focus}</p>
             <p>Put in your <b>4 hours</b>, tick topics ✓ Done as you go, and don't skip the weekly mock.</p>
             <p><a href="${TRACKER}">Open the tracker → the ☀️ "Today's 4h" chip has your exact next topics.</a></p>`
    };
  }
  return {
    subject: `✅ Log today's prep — Phase ${p.phase}`,
    html: `<p><b>Evening check-in.</b> Did you get your 4h in for <b>Phase ${p.phase}</b>?</p>
           <ul>
             <li>Tick today's topics ✓ Done (keeps your pace + 🔥 streak honest)</li>
             <li>Anything shaky? Mark it ↻ Revisit</li>
             <li>Been a week since your last backup? Tools ▾ → Back up to file</li>
           </ul>
           <p><a href="${TRACKER}">Open the tracker →</a></p>`
  };
}

async function main() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, TO_EMAIL } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !TO_EMAIL) {
    console.error('✗ Missing GMAIL_USER / GMAIL_APP_PASSWORD / TO_EMAIL secrets.');
    process.exit(1);
  }
  const isMorning = slot() === 'morning';
  const p = computePhase();
  const { subject, html } = build(p, isMorning);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s+/g, '') }
  });
  await transporter.sendMail({
    from: `FAANG Prep <${GMAIL_USER}>`, to: TO_EMAIL, subject,
    html: html + `<hr style="border:none;border-top:1px solid #eee;margin:16px 0"><p style="color:#888;font-size:12px">Automated ${isMorning ? 'morning' : 'evening'} reminder · edit times in .github/workflows/reminder.yml</p>`
  });
  console.log(`✓ Sent ${isMorning ? 'morning' : 'evening'} reminder → ${TO_EMAIL} (subject: ${subject})`);
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
