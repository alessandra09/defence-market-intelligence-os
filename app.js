// DEFENCE MARKET INTELLIGENCE OS - MVP client logic
// Everything here reads from /data/companies.json (sample data).
// Swap the fetch target for a real API endpoint once the ingestion
// pipeline described in METHODOLOGY.md is live - the rendering
// functions below don't need to change.

const EUR = (n) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(n / 1e6) + "M";

const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);

function tickClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  el.textContent = "local time " + new Date().toLocaleString("en-GB", { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

async function loadData() {
  const res = await fetch("data/companies.json");
  return res.json();
}

const REDUCE_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateValue(el, endText) {
  if (REDUCE_MOTION) { el.textContent = endText; return; }
  const match = endText.match(/-?[\d,.]+/);
  if (!match) { el.textContent = endText; return; }
  const prefix = endText.slice(0, match.index);
  const suffix = endText.slice(match.index + match[0].length);
  const end = parseFloat(match[0].replace(/,/g, ""));
  if (isNaN(end)) { el.textContent = endText; return; }
  const isInt = Number.isInteger(end);
  const duration = 900;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = end * eased;
    const formatted = isInt
      ? Math.round(current).toLocaleString("en-US")
      : current.toFixed(1);
    el.textContent = prefix + formatted + suffix;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = endText;
  }
  requestAnimationFrame(frame);
}

function renderKPIs(data) {
  const total = data.companies.reduce((s, c) => s + (c.lastRoundEUR || 0), 0);
  const verified = data.companies.filter((c) => c.real).length;
  const kpis = [
    { label: "Tracked funding (dataset)", value: "€" + EUR(total) },
    { label: "Funding events tracked", value: String(data.companies.length) },
    { label: "Companies tracked", value: String(data.companies.length) },
    { label: "Verified rows", value: verified + " / " + data.companies.length },
    { label: "Countries covered", value: String(new Set(data.companies.map((c) => c.country)).size) },
    { label: "Active signals", value: String(data.signals.length) },
  ];
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = kpis
    .map(
      (k, i) => `
    <div class="kpi">
      <div class="label">${k.label}</div>
      <div class="value" data-target="${k.value}" id="kpi-val-${i}">${k.value}</div>
      <span class="stamp verified">verified dataset</span>
    </div>`
    )
    .join("");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          kpis.forEach((k, i) => {
            const el = document.getElementById("kpi-val-" + i);
            if (el) animateValue(el, k.value);
          });
          io.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(grid);
}

function svgLineChart(el, years, series) {
  const W = 500, H = 200, padL = 40, padR = 12, padT = 14, padB = 24;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const colors = ["#C98A3B", "#6C8CAE", "#5CA37B", "#D6B24C"];
  const allVals = Object.values(series).flat();
  const maxV = Math.max(...allVals) * 1.08;
  const minV = 0;
  const x = (i) => padL + (innerW * i) / (years.length - 1);
  const y = (v) => padT + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  let svg = "";
  const gridN = 4;
  for (let g = 0; g <= gridN; g++) {
    const gy = padT + (innerH * g) / gridN;
    const val = maxV - (maxV * g) / gridN;
    svg += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" stroke="rgba(231,229,222,0.07)" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${gy + 3}" font-size="9" text-anchor="end" fill="#5C6268" font-family="IBM Plex Mono, monospace">${val.toFixed(0)}</text>`;
  }
  years.forEach((yr, i) => {
    svg += `<text x="${x(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#5C6268" font-family="IBM Plex Mono, monospace">${yr}</text>`;
  });

  const legendItems = [];
  Object.entries(series).forEach(([country, values], i) => {
    const color = colors[i % colors.length];
    let d = "";
    values.forEach((v, idx) => { d += (idx === 0 ? "M" : "L") + x(idx).toFixed(1) + " " + y(v).toFixed(1) + " "; });
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>`;
    values.forEach((v, idx) => { svg += `<circle cx="${x(idx).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2" fill="${color}"/>`; });
    legendItems.push({ country, color });
  });

  legendItems.forEach((item, i) => {
    const lx = padL + i * 95;
    svg += `<rect x="${lx}" y="2" width="8" height="8" fill="${item.color}"/>`;
    svg += `<text x="${lx + 12}" y="10" font-size="9" fill="#93999F" font-family="IBM Plex Mono, monospace">${item.country}</text>`;
  });

  el.innerHTML = svg;
}

