/* ============================ STATE & PERSISTENCE ============================ */

import { makeDefaultState } from "./data.js";

const STORE_KEY = "rdf_unified_v2";

export function loadState() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s);
    // Ensure new fields exist in old saves
    if (!parsed.salary) parsed.salary = {};
    if (parsed.salary.labSalesPreview == null) parsed.salary.labSalesPreview = parsed.sales?.value || 336199;
    if (!parsed.invest) parsed.invest = { total: 0, auto: false, buckets: [] };
    if (parsed.invest.auto == null) parsed.invest.auto = false;
    if (!parsed.ui) parsed.ui = {};
    if (!parsed.ui.view) parsed.ui.view = "monthly";
    if (parsed.employees) {
      parsed.employees.forEach((e) => {
        if (e.salaryModel == null) e.salaryModel = e.group === "Labor" ? "0" : "1";
      });
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function clearState() {
  localStorage.removeItem(STORE_KEY);
}

export function getDefaultState() {
  return JSON.parse(JSON.stringify(makeDefaultState()));
}

/* ============================ JSON I/O ============================ */

export function exportJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "red-dragon-factory-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
}

export function importJSON(text) {
  try {
    const s = JSON.parse(text);
    // basic validation
    if (!s.products || !s.employees || !s.salary) throw new Error("Invalid state file");
    return s;
  } catch (e) {
    alert("Import error: " + e.message);
    return null;
  }
}

/* ============================ CSV I/O ============================ */

export function csvTemplate(state) {
  const rows = [["group", "item", "raw_cny", "hours_pc", "qty_6mo", "price_usd"]].concat(
    state.products.map((p) => [p.group, p.item, p.raw, p.hours, p.qty, p.price == null ? "" : p.price])
  );
  const csv = rows
    .map((r) =>
      r
        .map((c) =>
          /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : c
        )
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products-template.csv";
  a.click();
}

function parseCSV(text) {
  const rows = [];
  let i = 0,
    f = "",
    row = [],
    q = false;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          f += '"';
          i++;
        } else q = false;
      } else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") {
        row.push(f);
        f = "";
      } else if (c === "\n" || c === "\r") {
        if (f !== "" || row.length) {
          row.push(f);
          rows.push(row);
          row = [];
          f = "";
        }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else f += c;
    }
    i++;
  }
  if (f !== "" || row.length) {
    row.push(f);
    rows.push(row);
  }
  return rows;
}

export function importCSV(text) {
  const rows = parseCSV(text).filter((r) => r.length >= 5);
  const head = rows.shift();
  const prods = rows
    .filter((r) => r.length >= 2 && String(r[0] || "").trim())
    .map((r) => ({
      id: "p" + Math.random().toString(36).slice(2),
      group: String(r[0] || ""),
      item: String(r[1] || ""),
      raw: parseFloat(r[2]) || 0,
      hours: parseFloat(r[3]) || 0,
      qty: parseFloat(r[4]) || 0,
      price: r[5] === "" || r[5] == null ? null : parseFloat(r[5]),
    }));
  return prods;
}

/* ============================ EXCEL I/O ============================ */

