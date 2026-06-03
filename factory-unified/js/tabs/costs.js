/* ============================ TAB 6: COSTS & DECISION ============================ */

import { translate as tt, formatMoney as fm, formatNumber as fn, formatPct as fp, esc } from "../ui.js";
import { donutSVG } from "../ui.js";

function makeLegend(segs, moneyFn) {
  return `<div class="legend">` + segs.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)} · ${moneyFn(s.value)}</span>`).join("") + `</div>`;
}

export function renderCosts(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "month") => fm(v, state.ui.cur, state.ui.rate, d, p, view);

  const cost = [
    { label: t("m6_materials"), value: D.materialMonthly, color: "#FF9800" },
    { label: t("m6_salaries"), value: D.payroll, color: "#00BCD4" },
    { label: t("m6_rent"), value: D.rentM, color: "#FFB300" },
    { label: t("m6_electricity"), value: D.elecM, color: "#B388FF" },
  ];

  const profitable = D.netM >= 0;
  const enough = D.invTotal >= D.needs;
  const payLbl = state.salary.model === "0" ? t("mode_fixed") : t("modelname_1");
  const hist = D.hist;

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m6_title")}</h2><span class="tag">${t("tag_editable")}</span></div>
      <div class="sec-sub">${t("m6_sub")}</div>
      <div class="flex" style="margin-bottom:14px">
        <div><label class="lbl">${t("m6_rent_month")}</label><input type="number" id="rent" class="num-sm" step="100" value="${state.costs.rentMonthly}"></div>
        <div><label class="lbl">${t("m6_elec_month")}</label><input type="number" id="elec" class="num-sm" step="100" value="${state.costs.elecMonthly}"></div>
        <div class="help" style="align-self:flex-end">${t("m6_salaries_help")}</div>
      </div>

      <div class="grid g2">
        <div>
          <h3>${t("m6_cost_breakdown", money(D.S))}</h3>
          <div class="grid" style="grid-template-columns:158px 1fr;gap:14px;align-items:center">
            <div>${donutSVG(cost)}</div>
            <div>${makeLegend(cost, money)}</div>
          </div>
          <hr class="hr">
          <div class="kv"><span>${t("m6_sales")}</span><b class="bl">${money(D.S)}</b></div>
          <div class="kv"><span>${t("m6_minus_material")}</span><b class="or">${money(D.materialMonthly)}</b></div>
          <div class="kv"><span>${t("m6_minus_payroll", payLbl)}</span><b class="te">${money(D.payroll)}</b></div>
          <div class="kv"><span>${t("m6_minus_rent_elec")}</span><b>${money(D.rentM + D.elecM)}</b></div>
          <div class="kv"><span>${t("m6_eq_net")}</span><b class="${profitable ? "pos" : "neg"}">${money(D.netM)}</b></div>
          <div class="kv"><span>${t("m6_over_months", state.ui.months)}</span><b class="${profitable ? "pos" : "neg"}">${money(D.netM * state.ui.months, 0, "total")}</b></div>
        </div>
        <div>
          <div class="verdict ${profitable ? "good" : "bad"}">
            <div class="vh ${profitable ? "pos" : "neg"}">${profitable ? t("m6_profitable") : t("m6_loss")}</div>
            <div class="help">${profitable ? t("m6_profitable_help", money(D.S), money(D.netM), fp(D.marginM)) : t("m6_loss_help", money(D.S), money(-D.netM))}</div>
          </div>
          <div class="verdict ${enough ? "good" : "bad"}" style="margin-top:12px">
            <div class="vh ${enough ? "pos" : "neg"}">${enough ? t("m6_inv_enough") : t("m6_inv_not_enough")}</div>
            <div class="help">${enough ? t("m6_inv_enough_help", money(D.invTotal, 0, "total"), money(D.needs, 0, "total"), D.runway.toFixed(1)) : t("m6_inv_not_enough_help", money(D.needs, 0, "total"), money(D.invTotal, 0, "total"))}</div>
          </div>
          <hr class="hr">
          <h3>${t("m6_ground_truth")} <span class="help">${t("m6_6mo_actuals")}</span></h3>
          <div class="kv"><span>${t("m6_sales")}</span><b>${money(hist.sales, 0, "total")}</b></div>
          <div class="kv"><span>${t("m6_materials")}</span><b>${money(hist.material, 0, "total")}</b></div>
          <div class="kv"><span>${t("m6_gt_fixed")}</span><b>${money(hist.fixed, 0, "total")}</b></div>
          <div class="kv"><span>${t("m6_gt_net")}</span><b class="${hist.net >= 0 ? "pos" : "neg"}">${money(hist.net, 0, "total")} · ${fp(hist.margin)}</b></div>
          <div class="help">${t("m6_gt_help", state.ui.rate)}</div>
        </div>
      </div>
    </div>
  `;
}
