# Endo AI — Case Study Page Build Spec

For: Claude Code, building `/endo-ai/index.html` (or equivalent route) on
robysaavedra.com, using the existing Olympus case study page
(`/olympus/index.html`) as the structural and stylistic template.

## Before writing any code

Read the existing Olympus page in full — its HTML, and the shared
`dist/css/styles.css` / `src/scripts/site-chrome.js` it depends on. This new
page should reuse the exact same section classes, carousel/lightbox/scroll
scripts, and visual system. Do not introduce new component patterns unless a
section genuinely has no equivalent (flagged below where that's the case).
Match indentation, comment-banner style (`<!-- ─── Section ─── -->`), and
script-init calls at the bottom of the file.

**Do not carry over the password paywall.** Olympus gates its content behind
`initOlympusPaywall()` because it covers real, possibly-confidential former
employer work. This page does not need that — it's explicitly a self-directed
project (see framing note below) with nothing to gate. Omit
`cs-paywall` / `cs-intro--paywall-preview` entirely; structure the intro like
a normal unlocked `cs-intro`.

## Critical framing note — read before writing copy

This is a **self-directed, speculative project**, not a project built for or
commissioned by an employer. It grew out of a real, shipped project at
Olympus (the traceability search tool — see the existing Olympus case study),
where AI was explicitly ruled out for the MVP due to privacy and
infrastructure constraints, with the design deliberately built to "lay the
foundation for a natural language layer down the road." This project is that
natural language layer, designed and built independently afterward to prove
the concept out.

Do not write copy that implies this was commissioned work, a company
initiative, an official team project, or that it shipped/launched at a real
company. Do not invent named colleagues, a company pod, or specific
statistics (e.g. no "42% reduction," no "12% stale-data rate") — those were
explored earlier as a hypothetical exercise to reason through how a team
*would* approach this, and are not real findings. Where the copy below
references a design rationale (e.g. the confidence-tier model, the PII
architecture), that reasoning is real and should be written with full
conviction — it's the invented *metrics* that must not appear, not the
invented *scenario*.

The one exception: it is fine, and encouraged, to reference the real Olympus
project as direct professional context/motivation — that part is true and
strengthens the throughline between the two case studies.

## Section-by-section content

### Intro (`cs-intro`, no paywall variant)

- Label row: `Case study / Endo AI`
- H1: **Designing an agentic AI layer for a clinical environment that can't see the data it's reasoning about**
- Lead paragraph: A self-directed project exploring what an AI agent for clinical logistics should look like — designed and built end to end, extending a constraint I ran into on a real traceability tool I led at Olympus.
- Quick Info:
  - My Role: Concept, Design, and End-to-End Build
  - TL;DR: I designed and built a working prototype of an AI agent for an endoscopy suite, reasoning through what it means to design judgment into a system that must stay useful, honest, and provably safe with patient data.
- Hero image: `[PLACEHOLDER: hero-endoai.jpg — a clean product shot of the EndoAI chat panel open alongside Asset Care, dark theme, similar framing to the Olympus hero]`

### Background (`cs-bg`)

Four numbered blocks, same pattern as Olympus. Suggested content:

1. **The gap** — Reprocessing and chain-of-custody data for medical scopes is only useful if it can be retrieved instantly, in plain language, by someone under time pressure — the exact problem the Olympus traceability tool solved for structured queries.
2. **The constraint left open** — That project deliberately left AI out of scope for its MVP, for real privacy and infrastructure reasons, but was designed to make room for a natural-language layer eventually.
3. **The premise** — Endo AI picks up that thread: what does that natural-language layer actually need to get right before it can be trusted in a clinical setting?
4. **The approach** — Rather than theorize, I designed the interaction model and built a working prototype myself — real interface, real database, real generated reports — to pressure-test the reasoning against an actual implementation.

### Situation (`cs-situation`)

- Section title: A nurse doesn't think in questions, she thinks in reassurance
- Body: The obvious approach was a chatbot bolted onto the app. That framing didn't hold up. A head nurse managing scopes, rooms, and staff in real time isn't looking to query a database — she's asking one thing, over and over, in different forms: *am I about to have a problem in the next twenty minutes.* Designing for that meant giving the agent real clinical data to reason with — which immediately collided with the strictest constraint in the room: patient privacy.
- Image: `[PLACEHOLDER: situation-image — evocative supporting image, parallel to Olympus's "Ruler.jpg" analog-tools shot; something conveying "instant judgment under pressure" — open]`

### Problem statement (`cs-problem-section`)

How might we design an AI agent trustworthy enough for a clinical environment, when it can never see the patient data it's reasoning about?

### Task + Constraints (`cs-task-wrap`)

**Task:**
- Section title: Design the interaction model for an agent that's useful everywhere and trusted immediately
- Body: The agent needed to be accessible from any screen in the app, aware of whatever the nurse was already looking at, but never boxed in by it — and it needed to earn trust on first contact, the same bar the Olympus tool had to clear, with none of the safety net a structured query wizard has by design.

**Constraints** (5 numbered, assign distinct `--cs-constraint-color` values matching the Olympus pattern):

1. The agent's context could never contain patient identifiers directly — only de-identified references, resolved separately from the model entirely.
2. Proactive behavior (the agent volunteering information unprompted) carries real liability and cost implications, and had to be scoped deliberately narrow rather than open-ended.
3. Real-world reprocessing documentation has genuine gaps — not every step gets logged in the moment it happens — so the interface had to represent confidence honestly instead of presenting status as flat fact.
4. Any generated compliance document needed to carry the same honesty as the live interface — provenance couldn't quietly disappear once something became a PDF.
5. The system had to hold up as a working build, not just a design spec — every interaction pattern needed to survive actually being implemented against a real database.

### Action (`cs-action`)

- Title (with highlight span like Olympus's `cs-action-title-highlight`): A small set of purpose-built components, each mapped to a decision, not a data type
- Hover card image: `[PLACEHOLDER: action-hover.jpg — a candid/process shot, parallel to "Roby in clinical testing gear"; could be a screenshot of the Claude Code build session, or a photo of sketches/whiteboarding]`
- Body paragraph 1: The instinct to build one flexible chat surface didn't hold up. Instead, I designed a small registry of components, each one mapped to a specific moment of nurse decision-making — a status card for "can I proceed right now," a trace timeline for "can I prove what happened," an options card for a scheduling conflict with real tradeoffs. Restraint was the actual design language: no card tried to do more than one job well.
- Body paragraph 2: The hardest constraint — keeping patient identity out of the model's context entirely — required solving it on both sides of the conversation. The agent only ever receives de-identified references in anything it outputs. Free-text input needed the same discipline: a typed patient name resolves to an internal reference before a query ever reaches the model, not after.
- Carousel (`work-case-carousel`), title "Widgets in the system":
  `[PLACEHOLDER: widget-taxonomy-1.png through widget-taxonomy-5.png — restyled taxonomy grid in Endo AI's actual dark theme, showing status card, trace timeline with confidence tiers visible, options card, elicitation/date-range card, export builder]`

### Breakthrough (`cs-testing` — reuse this class name even though the content differs from Olympus's testing narrative)

- Label: The breakthrough
- Section title: Reprocessing status isn't binary — it has real, nameable structure
- Body: The turning point wasn't a UI idea, it was realizing the underlying data problem had shape. A scope's documentation isn't simply "complete" or "incomplete" — it can be system-confirmed by a sensor, reasonably implied from a later step, self-reported by a nurse with no system record at all, or genuinely missing. Once that structure was named, the interface had an honest way to represent it — a flat checkmark would have been a lie of omission in a compliance-critical tool. Every card in the system, from a live status view to a generated PDF, carries that same four-tier distinction through to the end.
- Supporting diagram (use `cs-flow-zoom` hover-to-zoom pattern from Olympus):
  `[PLACEHOLDER: confidence-tier-diagram.png — visual explanation of the four-tier model, or the trace-timeline screenshot showing tiers side by side]`

### Result (`cs-result`)

- Section title: A working prototype — real interface, real database, real generated reports
- Body paragraph 1: The system runs on a real backend, not a static mock: a live scope inventory, an agent built on a fixed set of typed tools rather than freeform generation, and report generation that produces actual downloadable files with real provenance data attached.
- Body paragraph 2: Every interaction pattern in this case study — the confidence tiers, the PII boundary, the editable elicitation flows — is implemented and running, not just specified.
- **Primary artifact, place first in this section, above the carousel:**
  `[PLACEHOLDER: endo-ai-demo.mp4 — a short (60–90 second) screen recording. Prioritize showing the free-text patient name resolving before it reaches the model — this is the single most technically interesting, otherwise-invisible moment in the whole system]`
- Carousel: `[PLACEHOLDER: result-1.png through result-4.png — real prototype screenshots: Asset Care inventory, an EndoAI chat exchange with citations, the trace timeline, the export builder finished state]`

### Outcome (`cs-outcome`)

- Section title: This started as a design question and became a working system
- Body: There's no launch metric here — this wasn't shipped to real users, and it isn't pretending to be. What's real: every hard constraint got an actual implementation, not just a diagram. What's still open: a manual reprocessing-logging flow that's designed but not yet wired into the live build, and a model upgrade from the fast, low-latency model used for prototyping to something more capable for genuinely ambiguous requests. Both are honest next steps, not gaps to talk around — they're where an interface like this has to hold up against real ambiguity rather than a clean demo path.

### Next (`cs-next`)

Point back to Olympus, completing the loop:
- Section title: Read the project this one grew out of
- CTA: `View case study` → `/olympus`

(If Olympus's own "Next" currently points forward to Cavnue, consider whether
Olympus should also gain a line/link forward to this page, so the throughline
reads in both directions. Flag this as a possible edit to the Olympus page
rather than assuming — don't modify Olympus's copy without confirmation.)

## Media checklist (all placeholders referenced above, in build order)

1. `hero-endoai.jpg` — hero shot, chat panel + Asset Care
2. Situation section image (open concept)
3. `action-hover.jpg` — process/candid shot for the action title hover card
4. `widget-taxonomy-1.png` … `-5.png` — restyled widget carousel (dark theme, real product colors — not the pastel wellness-app reference used during design exploration)
5. `confidence-tier-diagram.png` — breakthrough section diagram
6. `endo-ai-demo.mp4` — the screen recording, PII-resolution moment prioritized
7. `result-1.png` … `-4.png` — real prototype screenshots for the result carousel

All images should follow the same `<picture>` + mobile `srcset` pattern
Olympus uses (`img/name.png` desktop, `img/name-mobile.png` or `name-sm.png`
for the `max-width: 768px` breakpoint) — check the Olympus markup for the
exact naming convention already in use in `img/` and match it.

## What to explicitly leave out

- The password paywall
- Any specific invented statistic
- Named colleagues or a described "pod" — the real story is a solo,
  self-directed build with informed reasoning about what a team review
  process would need to catch
- Language implying this shipped, launched, or was adopted by an employer
