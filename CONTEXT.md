# 🧭 START HERE — Continuity File (read this first if resuming in a new chat)

This file lets a new chat session pick up **exactly** where we left off, with zero re-explaining.

---

## ▶️ HOW TO RESUME IN A NEW CHAT
Open a new Kiro session, select the `adhamcodes/SwipeIQ` repo, and paste this:

> "Continue building SwipeIQ. First read `CONTEXT.md`, then `ROADMAP.md` in this repo — that's
> our full plan, working agreement, and current status. You are the captain/decision-maker; I'm a
> solo beginner and I follow your click-by-click orders. Tell me where we are and give me the next step."

---

## 🚨 IMMEDIATE NEXT STEP (do this FIRST — we're mid-fix)
We are in **Phase 1**, fixing a **launch crash**. The exact cause is **CONFIRMED via adb logcat**:
the real (APK) build crashed on launch because of the **`@expo/ui`** beta package
(`java.lang.NoClassDefFoundError ... expo.modules.ui.ExpoUIModule.definition`). It's unused leftover
from the starter template, and its version is incompatible with Expo SDK 54.

**THE FIX (guide Adham click-by-click):**
1. Merge **PR #11** (it disables experimental React Compiler + carries this CONTEXT update).
2. On his computer: `git checkout main` then `git pull`.
3. Remove the broken unused beta packages:
   `npm uninstall @expo/ui expo-glass-effect`
4. Commit + push:
   `git add package.json package-lock.json`
   `git commit -m "Remove unused beta @expo/ui + expo-glass-effect (fixes launch crash)"`
   `git push`
5. Rebuild: `eas build --platform android --profile preview` (emulator prompt → type `n`).
6. Install the new APK → open → it should launch to the **onboarding** screen. 🎉
> If a DIFFERENT `NoClassDefFoundError` for another expo module appears next, remove that
> beta/unused package the same way and rebuild. (Adham has adb/platform-tools set up to read crash logs:
> `cd "C:\Users\User\OneDrive\Desktop\platform-tools"` then `.\adb -s <device> logcat -b crash -d`.)

---

## 🤝 OUR WORKING AGREEMENT (how Kiro & Adham work together)
- **Roles:** Kiro is the **captain / lead decision-maker**; Adham is a solo beginner who follows
  click-by-click orders. Kiro proposes the plan and decides technical details.
- **Style:** Explain everything **ELI10** with **click-by-click** steps. Warm, encouraging, patient.
- **Safety:** Small, testable batches. Always **push to GitHub**. Be **honest about risk**.
- **Goal/feel:** Adham wants the app to look **truly professional ("fine like wine")**, not "vibe-coded".
- Adham **can't access the filesystem directly** — surface file contents; use PRs/branches.
- **Personal:** Adham is a CSE student in Bangladesh; this project matters deeply to him. Be supportive.

## 📱 WHAT SWIPEIQ IS
A study app that turns learning into a swipe game. Type any topic → AI instantly makes flashcards →
learn by swiping (right = know it, left = don't). Uses SM-2 spaced repetition, a mascot coach named
**Q**, streaks/XP/ranks, a timed **Boss Arena**, and a **Roast mode**. Tagline: *Swipe. Learn. Level up.*

## 🛠️ TECH STACK
- Expo SDK **54**, React Native **0.81.5**, React **19**, **New Architecture ON**, Expo Router, TypeScript.
- `babel.config.js` present with `react-native-worklets/plugin`; `babel-preset-expo` installed.
- State: Zustand (`src/lib/store.ts`) + AsyncStorage. Color tokens live in `getThemeColors` there.
- Backend: Supabase (Auth, Postgres + RLS, Edge Functions). Project ref `dlyqfcfagmameiwotubb`.
- AI: Google Gemini (free `gemini-2.5-flash`) via the `generate-cards` edge function (server-side).
- App package id: `com.adham.swipeiq`. Keys are *publishable* (public by design).
- Build: `eas build -p android --profile preview` → installable APK. Adham builds on his Expo account.

## 📍 CURRENT STATUS
- **v1.0 is merged to `main`.** We're in **Phase 1**: getting the first shareable APK to launch.
- APK **builds fine**; it was **crashing on launch** → cause found = `@expo/ui` (see IMMEDIATE NEXT STEP).
- ⚠️ Adham's `.env` has `EXPO_PUBLIC_GEMINI_API_KEY` — a Gemini key should **NOT** be public/client-side.
  After the app launches, clean this up (AI must only run server-side in the `generate-cards` function).
- ⚠️ Dependabot PRs **#4–#8**: do **NOT** merge (huge version jumps that would break the build).
- **PR #11**: disables React Compiler + this CONTEXT update — safe to merge.
- **Still pending:** Phase 1b (Sentry crash reporting + EAS Update for instant OTA fixes), then the rest
  of `ROADMAP.md` (the "wine" polish pass, hard testing, friend beta, publish, monetize, scale).

## 📋 DEBUGGING JOURNAL — the launch-crash saga (so you have full context)
1. App ran fine in Expo Go but crashed on launch as a real APK.
2. Added `babel.config.js` (worklets plugin) — required, but didn't fix the launch crash.
3. `babel.config.js` needed `babel-preset-expo` → installed it → the build then succeeded.
4. Disabled experimental **React Compiler** (PR #11) as a precaution — turned out NOT to be the cause.
5. Read **adb logcat** → REAL cause = **`@expo/ui`** beta package (`NoClassDefFoundError`).
6. **FIX = remove `@expo/ui` + `expo-glass-effect`** (unused beta packages). ← WE ARE HERE.

## 🗂️ KEY FILES
- `ROADMAP.md` — the full 8-phase plan (master checklist).
- `CONTEXT.md` — this file (resume + status).
- `TESTING.md` — manual hard-test missions + friend-tester questions.
- `TESTING-AUTOMATION.md` — APK build, monkey, Maestro, Firebase Test Lab, security scanners.
- `LEARN-GITHUB.md` — GitHub course + repo tour reference.
- `scripts/generate-icon.py` — regenerates the app icon/splash on demand.
- `.env.example` — environment variable template.
