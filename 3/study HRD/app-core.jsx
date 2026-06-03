/* ============================================================
   RED DRAGON FACTORY — core engine, state, formulas
   Exposes window.RDF = { Provider, useRDF, fmt..., SALARY_MODELS, ... }
   ============================================================ */
(function(){
const { createContext, useContext, useState, useEffect, useMemo, useCallback } = React;

const STORE_KEY = 'rdf_state_v1';
const D = window.RDF_DATA;

/* ---------------- defaults ---------------- */
function freshProducts(){ return D.products.map(p=>({...p})); }
const POS_KEY = {'General Manager':'pos_gm','GM Assistant':'pos_gma','Factory Manager':'pos_fm','Accountant':'pos_acct','HR':'pos_hr','Welder':'pos_welder','Labor (retired)':'pos_labor_ret','QC':'pos_qc','Labor':'pos_labor','Machinery man':'pos_mach'};
function freshEmployees(){
  return D.employees.map(e=>({
    id:e.id, name:e.name, position:e.position, posKey:POS_KEY[e.position]||null, posDirty:false,
    currentPay:e.basic,            // today's fixed pay (Model 0 reference, immutable-ish)
    basic:e.basic,                 // editable floor
    group:e.group,                 // 'Employee' (admin) | 'Labor' (production)
    availHoursPerDay:e.availHoursPerDay||0,
  }));
}

const DEFAULT_TIERS = [
  { pct:70,  label:'Survival' },
  { pct:100, label:'Base' },
  { pct:120, label:'Target' },
  { pct:150, label:'Stretch' },
];

function sixMoTotal(products, fx){
  return products.reduce((s,p)=> s + (p.priceUSD!=null ? p.qty * p.priceUSD * fx : 0), 0);
}

function defaultAllocation(){
  return [
    { id:'a1', name:'Machinery',      nameKey:'bk_machinery',  nameDirty:false, kind:'fixed',   amount:900000 },
    { id:'a2', name:'Assets & tooling',nameKey:'bk_assets',    nameDirty:false, kind:'fixed',  amount:450000 },
    { id:'a3', name:'Raw materials',  nameKey:'bk_raw',        nameDirty:false, kind:'fixed',   amount:350000 },
    { id:'a4', name:'Fixed cost setup',nameKey:'bk_fixed',     nameDirty:false, kind:'fixed',  amount:120000 },
    { id:'a5', name:'Rent reserve',   nameKey:'bk_rent',       nameDirty:false, kind:'reserve', source:'rent',    months:3 },
    { id:'a6', name:'Salary reserve', nameKey:'bk_salary',     nameDirty:false, kind:'reserve', source:'payroll', months:3 },
    { id:'a7', name:'Contingency',    nameKey:'bk_contingency',nameDirty:false, kind:'fixed',   amount:150000 },
  ];
}

function makeDefaultState(){
  const products = freshProducts();
  const fx = D.meta.fx;
  const base = Math.round(sixMoTotal(products, fx) / D.meta.months);
  return {
    fx,
    currency:'CNY',
    lang:'en',
    products,
    employees: freshEmployees(),
    laborDaysPerMonth: 26,
    baseMonthlySales: base,           // 6-mo ÷ 6 (editable)
    monthlySalesTarget: base,         // live slider value (T)
    flexPct: 50,                      // ± worst/best
    rentPerYear: D.meta.rentPerYear,
    electricityPerMonth: D.meta.electricityPerMonth,
    totalInvestment: 3000000,
    allocation: defaultAllocation(),
    salaryModel: 'C',
    tiers: DEFAULT_TIERS.map(t=>({...t})),
    params: {
      A: { poolPctByTier:[0, 6, 10, 14] },        // % of monthly sales into bonus pool, shared by basic-weight
      B: { upliftByTier:[0, 8, 20, 32] },         // % uplift over basic (interpolated)
      C: { upliftByTier:[0, 10, 25, 40] },        // % uplift over basic (stepped)
      D: { upliftByTier:[0, 6, 16, 28], poolPctByTier:[0, 3, 6, 9] },
    },
  };
}

/* ---------------- tier helpers ---------------- */
// ratio in percent-of-base (e.g. 100 = base). returns interpolated value across tier array
function tierInterp(tiers, arr, ratioPct){
  if(ratioPct<=tiers[0].pct) return arr[0];
  for(let i=0;i<tiers.length-1;i++){
    if(ratioPct<=tiers[i+1].pct){
      const t=(ratioPct - tiers[i].pct)/(tiers[i+1].pct - tiers[i].pct);
      return arr[i] + t*(arr[i+1]-arr[i]);
    }
  }
  return arr[arr.length-1];
}
// stepped: value of the highest tier whose pct <= ratio
function tierStep(tiers, arr, ratioPct){
  let v=arr[0];
  for(let i=0;i<tiers.length;i++){ if(ratioPct>=tiers[i].pct) v=arr[i]; }
  return v;
}
function activeTier(tiers, ratioPct){
  let idx=0;
  for(let i=0;i<tiers.length;i++){ if(ratioPct>=tiers[i].pct) idx=i; }
  return idx;
}

/* ---------------- salary: pay for one person at sales T ---------------- */
// totalBasicAll passed so pool can be distributed by basic-weight
function payFor(person, model, S, T, totalBasicAll){
  const basic = person.basic;
  if(model==='M0') return person.currentPay; // baseline = today's fixed
  const base = S.baseMonthlySales || 1;
  const ratioPct = (T/base)*100;
  const tiers = S.tiers;
  let pay = basic;
  if(model==='A'){
    const poolPct = tierInterp(tiers, S.params.A.poolPctByTier, ratioPct)/100; // % of monthly sales into the bonus pool
    const pool = poolPct * T;
    pay = basic + pool * (basic/totalBasicAll);
  } else if(model==='B'){
    const up = tierInterp(tiers, S.params.B.upliftByTier, ratioPct)/100;
    pay = basic*(1+up);
  } else if(model==='C'){
    const up = tierStep(tiers, S.params.C.upliftByTier, ratioPct)/100;
    pay = basic*(1+up);
  } else if(model==='D'){
    const up = tierInterp(tiers, S.params.D.upliftByTier, ratioPct)/100;
    const poolPct = tierInterp(tiers, S.params.D.poolPctByTier, ratioPct)/100;
    const pool = poolPct * T;
    pay = basic*(1+up) + pool*(basic/totalBasicAll);
  }
  return Math.max(basic, pay);
}

/* ---------------- main compute ---------------- */
function compute(S, opts={}){
  const fx = S.fx;
  const months = D.meta.months;
  const products = S.products;
  const T = opts.salesOverride!=null ? opts.salesOverride : S.monthlySalesTarget;
  const model = opts.modelOverride || S.salaryModel;

  // 6-mo totals & mix
  let sixMo = 0;
  const priced = products.map(p=>{
    const priceCNY = p.priceUSD!=null ? p.priceUSD*fx : 0;
    const rev6 = p.qty * priceCNY;
    sixMo += rev6;
    return { ...p, priceCNY, rev6 };
  });
  const base = sixMo/months;

  // production plan for target T (scale by revenue share)
  let totalMaterial=0, totalReqHours=0, totalQty=0, planRevenue=0;
  const plan = priced.map(p=>{
    const share = sixMo>0 ? p.rev6/sixMo : 0;
    const itemRev = share*T;
    const qty = p.priceCNY>0 ? itemRev/p.priceCNY : 0;
    const material = qty*p.rawCost;
    const hours = qty*p.hoursPerPc;
    totalMaterial+=material; totalReqHours+=hours; totalQty+=qty; planRevenue+=itemRev;
    return { ...p, share, itemRev, qty, material, hours };
  });

  // labor capacity
  const labor = S.employees.filter(e=>e.group==='Labor');
  const admin = S.employees.filter(e=>e.group==='Employee');
  const availableHours = labor.reduce((s,e)=> s + (e.availHoursPerDay||0)*S.laborDaysPerMonth, 0);
  const utilization = availableHours>0 ? totalReqHours/availableHours : 0;
  // ceiling: T at which utilization=100% (hours scale linearly with T)
  const ceilingT = totalReqHours>0 ? T * (availableHours/totalReqHours) : Infinity;

  // payroll under model
  const totalBasicAll = S.employees.reduce((s,e)=>s+e.basic,0) || 1;
  const people = S.employees.map(e=>{
    const pay = payFor(e, model, S, T, totalBasicAll);
    return { ...e, pay, deltaVsToday: pay - e.currentPay };
  });
  const totalPayroll = people.reduce((s,p)=>s+p.pay,0);
  const todayPayroll = S.employees.reduce((s,e)=>s+e.currentPay,0);

  // costs (monthly)
  const rent = S.rentPerYear/12;
  const electricity = S.electricityPerMonth;
  const net = T - totalMaterial - rent - electricity - totalPayroll;
  const margin = T>0 ? net/T : 0;
  const payrollPctSales = T>0 ? totalPayroll/T : 0;

  return {
    fx, months, T, base, sixMo, model,
    plan, totalMaterial, totalReqHours, totalQty, planRevenue,
    labor, admin, availableHours, utilization, ceilingT,
    people, totalPayroll, todayPayroll,
    rent, electricity, net, margin, payrollPctSales, totalBasicAll,
  };
}

/* break-even sales for a person under current model: T where pay==currentPay */
function breakEvenSales(person, S){
  const total = S.employees.reduce((s,e)=>s+e.basic,0)||1;
  if(person.basic >= person.currentPay) return 0; // floor already ≥ today
  let lo=0, hi=S.baseMonthlySales*4;
  for(let i=0;i<40;i++){
    const mid=(lo+hi)/2;
    const pay=payFor(person, S.salaryModel, S, mid, total);
    if(pay < person.currentPay) lo=mid; else hi=mid;
  }
  return Math.round(hi);
}

/* ---------------- formatting ---------------- */
function fmtMoney(cny, S, opts={}){
  const v = S.currency==='USD' ? cny/S.fx : cny;
  const sym = S.currency==='USD' ? '$' : '¥';
  const dp = opts.dp!=null ? opts.dp : (S.currency==='USD' ? (Math.abs(v)<100?2:0) : 0);
  const sign = v<0?'-':'';
  const n = Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:dp,maximumFractionDigits:dp});
  return sign+sym+n;
}
function fmtNum(n, dp=0){ return Number(n).toLocaleString('en-US',{minimumFractionDigits:dp,maximumFractionDigits:dp}); }
function fmtPct(x, dp=1){ return (x*100).toFixed(dp)+'%'; }
function fmtSign(x){ return x>=0?'+'+fmtNum(Math.round(x)):fmtNum(Math.round(x)); }

