/* ===== Salary Lab: Owner comparison + Employee "today vs new" views ===== */
(function(){
const { RDFChart, PAL, baseOpts } = window.RDFCharts;
const MODELS = window.RDF.SALARY_MODELS;
const MODEL_COLOR = { M0:'#6f6857', A:'#1F6F54', B:'#b1801f', C:'#155741', D:'#a8581e' };
const mk = id => 'm'+(id==='M0'?'0':id);

function SalaryOwnerView({R}){
  const { S, t } = R;
  const worst=window.RDF_worst(S), base=Math.round(S.baseMonthlySales), best=window.RDF_best(S);

  const N=11;
  const xs=Array.from({length:N},(_,i)=>Math.round(worst+(best-worst)*i/(N-1)));
  const datasets = MODELS.map(m=>({
    label:t(mk(m.id)+'_short'),
    data: xs.map(tt=>Math.round(R.computeAt({salesOverride:tt,modelOverride:m.id}).totalPayroll)),
    borderColor:MODEL_COLOR[m.id], backgroundColor:MODEL_COLOR[m.id],
    borderWidth: m.id===S.salaryModel?3:1.5, tension:.25,
    pointRadius: m.id===S.salaryModel?3:0, borderDash: m.id==='M0'?[5,4]:[],
  }));

  const rows = MODELS.map(m=>{
    const pb=R.computeAt({salesOverride:base,modelOverride:m.id});
    const pw=R.computeAt({salesOverride:worst,modelOverride:m.id});
    const pB=R.computeAt({salesOverride:best,modelOverride:m.id});
    return { m, payBase:pb.totalPayroll, payWorst:pw.totalPayroll, payBest:pB.totalPayroll,
      pctBase:pb.payrollPctSales, netBase:pb.net, netWorst:pw.net,
      protected: pb.totalPayroll - pw.totalPayroll };
  });

  return (
    <div>
      <div className="card" style={{marginBottom:'16px'}}>
        <div className="card-h">{t('ow_chart')}</div>
        <p className="card-sub">{t('ow_chart_sub')}</p>
        <RDFChart type="line" height={300}
          data={{labels:xs.map(tt=>R.fmtMoney(tt)),datasets}}
          options={baseOpts({interaction:{mode:'index',intersect:false},
            scales:{y:{grid:{color:'#ddd6c5'},ticks:{callback:v=>R.fmtMoney(v)}},x:{grid:{display:false}}},
            plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:14,font:{size:10}}},
              tooltip:{callbacks:{label:c=>c.dataset.label+': '+R.fmtMoney(c.parsed.y)}}}})} />
      </div>

      <div className="card">
        <div className="card-h">{t('ow_ledger')}</div>
        <p className="card-sub">{t('ow_ledger_sub')}</p>
        <table className="tbl mt8">
          <thead><tr>
            <th className="l">{t('th_model')}</th>
            <th>{t('th_pay_worst')}</th><th>{t('th_pay_base')}</th><th>{t('th_pay_best')}</th>
            <th>{t('th_pct_sales')}</th><th>{t('th_net_base')}</th><th>{t('th_net_worst')}</th><th>{t('th_protected')}</th>
          </tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.m.id} style={r.m.id===S.salaryModel?{background:'rgba(31,111,84,.07)'}:null}>
                <td className="l">
                  <span className="swatch" style={{background:MODEL_COLOR[r.m.id],display:'inline-block',marginRight:'8px',verticalAlign:'middle'}}></span>
                  {t(mk(r.m.id)+'_short')}{r.m.id===S.salaryModel && <span className="pill emer" style={{marginLeft:'8px'}}>{t('active')}</span>}
                </td>
                <td className="num">{R.fmtMoney(r.payWorst)}</td>
                <td className="num">{R.fmtMoney(r.payBase)}</td>
                <td className="num">{R.fmtMoney(r.payBest)}</td>
                <td className="num">{R.fmtPct(r.pctBase)}</td>
                <td className="num" style={{color:r.netBase>=0?'var(--emer)':'var(--red)'}}>{R.fmtMoney(r.netBase)}</td>
                <td className="num" style={{color:r.netWorst>=0?'var(--emer)':'var(--red)'}}>{R.fmtMoney(r.netWorst)}</td>
                <td className="num">{r.m.id==='M0'?'—':R.fmtMoney(r.protected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalaryEmployeeView({R}){
  const { S, model, t } = R;
  const activeName = t(mk(S.salaryModel)+'_name');
  const groups = [ {key:'Labor', title:t('ev_labor')}, {key:'Employee', title:t('ev_admin')} ];
  return (
    <div>
      <div className="note emer" style={{marginBottom:'16px'}}>
        {t('ev_note',{model:activeName})}
      </div>
      {groups.map(g=>{
        const people = model.people.filter(p=>p.group===g.key);
        if(!people.length) return null;
        const maxPay = Math.max(...model.people.map(p=>Math.max(p.pay,p.currentPay)));
        return (
          <div className="card" key={g.key} style={{marginBottom:'16px'}}>
            <div className="card-h">{g.title}</div>
            <table className="tbl mt8">
              <thead><tr>
                <th className="l">{t('person')}</th><th>{t('th_basic')}</th><th>{t('th_today')}</th>
                <th>{t('th_at_target')}</th><th>{t('th_change')}</th><th className="l" style={{width:'200px'}}>{t('th_today_new')}</th><th>{t('th_sales_match')}</th>
              </tr></thead>
              <tbody>
                {people.map(p=>{
                  const be=R.breakEvenSales(p);
                  const tW=Math.round((p.currentPay/maxPay)*180);
                  const nW=Math.round((p.pay/maxPay)*180);
                  return (
                    <tr key={p.id}>
                      <td className="l">{p.name}<div className="grp">{R.dispPos(p)}</div></td>
                      <td className="num">{R.fmtMoney(p.basic)}</td>
                      <td className="num">{R.fmtMoney(p.currentPay)}</td>
                      <td className="num" style={{fontWeight:700}}>{R.fmtMoney(p.pay)}</td>
                      <td className="num" style={{color:p.deltaVsToday>=0?'var(--emer)':'var(--red)'}}>
                        {p.deltaVsToday>=0?'+':''}{R.fmtPct(p.currentPay>0?p.deltaVsToday/p.currentPay:0,0)}
                      </td>
                      <td className="l">
                        <div style={{width:tW+'px'}} className="bar today">{R.fmtMoney(p.currentPay)}</div>
                        <div style={{width:nW+'px'}} className="bar new">{R.fmtMoney(p.pay)}</div>
                      </td>
                      <td className="num">{be<=0?<span className="muted">{t('ev_floor_ge')}</span>:R.fmtMoney(be)}</td>
                    </tr>
                  );
                })}
                <tr className="sum">
                  <td className="l">{t('ev_group_payroll')}</td>
                  <td></td>
                  <td className="num">{R.fmtMoney(people.reduce((s,p)=>s+p.currentPay,0))}</td>
                  <td className="num">{R.fmtMoney(people.reduce((s,p)=>s+p.pay,0))}</td>
                  <td colSpan="3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

window.SalaryOwnerView = SalaryOwnerView;
window.SalaryEmployeeView = SalaryEmployeeView;
window.MODEL_COLOR = MODEL_COLOR;
window.RDF_mk = mk;
})();
