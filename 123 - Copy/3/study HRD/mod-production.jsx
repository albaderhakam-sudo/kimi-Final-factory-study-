/* ===== Module: Sales → Production plan + product data ===== */
(function(){
const { useState } = React;

function groupBy(plan){
  const g={};
  plan.forEach(p=>{ (g[p.group]=g[p.group]||[]).push(p); });
  return g;
}

function ProductionModule(){
  const R = window.RDF.useRDF();
  const { S, set, model, t } = R;
  const [showData,setShowData]=useState(false);
  const groups = groupBy(model.plan);
  const basis = S.currency==='USD' ? t('pr_at_rate',{fx:S.fx}) : t('pr_yuan_basis');

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('pr_title')}<span className="tag emer">{t('pr_tag')}</span></h2>
          <p>{t('pr_intro')}</p>
        </div>
      </div>

      <div className="kpis" style={{marginBottom:'16px'}}>
        <div className="kpi accent">
          <div className="lab">{t('pr_target')}</div>
          <div className="val num">{R.fmtMoney(model.T)}</div>
          <div className="sub">{t('pr_of_base',{pct:(model.T/model.base*100).toFixed(0),basis})}</div>
        </div>
        <div className="kpi">
          <div className="lab">{t('pr_base66')}</div>
          <div className="val num">{R.fmtMoney(model.base)}</div>
          <div className="sub">{t('pr_from6',{x:R.fmtMoney(model.sixMo)})}</div>
        </div>
        <div className="kpi">
          <div className="lab">{t('pr_units')}</div>
          <div className="val num">{R.fmtNum(model.totalQty,0)}</div>
          <div className="sub">{t('pr_across')}</div>
        </div>
        <div className="kpi brass">
          <div className="lab">{t('pr_matl_bill')}</div>
          <div className="val num">{R.fmtMoney(model.totalMaterial)}</div>
          <div className="sub">{t('pr_of_sales',{pct:R.fmtPct(model.totalMaterial/model.T)})}</div>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr',marginBottom:'16px'}}>
        <div className="card tight">
          <div className="row wrap" style={{justifyContent:'space-between'}}>
            <div className="row wrap" style={{gap:'22px'}}>
              <div className="field" style={{maxWidth:'190px'}}>
                <label>{t('pr_base_sales')}</label>
                <input className="inp" type="number" value={Math.round(S.baseMonthlySales)}
                  onChange={e=>{ const v=+e.target.value||0; set({baseMonthlySales:v, monthlySalesTarget:v}); }} />
              </div>
              <div className="field" style={{maxWidth:'150px'}}>
                <label>{t('pr_flex')}</label>
                <input className="inp" type="number" value={S.flexPct}
                  onChange={e=>set({flexPct:Math.max(0,Math.min(90,+e.target.value||0))})} />
              </div>
              <div className="field">
                <label>{t('pr_reset_to')}</label>
                <div className="scn" style={{borderColor:'var(--ink)'}}>
                  <button style={btnStyle(model.T,worst(S))} onClick={()=>set({monthlySalesTarget:worst(S)})}>{t('worst',{f:S.flexPct})}</button>
                  <button style={btnStyle(model.T,Math.round(S.baseMonthlySales))} onClick={()=>set({monthlySalesTarget:Math.round(S.baseMonthlySales)})}>{t('base')}</button>
                  <button style={btnStyle(model.T,best(S))} onClick={()=>set({monthlySalesTarget:best(S)})}>{t('best',{f:S.flexPct})}</button>
                </div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="eyebrow">{t('pr_net_at')}</div>
              <div className={'bignum '+(model.net>=0?'delta-up':'delta-dn')} style={{fontSize:'30px'}}>{R.fmtMoney(model.net)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{justifyContent:'space-between',marginBottom:'4px'}}>
          <div className="card-h">{t('pr_plan')}</div>
          <button className="iconbtn add" onClick={()=>setShowData(!showData)}>{showData?t('pr_hide'):t('pr_edit')}</button>
        </div>
        <p className="card-sub">{t('pr_plan_sub')}</p>

        {Object.keys(groups).map(gname=>{
          const items=groups[gname];
          const gQty=items.reduce((s,p)=>s+p.qty,0);
          const gRev=items.reduce((s,p)=>s+p.itemRev,0);
          const gMat=items.reduce((s,p)=>s+p.material,0);
          const gHrs=items.reduce((s,p)=>s+p.hours,0);
          const active=items.filter(p=>p.qty>0.5);
          if(active.length===0) return null;
          return (
            <div key={gname} style={{marginBottom:'20px'}}>
              <div className="row" style={{justifyContent:'space-between',borderBottom:'1.5px solid var(--ink)',paddingBottom:'7px',marginBottom:'2px'}}>
                <div className="disp" style={{fontWeight:700,fontSize:'14px'}}>{gname} <span className="grp num">{t('pr_items_n',{n:active.length})}</span></div>
                <div className="num" style={{fontSize:'12px',color:'var(--muted)'}}>
                  {t('pr_grp_summary',{q:R.fmtNum(gQty,0),r:R.fmtMoney(gRev),m:R.fmtMoney(gMat),h:R.fmtNum(gHrs,0)})}
                </div>
              </div>
              <table className="tbl">
                <thead><tr>
                  <th className="l">{t('th_item')}</th><th>{t('th_mix')}</th><th>{t('th_price')}</th><th>{t('th_qty_mo')}</th>
                  <th>{t('th_revenue')}</th><th>{t('th_material')}</th><th>{t('th_hours')}</th>
                </tr></thead>
                <tbody>
                  {active.map(p=>(
                    <tr key={p.id}>
                      <td className="l">{p.size}{p.priceUSD==null && <span className="pill red" style={{marginLeft:'8px'}}>{t('price_q')}</span>}</td>
                      <td className="num">{(p.share*100).toFixed(2)}%</td>
                      <td className="num">{p.priceUSD!=null?R.fmtMoney(p.priceCNY):'—'}</td>
                      <td className="num">{R.fmtNum(Math.round(p.qty),0)}</td>
                      <td className="num">{R.fmtMoney(p.itemRev)}</td>
                      <td className="num">{R.fmtMoney(p.material)}</td>
                      <td className="num">{R.fmtNum(p.hours,1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        <table className="tbl"><tbody>
          <tr className="sum">
            <td className="l">{t('pr_total_plan')}</td>
            <td></td><td></td>
            <td className="num">{R.fmtNum(Math.round(model.totalQty),0)}</td>
            <td className="num">{R.fmtMoney(model.planRevenue)}</td>
            <td className="num">{R.fmtMoney(model.totalMaterial)}</td>
            <td className="num">{R.fmtNum(model.totalReqHours,0)}</td>
          </tr>
        </tbody></table>
      </div>

      {showData && <ProductDataEditor R={R} />}
    </div>
  );
}

function worst(S){ return Math.round(S.baseMonthlySales*(1-S.flexPct/100)); }
function best(S){ return Math.round(S.baseMonthlySales*(1+S.flexPct/100)); }
function btnStyle(cur,val){ return Math.abs(cur-val)<1 ? {background:'var(--brass)',color:'#fff'} : {}; }

function ProductDataEditor({R}){
  const { S, set, t } = R;
  const [filter,setFilter]=useState('with');
  const rows = S.products.filter(p=> filter==='all' ? true : p.qty>0);
  function upd(id,key,val){
    set(prev=>({products:prev.products.map(p=>p.id===id?{...p,[key]:val}:p)}));
  }
  return (
    <div className="card mt16">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div className="card-h">{t('pr_data')} <span className="tag">{t('pr_data_tag',{n:S.products.length})}</span></div>
        <div className="chips emer">
          <button className={filter==='with'?'on':''} onClick={()=>setFilter('with')}>{t('pr_selling_n')}</button>
          <button className={filter==='all'?'on':''} onClick={()=>setFilter('all')}>{t('pr_all_n')}</button>
        </div>
      </div>
      <p className="card-sub">{t('pr_data_sub',{fx:S.fx})}</p>
      <div style={{maxHeight:'520px',overflow:'auto'}}>
      <table className="tbl">
        <thead><tr>
          <th className="l">{t('group')}</th><th className="l">{t('th_size')}</th><th>{t('th_raw')}</th>
          <th>{t('th_hpc')}</th><th>{t('th_qty6')}</th><th>{t('th_price_usd')}</th>
        </tr></thead>
        <tbody>
          {rows.map(p=>(
            <tr key={p.id}>
              <td className="l grp">{p.group}</td>
              <td className="l">{p.size}</td>
              <td><input className="inp" type="number" step="0.001" value={p.rawCost} onChange={e=>upd(p.id,'rawCost',+e.target.value||0)} /></td>
              <td><input className="inp" type="number" step="0.000001" value={p.hoursPerPc} onChange={e=>upd(p.id,'hoursPerPc',+e.target.value||0)} /></td>
              <td><input className="inp" type="number" value={p.qty} onChange={e=>upd(p.id,'qty',+e.target.value||0)} /></td>
              <td><input className={'inp'+(p.priceUSD==null?' miss':'')} type="number" step="0.001"
                value={p.priceUSD==null?'':p.priceUSD} placeholder={t('missing')}
                onChange={e=>upd(p.id,'priceUSD', e.target.value===''?null:+e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

window.ProductionModule = ProductionModule;
window.RDF_worst = worst; window.RDF_best = best;
})();
