# Defence Market Intelligence OS - Technical Product Specification
### For use as a Claude Code operating brief · Phase 2 onward · v1.1, Aug 2026

This is the finalized version of the spec you drafted, checked against
the live competitive landscape and against what is genuinely buildable
with real, verifiable data sources. Changes from your draft are called
out inline as **[CHANGED]** so you know exactly what was corrected and
why. Hand this whole file to Claude Code as the starting brief once
the Phase 1 MVP (already built, see `/defense-intel-mvp`) is on GitHub.

---

## 0. What changed from the original draft, and why

**[CHANGED] "Updates every second"** - removed as a target.
No source in this category updates per-second (see `METHODOLOGY.md`
in the MVP repo for the full cadence table: SIPRI and EDA are annual,
CORDIS is monthly, funding announcements are event-driven). Claiming
per-second updates to investors is a credibility risk, not a feature.
The replacement promise - **"every number shows when it was last
verified, and is refreshed as often as its real source changes"** - is both true and, per the source review below, actually a stronger
differentiator than fake real-time.

**[CHANGED] Competitor numbers updated.** Sixth Domain's own site now
states **3,400+ tracked startups, 1,500+ investors, 60+ markets** - up from the 2,900 / 37-market figures in the original draft. That
growth rate itself is a useful data point for your investor narrative
(the category is filling in fast; a "we listed some startups" MVP is
not a defensible product on its own - the provenance/signal layer is
what has to carry it).

**[CHANGED] Data source list narrowed to what's genuinely automatable
today**, with each source labeled by real cadence:
- SIPRI Military Expenditure Database - open Excel download, annual.
- European Defence Agency Defence Data - annual report.
- World Bank military-expenditure indicators - real REST API,
  `https://api.worldbank.org/v2/country/all/indicator/MS.MIL.XPND.CD`,
  queryable anytime even though underlying figures are annual.
- EU CORDIS - genuinely has an open dataset **and** API
  (`https://cordis.europa.eu/`, plus a SPARQL/EURIO endpoint), refreshed
  monthly, covering EU-funded research including dual-use/defence-tech
  projects. This is your best candidate for something that feels
  "live" and actually is.
- Company/investor announcements - no unified API; requires either
  RSS/press-page monitoring or a licensed dataset (Crunchbase,
  Dealroom, PitchBook all have paid APIs - evaluate cost before
  committing budget).
Do not represent Dealroom- or Sixth Domain-scale company/funding
coverage as achievable with free sources alone - their scale comes
from either manual analyst curation or paid data licenses. Say this
explicitly to any investor: **the MVP differentiates on provenance and
synthesis, not on matching their raw dataset size on day one.**

**[CHANGED] "Real-time every-second" AI layer expectations reset.**
The AI assistant queries your own structured database, not the live
web, and only answers from ingested, sourced records (kept from your
original `ai_data_rules` - that part was already correct and stays
unchanged).

Everything else below is your original spec, retained, with the above
corrections folded in.

---

## 1. Role & scope

You are acting as senior product architect, full-stack engineer, data
engineer, UX/UI designer, and QA engineer, building a production-quality
investor-facing web application:

**DEFENCE MARKET INTELLIGENCE OS** - a non-operational market-intelligence
platform covering the European (and, where data allows, global) defence
ecosystem: company intelligence, startup funding, venture capital,
investors, government defence spending, public funding, market trends,
non-operational technology categories, M&A, hiring/ecosystem signals,
news, and source-backed analysis.

**Explicitly out of scope, always:** operational military intelligence,
targeting functionality, weapon-employment analysis, tactical
recommendations, or any instructions concerning weapons use.

Audience: investors, VC/PE, corporate strategy teams, defence-industry
executives, analysts, founders, journalists, policymakers.

## 2. Product philosophy

**DATA → CONTEXT → SIGNAL → DECISION.**

