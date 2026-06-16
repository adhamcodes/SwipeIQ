# 🗺️ SwipeIQ Roadmap — Captain's Orders

Our shared map. 🧭 = I (Kiro) do it.  📱 = Adham does it (I give click-by-click).
We go top to bottom. Don't jump ahead — each phase sets up the next.

---

## ✅ PHASE 0 — Lock in everything we built
- [ ] 📱 Merge the **release/v1.0** Pull Request (#3) into `main`. (I'll walk you through the button.)
- [ ] 📱 Close PR #1 and #2 (their work is already inside #3).
> After this, `main` = your real, current app. Nothing is lost, ever.

## 🛡️ PHASE 1 — Make it real & crash-proof (answers "how do friends test it?")
- [x] 📱 Set up EAS: `npm i -g eas-cli` then `eas login`.
- [~] 🧯 Add **Sentry** crash reporting (so we SEE every crash). ← in progress (PR `feature/sentry-crash-reporting`)
- [ ] ⚡ Add **EAS Update** (push fixes in minutes, no store re-review).
- [x] 📱 Build a **preview APK**: `eas build -p android --profile preview`.
- [x] 📱 Install the APK on your phone → confirm the real app + icon work. 🎉 (launch crash fixed!)
> Now you have a real, shareable app with a safety net.

## 🍷 PHASE 2 — The "fine like wine" polish pass (warm-futuristic)
- [ ] �edesign microcopy: kill robot-speak ("DATA INJECTION" → human, warm lines).
- [ ] 🧠 Add micro-delight: button feedback, transitions, celebratory moments.
- [ ] 🧯 Spacing, depth, gradients, typography hierarchy — screen by screen.
- [ ] 🧯 Delightful empty states (no blank screens).
- [ ] 📱 You react to each screen → we tune until it feels like YOURS.
> This is the part that finally makes your heart match your eyes.

## 🧪 PHASE 3 — Hard testing (break it on purpose)
- [ ] 📱 Run the gremlin missions in `TESTING.md`.
- [ ] 📱 Run **Firebase Test Lab Robo** (auto-test on many real phones).
- [ ] 📱 Run **monkey** + **Maestro** (see `TESTING-AUTOMATION.md`).
- [ ] 🧯 I fix every bug you find.

## 🔐 PHASE 4 — Finalize backend & security
- [ ] 📱 Run **Supabase Security Advisor**; I fix anything it flags.
- [ ] 📱 Turn ON email confirmation + stronger password rules (Supabase dashboard).
- [ ] 🧯 Decide & build the **Gemini BYOK** plan (free-for-users, safe for us).
- [ ] 🧯 Apply security fix #3 (encrypt login token) — WITH you testing login right after.

## 👬 PHASE 5 — Friend beta
- [ ] 📱 Share the APK with friends.
- [ ] 📱 Collect reviews using the questions in `TESTING.md`.
- [ ] 🧯 We act on the feedback (fix, improve, decide what's worth it).

## 🚀 PHASE 6 — Publish
- [ ] 📱 Create a **Google Play** developer account ($25 one-time).
- [ ] 🧯 Prepare store listing: description, screenshots, privacy policy.
- [ ] 🧯 Build the production release; 📱 you submit it.
- [ ] (iOS later — needs an Apple account + Mac/TestFlight.)

## 📈 PHASE 7 — Live: manage & grow
- [ ] Watch Sentry (crashes), Supabase usage, Gemini quota.
- [ ] Read reviews, push EAS updates, ship improvements.
- [ ] Decide on monetization (only if people love it — never break the "free" promise).
- [ ] Scale: caching, limits, infrastructure as users grow.

---

### 📜 Our rules
1. Small, testable batches — you test each before we move on.
2. I'm always honest about risk.
3. You're the captain; I'm the engineer. (You've handed me the wheel for now. 👑)
4. Everything lives on GitHub — nothing is ever lost again.
5. We make it *yours* — your taste leads the polish.
