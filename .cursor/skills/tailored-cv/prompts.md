# Tailored CV — Full Prompt Library

Verbatim prompts for the 8-phase pipeline. Run Phase 1 first; use outputs as input to later phases.

---

## Phase 1. Job Description Analyzers

### Prompt 1.1. Job Description Analyzer

```
Act as an ATS scanner. I'll give you 5–10 UX/UI designer job
descriptions and my resume.
1. Extract the top 30 keys: skills, tools, domains, metrics, soft.
2. Organize into three columns:
   — critical (appears in 7+ of 10 jobs)
   — desirable (3–6 jobs)
   — missing from me (in jobs but not in my resume).
3. For each "critical" key, suggest which portfolio case
   it best belongs to.
If there are more than 10 descriptions, take the first 10.
Format — table.
Job descriptions: <paste>
Resume: <paste>
```

### Prompt 1.2. Wording Calibrator

```
Take three of my skill descriptions and three job descriptions below.
Rewrite each of mine into three versions — one per job.
Keep my vocabulary, pull in terms and metrics from the job description.
Don't invent experience I don't have.
```

### Prompt 1.3. Missing Keys Scanner

```
Give me a table: which skills appear in N out of 10 job descriptions
but are missing from my resume? Sort by frequency. For each, give a
short answer: can this be closed in a month (course, side project,
concept), or is it a multi-year skill?
```

### Prompt 1.4. One-Shot ATS-Weighted Header

```
Rewrite my portfolio's headline and subhead so the first 50 words
contain 5 "critical" keys from the analyzer table.
No bullet lists — a living sentence.
```

---

## Phase 2. The First Screen

### Prompt 2.1. First Screen Hook

```
I'll give you my current first screen and three target jobs.
Write three versions of headline + subhead + a one-line "about me"
— one per job.
Rules:
— no more than 12 words in the headline
— subhead expands the headline, doesn't repeat it
— "about me" = one skill + one metric + one domain
— no "innovative," "unique," "passionate."
```

### Prompt 2.2. 5-Second Test

```
Act as a recruiter who has 5 seconds for the first screen of my
portfolio. I'll describe or paste the first screen.
Say:
1. What I understood in 5 seconds (one phrase).
2. What didn't land.
3. What three edits would raise readability.
Don't comment on visuals — only message and hierarchy.
```

### Prompt 2.3. Captions for 3 Cases

```
Under each of my three main cases, write a preview caption of
8–12 words in the format "domain + task + result with a number."
If there's no number — replace with a concrete artifact (design system,
journey map, A/B test).
```

### Prompt 2.4. Meta Title and Description

```
For my portfolio's home page, write a title (up to 60 chars)
and description (up to 160 chars) using three "critical" keys
from the analyzer table. Don't lead with "UX designer portfolio" —
phrase it for a real search query.
```

**Before/after example:**
- Before: "UX/UI designer with experience in mobile and web products"
- After: "Product Designer. I build interfaces for mobile and web services, simplifying flows and pushing users to the target action."

---

## Phase 3. Case Doctor (CCDT-O)

CCDT-O = Context → Constraint → Decision → Trade-off → Outcome (extension of STAR).

### Prompt 3.1. The Case Doctor (CCDT-O)

```
I'll give you raw project text — unstructured, all at once.
Compose it into a case with 5 blocks:
1. Context — why the project existed, who the user was, what business.
2. Constraint — what limited you (deadlines, regulator, legacy, budget).
3. Decision — what you chose and why.
4. Trade-off — what alternatives you considered and why you dropped them.
5. Outcome — what you got in numbers or artifacts.
If something is missing in my text, mark [gap] and suggest what question
to ask myself to fill it.
Don't invent facts or numbers not in the text.
If the text is over 2000 words — process the first part and at the end
suggest how to split the case into two.
Tone — business, no "innovative/unique/clearly."
```

### Prompt 3.2. Trade-off Matrix

```
From my case, build a trade-off table. Columns:
alternative / pros / cons / why I didn't pick it.
Minimum three alternatives, including "do nothing."
If I didn't mention alternatives — ask me three clarifying questions
before filling the table.
```

### Prompt 3.3. Impact-First Reorder

```
Flip my case order from problem-first to impact-first.
Structure:
1. Impact — what changed in numbers or behavior.
2. Definition — what problem I solved.
3. Exploration — what I looked at.
4. Approach — what I ended up doing.
This is for "Portfolio A" (big tech), where the recruiter has 30 seconds
per case.
```

### Prompt 3.4. Number Extractor

