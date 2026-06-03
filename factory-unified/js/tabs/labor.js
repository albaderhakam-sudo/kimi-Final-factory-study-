/* ============================ TAB 4: LABOR ============================ */

import { translate as tt, formatMoney as fm, formatNumber as fn, formatPct as fp, esc } from "../ui.js";
import { createBar } from "../charts.js";

export function renderLabor(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "month") => fm(v, state.ui.cur, state.ui.rate, d, p, view);

  const over = D.util > 1;
  const groups = Object.values(D.byGroup)
    .filter((g) => g.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  const barLabels = groups.map((g) => g.group);
  const barData = groups.map((g) => g.hours);
  const barColors = groups.map((_, i) => ["#00BCD4", "#2196F3", "#FF9800", "#FFB300", "#00C853", "#B388FF", "#FF3D71", "#8B9DB8"][i % 8]);

  const ceilingPct = D.ceilingSales > 0 ? D.base / D.ceilingSales : 0;

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m4_title")}</h2><span class="tag">${t("tag_editable")}</span></div>
      <div class="sec-sub">${t("m4_sub")}</div>
      <div class="flex" style="margin-bottom:10px">
        <div><label class="lbl">${t("m4_hours_day")}</label><input type="number" id="hoursDay" class="num-sm" step="0.5" value="${state.labor.hoursDay}"></div>
        <div><label class="lbl">${t("m4_days_month")}</label><input type="number" id="daysMonth" class="num-sm" step="1" value="${state.labor.daysMonth}"></div>
        <div class="help" style="align-self:flex-end">${t("m4_hours_help")}</div>
      </div>

      <div class="g3 grid">
        <div class="kpi"><div class="k-l">${t("m4_utilization")}</div><div class="k-v ${over ? "neg" : D.util > 0.85 ? "am" : "pos"}">${fp(D.util)}</div><div class="k-s">${t("m4_of_hmo", fn(D.reqHoursMonthly, 0), fn(D.availHours, 0))}</div></div>
        <div class="kpi"><div class="k-l">${over ? t("m4_shortfall") : t("m4_headroom")}</div><div class="k-v ${over ? "neg" : "pos"}">${fn(Math.abs(D.availHours - D.reqHoursMonthly), 0)} ${t("h_suffix")}</div><div class="k-s">${over ? t("m4_overtime_hire") : t("m4_spare_hours")}</div></div>
        <div class="kpi"><div class="k-l">${t("m4_capacity_ceiling")}</div><div class="k-v bl">${money(D.ceilingSales)}</div><div class="k-s">${t("m4_sales_100")}</div></div>
      </div>

      <div class="grid g2" style="margin-top:14px">
        <div>
          <h3>${t("m4_hours_by_group", money(D.S))}</h3>
          <div class="chart-box-sm"><canvas id="laborChart"></canvas></div>
        </div>
        <div>
          <div class="kv"><span>${t("m4_producing_laborers")}</span><b>${D.nLabor}</b></div>
          <div class="kv"><span>${t("m4_avail_hours")}</span><b>${fn(D.availHours)} ${t("h_suffix")}</b></div>
          <div class="kv"><span>${t("m4_req_hours")}</span><b>${fn(D.reqHoursMonthly, 1)} ${t("h_suffix")}</b></div>
          <div class="kv"><span>${t("m4_at_base_use")}</span><b class="${over ? "neg" : "pos"}">${fp(ceilingPct)} ${t("m4_of_capacity")}</b></div>
          <div class="note">${over ? t("m4_over_note") : t("m4_under_note", money(D.ceilingSales), (D.ceilingSales / D.base).toFixed(2))}</div>
        </div>
      </div>
    </div>
  `;

  const ctx = document.getElementById("laborChart");
  if (ctx) {
    h.chartRefs.labor = createBar(ctx, barLabels, [{ label: t("laborHrs"), data: barData, backgroundColor: barColors }]);
  }
}
