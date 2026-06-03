/* ============================ MAIN APP CONTROLLER ============================ */

import { makeDefaultState } from "./data.js";
import { loadState, saveState, clearState, getDefaultState, exportJSON, importJSON, csvTemplate, importCSV, exportExcel, importExcel } from "./state.js";
import { recompute } from "./engine.js";
import { translate as tt, formatMoney, formatNumber, formatPct, esc, setVal } from "./ui.js";
import { renderOverview } from "./tabs/overview.js";
import { renderInvestment } from "./tabs/investment.js";
import { renderProduction } from "./tabs/production.js";
import { renderProducts } from "./tabs/products.js";
import { renderLabor } from "./tabs/labor.js";
import { renderSalary } from "./tabs/salary.js";
import { renderCosts } from "./tabs/costs.js";

/* ============================ STATE ============================ */
let state = loadState() || makeDefaultState();
if (!state.ui.lang) state.ui.lang = "en";
if (!state.ui.view) state.ui.view = "monthly";
if (state.salary.labSalesPreview == null) state.salary.labSalesPreview = state.sales.value;
if (state.employees) {
  state.employees.forEach((e) => {
    if (e.salaryModel == null) e.salaryModel = e.group === "Labor" ? "0" : "1";
  });
}

let activeTab = "overview";
let D = {};
let saveTimer = null;
let chartRefs = {};
let onlyProduced = false;

const TAB_IDS = ["overview", "investment", "production", "products", "labor", "salary", "costs"];

function t(k, ...a) {
  return tt(k, state.ui.lang, ...a);
}

function $(id) {
  return document.getElementById(id);
}

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState(state);
    const dot = $("savedDot");
    if (dot) dot.style.background = "var(--positive)";
  }, 400);
}

/* ============================ RENDER ============================ */
function refresh(preserveFocus = true) {
  D = recompute(state);
  renderControls();
  renderKPIs();
  renderNav();

  let foc = null;
  if (preserveFocus) {
    const ae = document.activeElement;
    if (ae && ae.dataset && (ae.dataset.k || ae.id)) {
      let s = null,
        e = null;
      try {
        s = ae.selectionStart;
        e = ae.selectionEnd;
      } catch (_) {}
      foc = { k: ae.dataset.k, id: ae.dataset.id, elId: ae.id, s, e };
    }
  }

  renderTab();
  debouncedSave();

  if (foc) {
    let el = null;
    if (foc.elId) el = $(foc.elId);
    else if (foc.k && foc.id) el = document.querySelector(`[data-k="${foc.k}"][data-id="${foc.id}"]`);
    else if (foc.k) el = document.querySelector(`[data-k="${foc.k}"]`);
    if (el) {
      el.focus();
      if (foc.s != null && el.setSelectionRange) {
        try {
          el.setSelectionRange(foc.s, foc.e);
        } catch (_) {}
      }
    }
  }
}