```
Read my raw text and pull out all numbers — conversion rates, timelines,
team size, traffic volume, screen count.
Group into two buckets:
— impact (changed for user/business)
— scale (size of the task).
If I invented a number or it sounds suspicious — flag it.
Don't invent facts or numbers not in the text.
If information is missing — mark [gap].
```

---

## Phase 4. AI-Slop Cleaner

### Prompt 4.1. GPT Bureaucracy Detector

```
Read my case text. Find fragments with AI-output signals:
— bureaucracy ("implementation of," "realization of," "ensuring")
— evaluative words without backup ("quality," "effective")
— general phrases without specifics ("improved user experience")
— missing first person where it should be.
Mark each flagged fragment in the format:
⚠️ <phrase> → 🎯 <how to rewrite it alive in my context>.
```

### Prompt 4.2. Generic-Word Anti-Spam

```
Find these words in my text: "innovative," "unique," "revolutionary,"
"clearly," "essentially," "it's worth noting," "in today's world,"
"being."
For each — suggest a concrete replacement in my context or argue for
deletion.
Separately, count the frequency of these words per 1000 characters.
```

### Prompt 4.3. Voice Restorer

```
Read my case. Find 3 spots where my voice should be heard
(moment of doubt, unexpected result, personal takeaway).
For each, suggest a short first-person insertion (1–2 sentences)
that draws on details in my text, not generic territory.
```

### Prompt 4.4. Fake-Metrics Detector

```
Find all percentages and absolute numbers in my case.
For each, ask me three questions:
1. What was the baseline.
2. What's the data source.
3. Over what period.
If I can't answer — mark 🚩 "weak metric, replace with qualitative
observation."
Don't propose new numbers. Work only with what's in the text.
```

---

## Phase 5. Seniority Judge

Middle: $70k–$110k. Senior: $110k–$170k. Gap = strategic thinking, trade-offs, sourced metrics, process ownership, reflection.

### Prompt 5.1. Senior Judge

```
Act as a hiring manager at design-lead level with experience hiring 50+
designers. I'll give you a case. Score it on 5 criteria, scale 1–5:
1. Strategic thinking (does the author see the business connection).
2. Trade-off (did they show rejected alternatives).
3. Business metrics (are numbers sourced).
4. Process ownership (structure, artifacts, accountability).
5. Reflection (what would they do differently).
Format per criterion:
<criterion>: <score>/5 — <one phrase why>.
At the end — overall: middle / senior / insufficient data.
```

### Prompt 5.2. What to Rewrite to Hit Senior

```
Based on the Senior Judge output (prompt 5.1), give 5 concrete edits:
what to cut, what to add, what to rephrase.
Each edit — with a "before" and "after" line, taken from my case.
If raising the level needs material I don't have — mark "needs new
information" with a clarifying question.
```

### Prompt 5.3. Band Alignment

```
Take my case after edits and three senior job postings ($110k–$170k).
Tell me which three phrasings in my case the recruiter at that level
will look at first. Where the misses are — where the hits are.
End: what band I currently land at with this case.
```

---

## Phase 6. One-Pager and Pitch Deck

### Prompt 6.1. One-Pager for Referral

```
Compose the text of a one-page A4 one-pager. Structure:
1. Header: name, specialization, contact, portfolio link.
2. "About me" — 2–3 sentences.
3. Three case highlights — one line each
   (domain / task / result).
4. Tool stack — one line.
5. Target role — one line.
Tone — business, no opening phrases like "I'm excited to share."
```

### Prompt 6.2. 10–12 Slide Pitch Deck

```
Expand the one-pager into a 10–12 slide structure for a team call.
Output as a list of 10–12 items, one per slide, in this format:
Slide N: title (up to 7 words) / 3 bullets or one case /
what I say out loud (1–2 sentences).
Structure: about me → 3 cases → how I work → why here → questions.
No "thanks for your attention" slide.
```

### Prompt 6.3. Platform Adapter

```
Take my pitch deck structure (10–12 slides) and adapt for three tools:
Storydoc (interactive modules), Pitch (templates with team analytics),
Canva (fast assembly).
For each — what to put in the first block, what in expandables,
where each platform's weak spot is.
```

---

## Phase 7. Industry Adaptation

### Prompt 7.1. Industry Tone

```
Act as a product designer with 5+ years of experience in
[fintech / EdTech / e-commerce]. I give you my case. Rewrite the
phrasing, headlines, and captions so they sound like an industry
insider:
— vocabulary (compliance, KYC, LTV, retention for fintech;
engagement, retention, didactics for EdTech; conversion, AOV,
cart for e-com)
— metrics the role values in this industry
— domain-specific constraints.
Same case — repackaged for the industry.
```