function svgBarChart(el, labels, values) {
  const W = 500, H = 200, padL = 34, padR = 12, padT = 10, padB = 42;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const maxV = Math.max(...values) * 1.1 || 1;
  const barW = innerW / values.length;
  const y = (v) => padT + innerH - (v / maxV) * innerH;

  let svg = "";
  const gridN = 4;
  for (let g = 0; g <= gridN; g++) {
    const gy = padT + (innerH * g) / gridN;
    const val = maxV - (maxV * g) / gridN;
    svg += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" stroke="rgba(231,229,222,0.07)" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${gy + 3}" font-size="9" text-anchor="end" fill="#5C6268" font-family="IBM Plex Mono, monospace">${val.toFixed(0)}</text>`;
  }
  values.forEach((v, i) => {
    const bx = padL + i * barW + barW * 0.15;
    const bw = barW * 0.7;
    const by = y(v);
    svg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${(padT + innerH - by).toFixed(1)}" fill="#C98A3B" rx="2"/>`;
    const label = labels[i].length > 12 ? labels[i].slice(0, 11) + "…" : labels[i];
    svg += `<text x="${(bx + bw / 2).toFixed(1)}" y="${H - 26}" font-size="8" text-anchor="middle" fill="#5C6268" font-family="IBM Plex Mono, monospace" transform="rotate(20 ${(bx + bw / 2).toFixed(1)} ${H - 26})">${label}</text>`;
  });

  el.innerHTML = svg;
}

function renderCharts(data) {
  const years = data.countrySpendTrendEUR_bn.years;
  const series = data.countrySpendTrendEUR_bn.series;
  svgLineChart(document.getElementById("spendChart"), years, series);

  const byCategory = {};
  data.companies.forEach((c) => {
    byCategory[c.category] = (byCategory[c.category] || 0) + (c.lastRoundEUR || 0) / 1e6;
  });
  svgBarChart(document.getElementById("categoryChart"), Object.keys(byCategory), Object.values(byCategory));
}

function renderCapitalMap(data) {
  const positions = {
    Portugal: [90, 380],
    France: [190, 260],
    Germany: [310, 195],
    Finland: [430, 55],
    Ukraine: [500, 250],
  };
  const W = 600, H = 460;
  const byCountry = {};
  data.companies.forEach((c) => {
    if (!positions[c.country]) return;
    (byCountry[c.country] = byCountry[c.country] || []).push(c);
  });
  const totals = Object.values(byCountry).map((list) => list.reduce((s, c) => s + (c.lastRoundEUR || 0), 0));
  const maxFunding = Math.max(...totals, 1);

  let svg = "";
  for (let gx = 20; gx < W; gx += 32) {
    for (let gy = 20; gy < H; gy += 32) {
      svg += `<circle cx="${gx}" cy="${gy}" r="0.6" fill="rgba(231,229,222,0.07)"/>`;
    }
  }

  Object.entries(byCountry).forEach(([country, companies]) => {
    const [cx, cy] = positions[country];
    const totalFunding = companies.reduce((s, c) => s + (c.lastRoundEUR || 0), 0);
    const r = 10 + 26 * Math.sqrt(totalFunding / maxFunding);
    svg += `<circle class="flow-pulse" cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="#C98A3B" stroke-width="1"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="#C98A3B" fill-opacity="0.14" stroke="#C98A3B" stroke-width="1.5"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="#C98A3B"/>`;
    svg += `<text x="${cx}" y="${cy - r - 14}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" font-weight="600" fill="#E7E5DE">${country}</text>`;
    svg += `<text x="${cx}" y="${cy - r - 2}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="#93999F">€${EUR(totalFunding)} · ${companies.length} ${companies.length === 1 ? "company" : "companies"}</text>`;
  });

  document.getElementById("capitalMap").innerHTML = svg;
}

