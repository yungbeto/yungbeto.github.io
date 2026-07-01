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

## Pipeline (run in order)

1. **Job Description Analyzer** — ATS keyword table (critical / desirable / missing). Anchor for all later phases.
2. **First Screen** — Headline, subhead, case captions for 5-second scan.
3. **Case Doctor (CCDT-O)** — Restructure experience: Context → Constraint → Decision → Trade-off → Outcome.
4. **AI-Slop Cleaner** — Remove bureaucracy, generic words, fake metrics.
5. **Seniority Judge** — Score middle vs senior on 5 criteria; targeted rewrites.
6. **Short formats** — One-pager + 10–12 slide pitch deck.
7. **Industry adaptation** — Vocabulary/metrics for fintech, EdTech, e-com.
8. **Package** — Write HTML to `private/cv/{opaque-slug}.html`; offer PDF export instructions.

Skip phases the user doesn't need. Always run phase 1 before tailoring. Always run phase 4 before finalizing.

Full prompt library: `.cursor/skills/tailored-cv/prompts.md`

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
- No em dashes (— or –) anywhere in copy; use a comma, period, or rewrite the sentence
- No "it's not X, it's Y" framing — state the positive claim directly without the contrast setup
- Headline ≤ 12 words; no bullet lists in header
- First person where ownership matters; don't invent experience or metrics
- Mark gaps as `[gap]` — ask Roby to fill, never fabricate

## Phase 8: HTML packaging

When writing the final HTML file:
- Read `cv/index.html` first and copy its structure exactly
- Link to `../../cv/cv.css` (two levels up — `private/cv/` → `private/` → repo root → `cv/cv.css`)
- Keep `<meta name="robots" content="noindex">`
- Keep the theme toggle, download button, and the full JS block unchanged
- Use a random 6-char alphanumeric slug for the filename
- Mark any unfilled gaps as HTML comments `<!-- [gap]: ... -->`
- Never commit to the public repo; remind Roby to use `?print=1` for PDF export