### Prompt 7.2. Honest Failure Case

```
I'll give you a project that failed (metrics didn't land, client backed
out, feature shipped and broke). Build a case for a mature HR in this
format:
1. What I set out to do.
2. What hypotheses I tested.
3. Why the hypothesis didn't hold.
4. What I took away and where I applied it.
No blame to the team or client.
No polish. Mature HRs value cases like this as a marker of reflection
and senior-level thinking.
```

### Prompt 7.3. Localization Adapter

```
Rewrite my case for two markets in parallel:
— US/EU hiring: English, impact in dollars or percentages, narrative
through "I" (not "we"), western references (e.g. Stripe, Klarna,
Shopify instead of generic "a fintech").
— Local market: native language, local company references.
Preserve all facts. Don't invent.
```

---

## CCDT-O Template (copy whole)

```
[Company] — [role] ([dates])
[Type of product in one sentence: what it is, for whom, on what platform]

Context and Constraints
— [Time pressure or deadline]
— [Regulator / compliance / NDA — if any]
— [Existing design system / legacy / technical constraints]
— [Team size and roles around you]

What I Did
— [Action 1: which flows, for which users]
— [Action 2 with trade-off: proposed two options — picked one, why]
— [Action 3 on handoff: how shipped, to whom, how I supported it]

Outcome
— [Metric 1 with baseline and period]
— [Metric 2 with baseline]
— [If no numbers — a concrete artifact: design system, A/B test, guide]
```

### "Is this block ready?" checklist

- [ ] In 5 seconds, clear what the product is (not "interface design" — "online banking for SMB")
- [ ] Real deadline ("3 months to release," not "worked on…")
- [ ] At least one constraint (KYC, GDPR, legacy, team size)
- [ ] Concrete verbs ("designed," "shipped") not "participated"
- [ ] Visible choice between options ("proposed A and B → picked B, because…")
- [ ] Every number has baseline and period
- [ ] If no numbers — material artifact (design system, A/B test, guide)

3 checks or fewer → rework. 6+ → holds up under ATS and hiring lead.

---

## Phase 8. Package to HTML

### Prompt 8.1. Generate Tailored CV HTML

```
Using the finalized CV content below, write a complete HTML file for a
tailored CV. Base the structure and all CSS classes strictly on the
template at cv/index.html (copy the topbar, header, sections, skill
chips, press items — whatever applies).

Rules:
— Output path: private/cv/{opaque-slug}.html (suggest a random 6-char
  alphanumeric slug if I haven't given one)
— Keep <meta name="robots" content="noindex"> in the head
— Keep the theme toggle and Download PDF button from the template
— Reuse cv/cv.css via <link rel="stylesheet" href="../cv/cv.css">
— Remove or comment out sections not relevant to this role
— Do not alter the JS block at the bottom of the template
— Do not invent content — only use what has passed phases 1–7
— Mark any [gap] items inline as HTML comments <!-- [gap]: ... -->

Finalized CV content:
<paste output from phases 1–7>
```

### Prompt 8.2. PDF Export Instructions

```
The tailored CV is at private/cv/{slug}.html. Give me step-by-step
instructions to export it as a print-ready PDF:
1. Open it in Chrome (or Safari) with ?print=1 appended to the URL
2. The page will auto-trigger the print dialog with light theme
3. Set: paper = A4 or Letter, margins = None, background graphics = on
4. Save as PDF — filename suggestion: RobySaavedra-{CompanyName}.pdf
Do not commit the PDF or the HTML to the public repo.
```

---

## Glossary

| Term | Meaning |
|------|---------|
| ATS | Applicant Tracking System — keyword filter (~75% rejected before human) |
| Case study | Problem → Method → Impact |
| One-pager | Single-page PDF for referrals |
| Pitch-deck | 10–12 slides for hiring call |
| STAR | Situation → Task → Action → Result |
| CCDT-O | Context → Constraint → Decision → Trade-off → Outcome |

---

## Anti-patterns (prompts that break your portfolio)

1. "Write a UX case about my project X" without explanation
2. "Invent metrics for the project"
3. "Use lively language" without specifics
4. "Make it like Apple" without references
5. "Act as a UX designer" — use level + context instead

---

## Model comparison (Case Doctor 3.1)

| Model | Strength |
|-------|----------|
| ChatGPT | Analytics, ATS tables |
| Claude | Long-context packaging |
| Gemini | Mixed tasks |

Prompts work in all three; difference is response style, not logic.
