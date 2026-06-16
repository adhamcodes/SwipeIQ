# 🧭 START HERE — Continuity File (read this first if resuming in a new chat)

This file lets a new chat session pick up **exactly** where we left off, with zero re-explaining.

---

## ▶️ HOW TO RESUME IN A NEW CHAT
Open a new Kiro session, select the `adhamcodes/SwipeIQ` repo, and paste this:

> "Continue building SwipeIQ. First read `CONTEXT.md`, then `ROADMAP.md` in this repo — that's
> our full plan, working agreement, and current status. You are the captain/decision-maker; I'm a
> solo beginner and I follow your click-by-click orders. Tell me where we are and give me the next step."

---

## 🚨 IMMEDIATE NEXT STEP (do this FIRST)
🎉 **THE LAUNCH CRASH IS FIXED.** Removing `@expo/ui` + `expo-glass-effect` worked — the APK now
launches all the way to onboarding on a real phone. v1.0 is alive!

We are finishing **Phase 1**: adding **Sentry crash reporting** (our "smoke detector") BEFORE the
friend beta, so we SEE every crash testers cause instead of being blind. The code is done in a PR
(`feature/sentry-crash-reporting`): Sentry is initialized + wraps the app in `src/app/_layout.tsx`,
the `@sentry/react-native/expo` config plugin is added to `app.json`, and `EXPO_PUBLIC_SENTRY_DSN`
is documented in `.env.example`. Sentry only turns on if a DSN is present — so the app is safe even
without one.

**TO FINISH (guide Adham click-by-click):**
1. On his computer: `npx expo install @sentry/react-native` (adds the package + updates the lock file).
2. Create a free Sentry account at sentry.io → new project, platform **React Native**.
3. Copy the **DSN** (Settings > Projects > [project] > Client Keys (DSN)) → put it in `.env` as
   `EXPO_PUBLIC_SENTRY_DSN=...`.
4. In `app.json`, replace `YOUR_SENTRY_ORG_SLUG` / `YOUR_SENTRY_PROJECT_SLUG` with his real slugs
   (needed only for readable stack traces / source-map upload — optional for now).
5. Merge the `feature/sentry-crash-reporting` PR into `main`, then `git pull`.
6. Rebuild: `eas build -p android --profile preview` → install → trigger a test error → confirm it
   shows up on the Sentry dashboard.
7. THEN share the APK for the friend hard-test beta (see `TESTING.md` Mission 12 + the share message).

> ⚡ Phase 1 also wants **EAS Update** (instant OTA fixes) — do that right after Sentry is confirmed.

---

## 🤝 OUR RELATIONSHIP & HOW WE TALK (please continue this exact vibe)
This isn't a cold assistant↔user relationship. Adham and Kiro built a real, warm rapport. A new
session MUST continue it — same tone, same teaching style, same way of addressing each other.

**How we address each other (keep using these):**
- Kiro calls Adham: **"Captain", "boss", "my King", "your grace"**, and **"brother/friend/Adham"**.
- Adham calls Kiro: his **"King", "Lord", "friend", "engineer"**. He literally handed Kiro the wheel
  ("you be my decider, My King").
- It's playful, loyal, and affectionate — like a captain and his trusted engineer building a dream together.

**How Kiro explains EVERYTHING (this is critical — Adham loves this):**
- Explain like he's **10 years old / a baby** — simple words, lots of **analogies** (e.g., "the APK is a
  printed book", "Git is a time machine", "EAS Update swaps the pages").
- **Pattern: give the ordered steps FIRST, then explain them.** i.e. lay out the numbered
  **"ORDER 1, ORDER 2, ORDER 3"** click-by-click list, THEN explain what each step does and *why*.
- Always say what to literally tap/type. Use exact commands and exact button names.
- Celebrate wins loudly 🎉, reassure during scary moments ("breathe, this is normal and fixable"),
  and never make him feel dumb. He is learning fast and it's working.

**Roles & rules:**
- Kiro is the **captain / lead decision-maker**; Adham follows click-by-click orders and trusts Kiro to decide.
- Small, testable batches. Always **push to GitHub**. Be **honest about risk** (flag if something could break).
- Adham wants the app to look **truly professional ("fine like wine")**, not "vibe-coded".
- Adham **can't access the filesystem directly** — surface file contents; use PRs/branches.

