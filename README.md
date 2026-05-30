# 🎯 FAANG+ Interview Prep Tracker

**Live site:** https://lovebansal0.github.io/faang-prep/

A self-hosted, progress-tracking study plan for experienced engineers (10 YOE) targeting
senior/staff roles. **203 topics** spanning IC fundamentals → executive strategy, with
verified 2025-26 company-tagged questions, weekly mocks, and spaced review built in.

---

## 🚀 How to run this plan

### 1. Pick your track (top toggle)
| Plan | Topics | Hours | Timeline |
|------|--------|-------|----------|
| 🏢 **FAANG+** | ~145 | ~700h | ~17 weeks @ 40h/wk |
| 🚀 **Startup** | ~116 | — | practical/full-stack focus |
| **All Topics** | 203 | ~960h | the full library |

**Most people should pick ONE track and ignore the rest.** The other tracks are a
library, not your sprint. For a FAANG Senior/Staff (L5/L6) goal, flip on **🏢 FAANG+**.

### 2. Set your weekly rhythm
Recommended split for a FAANG loop (~40h/week dedicated sprint):
- **~16h DSA** — patterns, then the weekly coding mock
- **~12h System Design** — foundations → problems → deep-dives
- **~4h LLD / OOD** — patterns + machine coding
- **~8h Behavioral + Mocks** — story bank + the weekly recorded mock

### 3. Work week-by-week
- Use the **week dropdown** or just scroll. Each week blends DSA + a system-design/LLD
  thread + a 🎤 weekly mock + spaced review.
- **✓ Done** marks a topic complete (counts toward your progress ring + ETA).
- **↻ Revisit** flags anything shaky — the weekly review cards re-surface these.
- Click **▸ N problems** on any card for the question list (LeetCode + external links,
  company-tagged G/M/A/Ms/Ub).

### 4. The non-negotiables (this is what actually moves the needle)
- **Spaced review** (built into weeks 3–14): re-solve old problems *cold*. Retention > coverage.
- **Weekly mocks** (from week 3): narrate out loud, timed, no autocomplete. Performance > knowledge.
- **Honest tracking**: only mark Done what you could redo cold today.

---

## ✨ Features

- **🔍 Search** (`/` to focus) — across topics, problems, and company names
- **📝 Per-week notes** — click "Notes" on any week header
- **＋ Add your own questions** — on any topic card
- **📌 My Topics** — a dedicated page for topics you discover while studying
- **⏳ ETA banner** — live hours-remaining + finish-date estimate at your pace
- **⊟ Collapse / ⊞ Expand all** weeks, **▶ Next incomplete** jump button
- **📤 Sync** — copy a link to carry progress to another device (📥 Import to restore)

---

## 🛠 To update and redeploy

```powershell
# from this folder
git add index.html
git commit -m "update: <what you changed>"
git push
# GitHub Pages rebuilds automatically in ~1 min
```

Everything is a single `index.html` (no build step). Progress is saved in your browser's
localStorage; use the Sync Link button to move it between devices.
