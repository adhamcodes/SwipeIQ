# 🗣️ SwipeIQ — Beta Feedback Log

Every piece of tester feedback lives here so nothing is ever lost. We read it, group it into
themes, and decide what to build next. Newest beta rounds go at the top of each tier.

**How this file is organized**
- **Tier 1 — Priority / Expert feedback** (pinned at the very top). High-signal reviews from people
  who know the space.
- **Tier 2 — Beta tester feedback.** Everyone else (friends, family, the wider beta).

**Triage tags** (Kiro adds these so we know how to act on each point):
- ✅ **Already exists** — built, but maybe not visible/discoverable enough.
- 🎯 **Quick win** — cheap to do, high impact.
- 🛠️ **Build later** — real feature, needs proper work (a future phase).
- 💭 **Big bet** — large/ambitious; worth planning, not rushing.

---

## ⭐ TIER 1 — Priority / Expert Feedback

### 🥇 Adham's cousin — CS background, currently studying AI in Germany · Beta 1 · 2026-06-17
> _Top-priority reviewer: strong CS + AI background, real target user._

**His review (verbatim):**

> Hey, I've been using the app and wanted to share some feedback.
>
> The AI study feature feels more useful for university students or users who are learning
> AI-related topics. For general learners, it doesn't always feel relevant unless the topic is
> specifically AI-focused.
>
> For example, if I'm learning a language, the AI can help me practice and learn general concepts,
> which is great. However, when I want to create flashcards directly from my course content, the
> experience feels limited.
>
> It would be really helpful if the app could:
>
> - Generate flashcards automatically from uploaded course materials or selected lessons.
> - Remember previous lessons and adapt future flashcards based on learning progress.
> - Provide more personalized study recommendations instead of mainly AI-related suggestions.
> - Support topic-based learning for any subject, not just AI or technology topics.
> - Offer spaced repetition and smart revision reminders to improve retention.
> - Create quizzes and practice tests from course content automatically.
> - Allow users to organize flashcards into folders or study sets by course/module.
> - Track learning progress and show weak areas that need more practice.
> - Improve contextual memory so the AI better understands what the user has already studied.
>
> Overall, the app has a lot of potential, but expanding the study tools for general learners and
> making flashcard generation more intelligent would significantly improve the learning experience.

**Captain's triage (Kiro's notes):**

| His point | Reality today | Verdict |
|---|---|---|
| "Feels AI/tech focused, not for general learners" | The app supports **any** topic; starter decks are diverse (capitals, SAT vocab, biology). BUT the input hint says *"e.g., Deep Learning, Quantum Physics..."* and loading says *"COMPILING ALGORITHMS..."* — the **wording/branding** makes it look AI-only. | 🎯 **Quick win** — change example topics to varied subjects + warm up robot-speak. (Ties into Phase 2 polish.) |
| Spaced repetition + revision reminders | **Already built** (SM-2 + notifications). | ✅ Exists → make it more **visible**. |
| Track progress / show weak areas | Partial (XP, mastered count, due-card priority); no dedicated "weak areas" view. | 🛠️ Build a simple progress/weak-areas screen. |
| Quizzes / practice tests | Partial — **Boss Arena** is a timed test. | ✅ Exists → surface it + expand. |
| Organize into folders / study sets by course | Library is currently flat (no folders). | 🛠️ Build later — folders/tags. |
| **Generate flashcards from uploaded course materials (PDF/notes/lessons)** | Not yet — biggest gap he named. | 💭 **Big bet & likely killer feature.** Highest potential value. |
| Adapt future cards to progress / contextual memory | Not yet. | 💭 Big bet (personalization/AI memory). |
| Personalized study recommendations | Not yet. | 🛠️/💭 Build later. |

**One-line summary:** _Two cheap fixes (de-tech the wording + surface features that already exist)
solve most of his "feels AI-only" complaint immediately. His standout idea — **flashcards from
uploaded course material** — is the feature most likely to make this a must-have for students._

---

## 🧑‍🤝‍🧑 TIER 2 — Beta Tester Feedback

> Paste each tester's feedback here using the template below. Keep them dated.

### Template (copy for each new tester)
```
### [Name] — [phone / who they are] · Beta 1 · YYYY-MM-DD
What they loved:
What confused/annoyed them:
Bugs they hit:
Would they use it regularly? Over Quizlet/Anki/Duolingo?
Their #1 requested feature:
Kiro's triage:
```

_(No tester entries yet — add them as the Google Form responses come in.)_