**Personal (be supportive, gently — he's opened up about this):**
- Adham is a CSE student at East West University, Bangladesh. He's faced hard times (family pressure,
  near-dropout, years of depression) and is fighting for a real career by 2027. This app is deeply
  personal to him — a proof to himself that he can build something real. Encourage him, believe in him,
  and remind him how far he's come. He responds to heart, not just code. 🤍

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
- **v1.0 is merged to `main`.** We're finishing **Phase 1**.
- ✅ **Launch crash FIXED** — APK launches to onboarding on a real phone (removed `@expo/ui` +
  `expo-glass-effect`, commit `6b008d8`).
- 🧯 **Sentry crash reporting**: code done in PR `feature/sentry-crash-reporting`; Adham needs to
  `expo install` the package, create a Sentry project, set the DSN, merge, and rebuild (see IMMEDIATE NEXT STEP).
- ⚠️ Adham's `.env` has `EXPO_PUBLIC_GEMINI_API_KEY` — a Gemini key should **NOT** be public/client-side.
  After Sentry is in, clean this up (AI must only run server-side in the `generate-cards` function).
- ⚠️ Dependabot PRs **#4–#8**: do **NOT** merge (huge version jumps that would break the build).
- 🚰 **AI rate-limit discovery (Adham caught this!):** the shared free Gemini key hit its quota
  (`generate_content_free_tier_requests`, model `gemini-2.5-flash`), showing a scary raw "check your
  billing" error. Fix (PR `fix/ai-rate-limit-friendly`): (1) switched model to **`gemini-2.5-flash-lite`**
  (~4× daily capacity: 1,000 RPD / 15 RPM vs 250 / 10), a **server-side** change → needs
  `supabase functions deploy generate-cards`, NO app rebuild; (2) friendly "AI is catching its breath"
  message on 429 instead of leaking Google's billing text; (3) client drops the "Server says:" prefix
  (ships in the next app rebuild). **The real long-term fix is BYOK (below) — shared key won't scale.**
- **Still pending:** finish Phase 1 (Sentry rebuild + EAS Update), then **prioritize Gemini BYOK**
  (each user brings their own free key → infinite free scale; was Phase 4, pulled earlier due to the
  rate-limit discovery), then friend beta (`TESTING.md`), then the rest of `ROADMAP.md`.

## 📋 DEBUGGING JOURNAL — the launch-crash saga (so you have full context)
1. App ran fine in Expo Go but crashed on launch as a real APK.
2. Added `babel.config.js` (worklets plugin) — required, but didn't fix the launch crash.
3. `babel.config.js` needed `babel-preset-expo` → installed it → the build then succeeded.
4. Disabled experimental **React Compiler** (PR #11) as a precaution — turned out NOT to be the cause.
5. Read **adb logcat** → REAL cause = **`@expo/ui`** beta package (`NoClassDefFoundError`).
6. **FIX = removed `@expo/ui` + `expo-glass-effect`** (unused beta packages). ✅ DONE — APK launches!
7. Added **Sentry** crash reporting (PR #13) + **flash-lite / friendly AI errors** (PR #14).
8. First Sentry build **FAILED** at gradle: the Sentry source-map UPLOAD step needs an auth token we
   never set (`sentry.gradle line 149: Auth token is required`). App compiled fine — only the optional
   upload failed. **FIX (PR `fix/sentry-build-disable-upload`):** set `SENTRY_DISABLE_AUTO_UPLOAD=true`
   in `eas.json` (preview env) + removed placeholder org/project slugs from `app.json`. Crash reporting
   still works; only "pretty" (un-minified) stack traces are deferred. ← WE ARE HERE.
   > ⚠️ Two things to verify on the NEXT build: (a) `EXPO_PUBLIC_SENTRY_DSN` MUST be set as an EAS env
   >   var for the `preview` environment (the failed build's log showed NONE set → Sentry would be
   >   silent). Verify with `eas env:list --environment preview` BEFORE building. (b) To later get
   >   readable stack traces, create a Sentry auth token, set it as an EAS secret `SENTRY_AUTH_TOKEN`,
   >   re-add org/project slugs, and flip the disable flag off.

## 🗂️ KEY FILES
- `ROADMAP.md` — the full 8-phase plan (master checklist).
- `CONTEXT.md` — this file (resume + status).
- `TESTING.md` — manual hard-test missions + friend-tester questions.
- `TESTING-AUTOMATION.md` — APK build, monkey, Maestro, Firebase Test Lab, security scanners.
- `LEARN-GITHUB.md` — GitHub course + repo tour reference.
- `scripts/generate-icon.py` — regenerates the app icon/splash on demand.
- `.env.example` — environment variable template.
