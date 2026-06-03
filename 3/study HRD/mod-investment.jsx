/* ===== Module: Investment & Allocation ===== */
(function(){
const { RDFChart, PAL, baseOpts } = window.RDFCharts;

function bucketAmount(b, ctx){
  if(b.kind==='reserve'){
    const monthly = b.source==='rent' ? ctx.rentMonthly : ctx.payrollFloor;
    return (b.months||0)*monthly;
  }
  return b.amount||0;
}

function InvestmentModule(){
  const R = window.RDF.useRDF();
  const { S, set, model, t } = R;
  const rentMonthly = S.rentPerYear/12;
  const payrollFloor = S.employees.reduce((s,e)=>s+e.basic,0);
  const ctx = { rentMonthly, payrollFloor };

  const buckets = S.allocation.map(b=>({...b, value:bucketAmount(b,ctx)}));
  const allocated = buckets.reduce((s,b)=>s+b.value,0);
  const available = S.totalInvestment - allocated;
  const reserveTotal = buckets.filter(b=>b.kind==='reserve').reduce((s,b)=>s+b.value,0)
    + (buckets.find(b=>b.nameKey==='bk_contingency')?.value||0);
  const burn = rentMonthly + S.electricityPerMonth + payrollFloor;
  const runway = burn>0 ? (reserveTotal + Math.max(0,available))/burn : 0;

  function upd(id,patch){ set(prev=>({allocation:prev.allocation.map(b=>b.id===id?{...b,...patch}:b)})); }
  function remove(id){ set(prev=>({allocation:prev.allocation.filter(b=>b.id!==id)})); }
  function add(){ set(prev=>({allocation:[...prev.allocation,{id:'a'+Date.now(),name:'—',kind:'fixed',amount:0}]})); }

  const donut = {
    labels: buckets.map(b=>R.dispName(b)),
    datasets:[{ data:buckets.map(b=>Math.round(b.value)), backgroundColor:PAL, borderColor:'#FBF9F3', borderWidth:2 }]
  };

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('inv_title')}<span className="tag brass">{t('inv_tag')}</span></h2>
          <p>{t('inv_intro')}</p>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'320px 1fr',alignItems:'start'}}>
        <div className="card">
          <div className="field">
            <label>{t('inv_total')}</label>
            <input className="inp big" type="number" value={S.totalInvestment}
              onChange={e=>set({totalInvestment:+e.target.value||0})} />
          </div>
          <p className="card-sub mt8">{t('inv_type_any')}</p>
          <div className="divider"></div>
          <Stat R={R} label={t('inv_allocated')} value={allocated} />
          <Stat R={R} label={available>=0?t('inv_surplus'):t('inv_shortfall')} value={available} pos={available>=0} neg={available<0} big />
          <div className="hairdiv"></div>
          <Stat R={R} label={t('inv_burn')} value={burn} />
          <div className="row" style={{justifyContent:'space-between',marginTop:'12px',alignItems:'baseline'}}>
            <div className="eyebrow">{t('inv_runway')}</div>
            <div className="bignum" style={{fontSize:'30px',color:runway>=6?'var(--emer)':'var(--red)'}}>{runway.toFixed(1)}<span style={{fontSize:'14px'}}>{t('inv_mo')}</span></div>
          </div>
          <div className={'note mt16 '+(available>=0?'emer':'red')}>
            {available>=0
              ? <span><strong>{t('inv_enough')}</strong> {t('inv_enough_d',{x:R.fmtMoney(available),r:runway.toFixed(1)})}</span>
              : <span><strong>{t('inv_short',{x:R.fmtMoney(-available)})}</strong> {t('inv_short_d')}</span>}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:'16px'}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div className="card-h">{t('inv_buckets')}</div>
              <button className="iconbtn add" onClick={add}>{t('inv_add')}</button>
            </div>
            <table className="tbl mt8">
              <thead><tr><th className="l">{t('inv_th_bucket')}</th><th>{t('inv_th_type')}</th><th>{t('inv_th_months')}</th><th>{t('inv_th_amount')}</th><th></th></tr></thead>
              <tbody>
                {buckets.map(b=>(
                  <tr key={b.id}>
                    <td className="l"><input className="inp l" value={R.dispName(b)} onChange={e=>upd(b.id,{name:e.target.value,nameDirty:true})} /></td>
                    <td>
                      <div className="chips emer" style={{transform:'scale(.92)'}}>
                        <button className={b.kind==='fixed'?'on':''} onClick={()=>upd(b.id,{kind:'fixed'})}>{t('inv_fixed')}</button>
                        <button className={b.kind==='reserve'?'on':''} onClick={()=>upd(b.id,{kind:'reserve',source:b.source||'rent',months:b.months||3})}>{t('inv_reserve')}</button>
                      </div>
                    </td>
                    <td>
                      {b.kind==='reserve'
                        ? <div className="row" style={{justifyContent:'flex-end',gap:'6px'}}>
                            <input className="inp" style={{width:'52px'}} type="number" value={b.months||0} onChange={e=>upd(b.id,{months:+e.target.value||0})} />
                            <select className="inp" style={{width:'92px'}} value={b.source} onChange={e=>upd(b.id,{source:e.target.value})}>
                              <option value="rent">{t('inv_x_rent')}</option><option value="payroll">{t('inv_x_payroll')}</option>
                            </select>
                          </div>
                        : <span className="muted">—</span>}
                    </td>
                    <td>
                      {b.kind==='reserve'
                        ? <span className="num">{R.fmtMoney(b.value)}</span>
                        : <input className="inp" type="number" value={b.amount||0} onChange={e=>upd(b.id,{amount:+e.target.value||0})} />}
                    </td>
                    <td><button className="iconbtn" onClick={()=>remove(b.id)}>×</button></td>
                  </tr>
                ))}
                <tr className="sum"><td className="l">{t('inv_total_alloc')}</td><td></td><td></td><td className="num">{R.fmtMoney(allocated)}</td><td></td></tr>
              </tbody>
            </table>
          </div>

          <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <div className="card">
              <div className="card-h">{t('inv_where')}</div>
              <RDFChart type="doughnut" data={donut} height={230}
                options={baseOpts({cutout:'58%',plugins:{legend:{display:false}}})} />
            </div>
            <div className="card">
              <div className="card-h">{t('inv_legend')}</div>
              <div className="mt8">
                {buckets.map((b,i)=>(
                  <div className="alloc-row" key={b.id}>
                    <span className="swatch" style={{background:PAL[i%PAL.length]}}></span>
                    <span style={{flex:1,fontSize:'12.5px'}}>{R.dispName(b)}</span>
                    <span className="num" style={{fontSize:'12px'}}>{R.fmtMoney(b.value)}</span>
                    <span className="num muted" style={{fontSize:'11px',width:'44px',textAlign:'right'}}>{allocated>0?(b.value/allocated*100).toFixed(0):0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({R,label,value,pos,neg,big}){
  return (
    <div className="row" style={{justifyContent:'space-between',alignItems:'baseline',margin:'8px 0'}}>
      <div className="eyebrow">{label}</div>
      <div className={'num '+(big?'bignum':'')} style={{fontSize:big?'22px':'15px',fontWeight:600,
        color:pos?'var(--emer)':neg?'var(--red)':'var(--ink)'}}>{R.fmtMoney(value)}</div>
    </div>
  );
}

window.InvestmentModule = InvestmentModule;
})();
