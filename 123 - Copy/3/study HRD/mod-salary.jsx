/* ===== Module: Salary Model Lab (centerpiece) ===== */
(function(){
const { useState } = React;
const MODELS = window.RDF.SALARY_MODELS;
const mk = id => 'm'+(id==='M0'?'0':id);

function SalaryModule(){
  const R = window.RDF.useRDF();
  const { S, set, t } = R;
  const [view,setView]=useState('lab');

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('sl_title')}<span className="tag emer">{t('sl_tag')}</span></h2>
          <p>{t('sl_intro')}</p>
        </div>
        <div className="viewtog no-print">
          <button className={view==='lab'?'on':''} onClick={()=>setView('lab')}>{t('sl_v_lab')}</button>
          <button className={view==='owner'?'on':''} onClick={()=>setView('owner')}>{t('sl_v_owner')}</button>
          <button className={view==='employee'?'on':''} onClick={()=>setView('employee')}>{t('sl_v_emp')}</button>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(5,1fr)',marginBottom:'16px'}}>
        {MODELS.map(m=>(
          <button key={m.id} onClick={()=>set({salaryModel:m.id})}
            style={{textAlign:'left',padding:'14px 15px',cursor:'pointer',
              background:m.id===S.salaryModel?'var(--emer)':'var(--card)',
              color:m.id===S.salaryModel?'#fff':'var(--ink)',
              border:'1.5px solid '+(m.id===S.salaryModel?'var(--emer)':'var(--ink)')}}>
            <div className="mono" style={{fontSize:'10px',letterSpacing:'.1em',opacity:.7}}>{t(mk(m.id)+'_short').split('·')[0]}</div>
            <div className="disp" style={{fontWeight:700,fontSize:'14px',margin:'4px 0',lineHeight:1.1}}>{t(mk(m.id)+'_name')}</div>
          </button>
        ))}
      </div>
      <div className="note" style={{marginBottom:'18px'}}><strong>{t(mk(S.salaryModel)+'_short')}:</strong> {t(mk(S.salaryModel)+'_desc')}</div>

      {view==='lab' && <LabView R={R} />}
      {view==='owner' && window.SalaryOwnerView({R})}
      {view==='employee' && window.SalaryEmployeeView({R})}
    </div>
  );
}