function renderMomentum(data) {
  const movers = data.companies.filter((c) => c.fundingHistory && c.fundingHistory.length >= 2);
  document.getElementById("momentumGrid").innerHTML = movers
    .map((c) => {
      const hist = c.fundingHistory;
      const first = hist[0].valuationEUR;
      const last = hist[hist.length - 1].valuationEUR;
      const multiple = (last / first).toFixed(1);
      const W = 460, H = 120, padL = 10, padR = 10, padT = 16, padB = 20;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const x = (i) => padL + (innerW * i) / (hist.length - 1);
      const y = (v) => padT + innerH - ((v - 0) / last) * innerH;
      let d = "";
      hist.forEach((pt, i) => { d += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(pt.valuationEUR).toFixed(1) + " "; });
      let dots = hist
        .map((pt, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(pt.valuationEUR).toFixed(1)}" r="3" fill="#C98A3B"/>`)
        .join("");
      let labels = hist
        .map((pt, i) => `<text x="${x(i).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="8.5" fill="#93999F" font-family="IBM Plex Mono, monospace">${fmtDate(pt.date).slice(0, 7)}</text>`)
        .join("");
      return `
      <div class="panel">
        <div class="chart-title">${c.name} <span style="color:#5CA37B;font-weight:600">+${multiple}x</span></div>
        <div class="chart-sub">${c.country} · valuation, ${hist[0].label} to ${hist[hist.length - 1].label}</div>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
          <path d="${d}" fill="none" stroke="#C98A3B" stroke-width="2"/>
          ${dots}${labels}
        </svg>
      </div>`;
    })
    .join("");
}
let SORT_KEY = null;
let SORT_DIR = 1;

function populateFilters(data) {
  const countries = [...new Set(data.companies.map((c) => c.country))].sort();
  const categories = [...new Set(data.companies.map((c) => c.category))].sort();
  const stages = [...new Set(data.companies.map((c) => c.stage))].sort();
  const fill = (id, values) => {
    const sel = document.getElementById(id);
    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  };
  fill("countryFilter", countries);
  fill("categoryFilter", categories);
  fill("stageFilter", stages);
}

function renderTable() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const country = document.getElementById("countryFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const stage = document.getElementById("stageFilter").value;

  let rows = ALL_COMPANIES.filter((c) => {
    return (
      (!q || c.name.toLowerCase().includes(q)) &&
      (!country || c.country === country) &&
      (!category || c.category === category) &&
      (!stage || c.stage === stage)
    );
  });

  if (SORT_KEY) {
    rows = [...rows].sort((a, b) => {
      const av = a[SORT_KEY],
        bv = b[SORT_KEY];
      if (typeof av === "number") return (av - bv) * SORT_DIR;
      return String(av).localeCompare(String(bv)) * SORT_DIR;
    });
  }

  document.getElementById("companyCount").textContent = rows.length;
  document.getElementById("companyBody").innerHTML = rows
    .map(
      (c) => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.country}</td>
      <td>${c.category}</td>
      <td>${c.stage}</td>
      <td>€${EUR(c.lastRoundEUR)}</td>
      <td>${fmtDate(c.lastRoundDate)}</td>
      <td>${c.leadInvestor}</td>
      <td>${
        c.real
          ? `<span class="tag real">verified</span> <a href="${c.sourceUrl}" target="_blank" rel="noopener" style="font-size:11px">source ↗</a>`
          : `<span class="tag sample">sample</span>`
      }</td>
    </tr>`
    )
    .join("");
}

function wireFilters() {
  ["searchInput", "countryFilter", "categoryFilter", "stageFilter"].forEach((id) =>
    document.getElementById(id).addEventListener("input", renderTable)
  );
  document.querySelectorAll("#companyTable thead th[data-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      SORT_DIR = SORT_KEY === key ? -SORT_DIR : 1;
      SORT_KEY = key;
      renderTable();
    });
  });
}

function renderCountries(data) {
  const grid = document.getElementById("countryGrid");
  const countries = Object.keys(data.countrySpendTrendEUR_bn.series);
  grid.innerHTML = countries
    .map((c) => {
      const values = data.countrySpendTrendEUR_bn.series[c];
      const latest = values[values.length - 1];
      const prev = values[values.length - 2];
      const delta = (((latest - prev) / prev) * 100).toFixed(1);
      return `
      <div class="country-card">
        <h4>${c}</h4>
        <div class="sub">€${latest}bn spend, 2025 · ${delta > 0 ? "+" : ""}${delta}% YoY</div>
      </div>`;
    })
    .join("");
}

function renderSignals(data) {
  document.getElementById("signalsFeed").innerHTML = data.signals
    .map((s) => {
      const isVerified = s.confidence === "verified";
      const stampClass = isVerified ? "verified" : "sample";
      const stampText = isVerified ? "verified signal, sourced event" : "sample signal, not a verified event";
      return `
    <div class="signal">
      <h3>${s.title}</h3>
      <p>${s.whatChanged}</p>
      <span class="stamp ${stampClass}">${stampText}</span>
    </div>`;
    })
    .join("");
}

function renderSources() {
  const sources = [
    { name: "SIPRI Military Expenditure Database", url: "https://www.sipri.org/databases/milex", note: "annual update, open Excel download, 1949–2025 coverage" },
    { name: "European Defence Agency - Defence Data", url: "https://eda.europa.eu/", note: "annual EU-27 defence spending report" },
    { name: "World Bank - Military expenditure indicators", url: "https://data.worldbank.org/indicator/MS.MIL.XPND.CD", note: "real REST API, annual underlying data" },
    { name: "EU CORDIS open dataset / API", url: "https://cordis.europa.eu/", note: "monthly-refreshed, genuinely queryable via API" },
  ];
  document.getElementById("sourceList").innerHTML = sources
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name} ↗</a><br/>${s.note}</li>`)
    .join("");
}

(async function init() {
  const data = await loadData();
  ALL_COMPANIES = data.companies;

  try { renderKPIs(data); } catch (e) { console.error("renderKPIs failed:", e); }
  try {
    populateFilters(data);
    wireFilters();
    renderTable();
  } catch (e) { console.error("Company table failed:", e); }
  try { renderCountries(data); } catch (e) { console.error("renderCountries failed:", e); }
  try { renderCapitalMap(data); } catch (e) { console.error("renderCapitalMap failed:", e); }
  try { renderMomentum(data); } catch (e) { console.error("renderMomentum failed:", e); }
  try { renderSignals(data); } catch (e) { console.error("renderSignals failed:", e); }
  try { renderSources(); } catch (e) { console.error("renderSources failed:", e); }
  try { renderCharts(data); } catch (e) { console.error("renderCharts failed:", e); }
})();
