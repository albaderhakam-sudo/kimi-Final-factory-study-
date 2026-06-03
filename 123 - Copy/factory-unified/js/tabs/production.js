/* ============================ TAB 2: PRODUCTION ============================ */

import { translate as tt, formatMoney as fm, formatNumber as fn, formatPct as fp, esc } from "../ui.js";
import { createBar } from "../charts.js";

export function renderProduction(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "month") => fm(v, state.ui.cur, state.ui.rate, d, p, view);

  const groups = Object.values(D.byGroup)
    .filter((g) => g.rev > 0)
    .sort((a, b) => b.rev - a.rev);

  // Bar chart data
  const viewMult = view === "yearly" ? 12 : 1;
  const barLabels = groups.map((g) => g.group);
  const barData = groups.map((g) => g.rev * viewMult);
  const barColors = groups.map((_, i) => ["#2196F3", "#00BCD4", "#FF9800", "#FFB300", "#00C853", "#B388FF", "#FF3D71", "#8B9DB8"][i % 8]);

  // Table rows
  let rowsHtml = `<tr><th>${t("m2_h_group_item")}</th><th>${t("m2_h_mix")}</th><th>${t("m2_h_make")}</th><th>${t("m2_h_revenue")}</th><th>${t("m2_h_material")}</th><th>${t("m2_h_hours")}</th></tr>`;
  let lastG = null;
  const produced = state.products.filter((p) => p._revM > 0);
  produced.forEach((p) => {
    if (p.group !== lastG) {
      const g = D.byGroup[p.group];
      rowsHtml += `<tr class="grp"><td>${esc(p.group)}</td><td>${fp(g.rev / D.S)}</td><td>${fn(g.qty)}</td><td>${money(g.rev)}</td><td>${money(g.mat)}</td><td>${fn(g.hours, 1)}</td></tr>`;
      lastG = p.group;
    }
    rowsHtml += `<tr><td style="padding-left:18px">${esc(p.item)}</td><td>${fp(p._share)}</td><td>${fn(p._qtyM)}</td><td>${money(p._revM)}</td><td>${money(p._matM)}</td><td>${fn(p._hoursM, 1)}</td></tr>`;
  });
  rowsHtml += `<tr class="total"><td>${t("m2_total_make", money(D.S))}</td><td>100%</td><td>${fn(D.qtyMonthly)}</td><td>${money(D.S)}</td><td>${money(D.materialMonthly)}</td><td>${fn(D.reqHoursMonthly, 1)}</td></tr>`;

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m2_title")}</h2></div>
      <div class="sec-sub">${t("m2_sub")}</div>
      <div class="grid g2">
        <div>
          <h3>${t("m2_rev_by_group", money(D.S))}</h3>
          <div class="chart-box-sm"><canvas id="prodChart"></canvas></div>
        </div>
        <div>
          <div class="kv"><span>${t("m2_items_produce")}</span><b>${fn(D.qtyMonthly)} ${t("pcs_mo")}</b></div>
          <div class="kv"><span>${t("m2_material_buy")}</span><b class="or">${money(D.materialMonthly)}/${t("mo_suffix")}</b></div>
          <div class="kv"><span>${t("m2_hours_needed")}</span><b>${fn(D.reqHoursMonthly, 1)} ${t("h_suffix")}/${t("mo_suffix")}</b></div>
          <div class="kv"><span>${t("m2_gross_margin")}</span><b class="pos">${money(D.S - D.materialMonthly)}</b></div>
          <div class="note">${t("m2_note")}</div>
        </div>
      </div>
      <h3 style="margin-top:14px">${t("m2_plan_title")}</h3>
      <div class="tall scrollx"><table>${rowsHtml}</table></div>
    </div>
  `;

  const ctx = document.getElementById("prodChart");
  if (ctx) {
    h.chartRefs.prod = createBar(ctx, barLabels, [{ label: t("revenue"), data: barData, backgroundColor: barColors }]);
  }
}
