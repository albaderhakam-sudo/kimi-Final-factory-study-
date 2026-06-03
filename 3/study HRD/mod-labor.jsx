/* ===== Module: Labor capacity & utilization ===== */
(function(){
const { RDFChart, PAL, baseOpts } = window.RDFCharts;

function LaborModule(){
  const R = window.RDF.useRDF();
  const { S, set, model, t } = R;

  const labor = S.employees.filter(e=>e.group==='Labor');
  const util = model.utilization;
  const headroom = model.availableHours - model.totalReqHours;
  const ceilVsNow = model.T>0 ? (model.ceilingT/model.T - 1)*100 : 0;

  const byGroup={};
  model.plan.forEach(p=>{ byGroup[p.group]=(byGroup[p.group]||0)+p.hours; });
  const groupHours = Object.entries(byGroup).filter(([,h])=>h>0.5).sort((a,b)=>b[1]-a[1]);

  const scen = [
    {k:t('worst',{f:S.flexPct}), tt:window.RDF_worst(S)},
    {k:t('base'), tt:Math.round(S.baseMonthlySales)},
    {k:'+20%', tt:Math.round(S.baseMonthlySales*1.2)},
    {k:'+30%', tt:Math.round(S.baseMonthlySales*1.3)},
    {k:t('best',{f:S.flexPct}), tt:window.RDF_best(S)},
  ].map(s=>{ const m=R.computeAt({salesOverride:s.tt}); return {...s, util:m.utilization}; });

  function updLabor(id,patch){ set(prev=>({employees:prev.employees.map(e=>e.id===id?{...e,...patch}:e)})); }
  const utilColor = util>1?'var(--red)':util>0.85?'var(--brass)':'var(--emer)';

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('lb_title')}<span className="tag">{t('lb_tag')}</span></h2>
          <p>{t('lb_intro')}</p>
        </div>
      </div>

      <div className="kpis" style={{marginBottom:'16px'}}>
        <div className="kpi" style={{borderColor:utilColor}}>
          <div className="lab">{t('lb_util')}</div>
          <div className="val" style={{color:utilColor}}>{R.fmtPct(util,0)}</div>
          <div className="sub">{t('lb_of_hrs',{r:R.fmtNum(model.totalReqHours,0),a:R.fmtNum(model.availableHours,0)})}</div>
        </div>
        <div className="kpi">
          <div className="lab">{headroom>=0?t('lb_spare'):t('lb_short')}</div>
          <div className={'val '+(headroom>=0?'pos':'neg')}>{R.fmtNum(Math.abs(headroom),0)}</div>
          <div className="sub">{headroom>=0?t('lb_slack'):t('lb_ot')}</div>
        </div>
        <div className="kpi accent">
          <div className="lab">{t('lb_ceiling')}</div>
          <div className="val num">{R.fmtMoney(model.ceilingT)}</div>
          <div className="sub">{t('lb_ceiling_sub',{d:(ceilVsNow>=0?'+':'')+ceilVsNow.toFixed(0)})}</div>
        </div>
        <div className="kpi">
          <div className="lab">{t('lb_crew')}</div>
          <div className="val num">{labor.length}</div>
          <div className="sub">{t('lb_crew_sub',{a:R.fmtNum(model.availableHours,0)})}</div>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1.1fr 1fr',alignItems:'start'}}>
        <div className="card">
          <div className="card-h">{t('lb_avail')}</div>
          <p className="card-sub">{t('lb_avail_sub')}</p>
          <div className="field" style={{maxWidth:'180px',marginBottom:'14px'}}>
            <label>{t('lb_days')}</label>
            <input className="inp" type="number" value={S.laborDaysPerMonth} onChange={e=>set({laborDaysPerMonth:+e.target.value||0})} />
          </div>
          <table className="tbl">
            <thead><tr><th className="l">{t('person')}</th><th className="l">{t('role')}</th><th>{t('th_hpd')}</th><th>{t('th_hpm')}</th></tr></thead>
            <tbody>
              {labor.map(e=>(
                <tr key={e.id}>
                  <td className="l">{e.name}</td>
                  <td className="l grp">{R.dispPos(e)}</td>
                  <td><input className="inp" style={{width:'64px'}} type="number" value={e.availHoursPerDay} onChange={ev=>updLabor(e.id,{availHoursPerDay:+ev.target.value||0})} /></td>
                  <td className="num">{R.fmtNum((e.availHoursPerDay||0)*S.laborDaysPerMonth,0)}</td>
                </tr>
              ))}
              <tr className="sum"><td className="l">{t('lb_total_avail')}</td><td></td><td></td><td className="num">{R.fmtNum(model.availableHours,0)}</td></tr>
            </tbody>
          </table>
          <div className={'note mt16 '+(util<=1?'emer':'red')}>
            {util<=1
              ? <span>{t('lb_note_ok',{util:R.fmtPct(util,0),d:ceilVsNow.toFixed(0),ceil:R.fmtMoney(model.ceilingT)})}</span>
              : <span>{t('lb_note_over',{h:R.fmtNum(-headroom,0)})}</span>}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:'16px'}}>
            <div className="card-h">{t('lb_util_scn')}</div>
            <p className="card-sub">{t('lb_util_scn_sub')}</p>
            <RDFChart type="bar" height={210}
              data={{labels:scen.map(s=>s.k),datasets:[{
                data:scen.map(s=>+(s.util*100).toFixed(0)),
                backgroundColor:scen.map(s=>s.util>1?'#b3402e':s.util>0.85?'#b1801f':'#1F6F54'),
                borderColor:'#1a1813',borderWidth:1.5}]}}
              options={baseOpts({scales:{y:{beginAtZero:true,suggestedMax:120,grid:{color:'#ddd6c5'},ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}},
                plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y+'%'}}}})} />
          </div>
          <div className="card">
            <div className="card-h">{t('lb_hrs_grp')} <span className="grp num">{t('lb_at_target')}</span></div>
            <table className="tbl mt8">
              <thead><tr><th className="l">{t('group')}</th><th>{t('th_hrs_mo')}</th><th>{t('th_share')}</th></tr></thead>
              <tbody>
                {groupHours.map(([g,h])=>(
                  <tr key={g}><td className="l">{g}</td><td className="num">{R.fmtNum(h,1)}</td>
                    <td className="num">{model.totalReqHours>0?(h/model.totalReqHours*100).toFixed(1):0}%</td></tr>
                ))}
                <tr className="sum"><td className="l">{t('lb_total_req')}</td><td className="num">{R.fmtNum(model.totalReqHours,0)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LaborModule = LaborModule;
})();
