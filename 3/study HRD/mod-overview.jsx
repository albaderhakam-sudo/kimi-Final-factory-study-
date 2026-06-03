/* ===== Module: Overview (dashboard home) ===== */
(function(){
function OverviewModule({goTo}){
  const R = window.RDF.useRDF();
  const { S, model, t } = R;

  // historical reconciliation (Model 0, historical fixed costs) — the ground-truth check
  const histSales = model.sixMo;
  const histMaterial = S.products.reduce((s,p)=> s + p.qty*p.rawCost, 0);
  const histSalaries = S.employees.reduce((s,e)=>s+e.currentPay,0)*6;
  const histFixed = 68000 + 30000 + histSalaries;
  const histNet = histSales - histMaterial - histFixed;
  const GT = { sales:2017193, material:1031503, fixed:586538, net:399152 };
  const ok = Math.abs(histNet-GT.net) < 1000;

  const payrollFloor = S.employees.reduce((s,e)=>s+e.basic,0);
  const rentMonthly=S.rentPerYear/12;
  const allocated = S.allocation.reduce((s,b)=>{
    if(b.kind==='reserve'){const m=b.source==='rent'?rentMonthly:payrollFloor;return s+(b.months||0)*m;} return s+(b.amount||0);
  },0);
  const available = S.totalInvestment-allocated;

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('ov_title')}</h2>
          <p>{t('ov_intro')}</p>
        </div>
      </div>

      <div className="card accent" style={{marginBottom:'16px',padding:'30px 32px'}}>
        <div className="eyebrow" style={{color:'rgba(255,255,255,.8)'}}>{t('ov_at',{sales:R.fmtMoney(model.T),pct:(model.T/model.base*100).toFixed(0),m:S.salaryModel})}</div>
        <div className="bignum" style={{fontSize:'46px',lineHeight:1.05,marginTop:'10px'}}>
          {t(model.net>=0?'ov_nets':'ov_loses',{x:R.fmtMoney(Math.abs(model.net))})}<span style={{fontSize:'22px',opacity:.85}}>{t('ov_permonth')}</span>
        </div>
        <div style={{fontSize:'14px',opacity:.9,marginTop:'8px'}}>
          {t('ov_hero_sub',{margin:R.fmtPct(model.margin),pay:R.fmtMoney(model.totalPayroll),paypct:R.fmtPct(model.payrollPctSales),util:R.fmtPct(model.utilization,0)})}
        </div>
      </div>

      <div className="kpis" style={{marginBottom:'16px'}}>
        <ClickKpi onClick={()=>goTo('investment')} lab={t('kpi_total_investment')} val={R.fmtMoney(S.totalInvestment)} sub={t('kpi_after_alloc',{x:(available>=0?'+':'')+R.fmtMoney(available)})} />
        <ClickKpi onClick={()=>goTo('production')} lab={t('kpi_base_sales')} val={R.fmtMoney(model.base)} sub={t('kpi_6mo6')} />
        <ClickKpi onClick={()=>goTo('labor')} lab={t('kpi_labor_util')} val={R.fmtPct(model.utilization,0)} sub={t('kpi_ceiling',{x:R.fmtMoney(model.ceilingT)})} />
        <ClickKpi onClick={()=>goTo('salary')} lab={t('kpi_payroll_target')} val={R.fmtMoney(model.totalPayroll)} sub={t('kpi_model_vs',{m:S.salaryModel,d:(model.totalPayroll>=model.todayPayroll?'+':'')+R.fmtPct(model.totalPayroll/model.todayPayroll-1,0)})} />
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',alignItems:'start'}}>
        <div className="card">
          <div className="card-h">{t('ov_scn')} <span className="grp num">±{S.flexPct}%</span></div>
          <p className="card-sub">{t('ov_scn_sub')}</p>
          <table className="tbl mt8">
            <thead><tr><th className="l">{t('scenario')}</th><th>{t('monthly_sales_c')}</th><th>{t('net_per_mo')}</th><th>{t('margin_c')}</th></tr></thead>
            <tbody>
              {[
                {k:t('worst',{f:S.flexPct}), tt:window.RDF_worst(S)},
                {k:t('base'), tt:Math.round(S.baseMonthlySales)},
                {k:t('target20'), tt:Math.round(S.baseMonthlySales*1.2)},
                {k:t('best',{f:S.flexPct}), tt:window.RDF_best(S)},
              ].map(s=>{ const m=R.computeAt({salesOverride:s.tt}); return (
                <tr key={s.k}><td className="l">{s.k}</td><td className="num">{R.fmtMoney(s.tt)}</td>
                  <td className="num" style={{color:m.net>=0?'var(--emer)':'var(--red)',fontWeight:600}}>{R.fmtMoney(m.net)}</td>
                  <td className="num">{R.fmtPct(m.margin)}</td></tr>
              );})}
            </tbody>
          </table>
        </div>

        <div className="card" style={{borderColor:ok?'var(--emer)':'var(--red)'}}>
          <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div className="card-h" style={{margin:0}}>{t('ov_check')}</div>
            <span className="pill emer" style={{borderColor:ok?'var(--emer)':'var(--red)',color:ok?'var(--emer)':'var(--red)'}}>{ok?t('ov_reconciles'):t('ov_off')}</span>
          </div>
          <p className="card-sub mt8">{t('ov_check_sub')}</p>
          <table className="tbl">
            <thead><tr><th className="l">{t('ov_6mo_actual')}</th><th>{t('ov_this_model')}</th><th>{t('ov_documented')}</th></tr></thead>
            <tbody>
              <tr><td className="l">{t('row_sales')}</td><td className="num">{R.fmtNum(Math.round(histSales))}</td><td className="num muted">{R.fmtNum(GT.sales)}</td></tr>
              <tr><td className="l">{t('row_material')}</td><td className="num">{R.fmtNum(Math.round(histMaterial))}</td><td className="num muted">{R.fmtNum(GT.material)}</td></tr>
              <tr><td className="l">{t('row_fixed')}</td><td className="num">{R.fmtNum(Math.round(histFixed))}</td><td className="num muted">{R.fmtNum(GT.fixed)}</td></tr>
              <tr className="sum"><td className="l">{t('row_net')}</td><td className="num" style={{color:'var(--emer)'}}>{R.fmtNum(Math.round(histNet))}</td><td className="num muted">{R.fmtNum(GT.net)}</td></tr>
            </tbody>
          </table>
          <p className="grp mt8">{t('ov_check_note')}</p>
        </div>
      </div>
    </div>
  );
}

function ClickKpi({onClick,lab,val,sub}){
  return (
    <button className="kpi" onClick={onClick} style={{textAlign:'left',cursor:'pointer',font:'inherit'}}>
      <div className="lab">{lab} <span style={{color:'var(--muted2)'}}>→</span></div>
      <div className="val num">{val}</div>
      <div className="sub">{sub}</div>
    </button>
  );
}

window.OverviewModule = OverviewModule;
})();