function renderControls() {
  // Language buttons
  document.querySelectorAll("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.ui.lang));
  // Currency buttons
  document.querySelectorAll("#curSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.ui.cur));
  // View buttons
  document.querySelectorAll("#viewSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.ui.view));
  // Header inputs
  setVal("rate", state.ui.rate);
  setVal("months", state.ui.months);
  // Rail
  document.querySelectorAll("#scnSeg button").forEach((b) => {
    const v = b.dataset.v;
    const target = v === "base" ? D.base : v === "worst" ? D.base * (1 - state.sales.flex / 100) : D.base * (1 + state.sales.flex / 100);
    b.classList.toggle("on", Math.abs(state.sales.value - target) < 1);
  });
  setVal("flex", state.sales.flex);
  const sl = $("salesSlider");
  if (sl) {
    sl.max = Math.round(Math.max(D.base * 2.5, 1000000));
    if (document.activeElement !== sl) sl.value = Math.min(state.sales.value, sl.max);
  }
  setVal("salesBox", Math.round(state.sales.value));
  const view = state.ui.view || "monthly";
  const sb = $("salesBig");
  if (sb) sb.textContent = formatMoney(state.sales.value, state.ui.cur, state.ui.rate, 0, "month", view);
  const dev = D.base > 0 ? state.sales.value / D.base - 1 : 0;
  const sv = $("salesVs");
  if (sv)
    sv.innerHTML = `<span class="${dev >= 0 ? "pos" : "neg"}">${dev >= 0 ? "+" : ""}${(dev * 100).toFixed(0)}%</span> ${t("vs_base")}`;
  const bm = $("baseMonthly");
  if (bm) bm.textContent = formatMoney(D.base, state.ui.cur, state.ui.rate, 0, "month", view);
  const st = $("salesTicks");
  if (st)
    st.innerHTML = `<span>0</span><span>${t("worst")} ${formatMoney(D.base * (1 - state.sales.flex / 100), state.ui.cur, state.ui.rate, 0, "month", view)}</span><span>${t("base")} ${formatMoney(D.base, state.ui.cur, state.ui.rate, 0, "month", view)}</span><span>${t("best")} ${formatMoney(D.base * (1 + state.sales.flex / 100), state.ui.cur, state.ui.rate, 0, "month", view)}</span><span>${formatMoney(sl ? sl.max : 1000000, state.ui.cur, state.ui.rate, 0, "month", view)}</span>`;

  // Static title / lang
  document.documentElement.lang = state.ui.lang === "zh" ? "zh" : "en";
  document.title = t("doc_title");
  $("stamp").textContent = new Date().toLocaleString();
}

function renderKPIs() {
  const view = state.ui.view || "monthly";
  const payrollLabel = (() => {
    const hasMixed = state.employees.some((e) => (e.salaryModel || state.salary.model) !== state.salary.model);
    if (hasMixed) return t("mixed_model");
    return state.salary.model === "0" ? t("fixed_word") : t("modelname_1");
  })();
  const cards = [
    { l: t("kpi_monthly_sales"), v: formatMoney(D.S, state.ui.cur, state.ui.rate, 0, "month", view), s: `${D.S >= D.base ? "+" : ""}${((D.S / D.base - 1) * 100 || 0).toFixed(0)}% ${t("vs_base")}`, c: "bl" },
    { l: t("kpi_material_cost"), v: formatMoney(D.materialMonthly, state.ui.cur, state.ui.rate, 0, "month", view), s: formatPct(D.S > 0 ? D.materialMonthly / D.S : 0) + " " + t("of_sales"), c: "or" },
    { l: t("kpi_payroll") + " (" + payrollLabel + ")", v: formatMoney(D.payroll, state.ui.cur, state.ui.rate, 0, "month", view), s: formatPct(D.S > 0 ? D.payroll / D.S : 0) + " " + t("of_sales"), c: "te" },
    { l: t("kpi_net_profit"), v: formatMoney(D.netM, state.ui.cur, state.ui.rate, 0, "month", view), s: formatPct(D.marginM) + " " + t("margin"), c: D.netM >= 0 ? "pos" : "neg" },
  ];
  $("kpis").innerHTML = cards.map((k) => `<div class="kpi"><div class="k-l">${k.l}</div><div class="k-v ${k.c}">${k.v}</div><div class="k-s">${k.s}</div></div>`).join("");
}

function renderNav() {
  document.querySelectorAll("nav.tabs a").forEach((a) => a.classList.toggle("active", a.dataset.v === activeTab));
}

function renderTab() {
  const container = $("tab-content");
  if (!container) return;

  // destroy old Chart.js instances
  Object.values(chartRefs).forEach((c) => c && c.destroy && c.destroy());
  chartRefs = {};

  const h = { chartRefs, onlyProduced };

  switch (activeTab) {
    case "overview":
      renderOverview(container, state, D, h);
      break;
    case "investment":
      renderInvestment(container, state, D, h);
      break;
    case "production":
      renderProduction(container, state, D, h);
      break;
    case "products":
      renderProducts(container, state, D, h);
      break;
    case "labor":
      renderLabor(container, state, D, h);
      break;
    case "salary":
      renderSalary(container, state, D, h);
      break;
    case "costs":
      renderCosts(container, state, D, h);
      break;
  }
}

/* ============================ EVENTS ============================ */
function findProd(id) {
  return state.products.find((p) => p.id === id);
}
function findEmp(id) {
  return state.employees.find((e) => e.id === id);
}
function findBucket(id) {
  return state.invest.buckets.find((b) => b.id === id);
}

document.addEventListener("input", (e) => {
  const t = e.target;
  const k = t.dataset.k;
  const id = t.dataset.id;
  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  // header / rail
  if (t.id === "rate") {
    state.ui.rate = num(t.value) || 1;
    refresh();
    return;
  }
  if (t.id === "months") {
    state.ui.months = Math.max(1, Math.round(num(t.value)));
    refresh();
    return;
  }
  if (t.id === "flex") {
    state.sales.flex = num(t.value);
    refresh();
    return;
  }
  if (t.id === "salesSlider") {
    state.sales.value = num(t.value);
    $("salesBox").value = Math.round(state.sales.value);
    $("salesBig").textContent = formatMoney(state.sales.value, state.ui.cur, state.ui.rate, 0, "month", state.ui.view || "monthly");
    refresh(false);
    return;
  }
  if (t.id === "salesBox") {
    state.sales.value = num(t.value);
    refresh();
    return;
  }
  if (t.id === "hoursDay") {
    state.labor.hoursDay = num(t.value);
    refresh();
    return;
  }
  if (t.id === "daysMonth") {
    state.labor.daysMonth = num(t.value);
    refresh();
    return;
  }
  if (t.id === "basicPct") {
    state.salary.basicPct = num(t.value);
    return;
  }
  if (t.id === "S0") {
    state.salary.S0 = num(t.value);
    refresh();
    return;
  }
  if (t.id === "multiplier") {
    state.salary.multiplier = num(t.value);
    refresh();
    return;
  }
  if (t.id === "rent") {
    state.costs.rentMonthly = num(t.value);
    refresh();
    return;
  }
  if (t.id === "elec") {
    state.costs.elecMonthly = num(t.value);
    refresh();
    return;
  }
  if (t.id === "invTotal") {
    state.invest.total = num(t.value);
    refresh();
    return;
  }
  if (t.id === "labSalesSlider") {
    state.salary.labSalesPreview = num(t.value);
    const sb = $("labSalesBig");
    if (sb) sb.textContent = formatMoney(state.salary.labSalesPreview, state.ui.cur, state.ui.rate, 0, "month", state.ui.view || "monthly");
    refresh(false);
    return;
  }
  if (t.id === "onlyProduced") {
    onlyProduced = t.checked;
    refresh(false);
    return;
  }

  // products
  if (k === "pitem") {
    findProd(id).item = t.value;
    refresh(false);
    return;
  }
  if (k === "praw") {
    findProd(id).raw = num(t.value);
    refresh(false);
    return;
  }
  if (k === "phours") {
    findProd(id).hours = num(t.value);
    refresh(false);
    return;
  }
  if (k === "pqty") {
    const p = findProd(id);
    p.qty = num(t.value);
    refresh(false);
    return;
  }
  if (k === "pprice") {
    const p = findProd(id);
    p.price = t.value === "" ? null : num(t.value);
    refresh(false);
    return;
  }

  // employees
  if (k === "ename") {
    findEmp(id).name = t.value;
    refresh(false);
    return;
  }
  if (k === "eposition") {
    findEmp(id).position = t.value;
    refresh(false);
    return;
  }
  if (k === "egroup") {
    const em = findEmp(id);
    em.group = t.value;
    if (t.value === "Labor" && !em.hoursMonth) em.hoursMonth = state.labor.hoursDay * state.labor.daysMonth;
    em.prod = t.value === "Labor";
    refresh();
    return;
  }
  if (k === "estandard") {
    findEmp(id).standard = num(t.value);
    refresh(false);
    return;
  }
  if (k === "ebasic") {
    findEmp(id).basic = num(t.value);
    refresh(false);
    return;
  }
  if (k === "ehours") {
    findEmp(id).hoursMonth = num(t.value);
    refresh(false);
    return;
  }
  if (k === "esalarymodel") {
    findEmp(id).salaryModel = t.value;
    refresh(false);
    return;
  }

  // buckets
  if (k === "bname") {
    findBucket(id).name = t.value;
    refresh(false);
    return;
  }
  if (k === "bmode") {
    findBucket(id).mode = t.value;
    refresh();
    return;
  }
  if (k === "bvalue") {
    findBucket(id).value = num(t.value);
    refresh(false);
    return;
  }
  if (k === "bmonths") {
    findBucket(id).months = num(t.value);
    refresh(false);
    return;
  }
  if (k === "bbasis") {
    findBucket(id).basis = t.value;
    refresh(false);
    return;
  }
});

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act;
  const v = b.dataset.v;
  const id = b.dataset.id;

  if (act === "lang") {
    state.ui.lang = v;
    refresh();
  } else if (act === "cur") {
    state.ui.cur = v;
    refresh();
  } else if (act === "scn") {
    const f = state.sales.flex / 100;
    state.sales.value = Math.round(v === "base" ? D.base : v === "worst" ? D.base * (1 - f) : D.base * (1 + f));
    refresh();
  } else if (act === "model") {
    state.salary.model = v;
    refresh();
  } else if (act === "view") {
    state.ui.view = v;
    refresh();
  } else if (act === "reconcile") {
    state.sales.value = Math.round(D.base);
    state.salary.model = "0";
    refresh();
  } else if (act === "reset") {
    if (confirm("Restore all default data and settings? Your edits in this browser will be lost.")) {
      state = makeDefaultState();
      clearState();
      refresh();
    }
  } else if (act === "export") {
    exportJSON(state);
  } else if (act === "import") {
    $("fileImport").click();
  } else if (act === "print") {
    window.print();
  } else if (act === "invFill") {
    state.invest.total = Math.round(D.needs);
    refresh();
  } else if (act === "addBucket") {
    state.invest.buckets.push({ id: "b" + Math.random().toString(36).slice(2), name: "New bucket", mode: "fixed", value: 0, months: 0, basis: "none", auto: false });
    refresh();
  } else if (act === "delBucket") {
    state.invest.buckets = state.invest.buckets.filter((x) => x.id !== id);
    refresh();
  } else if (act === "addProd") {
    state.products.push({ id: "p" + Math.random().toString(36).slice(2), group: "New group", item: "New item", raw: 0, hours: 0, qty: 0, price: null });
    refresh();
  } else if (act === "delProd") {
    state.products = state.products.filter((x) => x.id !== id);
    refresh();
  } else if (act === "addEmp") {
    const isLab = v === "Labor";
    state.employees.push({
      id: "e" + Math.random().toString(36).slice(2),
      name: "New " + v,
      position: v,
      group: v,
      standard: 5000,
      basic: 3000,
      hoursMonth: isLab ? state.labor.hoursDay * state.labor.daysMonth : 0,
      prod: isLab,
      salaryModel: isLab ? "0" : "1",
    });
    refresh();
  } else if (act === "delEmp") {
    state.employees = state.employees.filter((x) => x.id !== id);
    refresh();
  } else if (act === "applyBasic") {
    const f = (state.salary.basicPct || 0) / 100;
    state.employees.forEach((em) => (em.basic = Math.round(em.standard * f)));
    refresh();
  } else if (act === "csvTemplate") {
    csvTemplate(state);
  } else if (act === "csvImport") {
    $("csvFile").click();
  } else if (act === "xlsxExport") {
    exportExcel(state, window.XLSX);
  } else if (act === "xlsxImport") {
    $("xlsxFile").click();
  } else if (act === "tab") {
    activeTab = v;
    refresh();
  } else if (act === "invAutoToggle") {
    state.invest.auto = !state.invest.auto;
    refresh();
  }
});

/* ============================ FILE INPUTS ============================ */
$("fileImport")?.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const s = importJSON(r.result);
    if (s) {
      state = s;
      refresh();
    }
  };
  r.readAsText(f);
  e.target.value = "";
});