export function exportExcel(state, XLSX) {
  if (typeof XLSX === "undefined") {
    alert("Excel library not loaded — check your internet connection and refresh.");
    return;
  }
  const wb = XLSX.utils.book_new();
  const sheet = (name, rows) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  sheet("Products", [
    ["group", "item", "raw_cny_per_pc", "hours_per_pc", "qty_6mo", "price_usd_per_pc"],
    ...state.products.map((p) => [p.group, p.item, p.raw, p.hours, p.qty, p.price == null ? "" : p.price]),
  ]);

  sheet("Employees", [
    ["name", "position", "type", "standard_salary_cny", "basic_salary_cny", "hours_per_month", "production_worker", "salary_model"],
    ...state.employees.map((e) => [e.name, e.position, e.group, e.standard, e.basic, e.hoursMonth, e.prod ? "yes" : "no", e.salaryModel || (e.group === "Labor" ? "0" : "1")]),
  ]);

  sheet("Investment Buckets", [
    ["name", "mode", "value_cny", "months", "basis", "auto"],
    ...state.invest.buckets.map((b) => [b.name, b.mode, b.value, b.months, b.basis, b.auto ? "yes" : "no"]),
  ]);

  sheet("Fixed Costs", [
    ["item", "monthly_cny"],
    ["rent", state.costs.rentMonthly],
    ["electricity", state.costs.elecMonthly],
  ]);

  sheet("Settings", [
    ["setting", "value"],
    ["currency", state.ui.cur],
    ["exchange_rate", state.ui.rate],
    ["months", state.ui.months],
    ["language", state.ui.lang],
    ["view", state.ui.view || "monthly"],
    ["monthly_sales_target_cny", state.sales.value],
    ["sales_flex_pct", state.sales.flex],
    ["total_investment_cny", state.invest.total],
    ["salary_model", state.salary.model],
    ["basic_pct", state.salary.basicPct],
    ["S0", state.salary.S0],
    ["multiplier", state.salary.multiplier],
  ]);

  XLSX.writeFile(wb, "red-dragon-factory-" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

export function importExcel(arrayBuffer, XLSX) {
  if (typeof XLSX === "undefined") {
    alert("Excel library not loaded.");
    return null;
  }
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const rowsOf = (name) =>
    wb.SheetNames.includes(name) ? XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "" }) : null;

  const patches = {};
  let counts = [];

  const P = rowsOf("Products");
  if (P && P.length > 1) {
    const prods = P.slice(1)
      .filter((r) => r.length >= 2 && String(r[0] || "").trim())
      .map((r) => ({
        id: "p" + Math.random().toString(36).slice(2),
        group: String(r[0] || ""),
        item: String(r[1] || ""),
        raw: parseFloat(r[2]) || 0,
        hours: parseFloat(r[3]) || 0,
        qty: parseFloat(r[4]) || 0,
        price: r[5] === "" || r[5] == null ? null : parseFloat(r[5]),
      }));
    if (prods.length) {
      patches.products = prods;
      counts.push(prods.length + " products");
    }
  }

  const E = rowsOf("Employees");
  if (E && E.length > 1) {
    const emps = E.slice(1)
      .filter((r) => r.length >= 2 && String(r[0] || "").trim())
      .map((r) => {
        const prodStr = String(r[6] || "").toLowerCase().trim();
        const modelStr = String(r[7] || "").trim();
        return {
          id: "e" + Math.random().toString(36).slice(2),
          name: String(r[0] || ""),
          position: String(r[1] || ""),
          group: String(r[2] || "Employee"),
          standard: parseFloat(r[3]) || 0,
          basic: parseFloat(r[4]) || 0,
          hoursMonth: parseFloat(r[5]) || 0,
          prod: prodStr === "yes" || prodStr === "y" || prodStr === "true" || prodStr === "1",
          salaryModel: modelStr === "0" || modelStr === "1" ? modelStr : (String(r[2] || "") === "Labor" ? "0" : "1"),
        };
      });
    if (emps.length) {
      patches.employees = emps;
      counts.push(emps.length + " employees");
    }
  }

  const B = rowsOf("Investment Buckets");
  if (B && B.length > 1) {
    const bks = B.slice(1)
      .filter((r) => r.length >= 2 && String(r[0] || "").trim())
      .map((r) => ({
        id: "b" + Math.random().toString(36).slice(2),
        name: String(r[0] || ""),
        mode: String(r[1] || "fixed"),
        value: parseFloat(r[2]) || 0,
        months: parseFloat(r[3]) || 0,
        basis: String(r[4] || "none"),
        auto: String(r[5] || "").toLowerCase() === "yes",
      }));
    if (bks.length) {
      patches.buckets = bks;
      counts.push(bks.length + " buckets");
    }
  }

  const FC = rowsOf("Fixed Costs");
  if (FC && FC.length > 1) {
    const costPatches = {};
    for (const row of FC.slice(1)) {
      const k = String(row[0] || "").toLowerCase().trim();
      const v = parseFloat(row[1]);
      if (!isFinite(v)) continue;
      if (k === "rent") costPatches.rentMonthly = v;
      else if (k === "electricity" || k === "elec") costPatches.elecMonthly = v;
    }
    if (Object.keys(costPatches).length) {
      patches.costs = costPatches;
      counts.push("fixed costs");
    }
  }

  const S = rowsOf("Settings");
  if (S && S.length > 1) {
    const m = {};
    for (const row of S.slice(1)) {
      const k = String(row[0] || "").toLowerCase().trim();
      if (k) m[k] = row[1];
    }
    const num = (k) => (m[k] != null && m[k] !== "" ? parseFloat(m[k]) : null);
    const str = (k) => (m[k] != null && m[k] !== "" ? String(m[k]) : null);
    if (str("currency")) patches.cur = str("currency").toUpperCase();
    if (num("exchange_rate") != null) patches.rate = num("exchange_rate");
    if (num("months") != null) patches.months = Math.round(num("months"));
    if (str("language")) patches.lang = str("language").toLowerCase();
    if (str("view")) patches.view = str("view").toLowerCase();
    if (num("monthly_sales_target_cny") != null) patches.salesValue = num("monthly_sales_target_cny");
    if (num("sales_flex_pct") != null) patches.salesFlex = num("sales_flex_pct");
    if (num("total_investment_cny") != null) patches.invTotal = num("total_investment_cny");
    if (str("salary_model")) patches.salaryModel = str("salary_model");
    if (str("view")) patches.view = str("view").toLowerCase();
    if (num("basic_pct") != null) patches.basicPct = num("basic_pct");
    if (num("s0") != null) patches.S0 = num("s0");
    if (num("multiplier") != null) patches.multiplier = num("multiplier");
    counts.push("settings");
  }

  if (!counts.length) {
    alert("No recognized sheets found. Expected: Products, Employees, Investment Buckets, Fixed Costs, Settings.");
    return null;
  }

  alert("Excel imported: " + counts.join(", ") + ".");
  return patches;
}
