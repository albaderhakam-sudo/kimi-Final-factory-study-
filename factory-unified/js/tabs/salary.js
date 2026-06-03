/* ============================ TAB 5: SALARY LAB ============================ */

import { translate as tt, formatMoney as fm, formatNumber as fn, formatPct as fp, esc } from "../ui.js";
import { payFor, breakEvenSales } from "../engine.js";
import { createLine } from "../charts.js";

export function renderSalary(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "month") => fm(v, state.ui.cur, state.ui.rate, d, p, view);
  const model = state.salary.model;
  const previewSales = state.salary.labSalesPreview || D.S;

  // Model description
  const desc = t("modeldesc_" + model);

  // Owner comparison
  const models = ["0", "1"];
  let ownerRows = `<tr><th>${t("m5_h_model")}</th><th>${t("m5_h_payroll_mo")}</th><th>${t("m5_h_pct_sales")}</th><th>${t("m5_h_net_mo")}</th><th>${t("m5_h_vs_fixed")}</th></tr>`;
  const fixedNet = D.S - D.materialMonthly - D.rentM - D.elecM - D.payrollFixed;
  models.forEach((m) => {
    const pr = m === "0" ? D.payrollFixed : D.payrollRamp;
    const net = D.S - D.materialMonthly - D.rentM - D.elecM - pr;
    const diff = net - fixedNet;
    ownerRows += `<tr class="${m === model ? "subtot" : ""}"><td>${m} · ${t("modelname_" + m)}</td><td>${money(pr)}</td><td>${fp(D.S > 0 ? pr / D.S : 0)}</td><td class="${net >= 0 ? "pos" : "neg"}">${money(net)}</td><td class="${diff >= 0 ? "pos" : "neg"}">${diff >= 0 ? "+" : ""}${money(diff)}</td></tr>`;
  });
  // Mixed row
  const mixedNet = D.S - D.materialMonthly - D.rentM - D.elecM - D.payroll;
  const mixedDiff = mixedNet - fixedNet;
  ownerRows += `<tr class="subtot" style="border-top:2px solid var(--border-subtle)"><td><b>${t("mixed_model")}</b> · ${t("m5_h_mixed")}</td><td><b>${money(D.payroll)}</b></td><td>${fp(D.S > 0 ? D.payroll / D.S : 0)}</td><td class="${mixedNet >= 0 ? "pos" : "neg"}"><b>${money(mixedNet)}</b></td><td class="${mixedDiff >= 0 ? "pos" : "neg"}">${mixedDiff >= 0 ? "+" : ""}${money(mixedDiff)}</td></tr>`;

  // Downside protection
  const worst = D.base * (1 - state.sales.flex / 100);
  const best = D.base * (1 + state.sales.flex / 100);
  const mixedWorst = payrollAtMixed(worst, state);
  const mixedBest = payrollAtMixed(best, state);
  const prot = `
    <div class="kv"><span>${t("m5_payroll_worst", money(worst))}</span><b>${money(mixedWorst)}</b></div>
    <div class="kv"><span>${t("m5_payroll_base", money(D.base))}</span><b>${money(D.payroll)}</b></div>
    <div class="kv"><span>${t("m5_payroll_best", money(best))}</span><b>${money(mixedBest)}</b></div>
    <div class="kv"><span>${t("m5_fixed_always")}</span><b>${money(D.payrollFixed)}</b></div>`;

  // Line chart data
  const xMax = Math.round(D.base * 2.2);
  const N = 40;
  const viewMult = view === "yearly" ? 12 : 1;
  const labels = [];
  const sFixed = [];
  const sMixed = [];
  const sNet = [];
  for (let i = 0; i <= N; i++) {
    const x = (xMax * i) / N;
    const xDisp = x * viewMult;
    labels.push(fn(xDisp / 1000, 0) + "k");
    const pf = D.payrollFixed * viewMult;
    const pm = payrollAtMixed(x, state) * viewMult;
    sFixed.push(pf);
    sMixed.push(pm);
    sNet.push(Math.max(0, x - D.materialMonthly - D.rentM - D.elecM - payrollAtMixed(x, state)) * viewMult);
  }

  // Employee comparison
  let empRows = `<tr><th>${t("m5_h_person")}</th><th>${t("m5_h_group")}</th><th>${t("m5_h_standard")}</th><th>${t("m5_h_new_at", money(previewSales))}</th><th>${t("m5_h_delta")}</th><th>${t("m5_h_sales_match")}</th></tr>`;
  state.employees.forEach((e) => {
    const standard = e.standard;
    const now = payFor(e, previewSales, state);
    const be = breakEvenSales(e, state);
    const d = now - standard;
    empRows += `<tr><td>${esc(e.name)}</td><td><span class="pill ${e.group === "Labor" ? "lab" : "emp"}">${e.group === "Labor" ? t("group_labor") : t("group_employee")}</span></td><td>${money(standard)}</td><td class="${now >= standard ? "pos" : "neg"}">${money(now)}</td><td class="${d >= 0 ? "pos" : "neg"}">${d >= 0 ? "+" : ""}${money(d)}</td><td>${be == null ? "—" : money(be)}</td></tr>`;
  });

  // Roster table
  let rosterRows = "";
  state.employees.forEach((e) => {
    const pay = payFor(e, D.S, state);
    const grp = `<select data-k="egroup" data-id="${e.id}"><option value="Employee"${e.group === "Employee" ? " selected" : ""}>${t("group_employee")}</option><option value="Labor"${e.group === "Labor" ? " selected" : ""}>${t("group_labor")}</option></select>`;
    const mod = `<select data-k="esalarymodel" data-id="${e.id}"><option value="0"${e.salaryModel === "0" ? " selected" : ""}>${t("modelname_0")}</option><option value="1"${e.salaryModel === "1" ? " selected" : ""}>${t("modelname_1")}</option></select>`;
    const hrs = e.group === "Labor" ? `<input class="num-sm" type="number" step="1" data-k="ehours" data-id="${e.id}" value="${e.hoursMonth}">` : `<span class="muted">—</span>`;
    rosterRows += `<tr>
      <td><input class="txt" data-k="ename" data-id="${e.id}" value="${esc(e.name)}"></td>
      <td><input class="txt" data-k="eposition" data-id="${e.id}" value="${esc(e.position)}"></td>
      <td>${grp}</td>
      <td>${mod}</td>
      <td><input class="num-sm" type="number" step="100" data-k="estandard" data-id="${e.id}" value="${e.standard}"></td>
      <td><input class="num-sm" type="number" step="100" data-k="ebasic" data-id="${e.id}" value="${e.basic}"></td>
      <td>${hrs}</td>
      <td class="${pay > e.standard ? "pos" : pay < e.standard ? "neg" : ""}">${money(pay)}</td>
      <td class="noprint"><button class="tiny" data-act="delEmp" data-id="${e.id}">✕</button></td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m5_title")}</h2><span class="tag">${t("tag_centerpiece")}</span></div>
      <div class="sec-sub">${t("m5_sub")}</div>

      <div class="grid g2" style="margin-bottom:16px">
        <div>
          <h3>${t("m5_choose_model")}</h3>
          <div class="seg" id="modelSeg">
            <button data-act="model" data-v="0" class="${model === "0" ? "on" : ""}">${t("model0_btn")}</button>
            <button data-act="model" data-v="1" class="${model === "1" ? "on" : ""}">${t("model1_btn")}</button>
          </div>
          <div class="note" id="modelDesc">${desc}</div>
        </div>
        <div>
          <h3>${t("m5_tune_rule")}</h3>
          <div class="flex">
            <div><label class="lbl">${t("m5_basic_pct")}</label><input type="number" id="basicPct" class="num-sm" step="1" min="0" max="100" value="${state.salary.basicPct}">% <button class="tiny" data-act="applyBasic">${t("apply")}</button></div>
            <div><label class="lbl">${t("m5_ref_sales")}</label><input type="number" id="S0" step="1000" value="${Math.round(state.salary.S0)}"></div>
          </div>
          <div class="flex" style="margin-top:8px">
            <div><label class="lbl">${t("m5_multiplier")}</label><input type="number" id="multiplier" class="num-sm" step="0.05" value="${state.salary.multiplier}"></div>
          </div>
          <div class="help" style="margin-top:6px">${t("m5_multiplier_help")}</div>
        </div>
      </div>

      <div class="card" style="background:var(--bg-input);margin-bottom:16px">
        <div class="between">
          <label class="lbl" style="margin:0">${t("m5_lab_sales")}: <span class="salesbig bl" id="labSalesBig">${money(previewSales)}</span></label>
          <span class="help">${t("m5_lab_sales_help")}</span>
        </div>
        <input type="range" id="labSalesSlider" min="0" max="${Math.round(Math.max(D.base * 2.5, 1000000))}" step="1000" value="${Math.round(previewSales)}">
        <div class="tick"><span>0</span><span>${t("worst")} ${money(D.base * (1 - state.sales.flex / 100))}</span><span>${t("base")} ${money(D.base)}</span><span>${t("best")} ${money(D.base * (1 + state.sales.flex / 100))}</span><span>${money(Math.max(D.base * 2.5, 1000000))}</span></div>
      </div>

      <div class="between"><h3>${t("m5_roster")}</h3>
        <div class="flex noprint"><button class="tiny" data-act="addEmp" data-v="Employee">${t("m5_add_emp")}</button><button class="tiny" data-act="addEmp" data-v="Labor">${t("m5_add_lab")}</button></div>
      </div>
      <div class="scrollx" style="margin-bottom:16px"><table>
        <thead><tr><th>${t("emp_h_name")}</th><th>${t("emp_h_position")}</th><th>${t("emp_h_group")}</th><th>${t("m5_h_model")}</th><th>${t("emp_h_standard")}</th><th>${t("emp_h_basic")}</th><th>${t("emp_h_hours")}</th><th>${t("emp_h_pay_now")}</th><th class="noprint"></th></tr></thead>
        <tbody>${rosterRows}</tbody>
        <tfoot><tr class="total"><td>${t("totals")}</td><td></td><td>${state.employees.length} ${t("ppl")}</td><td></td><td>${money(D.payrollStandard)}</td><td>${money(D.payrollFloor)}</td><td>${fn(D.availHours)} ${t("h_suffix")}</td><td>${money(D.payroll)}</td><td></td></tr></tfoot>
      </table></div>

      <div class="grid g2">
        <div>
          <h3>${t("m5_owner_view")} <span class="help">${t("m5_at_mo", money(D.S))}</span></h3>
          <div class="scrollx"><table>${ownerRows}</table></div>
          <h3 style="margin-top:14px">${t("m5_downside", t("mixed_model"))}</h3>
          ${prot}
          <div class="note">${t("m5_downside_note")}</div>
        </div>
        <div>
          <h3>${t("m5_payroll_vs_sales")}</h3>
          <div class="chart-box"><canvas id="salaryChart"></canvas></div>
          <div class="help">${t("m5_chart_help")}</div>
        </div>
      </div>

      <h3 style="margin-top:16px">${t("m5_emp_view")} <span class="help">${t("m5_emp_view_help")}</span></h3>
      <div class="scrollx"><table>${empRows}</table></div>
      <div class="note">${t("m5_emp_note")}</div>
    </div>
  `;

  const ctx = document.getElementById("salaryChart");
  if (ctx) {
    h.chartRefs.salary = createLine(ctx, labels, [
      { label: t("m5_fixed_payroll"), data: sFixed, borderColor: "#FF9800", backgroundColor: "#FF9800", pointRadius: 0, tension: 0.3 },
      { label: t("mixed_model"), data: sMixed, borderColor: "#00BCD4", backgroundColor: "#00BCD4", pointRadius: 0, tension: 0.3 },
      { label: t("m5_net_profit"), data: sNet, borderColor: "#00C853", backgroundColor: "#00C853", pointRadius: 0, tension: 0.3 },
    ]);
  }
}

function payrollAtMixed(sales, state) {
  return state.employees.reduce((a, e) => a + payFor(e, sales, state), 0);
}
