# 🎯 FAANG+ Interview Prep Tracker

**Live site:** https://lovebansal0.github.io/faang-prep/

A self-hosted, progress-tracking study plan for experienced engineers (10 YOE) targeting
senior/staff/principal roles — and even CTO/exec prep. **210 topics** spanning IC
fundamentals → executive strategy, with **~800 company-tagged questions** (Google, Meta,
Amazon, Microsoft, Uber — verified 2025-26), weekly mocks, spaced review, and per-problem
solution/diagram notes. Pure static site (no backend, no build step).

---

## 🗂 Pages

The site is a small multipage app. `index.html` is the hub; the discipline pages are
focused views that **share the same data and the same saved progress**.

| Page | File | Covers |
|------|------|--------|
| 🎯 **Full Tracker** (hub) | `index.html` | Everything — all tracks, weeks, filters, tools |
| 🧮 **DSA & Concurrency** | `dsa.html` | DSA + Multithreading |
| 🏛 **System Design** | `system-design.html` | HLD + LLD + Machine Coding |
| 💬 **Behavioral & Leadership** | `behavioral.html` | Behavioral + CTO/Exec |
| 🛠 **Engineering Craft** | `craft.html` | Practical code, Full-Stack, DevOps, Queries, AI/ML, Projects |

A **Views:** nav strip on the main page links to all of them; each discipline page links
back. Shared assets: `data.js` (curriculum), `shared.css`, `shared.js`.

---

## 🚀 How to run this plan

### 1. Pick your track (top toggle)
| Plan | Topics | Approx hours | Timeline @ 60h/wk |
|------|--------|------|----------|
| 🏢 **FAANG+** | ~145 | ~700h | ~12 weeks |
| 🚀 **Startup** | ~116 | — | practical / full-stack focus |
| **All Topics** | 210 | ~960h | ~16 weeks (full library) |

**Pick ONE track and ignore the rest** — the others are a library, not your sprint. For a
FAANG Senior/Staff (L5/L6) goal, flip on **🏢 FAANG+**. (Startup and CTO/Exec content is
there when you want it.)

### 2. Set your weekly rhythm (8h/day · ≈60h/week sprint)
- **~24h DSA** — patterns, then the weekly coding mock
- **~18h System Design** — foundations → real systems → deep-dives
- **~6h LLD / OOD** — patterns + machine coding
- **~12h Behavioral + Mocks** — story bank + the weekly recorded mock

### 3. Work week-by-week
Each week blends DSA + a system-design/LLD thread + a 🎤 weekly mock + spaced review.
- **✓ Done** / **↻ Revisit** on each topic *and* each individual problem.
- Click **▸ N problems** to expand the question list (LeetCode + external links,
  company tags G/M/A/Ms/Ub, E/M/H difficulty).
- The **📅 This Week** banner (plan starts **June 7, 2026**) shows the current week's focus
  and whether you're on track / behind, computed live from your progress.

### 4. The non-negotiables
- **Spaced review** — re-solve old problems *cold*. Retention > coverage. The **🔁 Due review**
  filter surfaces topics done ≥7 days ago.
- **Weekly mocks** (from week 3) — narrate aloud, timed, no autocomplete. Performance > knowledge.
- **Honest tracking** — only mark Done what you could redo cold today.

---

## ✨ Features

**Navigation & filtering**
- 🔍 **Search** (`/` to focus) — multi-word, across topic titles, problem names, companies
- **Plan toggle** (All / FAANG+ / Startup) and **discipline pills**
- **Status filter** — All · Pending · Done · ↻ Revisit · 🔁 Due review
- **Difficulty filter** — E / M / H (hides non-matching problems; stacks with status filter)
- **Week dropdown**, **▶ Next incomplete** jump, **🎲 Random** unfinished-topic picker
- Collapsible weeks with per-week progress + hours

**Progress tracking**
- Per-**topic** and per-**problem** Done/Revisit, with a live `attempted / done / retake`
  stat badge on every card
- ⏳ **ETA banner** — hours remaining + finish-date estimate at your pace
- 🔥 **Streak** counter and 📅 **Activity heatmap** (18 weeks, intensity by daily actions)
- 🔁 **Spaced repetition** — done-timestamps drive the "Due review" filter

**Your own content**
- ✎ **Per-problem annotations** — attach your **solution code** + a **design image**
  (upload, auto-downscaled, or paste a URL)
- 📝 **Per-week notes**
- ＋ **Add custom questions** to any topic
- 📌 **My Topics** — track extra topics you discover while studying

**Data portability**
- 📤 **Sync Link / 📥 Import** — carry topic + per-problem progress to another device via a URL
- 💾 **Backup / ♻️ Restore** — download/upload a full JSON of **everything**, including
  code + design images (which are too big for the sync URL). This is your real safety net.

**Appearance**
- 🌙/☀️ **Theme toggle** — cool/calm dark and soft light, your choice is remembered

> All data lives in your browser's **localStorage** (no server). Keys: `faang_v3` (topics),
> `faang_pstate` (problems), `faang_annot` (code+images), `faang_notes`, `faang_cq`
> (custom questions), `faang_ct` (custom topics), `faang_done_ts`, `faang_activity`,
> `faang_theme`. **Use 💾 Backup regularly** — clearing browser data wipes everything.

---

## 📚 What's inside (content)

- **FAANG+ (wk 1–16):** DSA (all patterns → hard marathon → 2025-26 questions), Multithreading,
  LLD (patterns, DDD, machine coding), HLD (foundations → real systems → curveballs),
  Behavioral (STAR, Amazon LPs, staff-level), weekly mock + spaced-review backbone,
  process/logistics (recruiter/OA, company playbooks, comp negotiation, readiness).
- **Startup (wk 17–24):** Clean code/TDD, REST/SQL/auth, Redis, Docker/CI-CD/AWS, Kubernetes,
  startup system design, take-home strategy, equity/offer negotiation.
- **Month 5 (wk 25–28):** Machine Coding Round, Advanced Queries (SQL/NoSQL/Kafka/Redis),
  AI/ML for SWE (RAG, vector DBs, MLOps), office project planning.
- **CTO / Exec:** org design, strategy, FinOps, hiring/leveling, reliability culture,
  security/compliance, board & M&A, data/AI strategy.
- **Deep-dives & curveballs:** senior/principal HLD & LLD trade-off questions, concurrency,
  Kafka internals, Redis complexities, DDD, staff behavioral.
- **Added foundational patterns:** Prefix Sum/Difference Array, Cyclic Sort, Design Data
  Structures, Intervals, String Matching (KMP/RK/Z), Bitwise-Trie Max XOR, Reservoir Sampling.

---

## 🛠 Develop & deploy

No build step — edit the files and push; GitHub Pages redeploys in ~1 minute.

```powershell
git add -A
git commit -m "update: <what you changed>"
git push
```

**Editing the curriculum:** topics live in the `T = [...]` array. It exists in **two**
places that must stay in sync — the inline copy in `index.html` and `data.js` (used by the
discipline pages). Add/edit a topic in both.

**Local preview:** any static server, e.g. `python -m http.server 3333` then open
`http://localhost:3333/`.

---

## ⚠️ Notes
- **Privacy:** the repo and site are public; there's no login (a static site can't enforce
  real auth). Don't store anything sensitive in notes/annotations.
- **Weekly reminder:** a scheduled task can push a "this week's plan" notification each
  Saturday — it runs while the Claude Code app is open (best-effort, not email).
