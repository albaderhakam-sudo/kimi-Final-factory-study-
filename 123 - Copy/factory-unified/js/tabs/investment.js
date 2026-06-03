/* ============================ TAB 1: INVESTMENT ============================ */

import { translate as tt, formatMoney as fm, esc } from "../ui.js";
import { createDonut } from "../charts.js";

function makeLegend(segs, moneyFn) {
  return `<div class="legend">` + segs.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)} · ${moneyFn(s.value)}</span>`).join("") + `</div>`;
}

export function renderInvestment(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "total") => fm(v, state.ui.cur, state.ui.rate, d, p, view);

  const invTotal = D.invTotal;
  const enough = invTotal >= D.needs;

  // Donut data
  const segs = state.invest.buckets
    .filter((b) => b._amt > 0)
    .map((b, i) => ({
      label: b.name,
      value: b._amt,
      color: ["#2196F3", "#00BCD4", "#FF9800", "#FFB300", "#00C853", "#B388FF", "#FF3D71", "#8B9DB8"][i % 8],
    }));

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m1_title")}</h2><span class="tag">${t("tag_editable")}</span></div>
      <div class="sec-sub">${t("m1_sub")}</div>
      <div class="grid g2">
        <div>
          <label class="lbl">${t("m1_total_label")}</label>
          <div class="flex" style="align-items:center;gap:12px;margin-bottom:8px">
            <input type="number" id="invTotal" step="10000" style="width:180px;font-size:16px" value="${state.invest.auto ? '' : (state.invest.total || '')}" ${state.invest.auto ? 'disabled' : ''}>
            <label class="toggle ${state.invest.auto ? 'on' : ''}" id="invAutoToggle" data-act="invAutoToggle">
              <div class="toggle-switch"></div>
              <span class="toggle-label">${t("m1_auto")}</span>
            </label>
          </div>
          <div class="help" style="margin-bottom:14px">${t("m1_auto_help")}</div>

          <div class="between">
            <h3>${t("m1_alloc_buckets")}</h3>
            <button class="tiny noprint" data-act="addBucket">${t("m1_add_bucket")}</button>
          </div>
          <div class="scrollx"><table id="bucketTbl">
            <thead><tr><th>${t("bucket_h_bucket")}</th><th>${t("bucket_h_mode")}</th><th>${t("bucket_h_value")}</th><th>${t("bucket_h_basis")}</th><th>${t("bucket_h_amount")}</th><th class="noprint"></th></tr></thead>
            <tbody>${renderBuckets(state, t, money)}</tbody>
            <tfoot><tr class="total"><td>${t("total_needs")}</td><td></td><td></td><td></td><td>${money(D.needs)}</td><td></td></tr></tfoot>
          </table></div>
        </div>
        <div>
          <div class="chart-box-sm"><canvas id="investChart"></canvas></div>
          ${makeLegend(segs, money)}
          <hr class="hr">
          <div class="kv"><span>${t("m1_total_needs_sum")}</span><b>${money(D.needs)}</b></div>
          <div class="kv"><span>${t("m1_your_investment")}</span><b>${money(invTotal)}</b></div>
          <div class="kv"><span>${enough ? t("surplus") : t("shortfall")}</span><b class="${enough ? "pos" : "neg"}">${money(Math.abs(D.surplus))}</b></div>
          <div class="kv"><span>${t("m1_reserve_cash")}</span><b>${money(D.reserveCash)}</b></div>
          <div class="kv"><span>${t("m1_burn_zero")}</span><b>${money(D.burnZero, 0, "month")}</b></div>
          <div class="kv"><span>${t("m1_runway_zero")}</span><b class="${D.runway >= 3 ? "pos" : "am"}">${D.runway.toFixed(1)} ${t("months_unit")}</b></div>
          <div class="verdict ${enough ? "good" : "bad"}" style="margin-top:12px">
            <div class="vh ${enough ? "pos" : "neg"}">${enough ? t("m1_enough") : t("m1_not_enough")}</div>
            <div class="help">${enough ? t("m1_enough_help", money(D.surplus), D.runway.toFixed(1)) : t("m1_not_enough_help", money(-D.surplus), money(D.needs))}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Chart
  const ctx = document.getElementById("investChart");
  if (ctx) {
    h.chartRefs.invest = createDonut(
      ctx,
      segs.map((s) => s.label),
      segs.map((s) => s.value),
      segs.map((s) => s.color),
      { currency: state.ui.cur, rate: state.ui.rate }
    );
  }
}

function renderBuckets(state, t, money) {
  const basisLbl = { rent: t("basis_rent"), payroll: t("basis_payroll"), material: t("basis_material"), elec: t("basis_elec") };
  return state.invest.buckets
    .map((b) => {
      const modeSel = `<select data-k="bmode" data-id="${b.id}"><option value="fixed"${b.mode === "fixed" ? " selected" : ""}>${t("mode_fixed")}</option><option value="months"${b.mode === "months" ? " selected" : ""}>${t("mode_months")}</option></select>`;
      const valCell =
        b.mode === "fixed"
          ? `<input type="number" class="num-sm" step="1000" data-k="bvalue" data-id="${b.id}" value="${b.value}">`
          : `<input type="number" class="num-sm" step="1" data-k="bmonths" data-id="${b.id}" value="${b.months}"> ${t("mo_suffix")}`;
      const basisSel =
        b.mode === "months"
          ? `<select data-k="bbasis" data-id="${b.id}">${["rent", "payroll", "material", "elec"].map((x) => `<option value="${x}"${b.basis === x ? " selected" : ""}>${basisLbl[x]}</option>`).join("")}</select>`
          : `<span class="muted">—</span>`;
      return `<tr><td><input class="txt" data-k="bname" data-id="${b.id}" value="${esc(b.name)}"></td><td>${modeSel}</td><td>${valCell}</td><td>${basisSel}</td><td>${money(b._amt)}</td><td class="noprint"><button class="tiny" data-act="delBucket" data-id="${b.id}">✕</button></td></tr>`;
    })
    .join("");
}


