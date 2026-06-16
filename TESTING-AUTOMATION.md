# 🤖 Automated Testing & Security Scanning

Manual tapping isn't enough (and your single cheap phone can't cover all devices).
These tools let robots test your app, on many devices, and find flaws for you.

> ⚠️ **Important:** Monkey, Maestro, and cloud device farms need a real **APK / dev build**,
> NOT Expo Go. Build one first.

---

## Step 0 — Build an installable APK (free, in the cloud)
```bash
npm install -g eas-cli      # one time
eas login                   # use your Expo account
eas build -p android --profile preview
```
When it finishes, download the `.apk`. That file is what every tool below uses.
Your app's package id is **`com.adham.swipeiq`**.

---

## 1) 🐒 Monkey test — random chaos tapping (finds crashes)
Built into Android. Install the APK on a phone/emulator (USB debugging on), then:
```bash
# 5,000 random taps/swipes/keys. Watch for "CRASH" or "ANR" in the output.
adb shell monkey -p com.adham.swipeiq -v 5000

# gentler, with small pauses between events:
adb shell monkey -p com.adham.swipeiq --throttle 300 -v 2000
```
If it crashes, the terminal prints the exact error and the random seed to reproduce it.

---

## 2) 🎭 Maestro — scripted automated flows (repeatable tests)
```bash
curl -fsSL https://get.maestro.mobile.dev | bash   # install (one time)
maestro test .maestro/smoke.yaml                   # launch + onboarding + login
maestro test .maestro/generate-deck.yaml           # full login -> generate -> swipe
```
Edit the `.maestro/*.yaml` files to add more flows. `maestro studio` lets you record taps visually.

---

## 3) ☁️ Firebase Test Lab — auto-test on MANY real phones (fixes the "cheap phone" problem)
The **Robo test** automatically explores your app on real Google devices and reports crashes —
no script required.
1. Go to **console.firebase.google.com** → create a free project.
2. Left menu → **Test Lab** → **Run a test** → **Robo test**.
3. Upload your `.apk`, pick several devices (different sizes / Android versions) → **Run**.
4. Read the report: crashes, screenshots, and a video of each device.

Other options: **BrowserStack App Live** (drive real devices in your browser), **AWS Device Farm**.

---

## 4) 🛡️ Security / vulnerability scanners
| Tool | How to run | Finds |
|------|-----------|-------|
| **npm audit** | `npm audit` (in project folder) | Vulnerable dependencies |
| **Dependabot** | Already configured; turn on alerts in GitHub → Settings → Code security | Vulnerable deps (auto PRs) |
| **Supabase Security Advisor** | Supabase dashboard → **Advisors → Security Advisor** | Tables without RLS, unsafe functions |
| **MobSF** | `docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf` then upload your APK | Insecure storage, leaked secrets, risky permissions |
| **Semgrep** | `pip install semgrep && semgrep --config auto` | Insecure code patterns |

---

## Recommended order
1. Build APK (Step 0).
2. Run **Firebase Robo test** (cross-device + auto crash finding).
3. Run **monkey** (stress) + **Maestro** (repeatable flows).
4. Run **Supabase Security Advisor** + **npm audit** + **MobSF**.
5. Send the APK to friends with the questions in `TESTING.md`.
