/* ============================ TAB 3: PRODUCTS ============================ */

import { translate as tt, formatMoney as fm, esc } from "../ui.js";

export function renderProducts(container, state, D, h) {
  const t = (k, ...a) => tt(k, state.ui.lang, ...a);
  const view = state.ui.view || "monthly";
  const money = (v, d, p = "total") => fm(v, state.ui.cur, state.ui.rate, d, p, view);
  const rate = state.ui.rate;

  const onlyP = h.onlyProduced;
  const groups = {};
  state.products.forEach((p) => {
    if (!groups[p.group]) groups[p.group] = [];
    groups[p.group].push(p);
  });

  // Missing price alert
  const miss = state.products.filter((p) => p.price == null && p.qty > 0);
  const alertHtml = miss.length
    ? `<div class="note alert">${t("m3alert_miss", miss.length, miss.map((p) => esc(p.group + " " + p.item)).join(", "))}</div>`
    : `<div class="note" style="border-left-color:var(--positive)">${t("m3alert_ok")}</div>`;

  // Group summary cards
  let cardsHtml = `<div class="g4 grid" style="margin-bottom:16px">`;
  for (const gName of Object.keys(groups)) {
    const gProds = groups[gName];
    const produced = gProds.filter((p) => p.qty > 0).length;
    const missingPrices = gProds.filter((p) => p.price == null).length;
    const groupSales = gProds.reduce((s, p) => s + (p.price != null && p.qty > 0 ? p.qty * p.price * rate : 0), 0);
    cardsHtml += `
      <div class="kpi">
        <div class="k-l">${esc(gName)}</div>
        <div class="k-v" style="font-size:16px">${money(groupSales)}</div>
        <div class="k-s">${produced} ${t("produced")} / ${gProds.length} ${t("items")}${missingPrices > 0 ? ` · <span class="neg">${missingPrices} ${t("missing")}</span>` : ""}</div>
      </div>`;
  }
  cardsHtml += `</div>`;

  // Per-group tables
  let tablesHtml = "";
  for (const gName of Object.keys(groups)) {
    const gProds = groups[gName];
    if (onlyP && !gProds.some((p) => p.qty > 0)) continue;

    let rows = "";
    gProds.forEach((p, i) => {
      if (onlyP && !(p.qty > 0)) return;
      const miss = p.price == null && p.qty > 0;
      const sales6 = p.price != null ? p.qty * p.price * rate : 0;
      rows += `<tr>
        <td style="color:var(--text-muted)">${i + 1}</td>
        <td>${esc(p.item)}${p.qty === 0 ? ` <span class="pill">${t("catalogue")}</span>` : ""}${miss ? ` <span class="pill" style="border-color:var(--negative);color:var(--negative)">${t("missing")}</span>` : ""}</td>
        <td><input class="num-sm" type="number" step="0.001" data-k="praw" data-id="${p.id}" value="${p.raw}"></td>
        <td><input class="num-sm" type="number" step="0.0001" data-k="phours" data-id="${p.id}" value="${p.hours}"></td>
        <td><input class="num-sm" type="number" step="1" data-k="pqty" data-id="${p.id}" value="${p.qty}"></td>
        <td><input class="num-sm ${miss ? "flag" : ""}" type="number" step="0.001" data-k="pprice" data-id="${p.id}" value="${p.price == null ? "" : p.price}" placeholder="${miss ? t("missing") : ""}"></td>
        <td class="muted">${p.price != null ? money(p.price * rate) : "—"}</td>
        <td>${p.price != null ? money(sales6) : "<span class=\"muted\">—</span>"}</td>
        <td class="noprint"><button class="tiny" data-act="delProd" data-id="${p.id}">✕</button></td>
      </tr>`;
    });

    tablesHtml += `
      <div class="card section">
        <div class="between">
          <h3>${esc(gName)}</h3>
          <span class="muted">${gProds.filter((p) => p.qty > 0).length} ${t("produced")} / ${gProds.length} ${t("items")}</span>
        </div>
        <div class="scrollx"><table>
          <thead><tr><th>#</th><th>${t("prod_h_item")}</th><th>${t("prod_h_raw")}</th><th>${t("prod_h_hours")}</th><th>${t("prod_h_qty")}</th><th>${t("prod_h_price")}</th><th>${t("priceCNY")}</th><th>${t("prod_h_sales")}</th><th class="noprint"></th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>`;
  }

  container.innerHTML = `
    <div class="card section">
      <div class="between"><h2>${t("m3_title")}</h2><span class="tag">${t("tag_editable")}</span></div>
      <div class="sec-sub">${t("m3_sub")}</div>
      ${alertHtml}
      <div class="flex noprint" style="margin-bottom:10px">
        <button class="tiny" data-act="addProd">${t("m3_add_item")}</button>
        <button class="tiny" data-act="csvTemplate">${t("m3_csv_template")}</button>
        <button class="tiny" data-act="csvImport">${t("m3_csv_import")}</button>
        <label class="help" style="margin-left:auto;display:flex;align-items:center;gap:6px"><input type="checkbox" id="onlyProduced" ${onlyP ? "checked" : ""} style="width:auto"><span>${t("m3_only_produced")}</span></label>
      </div>
    </div>
    ${cardsHtml}
    ${tablesHtml}
  `;
}
