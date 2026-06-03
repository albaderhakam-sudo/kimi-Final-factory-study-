/* ============================ UI HELPERS ============================ */

import { t, tBilingual } from "./i18n.js";

export function formatMoney(cny, cur, rate, dec = 0, period = "month", view = "monthly") {
  let v = cny;
  if (period === "month" && view === "yearly") v *= 12;
  if (cur === "USD") v = v / rate;
  const sym = cur === "USD" ? "$" : "¥";
  return sym + formatNumber(v, dec);
}

export function formatNumber(v, dec = 0) {
  if (!isFinite(v)) v = 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function formatPct(x, dec = 1) {
  if (!isFinite(x)) x = 0;
  return (x * 100).toFixed(dec) + "%";
}

export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function translate(key, lang, ...args) {
  if (lang === "both") return tBilingual(key, ...args);
  return t(key, lang, ...args);
}

export function setVal(id, v) {
  const el = document.getElementById(id);
  if (el && document.activeElement !== el) el.value = v;
}

/* ============================ CHART HELPERS (Inline SVG) ============================ */

export function donutSVG(segs, size = 158, thick = 24) {
  const r = (size - thick) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segs.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  let off = 0;
  const arcs = segs
    .map((s) => {
      const len = (Math.max(0, s.value) / total) * circ;
      const el = `<circle r="${r}" cx="${c}" cy="${c}" fill="none" stroke="${s.color}" stroke-width="${thick}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`;
      off += len;
      return el;
    })
    .join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${arcs}<circle r="${r - thick / 2 - 1}" cx="${c}" cy="${c}" fill="var(--bg-card)"/></svg>`;
}

export function legendHTML(segs, cur, rate) {
  return (
    `<div class="legend">` +
    segs
      .map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)} · ${formatMoney(s.value, cur, rate)}</span>`)
      .join("") +
    `</div>`
  );
}

export function barsH(rows) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    `<div class="barsH">` +
    rows
      .map(
        (r) =>
          `<div class="barRow"><div class="barLab" title="${esc(r.label)}">${esc(r.label)}</div><div class="barTrack"><div class="barFill" style="width:${(Math.max(0, r.value) / max) * 100}%;background:${r.color || "var(--blue)"}"></div></div><div class="barVal">${r.disp != null ? r.disp : formatMoney(r.value, r.cur, r.rate)}</div></div>`
      )
      .join("") +
    `</div>`
  );
}

export function lineChartSVG(series, opts) {
  const W = opts.w || 520;
  const H = opts.h || 200;
  const pad = 34;
  const xMax = opts.xMax;
  const yMax = opts.yMax * 1.08 || 1;
  const X = (x) => pad + (x / xMax) * (W - pad - 8);
  const Y = (y) => H - pad - (y / yMax) * (H - pad - 10);
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const gy = H - pad - (i / 4) * (H - pad - 10);
    grid += `<line x1="${pad}" y1="${gy}" x2="${W - 8}" y2="${gy}" stroke="var(--border-subtle)"/><text x="2" y="${gy + 3}" fill="var(--text-muted)" font-size="9">${formatNumber((yMax * i) / 4 / 1000, 0)}k</text>`;
  }
  const polys = series
    .map((s) => {
      const pts = s.pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
      return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    })
    .join("");
  const mk =
    opts.markX != null
      ? `<line x1="${X(opts.markX)}" y1="10" x2="${X(opts.markX)}" y2="${H - pad}" stroke="var(--amber)" stroke-dasharray="4 3"/>`
      : "";
  const xl = `<text x="${pad}" y="${H - 8}" fill="var(--text-muted)" font-size="9">0</text><text x="${W - 30}" y="${H - 8}" fill="var(--text-muted)" font-size="9">${formatNumber(xMax / 1000, 0)}k</text>`;
  const leg =
    `<div class="legend">` + series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join("") + `</div>`;
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="max-width:${W}px">${grid}${mk}${polys}${xl}</svg>${leg}`;
}
