# Defence Market Intelligence OS - MVP

Investor-facing market-intelligence dashboard for the European defence
ecosystem: funding, companies, government spending, market signals.
Non-operational - no weapons, targeting, or tactical data.

**This is Phase 1 of a 5-phase build** (see `ARCHITECTURE_NOTES.md` for the
full plan). It is a static site with sample data, built to prove the
design system and product shape and to be demo-ready today. Phase 2+
(real database, live ingestion, AI assistant) is specified separately
in `DEFENSE_MARKET_INTEL_OS_SPEC.md` - hand that file to Claude Code as
a starting brief when you're ready to build the real backend.

## What's real and what's a placeholder right now

Every row in `data/companies.json` is tagged `"real": true/false`.
Two rows (Harmattan AI, Helsing) carry an actual public source link
and are marked `verified` in the UI. Everything else is a labeled
placeholder so the table, filters, and charts have something to
render - **do not show this to an investor as real data.** Replace
`data/companies.json` with real, sourced records before that happens.
See `METHODOLOGY.md` for exactly which sources are genuinely
API-queryable vs. annual manual downloads.

## Run it locally

No build step. Any static file server works:

```bash
cd defense-intel-mvp
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages (free, ~10 minutes)

1. Create a new repository on GitHub (e.g. `defence-market-intel`).
2. From this folder, initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial MVP: dashboard shell + sample data"
   git branch -M main
   git remote add origin https://github.com/<your-username>/defence-market-intel.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch →
   `main` / root**. Save.
4. Wait ~1 minute. Your site is live at:
   `https://<your-username>.github.io/defence-market-intel/`
5. Every future `git push` to `main` updates the live site
   automatically - no rebuild step, because this is a static site.

That's the entire deployment. There is no server, no database, no
API key to configure yet, which is exactly why it can be "100%
working" today - Phase 2 (real backend) trades that simplicity for
real, live data, and needs its own hosting (see the spec doc).

## File map

```
index.html - page structure, all sections
style.css - design tokens + layout (see design system notes below)
app.js - loads data/companies.json, renders KPIs/charts/table
data/companies.json - sample dataset, clearly labeled
METHODOLOGY.md - data source reality check, update cadence, confidence levels
```

## Design system (short version)

- **Palette**: near-black graphite background, warm off-white ("paper")
  panel for the data table, one restrained brass/amber accent used only
  for the eyebrow, active nav state, and chart highlights - not a
  crypto-neon or camo look.
- **Type**: IBM Plex Sans for everything readable, IBM Plex Mono for
  every number, timestamp, and source tag - institutional, European,
  built for numeric density.
- **Signature element**: the "provenance stamp" - a small monospace tag
  (`verified` / `sample`) on every data point. This is the visual
  expression of the product's actual differentiator: every number
  traces to a source and a timestamp.

## Known limitations of this MVP (by design)

- Data is static JSON, not a live pipeline.
- No AI assistant yet (Phase 4 in the full spec).
- No auth, watchlists, or saved searches (Phase 4).
- Desktop-first; mobile breakpoint is basic, not fully polished.

None of these are bugs - they're the deliberate Phase 1 scope so the
first version is something that actually runs, everywhere, with zero
moving parts to break.