/* ---------------- provider ---------------- */
const Ctx = createContext(null);

function Provider({children}){
  const [S, setSraw] = useState(()=>{
    try{
      const saved = localStorage.getItem(STORE_KEY);
      if(saved){ return {...makeDefaultState(), ...JSON.parse(saved)}; }
    }catch(e){}
    return makeDefaultState();
  });
  const [saved, setSaved] = useState(true);

  const set = useCallback((patch)=>{
    setSraw(prev=>{ const next = typeof patch==='function'?{...prev,...patch(prev)}:{...prev,...patch}; return next; });
    setSaved(false);
  },[]);

  // autosave (debounced)
  useEffect(()=>{
    const id=setTimeout(()=>{
      try{ localStorage.setItem(STORE_KEY, JSON.stringify(S)); setSaved(true); }catch(e){}
    }, 400);
    return ()=>clearTimeout(id);
  },[S]);

  const model = useMemo(()=>compute(S),[S]);

  const t = useCallback((key,vars)=>{
    const en = window.RDF_I18N.en, dict = window.RDF_I18N[S.lang]||en;
    let s = dict[key]!=null ? dict[key] : (en[key]!=null ? en[key] : key);
    if(vars){ for(const k in vars){ s = s.split('{'+k+'}').join(vars[k]); } }
    return s;
  },[S.lang]);

  const api = {
    S, set, saved, t, lang:S.lang,
    model,
    computeAt:(opts)=>compute(S,opts),
    breakEvenSales:(p)=>breakEvenSales(p,S),
    payFor:(p,m,T)=>payFor(p,m,S,T,S.employees.reduce((s,e)=>s+e.basic,0)||1),
    reset:()=>{ if(confirm(t('reset_confirm'))){ const d=makeDefaultState(); d.lang=S.lang; setSraw(d); setSaved(false); } },
    exportJSON:()=>{
      const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
      a.download='red-dragon-factory-dataset.json'; a.click();
    },
    importJSON:(file)=>{
      const r=new FileReader();
      r.onload=()=>{ try{ const obj=JSON.parse(r.result); setSraw({...makeDefaultState(),...obj}); setSaved(false); alert(t('json_ok')); }catch(e){ alert(t('json_err')); } };
      r.readAsText(file);
    },
    fmtMoney:(v,o)=>fmtMoney(v,S,o),
    fmtNum, fmtPct, fmtSign,
    dispPos:(e)=> (e.posKey && !e.posDirty) ? t(e.posKey) : e.position,
    dispName:(b)=> (b.nameKey && !b.nameDirty) ? t(b.nameKey) : b.name,
    tierInterp, tierStep, activeTier,
  };
  return React.createElement(Ctx.Provider,{value:api},children);
}
function useRDF(){ return useContext(Ctx); }

window.RDF = {
  Provider, useRDF, compute, makeDefaultState,
  SALARY_MODELS:[
    {id:'M0', name:'Current fixed', short:'0 · Fixed', desc:"Today's pay. The baseline everyone is on now."},
    {id:'A',  name:'Basic + share of sales', short:'A · Share', desc:'A bonus pool worth a % of monthly sales, shared in proportion to base salary. Everyone shares the upside.'},
    {id:'B',  name:'Basic + uplift ramp', short:'B · Ramp', desc:'Pay = basic × (1 + uplift%). Uplift climbs smoothly as sales rise toward stretch.'},
    {id:'C',  name:'Tiered targets', short:'C · Tiered', desc:'Cross a sales target, jump a pay tier. The strongest "sell more, earn more" signal.'},
    {id:'D',  name:'Custom mix', short:'D · Custom', desc:'Blend an uplift ramp with a sales-share pool. Tune both.'},
  ],
};
})();
