/* ============================ CALCULATION ENGINE ============================ */

export function recompute(state) {
  const rate = +state.ui.rate || 1;
  const S = Math.max(0, +state.sales.value || 0);

  // 1. Actuals (6-mo) + base monthly
  let rev6 = 0, mat6 = 0;
  state.products.forEach((p) => {
    const r6 = p.price != null ? (+p.qty || 0) * (+p.price || 0) * rate : 0;
    p._rev6 = r6;
    rev6 += r6;
    mat6 += (+p.qty || 0) * (+p.raw || 0);
  });
  const base = rev6 / 6;

  // 2. Production plan from revenue mix
  let matM = 0, hoursM = 0, qtyTot = 0;
  const byGroup = {};
  state.products.forEach((p) => {
    const share = rev6 > 0 ? p._rev6 / rev6 : 0;
    const revM = share * S;
    const priceCny = p.price != null ? (+p.price || 0) * rate : 0;
    const qtyM = priceCny > 0 ? revM / priceCny : 0;
    p._share = share;
    p._revM = revM;
    p._qtyM = qtyM;
    p._matM = qtyM * (+p.raw || 0);
    p._hoursM = qtyM * (+p.hours || 0);
    matM += p._matM;
    hoursM += p._hoursM;
    qtyTot += qtyM;
    if (!byGroup[p.group])
      byGroup[p.group] = { group: p.group, rev: 0, qty: 0, mat: 0, hours: 0, items: 0, priced: 0 };
    const g = byGroup[p.group];
    g.rev += revM;
    g.qty += qtyM;
    g.mat += p._matM;
    g.hours += p._hoursM;
    g.items++;
    if (p.price != null && p.qty > 0) g.priced++;
  });

  // 3. Labor capacity
  let avail = 0, nLab = 0;
  state.employees.forEach((e) => {
    if (e.group === "Labor" && e.prod !== false) {
      avail += +e.hoursMonth || 0;
      nLab++;
    }
  });
  const util = avail > 0 ? hoursM / avail : 0;
  const ceilingSales = util > 0 ? S / util : 0;

  // 4. Salary
  const totalGap = state.employees.reduce(
    (a, e) => a + Math.max(0, (+e.standard || 0) - (+e.basic || 0)),
    0
  );
  const payrollFloor = state.employees.reduce((a, e) => a + (+e.basic || 0), 0);
  const payrollStandard = state.employees.reduce((a, e) => a + (+e.standard || 0), 0);
  const payrollFixed = payrollAt(S, state, "0");
  const payrollRamp = payrollAt(S, state, "1");
  const payroll = payrollAt(S, state, null);

  // 5. Costs / profit
  const rentM = +state.costs.rentMonthly || 0;
  const elecM = +state.costs.elecMonthly || 0;
  const fixedM = rentM + elecM + payroll;
  const netM = S - matM - rentM - elecM - payroll;
  const marginM = S > 0 ? netM / S : 0;
  const netFixedPay = S - matM - rentM - elecM - payrollFixed;

  // 6. Investment / allocation
  let needs = 0, reserveCash = 0;
  const D = { rentM, elecM, payrollFloor, matM };
  state.invest.buckets.forEach((b) => {
    b._amt = bucketAmount(b, D);
    needs += b._amt;
    if (b.mode === "months" && (b.basis === "rent" || b.basis === "payroll" || b.basis === "elec")) {
      reserveCash += b._amt;
    }
  });
  const invTotal = state.invest.auto ? autoInvestment(state, D) : +state.invest.total || 0;
  const surplus = invTotal - needs;
  const burnZero = rentM + elecM + payrollFloor;
  const runway = burnZero > 0 ? reserveCash / burnZero : 0;

  // 7. Historical reconciliation
  const sal6 = payrollStandard * 6;
  const hist = {
    sales: rev6,
    material: mat6,
    rent: 68000,
    elec: 30000,
    sal: sal6,
  };
  hist.fixed = hist.rent + hist.elec + hist.sal;
  hist.net = hist.sales - hist.material - hist.fixed;
  hist.margin = hist.sales > 0 ? hist.net / hist.sales : 0;

  return {
    rate,
    S,
    base,
    rev6,
    mat6,
    materialMonthly: matM,
    reqHoursMonthly: hoursM,
    qtyMonthly: qtyTot,
    byGroup,
    availHours: avail,
    nLabor: nLab,
    util,
    ceilingSales,
    totalGap,
    payrollFloor,
    payrollStandard,
    payrollFixed,
    payrollRamp,
    payroll,
    rentM,
    elecM,
    fixedM,
    netM,
    marginM,
    netFixedPay,
    needs,
    invTotal,
    surplus,
    reserveCash,
    burnZero,
    runway,
    hist,
  };
}

function bucketAmount(b, D) {
  if (b.mode === "fixed") return +b.value || 0;
  const m = +b.months || 0;
  const basisMonthly =
    b.basis === "rent"
      ? D.rentM
      : b.basis === "payroll"
      ? D.payrollFloor
      : b.basis === "material"
      ? D.matM
      : b.basis === "elec"
      ? D.elecM
      : 0;
  return m * basisMonthly;
}

function autoInvestment(state, D) {
  return (
    D.rentM * 3 +
    D.elecM * 3 +
    D.payrollFloor * 3 +
    200000 +
    100000 +
    100000
  );
}

export function payFor(e, sales, state, forcedModel) {
  const model = forcedModel ?? e.salaryModel ?? state.salary.model;
  const basic = +e.basic || 0;
  const standard = +e.standard || 0;
  const gap = Math.max(0, standard - basic);
  const S0 = (+state.salary.S0) || 1;
  const mult = +state.salary.multiplier || 0;
  const S = Math.max(0, +sales || 0);

  if (model === "0") return standard;

  // Model 1: Ramp & Multiplier
  if (S <= S0) {
    const r = S0 > 0 ? S / S0 : 0;
    return Math.max(basic, basic + gap * r);
  } else {
    const above = S0 > 0 ? (S - S0) / S0 : 0;
    return Math.max(basic, standard + gap * mult * above);
  }
}

function payrollAt(sales, state, forcedModel) {
  return state.employees.reduce((a, e) => a + payFor(e, sales, state, forcedModel), 0);
}

export function breakEvenSales(e, state) {
  // Binary search for sales level where payFor(e, sales) >= e.standard
  let lo = 0, hi = (state.salary.S0 || 1) * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (payFor(e, mid, state) < e.standard - 0.5) lo = mid;
    else hi = mid;
  }
  return hi;
}