Every page must answer: What am I looking at? Why does it matter?
Where did this number come from? When was it last updated? How
reliable is it? What should I investigate next?

The moat is not dataset size. It is:
> Every number has a source. Every source has a timestamp. Every
> signal has evidence. Every AI conclusion traces back to data.

## 3. Competitive landscape (verified Aug 2026)

- **Dealroom** - strong startup/investor layer, dedicated European
  defence-tech dataset, funding + geography + growth rankings.
  Strength: breadth and investor trust. Weakness for you: generalist
  platform, defence is one vertical among many.
- **Sixth Domain** - closest direct competitor. 3,400+ defence/dual-use
  startups, 1,500+ investors, 60+ markets, AI assessment scorecards,
  deal/procurement signal monitoring. This is the bar for "table stakes"
  company coverage - a static 15–20 company list will read as
  pre-MVP next to this.
- **Janes** - enterprise-grade intelligence/data product: validated
  datasets, budgets, programmes, forecasts, knowledge graph. Strength:
  data connectivity and provenance culture (worth emulating). Weakness
  for your positioning: heavy enterprise sales motion, not a modern
  self-serve SaaS feel.
- **SIPRI / EDA** - authoritative but raw: no product layer, no
  synthesis, annual cadence only.

**Where you can actually win:** usability, transparency of provenance,
synthesis (turning raw records into signals with evidence), visual
quality, and speed of self-serve access - not raw dataset size on day one.

## 4. SWOT (use to shape scope, not just document it)

**Strengths** - modern UX vs. Janes' enterprise feel; provenance-first
design vs. competitors who show numbers without visible sourcing;
AI-assisted synthesis layer that cites its own database.

**Weaknesses** - day-one company/funding coverage will be far smaller
than Sixth Domain or Dealroom unless you license a dataset; no analyst
team to manually curate at their scale; single-builder bandwidth.

**Opportunities** - European defence spending grew materially in 2025
(SIPRI: European spending up in real terms); investor demand for
capital-flow understanding, not just news, is rising; a provenance-first
product is a genuine gap even among the "AI-ready" positioning Janes
and Sixth Domain already claim, because none of them expose
verification timestamps at the individual-datapoint level the way this
spec does.

**Threats** - paid-data competitors can outspend on coverage; EU/gov
data licensing or export-control changes could affect sourcing; a
credibility hit from one fabricated or stale number is disproportionately
costly in this sector - QA discipline matters more here than in most
SaaS categories.