$("csvFile")?.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const prods = importCSV(r.result);
    if (prods.length) {
      state.products = prods;
      refresh();
      alert("Imported " + prods.length + " items from CSV.");
    }
  };
  r.readAsText(f);
  e.target.value = "";
});

$("xlsxFile")?.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (typeof window.XLSX === "undefined") {
    alert("Excel library not loaded.");
    e.target.value = "";
    return;
  }
  const r = new FileReader();
  r.onload = (ev) => {
    const patches = importExcel(ev.target.result, window.XLSX);
    if (!patches) return;
    if (patches.products) state.products = patches.products;
    if (patches.employees) state.employees = patches.employees;
    if (patches.buckets) state.invest.buckets = patches.buckets;
    if (patches.costs) Object.assign(state.costs, patches.costs);
    if (patches.cur) state.ui.cur = patches.cur;
    if (patches.rate != null) state.ui.rate = patches.rate;
    if (patches.months != null) state.ui.months = patches.months;
    if (patches.lang) state.ui.lang = patches.lang;
    if (patches.salesValue != null) state.sales.value = patches.salesValue;
    if (patches.salesFlex != null) state.sales.flex = patches.salesFlex;
    if (patches.invTotal != null) state.invest.total = patches.invTotal;
    if (patches.salaryModel) state.salary.model = patches.salaryModel;
    if (patches.basicPct != null) state.salary.basicPct = patches.basicPct;
    if (patches.S0 != null) state.salary.S0 = patches.S0;
    if (patches.multiplier != null) state.salary.multiplier = patches.multiplier;
    refresh();
  };
  r.readAsArrayBuffer(f);
  e.target.value = "";
});

/* ============================ INIT ============================ */
refresh();
