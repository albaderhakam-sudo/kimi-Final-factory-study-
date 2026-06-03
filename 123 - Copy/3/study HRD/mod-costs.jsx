/* ===== Module: Costs, charts & the decision ===== */
(function(){
const { RDFChart, PAL, baseOpts } = window.RDFCharts;

function bucketAmount(b, ctx){
  if(b.kind==='reserve'){ const monthly = b.source==='rent'?ctx.rentMonthly:ctx.payrollFloor; return (b.months||0)*monthly; }
  return b.amount||0;
}

function CostsModule(){
  const R = window.RDF.useRDF();
  const { S, set, model, t } = R;
  const rentMonthly = S.rentPerYear/12;

  const costs = [
    {k:t('cost_material'), v:model.totalMaterial, c:'#1F6F54'},
    {k:t('cost_payroll'), v:model.totalPayroll, c:'#b1801f'},
    {k:t('cost_rent'), v:rentMonthly, c:'#155741'},
    {k:t('cost_elec'), v:S.electricityPerMonth, c:'#a8581e'},
  ];
  const totalCost = costs.reduce((s,c)=>s+c.v,0);

  const payrollFloor = S.employees.reduce((s,e)=>s+e.basic,0);
  const ctx={rentMonthly,payrollFloor};
  const allocated = S.allocation.reduce((s,b)=>s+bucketAmount(b,ctx),0);
  const available = S.totalInvestment - allocated;
  const reserveTotal = S.allocation.filter(b=>b.kind==='reserve').reduce((s,b)=>s+bucketAmount(b,ctx),0)
    + (S.allocation.find(b=>b.nameKey==='bk_contingency') ? bucketAmount(S.allocation.find(b=>b.nameKey==='bk_contingency'),ctx) : 0);
  const burn = rentMonthly + S.electricityPerMonth + payrollFloor;
  const runway = burn>0 ? (reserveTotal+Math.max(0,available))/burn : 0;

  const worstNet = R.computeAt({salesOverride:window.RDF_worst(S)}).net;
  const profitable = model.net>0;
  const resilient = worstNet>0;
  const fundable = available>=0 && runway>=4;

  const wf = [
    {k:t('wf_sales'), v:model.T},
    {k:t('wf_material'), v:-model.totalMaterial},
    {k:t('wf_payroll'), v:-model.totalPayroll},
    {k:t('wf_rent'), v:-rentMonthly},
    {k:t('wf_elec'), v:-S.electricityPerMonth},
  ];
  let run=0; const wfBars=[]; const wfBase=[];
  wf.forEach((s,i)=>{ if(i===0){wfBase.push(0);wfBars.push(s.v);run=s.v;} else {wfBase.push(run+s.v);wfBars.push(-s.v);run=run+s.v;} });
  wf.push({k:t('wf_net'), v:run}); wfBase.push(0); wfBars.push(run);

  return (
    <div>
      <div className="modhead">
        <div>
          <h2>{t('co_title')}<span className="tag">{t('co_tag')}</span></h2>
          <p>{t('co_intro')}</p>
        </div>
      </div>

      <div className="kpis" style={{marginBottom:'16px'}}>
        <div className={'kpi '+(model.net>=0?'accent':'')} style={model.net<0?{borderColor:'var(--red)'}:null}>
          <div className="lab">{t('co_net')}</div>
          <div className={'val num '+(model.net<0?'neg':'')}>{R.fmtMoney(model.net)}</div>
          <div className="sub">{t('margin_c')} {R.fmtPct(model.margin)}</div>
        </div>
        <div className="kpi"><div className="lab">{t('co_total_cost')}</div><div className="val num">{R.fmtMoney(totalCost)}</div><div className="sub">{t('co_total_sub',{pct:R.fmtPct(totalCost/model.T)})}</div></div>
        <div className="kpi"><div className="lab">{t('co_net_worst',{f:S.flexPct})}</div><div className={'val num '+(worstNet>=0?'pos':'neg')}>{R.fmtMoney(worstNet)}</div><div className="sub">{t('co_stress')}</div></div>
        <div className="kpi"><div className="lab">{t('co_runway')}</div><div className="val num">{runway.toFixed(1)}<span style={{fontSize:'14px'}}>{t('inv_mo')}</span></div><div className="sub">{t('co_res_burn')}</div></div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'360px 1fr',alignItems:'start',marginBottom:'16px'}}>
        <div className="card">
          <div className="card-h">{t('co_fixed')}</div>
          <div className="field mt8"><label>{t('co_rent')}</label>
            <input className="inp" type="number" value={S.rentPerYear} onChange={e=>set({rentPerYear:+e.target.value||0})} />
            <span className="grp">{t('co_rent_mo',{x:R.fmtMoney(rentMonthly)})}</span>
          </div>
          <div className="field mt16"><label>{t('co_elec')}</label>
            <input className="inp" type="number" value={S.electricityPerMonth} onChange={e=>set({electricityPerMonth:+e.target.value||0})} />
          </div>
          <div className="field mt16"><label>{t('co_fx')}</label>
            <input className="inp" type="number" step="0.1" value={S.fx} onChange={e=>set({fx:+e.target.value||1})} />
            <span className="grp">{t('co_fx_sub')}</span>
          </div>
          <div className="divider"></div>
          <div className="card-h" style={{fontSize:'14px'}}>{t('co_mix')}</div>
          <RDFChart type="doughnut" height={180}
            data={{labels:costs.map(c=>c.k),datasets:[{data:costs.map(c=>Math.round(c.v)),backgroundColor:costs.map(c=>c.c),borderColor:'#FBF9F3',borderWidth:2}]}}
            options={baseOpts({cutout:'58%'})} />
          <div className="mt8">
            {costs.map(c=>(
              <div className="alloc-row" key={c.k}>
                <span className="swatch" style={{background:c.c}}></span>
                <span style={{flex:1,fontSize:'12.5px'}}>{c.k}</span>
                <span className="num" style={{fontSize:'12px'}}>{R.fmtMoney(c.v)}</span>
                <span className="num muted" style={{fontSize:'11px',width:'44px',textAlign:'right'}}>{(c.v/totalCost*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:'16px'}}>
            <div className="card-h">{t('co_waterfall')} <span className="grp num">{t('co_at_target')}</span></div>
            <RDFChart type="bar" height={250}
              data={{labels:wf.map(s=>s.k),datasets:[
                {data:wfBase,backgroundColor:'transparent',stack:'s'},
                {data:wfBars,stack:'s',borderColor:'#1a1813',borderWidth:1.5,
                  backgroundColor:wf.map((s,i)=> i===0?'#155741': i===wf.length-1?(run>=0?'#1F6F54':'#b3402e'):'#d8b48a')}
              ]}}
              options={baseOpts({plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.datasetIndex===1?R.fmtMoney(wf[c.dataIndex].v):''}}},
                scales:{y:{stacked:true,grid:{color:'#ddd6c5'},ticks:{callback:v=>R.fmtMoney(v)}},x:{stacked:true,grid:{display:false}}}})} />
          </div>

          <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <Verdict R={R} ok={profitable&&resilient}
              title={t('co_v1')}
              yes={t('co_v1_yes',{net:R.fmtMoney(model.net),margin:R.fmtPct(model.margin)})}
              no={profitable?t('co_v1_thin',{f:S.flexPct,worst:R.fmtMoney(worstNet)}):t('co_v1_no',{net:R.fmtMoney(model.net)})}
              detail={resilient?t('co_v1_d_ok',{f:S.flexPct,worst:R.fmtMoney(worstNet)}):t('co_v1_d_no',{f:S.flexPct,worst:R.fmtMoney(worstNet)})} />
            <Verdict R={R} ok={fundable}
              title={t('co_v2')}
              yes={t('co_v2_yes',{x:R.fmtMoney(available),r:runway.toFixed(1)})}
              no={available<0?t('co_v2_short',{x:R.fmtMoney(-available)}):t('co_v2_tight',{r:runway.toFixed(1)})}
              detail={t('co_v2_d',{burn:R.fmtMoney(burn)})} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Verdict({R,ok,title,yes,no,detail}){
  const { t } = R;
  return (
    <div className="card" style={{borderColor:ok?'var(--emer)':'var(--red)',borderWidth:'2px'}}>
      <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
        <div className="card-h" style={{margin:0}}>{title}</div>
        <span className="pill" style={{borderColor:ok?'var(--emer)':'var(--red)',color:ok?'var(--emer)':'var(--red)',fontWeight:600}}>{ok?t('yes'):t('watch')}</span>
      </div>
      <p style={{fontSize:'13.5px',fontWeight:600,margin:'12px 0 8px',color:ok?'var(--emer)':'var(--red)'}}>{ok?yes:no}</p>
      <p className="muted" style={{fontSize:'12px',margin:0}}>{detail}</p>
    </div>
  );
}

window.CostsModule = CostsModule;
})();