function LabView({R}){
  const { S, set, model, t } = R;
  const maxPay = Math.max(...model.people.map(p=>Math.max(p.pay,p.currentPay)),1);

  function updEmp(id,patch){ set(prev=>({employees:prev.employees.map(e=>e.id===id?{...e,...patch}:e)})); }
  function removeEmp(id){ set(prev=>({employees:prev.employees.filter(e=>e.id!==id)})); }
  function addEmp(group){ set(prev=>({employees:[...prev.employees,{id:'e'+Date.now(),name:'—',position:group==='Labor'?'Labor':'Staff',posKey:group==='Labor'?'pos_labor':'pos_staff',posDirty:false,currentPay:4000,basic:4000,group,availHoursPerDay:group==='Labor'?8:0}]})); }

  return (
    <div className="grid" style={{gridTemplateColumns:'minmax(0,1fr) 360px',alignItems:'start'}}>
      <div>
        {['Labor','Employee'].map(grp=>{
          const people = model.people.filter(p=>p.group===grp);
          return (
            <div className="card" key={grp} style={{marginBottom:'16px'}}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <div className="card-h">{grp==='Labor'?t('sl_labor'):t('sl_admin')}</div>
                <button className="iconbtn add" onClick={()=>addEmp(grp)}>{t('sl_add')}</button>
              </div>
              <table className="tbl mt8">
                <thead><tr>
                  <th className="l">{t('name')}</th><th className="l">{t('role')}</th><th>{t('th_basic')}</th>
                  <th>{t('th_pay_target')}</th><th className="l" style={{width:'150px'}}>{t('th_vs_today')}</th><th></th>
                </tr></thead>
                <tbody>
                  {people.map(p=>{
                    const w=Math.round((p.pay/maxPay)*130);
                    const wt=Math.round((p.currentPay/maxPay)*130);
                    return (
                      <tr key={p.id}>
                        <td className="l"><input className="inp l" style={{width:'110px'}} value={p.name} onChange={e=>updEmp(p.id,{name:e.target.value})} /></td>
                        <td className="l"><input className="inp l" style={{width:'104px'}} value={R.dispPos(p)} onChange={e=>updEmp(p.id,{position:e.target.value,posDirty:true})} /></td>
                        <td><input className="inp" style={{width:'88px'}} type="number" value={p.basic} onChange={e=>updEmp(p.id,{basic:+e.target.value||0})} /></td>
                        <td className="num" style={{fontWeight:700}}>{R.fmtMoney(p.pay)}</td>
                        <td className="l">
                          <div className="bar today" style={{width:Math.max(wt,28)+'px',height:'11px',fontSize:'8.5px'}}></div>
                          <div className="bar new" style={{width:Math.max(w,28)+'px',height:'11px',fontSize:'8.5px',marginTop:'2px'}}></div>
                        </td>
                        <td>
                          <div className="row" style={{gap:'4px',justifyContent:'flex-end'}}>
                            <button className="iconbtn" onClick={()=>updEmp(p.id,{group:grp==='Labor'?'Employee':'Labor',availHoursPerDay:grp==='Labor'?0:8})}>⇄</button>
                            <button className="iconbtn" onClick={()=>removeEmp(p.id)}>×</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="sum">
                    <td className="l">{t('sl_group_n',{n:people.length})}</td><td></td>
                    <td className="num">{R.fmtMoney(people.reduce((s,p)=>s+p.basic,0))}</td>
                    <td className="num">{R.fmtMoney(people.reduce((s,p)=>s+p.pay,0))}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div>
        <div className="card" style={{marginBottom:'16px'}}>
          <div className="card-h">{t('sl_live')} <span className="grp num">{t('lb_at_target')}</span></div>
          <div className="row" style={{justifyContent:'space-between',alignItems:'baseline',marginTop:'8px'}}>
            <div className="eyebrow">{t('sl_total_payroll')}</div>
            <div className="bignum" style={{fontSize:'26px'}}>{R.fmtMoney(model.totalPayroll)}</div>
          </div>
          <div className="row" style={{justifyContent:'space-between',alignItems:'baseline',marginTop:'6px'}}>
            <div className="eyebrow">{t('sl_vs_fixed')}</div>
            <div className="num" style={{color:model.totalPayroll>=model.todayPayroll?'var(--emer)':'var(--red)',fontWeight:600}}>
              {model.totalPayroll>=model.todayPayroll?'+':''}{R.fmtMoney(model.totalPayroll-model.todayPayroll)} ({R.fmtPct((model.totalPayroll/model.todayPayroll-1),0)})
            </div>
          </div>
          <div className="row" style={{justifyContent:'space-between',alignItems:'baseline',marginTop:'6px'}}>
            <div className="eyebrow">{t('sl_payroll_pct')}</div>
            <div className="num" style={{fontWeight:600}}>{R.fmtPct(model.payrollPctSales)}</div>
          </div>
        </div>

        <TierEditor R={R} />
        <ParamEditor R={R} />
      </div>
    </div>
  );
}

function TierEditor({R}){
  const { S, set, t } = R;
  function upd(i,patch){ set(prev=>({tiers:prev.tiers.map((tt,j)=>j===i?{...tt,...patch}:tt)})); }
  const curRatio = (S.monthlySalesTarget/S.baseMonthlySales*100);
  const activeIdx = S.tiers.reduce((acc,tt,i)=>curRatio>=tt.pct?i:acc,0);
  return (
    <div className="card" style={{marginBottom:'16px'}}>
      <div className="card-h">{t('sl_tiers')}</div>
      <p className="card-sub">{t('sl_tiers_sub',{tier:S.tiers[activeIdx].label})}</p>
      <table className="tbl">
        <thead><tr><th className="l">{t('th_tier')}</th><th>{t('th_pct_base')}</th></tr></thead>
        <tbody>
          {S.tiers.map((tt,i)=>(
            <tr key={i} style={i===activeIdx?{background:'rgba(177,128,31,.12)'}:null}>
              <td className="l"><input className="inp l" value={tt.label} onChange={e=>upd(i,{label:e.target.value})} /></td>
              <td><input className="inp" type="number" value={tt.pct} onChange={e=>upd(i,{pct:+e.target.value||0})} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ParamEditor({R}){
  const { S, set, t } = R;
  const m = S.salaryModel;
  if(m==='M0') return <div className="note">{t('sl_m0_note')}</div>;
  function updArr(key,i,v){ set(prev=>({params:{...prev.params,[m]:{...prev.params[m],[key]:prev.params[m][key].map((x,j)=>j===i?v:x)}}})); }
  const p = S.params[m];
  const tiers = S.tiers;
  const Block=({label,unit,arrKey})=>(
    <div style={{marginBottom:'12px'}}>
      <div className="eyebrow" style={{marginBottom:'6px'}}>{label}</div>
      <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
        {tiers.map((tt,i)=>(
          <div key={i} className="field">
            <label style={{fontSize:'8.5px'}}>{tt.label}</label>
            <div className="unit"><input className="inp" type="number" value={p[arrKey][i]} onChange={e=>updArr(arrKey,i,+e.target.value||0)} /><span className="pre" style={{paddingRight:'8px'}}>{unit}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="card">
      <div className="card-h">{t('sl_tune',{m})}</div>
      <p className="card-sub">{t('sl_tune_sub')}</p>
      {(m==='B'||m==='C'||m==='D') && <Block label={t('sl_uplift')} unit="%" arrKey="upliftByTier" />}
      {(m==='A'||m==='D') && <Block label={t('sl_pool')} unit="%" arrKey="poolPctByTier" />}
    </div>
  );
}

window.SalaryModule = SalaryModule;
})();
