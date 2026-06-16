# 📚 GitHub: Zero → Mastery + A Tour of This Repo
A keep-forever reference, written for Adham.

---

## PART 1 — GitHub Zero → Mastery

### Level 0 — Git vs GitHub (the #1 confusion)
- **Git** = a tool *on your computer*. A **time machine** for code — saves snapshots, remembers every version, works offline.
- **GitHub** = a *website* that stores your Git project online. **Google Drive for code** + a **social network for developers.**
- Git is the engine; GitHub is the garage where you park it and show it off.

### Level 1 — Vocabulary
| Word | Meaning |
|------|---------|
| Repository ("repo") | The project folder + its full history. |
| Commit | A saved snapshot with a label. |
| Branch | A safe parallel copy to experiment on. |
| `main` | The official, real version. |
| Remote | The online copy (on GitHub). |
| Push | Send commits up to GitHub. |
| Pull | Bring GitHub's latest down to your computer. |
| Clone | Download a whole repo for the first time. |

### Level 2 — The daily loop (90% of Git)
```bash
git status                  # what did I change?
git add .                   # stage the changes
git commit -m "what I did"  # save a snapshot with a label
git push                    # send it up to GitHub
git pull                    # (when starting) grab the latest first
```
Memorize: **status → add → commit → push.**

### Level 3 — Branches & Pull Requests (the pro workflow)
1. Make a **branch** so `main` stays safe.
2. Change, commit, push the branch.
3. Open a **Pull Request (PR)** — "please review + add my branch to `main`."
4. **Merge** the PR → work joins `main`.
A PR = "I cooked on a side stove; taste it, then add it to the main pot."

### Level 4 — The "Oh No" survival kit
| Situation | What to do |
|-----------|-----------|
| Merge conflict | Two edits touched the same line; pick one (rare solo). |
| Bad commit | Git is a time machine — almost nothing is permanent. |
| `.gitignore` | List of files Git ignores (node_modules, `.env`). |
| Never commit | Passwords, private keys, `.env` files. |

### Level 5 — Showing it to the world
- **Public vs Private:** Settings → General → Change visibility.
- **README.md** = your storefront.
- **Stars ⭐** = likes. **Collaborator** = invited editor. **Fork** = someone copies your repo.

### Level 6 — Mastery habits
- Clear commit messages, one branch per feature, use the **Issues** tab for bugs/todos,
  **Actions** for automation (Dependabot), and keep a clean README + LICENSE.

---

## PART 2 — Tour of THIS repo (SwipeIQ)

### Docs (the project's memory)
`README.md` (storefront) · `PRD.md` (vision) · `ROADMAP.md` (8-phase plan) ·
`CONTEXT.md` (resume-in-new-chat file) · `TESTING.md` (hard-test missions) ·
`TESTING-AUTOMATION.md` (automated testing + security) · `LEARN-GITHUB.md` (this file) ·
`AGENTS.md` / `CLAUDE.md` (AI notes) · `LICENSE`.

### Config
`package.json` (libraries) · `package-lock.json` (locked versions) · `app.json` (Expo app config) ·
`eas.json` (build profiles) · `tsconfig.json` (TypeScript) · `.gitignore` · `.env.example` ·
`.github/dependabot.yml` (dependency scanner).

### `src/` — the app
- **`src/app/`** = screens (Expo Router = file-based routing):
  `_layout.tsx` (shell: auth + routing) · `index.tsx` (Dashboard) · `login.tsx` · `onboarding.tsx` ·
  `generator.tsx` (AI decks) · `arena.tsx` (swipe study) · `boss-arena.tsx` (timed) ·
  `review.tsx` (due cards) · `library.tsx` (Data Vault) · `editor.tsx` · `summary.tsx`.
- **`src/components/`** = `coach-mascot.tsx` (⚡ Q) · `brand-logo.tsx`.
- **`src/lib/`** = brains: `store.ts` (state + color tokens) · `supabase.ts` (backend) ·
  `gemini.ts` (AI) · `cloud-sync.ts` (backup) · `sm2.ts` (spaced repetition) · `coach.ts` ·
  `deck-utils.ts` · `starter-decks.ts` · `ranks.ts` · `notifications.ts` · `auth.ts`.
- Plus `constants/theme.ts`, `hooks/`, `types/`, `global.css`.

### `assets/` — images, swipe sounds, icon source.
### `scripts/` — `generate-icon.py` (regenerate the icon) · `reset-project.js`.
### `supabase/` — backend: `config.toml` · `functions/generate-cards` + `generate-coach` · `migrations/*.sql`.
### `.maestro/` — automated test flows (`smoke.yaml`, `generate-deck.yaml`).

---

## PART 3 — Use & show your repo
- **Show your CODE to a dev friend:** make repo Public (or add collaborator), share
  `https://github.com/adhamcodes/SwipeIQ`.
- **Let a friend USE the app:** send them the **APK** (not the repo). Code = GitHub; app = APK.
- **Run the code:** `git clone …` → `cd SwipeIQ` → `npm install` → copy `.env.example` to `.env` → `npx expo start`.
