---
name: tailored-cv
description: >-
  Produces tailored CVs and portfolio copy from job descriptions using an
  8-phase pipeline (ATS analysis, first-screen hooks, CCDT-O case structure,
  AI-slop cleanup, seniority calibration). Use when the user asks for a
  tailored CV, job-specific resume, application materials, one-pager, or
  portfolio rewrite for a role.
---

# Tailored CV Pipeline

Produce honest, ATS-aware tailored CVs for Roby's portfolio site. **Never commit company-named files to the public repo.**

## Repo rules

| What | Where |
|------|--------|
| Generic public CV | `cv/index.html` + `cv/cv.css` (linked from site nav) |
| Tailored CVs | `private/cv/` only — gitignored, not deployed |
| Filename | Opaque slug, e.g. `private/cv/x7k2m9.html` — **never** `sesame.html`, `railway.html` |
| For applications | PDF export or temporary private hosting — not public GitHub Pages paths |

Copy structure/styles from `cv/index.html`. Keep `meta name="robots" content="noindex"` on tailored pages.

**CSS path:** `<link rel="stylesheet" href="../../cv/cv.css">` — two levels up because the file lives at `private/cv/`, so `../../` reaches the repo root.

**Experience order:** always reverse chronological (most recent first). Tailor bullets and emphasis, not listing order.

## Pipeline (run in order)

1. **Job Description Analyzer** — ATS keyword table (critical / desirable / missing). Anchor for all later phases. → Prompts 1.1–1.4
2. **First Screen** — Headline, subhead, case captions for 5-second scan. → Prompts 2.1–2.4
3. **Case Doctor (CCDT-O)** — Restructure experience: Context → Constraint → Decision → Trade-off → Outcome. → Prompts 3.1–3.4
4. **AI-Slop Cleaner** — Remove bureaucracy, generic words, fake metrics. → Prompts 4.1–4.4
5. **Seniority Judge** — Score middle vs senior on 5 criteria; targeted rewrites. → Prompts 5.1–5.3
6. **Short formats** — One-pager + 10–12 slide pitch deck. → Prompts 6.1–6.3
7. **Industry adaptation** — Vocabulary/metrics for fintech, EdTech, e-com. → Prompts 7.1–7.3
8. **Package** — Write HTML to `private/cv/{opaque-slug}.html`; offer PDF export instructions.

Skip phases the user doesn't need. Always run 1.1 before tailoring. Always run 4.x before finalizing.

## CCDT-O case skeleton

```
[Company] — [role] ([dates])
[Product type: what, for whom, platform]

Context and Constraints
— [Deadline / regulator / legacy / team size]

What I Did
— [Concrete action + trade-off: proposed A and B → picked B because…]

Outcome
— [Metric with baseline + period] OR [concrete artifact]
```

**Ready checklist** (need 4+ of 6):
- [ ] Product is specific (not "interface design")
- [ ] Real deadline named
- [ ] At least one constraint (technical, regulatory, budget, team)
- [ ] Concrete verbs (designed, shipped) not "participated"
- [ ] Visible choice between options
- [ ] Numbers have baseline + period, or material artifact named

## Tone rules

- No: innovative, unique, passionate, revolutionary, clearly, essentially
- Headline ≤ 12 words; no bullet lists in header
- First person where ownership matters; don't invent experience or metrics
- Mark gaps as `[gap]` — ask Roby to fill, never fabricate

## Anti-patterns (never do)

1. "Write a UX case about project X" without context/constraints
2. Invent metrics — flag weak numbers with 🚩
3. "Make it lively" without specific word bans
4. "Make it like Apple" without concrete references
5. Vague role: "Act as a UX designer" — use level + domain instead

## Model notes

- ChatGPT: analytics / ATS tables
- Claude: long-case packaging, full CV rewrites
- Run Case Doctor (3.1) on raw notes before HTML generation

## Full prompts

All 30 prompts verbatim: [prompts.md](prompts.md)
