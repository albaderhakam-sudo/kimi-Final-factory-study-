# Red Dragon Factory — Case Study Tool

A fully client-side, bilingual (English / 简体中文) factory investment, production-planning,
and salary-modelling tool. No build step, no backend, no dependencies to install — it runs
entirely in the browser from static files.

---

## 1. Running it in VS Code

The app loads its `.jsx` files over HTTP and compiles them in the browser with Babel.
Because of that, **opening `factory-case-study.html` directly as a `file://` URL will not work**
(the browser blocks loading the script modules). You need a tiny local web server. Two easy ways:

### Option A — VS Code "Live Server" extension (recommended)
1. Install the **Live Server** extension (publisher: Ritwick Dey) from the Extensions panel.
2. Right-click `factory-case-study.html` → **Open with Live Server**.
3. Your browser opens at something like `http://127.0.0.1:5500/factory-case-study.html`.
4. Edits to any file + save → the page auto-reloads.

### Option B — one-line terminal server
From the project folder, run whichever you have:
```bash
python3 -m http.server 8000        # then open http://localhost:8000/factory-case-study.html
# or
npx serve .                        # prints the URL to open
```

That's the entire toolchain. There is nothing to `npm install`.

---

## 2. How the project is wired

`factory-case-study.html` is the entry point. It pulls in, in order:

| Load order | File | Role |
|---|---|---|
| CDN | React 18, ReactDOM, Babel-standalone, Chart.js 4 | Runtime libraries (pinned, with integrity hashes) |
| `data.js` | **Canonical dataset.** Products, employees, FX, rent. Parsed exactly from the source Excel. Plain JS, sets `window.RDF_DATA`. |
| `i18n.js` | **All UI strings** in `en` + `zh`, as `window.RDF_I18N`. `{token}` placeholders are interpolated by `t()`. |
| `app-core.jsx` | **The engine.** State, all formulas, the React context provider, `t()`, number/money formatting, localStorage autosave, JSON import/export. Exposes `window.RDF`. |
| `charts.jsx` | Thin Chart.js wrapper (`RDFChart`) + Workshop palette. |
| `mod-*.jsx` | One file per tab/module (see below). Each attaches its component to `window`. |
| `app-main.jsx` | Top bar (sales slider, language + currency toggles, save menu), tab nav, and the root `App`. Exposes `window.RDFApp`. |
| inline | Renders `<window.RDFApp />` into `#root`. |

`styles.css` holds the entire Workshop design system (CSS variables for color/type, all component classes). No CSS framework.

### Why globals instead of ES modules / imports?
Every `.jsx` file is compiled independently by in-browser Babel, so they don't share a module
scope. The convention used throughout is: **define everything inside an IIFE, then attach the
public pieces to `window`** (e.g. `window.SalaryModule = SalaryModule`). If you add a file,
follow the same pattern and add a `<script type="text/babel" src="...">` tag to the HTML in the
right spot (after `app-core.jsx`, before `app-main.jsx`).

---

## 3. The modules (tabs)

| File | Tab | What it does |
|---|---|---|
| `mod-overview.jsx` | Overview | Hero net-profit statement, clickable KPIs, scenario table, and the **built-in accuracy check** that reconciles to documented 6-month actuals. |
| `mod-investment.jsx` | Investment | Total investment input, editable allocation buckets (fixed + auto-computed reserves), donut, surplus/shortfall, runway. |
| `mod-production.jsx` | Production | The driver. Monthly sales → per-item build plan, material bill, hours. Full 60-item product editor. |
| `mod-labor.jsx` | Labor | Crew capacity, utilization, the capacity ceiling, hours-by-group. |
| `mod-salary.jsx` | Salary Lab | Centerpiece. Model picker (0/A/B/C/D), tier + parameter editors, employee editor, live payroll. |
| `mod-salary-compare.jsx` | (Salary sub-views) | Owner view (payroll-vs-sales chart + ledger) and Employee view (today-vs-new per person). |
| `mod-costs.jsx` | Costs & Decision | Editable costs, FX lever, profit waterfall, two verdicts. |

---

## 4. The calculation engine (`app-core.jsx`)

Everything funnels through one pure function, `compute(S, opts)`, where `S` is the whole state
object. It returns the full derived model (production plan, material, hours, utilization,
payroll under the chosen salary model, net, margin, etc.). Key entry points:

- `compute(S)` — the live model for the current state.
- `compute(S, {salesOverride, modelOverride})` — recompute at a different sales level or salary
  model **without mutating state**. This is how every scenario column, chart series, and
  break-even search is produced. Use this rather than duplicating math.
- `payFor(person, model, S, T, totalBasicAll)` — pay for one person at sales `T` under a model.
  Salary models live here; this is the function to edit if you change how pay is computed.
- `breakEvenSales(person, S)` — binary search for the sales level where a person matches today's pay.

**Salary models** (all keep `basic` as a hard floor):
- `M0` Current fixed — today's pay, the baseline.
- `A` Basic + share — a bonus pool = % of monthly sales, split by basic-salary weight.
- `B` Uplift ramp — `basic × (1 + uplift%)`, interpolated smoothly across tiers.
- `C` Tiered — stepped uplift; crossing a sales tier jumps a pay step.
- `D` Custom mix — uplift ramp + sales-share pool.

Tunable values live in `S.tiers` (the sales thresholds) and `S.params[model]` (uplift % and
pool % per tier). The UI for these is in `mod-salary.jsx` (`TierEditor`, `ParamEditor`).

### State, persistence, and the one gotcha
- State shape is defined in `makeDefaultState()`.
- `set(patch)` accepts an object (merged) **or** a function `prev => partialPatch`. The function
  form returns *only the changed slice* and the provider merges it — do **not** return the whole
  state from a function updater.
- State autosaves to `localStorage` under `rdf_state_v1` (400 ms debounce). To wipe and reseed
  with defaults: run `localStorage.removeItem('rdf_state_v1')` in the console and reload, or use
  **Reset to Excel** in the save menu.
- Because old saved state can shadow new default fields, after changing `makeDefaultState()` you
  usually want to reset (or bump the `STORE_KEY` version string).

---

## 5. Internationalization

- Add or edit copy in `i18n.js` — keep the `en` and `zh` key sets in sync.
- In components, call `t('key')` or `t('key', {var: value})` for `{var}` interpolation.
- **User data** (typed names) is intentionally *not* translated. Seeded job titles and bucket
  names carry a `posKey` / `nameKey` and a `…Dirty` flag: they localize automatically until the
  user edits them, after which the typed text sticks. See `dispPos()` / `dispName()` in
  `app-core.jsx`.

---

## 6. Common edits — where to look

- **Change a number/price/headcount in the seed data** → `data.js`.
- **Add/feed a new salary model** → `payFor()` + the `SALARY_MODELS` array in `app-core.jsx`,
  then add its label/desc keys in `i18n.js`.
- **Add a KPI or chart to a tab** → that tab's `mod-*.jsx`; use `RDFChart` from `charts.jsx`.
- **Restyle** → CSS variables at the top of `styles.css` (`--emer`, `--brass`, `--ink`, fonts…).
- **Add a new tab** → new `mod-*.jsx` (IIFE + `window.X = …`), add a `<script>` tag in the HTML,
  add an entry to `TAB_IDS` / `TAB_KEY` and the render switch in `app-main.jsx`.

---

## 7. Data provenance & known gaps

- The embedded dataset reconciles **exactly** to the documented 6-month actuals
  (Sales ¥2,017,193 · Material ¥1,031,503 · Net ¥399,152). The Overview tab proves this live.
- **Two selling prices are genuinely missing** from the source files: Sealing Cap **M20** and
  **M30**. They are stored as `null` and flagged red in the Production → product editor. Fill
  them in to complete sales totals.
- Forward model uses rent **185,000/yr**; the historical reconciliation uses the original
  68,000/6mo. Both are in `data.js` under `meta`.

---

## 8. If you'd rather port this into a real framework

The HTML files are working code, but if you want this inside an existing React/Vue/etc. app:
- The **engine** (`app-core.jsx` compute/payFor/breakEven) is framework-agnostic plain JS — lift
  it almost verbatim into a `.ts` module and unit-test it.
- The **data** (`data.js`) and **strings** (`i18n.js`) are plain objects — drop in as-is.
- Rebuild the **views** with your component library; treat the `mod-*.jsx` files as precise specs
  (they already encode every formula, label, and layout).