**Scope implication:** ship a narrow, deeply-sourced MVP (5–7 real
sources, ~20–40 real companies you've manually verified) rather than a
wide, shallow one. Depth of provenance beats breadth of listings for
your specific goal (Helsing/defence-sector application + investor demo).

## 5. Should you add AI? Yes - scoped narrowly

Add a Claude-powered assistant that **only** queries your own ingested,
sourced database (never the open web, never its own training data for
factual claims). It should:
1. Query the structured data.
2. Calculate from retrieved records.
3. Cite the underlying rows.
4. Distinguish fact from interpretation.
5. State uncertainty and gaps explicitly ("not enough verified data to
   answer that").

This is a real differentiator specifically because Sixth Domain and
Janes both already claim "AI-ready" positioning - being the one that
visibly refuses to answer past its verified data is the credible,
defensible version of that claim.

## 6. Architecture

- Frontend: React + TypeScript, Next.js, Tailwind CSS, Recharts.
- Backend: Next.js API routes (or a dedicated API layer if it grows).
- Database: PostgreSQL, Prisma ORM, Zod for validation.
- Testing: Vitest/Jest + Playwright.
- Deployment: Vercel for the app (simplest Next.js-native option);
  a managed Postgres (Neon, Supabase, or Railway) for the database - pick whichever has the most generous free tier at build time and
  document the choice in `ARCHITECTURE.md`.
- All credentials via environment variables. Never hard-coded.

## 7. Data pipeline

1. Fetch (per source, on its real cadence - see §0).
2. Validate against a Zod schema.
3. Normalize (currency → EUR, dates → ISO 8601).
4. Deduplicate, assign stable IDs.
5. Store full provenance: source, source URL, publication date,
   retrieval date, source type, confidence, last-verified date,
   original value, normalized value, methodology note.
6. Log every run to `ingestion_logs`; track source health in
   `source_registry` and `data_quality_status`.
7. On source failure: show the last verified dataset with its
   timestamp. Never fabricate a gap-filler value.

## 8. Core entities

`Company, Investor, FundingRound, Country, MarketCategory, FundingEvent,
GovernmentFunding, MarketMetric, NewsEvent, Source,
CompanyInvestorRelationship, CompanyCategoryRelationship, CountryMetric,
DataUpdate, Signal, User, SavedSearch, Watchlist` - relational integrity
required; index on the fields your filters actually query (country,
category, stage, date range).

## 9. Product surface

Overview (Market Pulse + KPI strip) → Companies (filterable explorer +
rich profile with full provenance) → Funding Intelligence → Investors
(with a readable, non-hairball network view) → Countries → Market Map
(non-operational technology categories only) → Signals (evidence-backed,
AI-interpretation clearly labeled) → Methodology (public page explaining
source hierarchy, cadence, confidence levels - essential for investor
trust) → optional AI assistant panel, database-scoped only.

## 10. Design system

Carried over from the MVP already built - do not diverge without
reason:

- Near-black graphite background (`#0B0D10`), warm off-white "paper"
  panels for data tables (`#F3F1EA`), one restrained brass/amber accent
  (`#C98A3B`), steel-blue secondary (`#6C8CAE`).
- IBM Plex Sans for display/body, IBM Plex Mono for every number,
  timestamp, and source tag.
- No camo, no radar-sweep decoration, no crypto-dark-mode neon, no
  military-game aesthetic. Reference point: Bloomberg terminal density
  crossed with a modern European fintech product.
- Signature element: the "provenance stamp" tag (`verified` / `sample`
  / confidence level) attached to every data point.

## 11. Development phases

- **Phase 1 - done.** Static MVP: design system, mock-data dashboard,
  GitHub Pages deployable. Repo: `/defense-intel-mvp`.
- **Phase 2.** Companies, Funding, Countries, Investors as real Next.js
  routes against a Postgres schema - can still run on seed/sample data.
- **Phase 3.** Real ingestion: World Bank API + CORDIS API first (both
  genuinely automatable today); SIPRI/EDA as scheduled manual-import
  jobs (annual, so a cron job that checks quarterly for a new release
  is sufficient - do not over-engineer polling for a source that
  changes once a year).
- **Phase 4.** Signals engine, AI assistant (database-scoped), saved
  searches, watchlists.
- **Phase 5.** Testing, performance, security, deployment hardening.

Work phase by phase. After each phase: run tests, inspect results, fix
issues, commit at a meaningful milestone, then continue. Inspect the
existing repository before changing anything; prefer incremental
changes over rewrites.

## 12. Quality bar before calling anything "done"

Type checking, linting, unit + integration + E2E tests, production
build, responsive checks, accessibility checks, data-quality checks - all must pass, or the failure must be fixed, not just reported. Never
claim an API integration works without having actually called it and
inspected the response. If an API can't be reached in this environment,
implement the interface, use clearly labeled mock data, document the
required environment variables, and say plainly what remains to be
connected - do not simulate a successful call.

## 13. Deliverables at completion

Source code · database schema · API architecture · ingestion
architecture · seed data · tests · README · `.env.example` ·
deployment instructions · architecture diagram · data-source
methodology · known limitations · list of APIs requiring paid
credentials (flag these clearly - Crunchbase/Dealroom/PitchBook are
not free) · exact GitHub deployment steps. The result must run from a
clean clone of the repository.
