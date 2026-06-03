/* ============================ TAB 0: OVERVIEW ============================ */

import { translate as tt, formatMoney as fm, formatNumber as fn, formatPct as fp, esc } from "../ui.js";
import { payFor } from "../engine.js";

export function renderOverview(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "month") => fm(v, state.ui.cur, state.ui.rate, d, p, view);

  const worst = D.base * (1 - state.sales.flex / 100);
  const best = D.base * (1 + state.sales.flex / 100);

  const scenarios = [
    { name: t("worst"), sales: worst },
    { name: t("base"), sales: D.base },
    { name: t("best"), sales: best },
  ];

  const mixedPayrollAt = (sales) => state.employees.reduce((a, e) => a + payFor(e, sales, state), 0);
  let rows = "";
  for (const sc of scenarios) {
    const mat = D.materialMonthly * (sc.sales / (D.S || 1));
    const pay = mixedPayrollAt(sc.sales);
    const net = sc.sales - mat - D.rentM - D.elecM - pay;
    rows += `<tr><td>${esc(sc.name)}</td><td>${money(sc.sales)}</td><td>${money(mat)}</td><td>${money(pay)}</td><td class="${net >= 0 ? "pos" : "neg"}">${money(net)}</td><td>${fp(net / sc.sales)}</td></tr>`;
  }

  const hist = D.hist;
  container.innerHTML = `
    <div class="g4 grid" style="margin-bottom:18px">
      <div class="kpi"><div class="k-l">${t("kpi_monthly_sales")}</div><div class="k-v bl">${money(D.S)}</div><div class="k-s">${D.S >= D.base ? "+" : ""}${((D.S / D.base - 1) * 100 || 0).toFixed(0)}% ${t("vs_base")}</div></div>
      <div class="kpi"><div class="k-l">${t("kpi_material_cost")}</div><div class="k-v or">${money(D.materialMonthly)}</div><div class="k-s">${fp(D.S > 0 ? D.materialMonthly / D.S : 0)} ${t("of_sales")}</div></div>
      <div class="kpi"><div class="k-l">${t("kpi_payroll")} (${(() => {
        const hasMixed = state.employees.some((e) => (e.salaryModel || state.salary.model) !== state.salary.model);
        if (hasMixed) return t("mixed_model");
        return state.salary.model === "0" ? t("fixed_word") : t("modelname_1");
      })()})</div><div class="k-v te">${money(D.payroll)}</div><div class="k-s">${fp(D.S > 0 ? D.payroll / D.S : 0)} ${t("of_sales")}</div></div>
      <div class="kpi"><div class="k-l">${t("kpi_net_profit")}</div><div class="k-v ${D.netM >= 0 ? "pos" : "neg"}">${money(D.netM)}</div><div class="k-s">${fp(D.marginM)} ${t("margin")}</div></div>
    </div>

    <div class="card section">
      <div class="between"><h2>${t("m0_title")}</h2></div>
      <div class="sec-sub">${t("m0_sub")}</div>

      <h3>${t("m6_ground_truth")} <span class="help">${t("m6_6mo_actuals")}</span></h3>
      <div class="scrollx"><table>
        <thead><tr><th>${t("scenario")}</th><th>${t("kpi_monthly_sales")}</th><th>${t("kpi_material_cost")}</th><th>${t("kpi_payroll")}</th><th>${t("kpi_net_profit")}</th><th>${t("margin")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>

      <div style="margin-top:16px">
        <div class="kv"><span>${t("m6_sales")}</span><b>${money(hist.sales, 0, "total")}</b></div>
        <div class="kv"><span>${t("m6_materials")}</span><b>${money(hist.material, 0, "total")}</b></div>
        <div class="kv"><span>${t("m6_gt_fixed")}</span><b>${money(hist.fixed, 0, "total")}</b></div>
        <div class="kv"><span>${t("m6_gt_net")}</span><b class="${hist.net >= 0 ? "pos" : "neg"}">${money(hist.net, 0, "total")} · ${fp(hist.margin)}</b></div>
        <div class="help">${t("m6_gt_help", state.ui.rate)}</div>
      </div>
    </div>
  `;
}
