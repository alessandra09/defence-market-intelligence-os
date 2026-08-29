# Methodology & data reality check

This file exists because the single most important design decision in
this product is being honest about *how fresh data can actually be* - and that honesty is the product's real moat, not a limitation to hide.

## Why "updates every second" is not the right target

No public source for European defence-market data changes every
second - not for this product, and not for any competitor's either
(Dealroom, Sixth Domain, Janes included). The underlying reality:

| Source | What it actually is | Real update cadence |
|---|---|---|
| SIPRI Military Expenditure Database | Open Excel download, 1949–2025 | **Annual** (last revised 27 Apr 2026) |
| European Defence Agency - Defence Data | Official EU-27 report | **Annual** |
| World Bank military-expenditure indicators | Genuine REST API | Queryable anytime; underlying figures still annual |
| EU CORDIS (Horizon Europe / research funding) | Open dataset + real API | **Monthly** |
| Company funding announcements | Press releases, trade press | **Event-driven** - whenever a round or contract is announced |
| Government procurement announcements | Ministry / agency press pages | **Event-driven** |

A product that claims second-by-second updates on this category is
either lying to its users or pointing that frequency at something
meaningless (like a page reload timestamp). The credible, defensible
claim - and the one investors in this space actually trust - is:

> **Every number is refreshed as often as its real source changes, and
> every number shows exactly when it was last verified.**

That is what "Swiss-watch reliability" should mean here: not fake
real-time, but *never silently stale and never silently wrong.*

## Source tiers (per the product spec)

1. **Primary public sources** - SIPRI, EDA, World Bank, national budget
   documents. Treat as ground truth for government spending.
2. **Secondary reputable sources** - CORDIS (EU-funded R&D, real API),
   trade press (Reuters, Breaking Defense, sector newsletters),
   official company/investor press releases.
3. **Company-provided information** - self-reported figures from a
   company's own site or filings. Label separately; don't blend with
   verified third-party data.
4. **Derived metrics** - anything calculated from the above (totals,
   YoY %, momentum scores). Always show the formula on hover/tooltip.
5. **AI-generated interpretation** - the assistant's own commentary.
   Always visually distinct from verified data (see `ai_data_rules`
   in the full spec). Never presented as fact.

## Confidence levels used in this MVP

- `verified` - cross-checked against a primary or official source,
  with a working source URL and a "last verified" date.
- `sample` - placeholder row with no real source; exists only so the
  UI has something to render. Must not be shown to a real investor.

## What a real ingestion pipeline looks like (Phase 3 of the full spec)

1. Scheduled jobs (daily for event-driven sources, weekly for CORDIS,
   yearly-check for SIPRI/EDA) - not per-second polling.
2. Each job: fetch → validate (schema) → normalize (currency, dates)
   → deduplicate → assign a stable ID → write provenance fields
   (source, source URL, retrieval date, confidence) → log the run.
3. If a source is unreachable, the app shows the **last verified**
   dataset with its timestamp - never a silent gap, never fabricated
   numbers to fill it.
4. `ingestion_logs`, `source_registry`, and `data_quality_status`
   tables make every run observable after the fact.

This is described in full, with database schema, in
`DEFENSE_MARKET_INTEL_OS_SPEC.md` - hand that document to Claude Code
when you're ready to build Phase 2+.
