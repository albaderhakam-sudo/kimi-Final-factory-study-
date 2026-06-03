/* ===== App shell: topbar, tabs, menu, language toggle, CSV import/export ===== */
(function(){
const { useState, useRef } = React;

const TAB_IDS = ['overview','investment','production','labor','salary','costs'];
const TAB_KEY = { overview:'tab_overview', investment:'tab_investment', production:'tab_production',
  labor:'tab_labor', salary:'tab_salary', costs:'tab_costs' };

function TopBar(){
  const R = window.RDF.useRDF();
  const { S, set, model, t } = R;
  const worst = window.RDF_worst(S), best = window.RDF_best(S);
  const [menu,setMenu]=useState(false);
  const fileRef=useRef(null), csvRef=useRef(null);

  return (
    <div className="topbar no-print">
      <div className="topbar-inner">
        <div className="brand">RED DRAGON <span>FACTORY</span><small>{t('brand_sub')}</small></div>

        <div className="topbar-slider">
          <div className="row">
            <input className="rng" type="range" min={Math.min(worst,model.T)} max={Math.max(best,model.T)}
              step={Math.max(1,Math.round((best-worst)/300))} value={model.T}
              onChange={e=>set({monthlySalesTarget:+e.target.value})} />
          </div>
          <div className="row">
            <div className="ticks" style={{flex:1}}>
              <span className="t">{R.fmtMoney(worst)}</span>
              <span className="t base">{t('base_l')} {R.fmtMoney(Math.round(S.baseMonthlySales))}</span>
              <span className="t">{R.fmtMoney(best)}</span>
            </div>
          </div>
        </div>

        <div className="topbar-slider" style={{minWidth:'auto',flex:'0 0 auto',gap:'2px'}}>
          <div className="row" style={{gap:'8px'}}>
            <span className="row" style={{flexDirection:'column',alignItems:'flex-start',gap:'1px'}}>
              <span style={{fontFamily:'var(--mono)',fontSize:'9px',letterSpacing:'.14em',color:'#9b9485'}}>{t('monthly_sales')}</span>
              <span style={{fontFamily:'var(--mono)',fontSize:'16px',fontWeight:600}}>{R.fmtMoney(model.T)} <em style={{color:'var(--emer)',fontStyle:'normal'}}>{(model.T/model.base*100).toFixed(0)}%</em></span>
            </span>
          </div>
        </div>

        <div className="spring"></div>

        <div className="live-net">
          <div className="item"><span className="l">{t('net_mo')}</span><span className={'v '+(model.net>=0?'pos':'neg')}>{R.fmtMoney(model.net)}</span></div>
          <div className="item"><span className="l">{t('margin_u')}</span><span className="v">{R.fmtPct(model.margin,0)}</span></div>
        </div>

        <div className="seg" style={{borderColor:'#4a463c'}}>
          <button className={S.lang==='en'?'on':''} onClick={()=>set({lang:'en'})}>EN</button>
          <button className={S.lang==='zh'?'on':''} onClick={()=>set({lang:'zh'})}>中文</button>
        </div>

        <div className="seg" style={{borderColor:'#4a463c'}}>
          <button className={S.currency==='CNY'?'on':''} onClick={()=>set({currency:'CNY'})}>CNY ¥</button>
          <button className={S.currency==='USD'?'on':''} onClick={()=>set({currency:'USD'})}>USD $</button>
        </div>

        <div className="menu">
          <button className="tbtn" onClick={()=>setMenu(!menu)}>{R.saved?t('saved')+' ✓':t('saving')} ▾</button>
          {menu && <div className="menu-pop" onMouseLeave={()=>setMenu(false)}>
            <button onClick={()=>{R.exportJSON();setMenu(false);}}>{t('m_export_json')} <small>JSON</small></button>
            <button onClick={()=>{fileRef.current.click();}}>{t('m_import_json')} <small>JSON</small></button>
            <button onClick={()=>{exportCSV(S);setMenu(false);}}>{t('m_export_csv')} <small>CSV</small></button>
            <button onClick={()=>{csvRef.current.click();}}>{t('m_import_csv')} <small>CSV</small></button>
            <button onClick={()=>{window.print();setMenu(false);}}>{t('m_print')} <small>⌘P</small></button>
            <button onClick={()=>{R.reset();setMenu(false);}}>{t('m_reset')} <small>↺</small></button>
          </div>}
          <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}}
            onChange={e=>{ if(e.target.files[0]) R.importJSON(e.target.files[0]); e.target.value=''; setMenu(false); }} />
          <input ref={csvRef} type="file" accept=".csv,text/csv" style={{display:'none'}}
            onChange={e=>{ if(e.target.files[0]) importCSV(e.target.files[0],R); e.target.value=''; setMenu(false); }} />
        </div>
      </div>
    </div>
  );
}

function exportCSV(S){
  const head=['group','size','rawCost','hoursPerPc','qty','priceUSD'];
  const lines=[head.join(',')].concat(S.products.map(p=>
    [JSON.stringify(p.group),JSON.stringify(p.size),p.rawCost,p.hoursPerPc,p.qty,p.priceUSD==null?'':p.priceUSD].join(',')));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='red-dragon-products.csv';a.click();
}
function importCSV(file,R){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const rows=r.result.split(/\r?\n/).filter(x=>x.trim());
      const head=rows.shift().split(',').map(h=>h.trim());
      const idx=k=>head.indexOf(k);
      const parsed=rows.map((line,i)=>{
        const c=splitCSV(line);
        return { id:'p'+(i+1), group:strip(c[idx('group')]), size:strip(c[idx('size')]),
          rawCost:+c[idx('rawCost')]||0, hoursPerPc:+c[idx('hoursPerPc')]||0,
          qty:+c[idx('qty')]||0, priceUSD: c[idx('priceUSD')]===''?null:(+c[idx('priceUSD')]||null) };
      });
      R.set({products:parsed});
      alert(R.t('imported_n',{n:parsed.length}));
    }catch(e){ alert(R.t('csv_err')); }
  };
  r.readAsText(file);
}
function splitCSV(line){ const out=[];let cur='';let q=false;
  for(let i=0;i<line.length;i++){const ch=line[i];
    if(ch==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++;} else q=!q; }
    else if(ch===','&&!q){out.push(cur);cur='';} else cur+=ch; }
  out.push(cur); return out; }
function strip(s){ s=(s||'').trim(); if(s.startsWith('"')&&s.endsWith('"'))s=s.slice(1,-1); return s; }

function Shell(){
  const R = window.RDF.useRDF();
  const t = R.t;
  const [tab,setTab]=useState('overview');
  return (
    <React.Fragment>
      <TopBar />
      <div className="app">
        <div className="tabs no-print">
          {TAB_IDS.map((id,i)=>(
            <button key={id} className={tab===id?'on':''} onClick={()=>setTab(id)}>
              <span className="ix">{String(i).padStart(2,'0')}</span>{t(TAB_KEY[id])}
            </button>
          ))}
        </div>
        <div className="tabpane">
          {tab==='overview' && <window.OverviewModule goTo={setTab} />}
          {tab==='investment' && <window.InvestmentModule />}
          {tab==='production' && <window.ProductionModule />}
          {tab==='labor' && <window.LaborModule />}
          {tab==='salary' && <window.SalaryModule />}
          {tab==='costs' && <window.CostsModule />}
        </div>
      </div>
    </React.Fragment>
  );
}

function App(){
  return (
    <window.RDF.Provider>
      <Shell />
    </window.RDF.Provider>
  );
}

window.RDFApp = App;
})();
