/* Reusable Chart.js wrapper + Workshop theme defaults */
(function(){
const { useRef, useEffect } = React;

const INK='#1a1813', MUTED='#6f6857', HAIR='#ddd6c5';
const PAL=['#1F6F54','#b1801f','#155741','#8a9a5b','#a8581e','#5b8a78','#c2a86a','#3d5c4f','#d4b483','#7a6a4f'];

function baseOpts(extra){
  return Object.assign({
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
  }, extra||{});
}

function RDFChart({type,data,options,height=220}){
  const ref=useRef(null); const inst=useRef(null);
  useEffect(()=>{
    if(!window.Chart) return;
    if(inst.current){ inst.current.data=data; inst.current.options=options||inst.current.options; inst.current.update(); return; }
    inst.current=new window.Chart(ref.current,{type,data,options});
    return ()=>{};
  });
  useEffect(()=>()=>{ if(inst.current){ inst.current.destroy(); inst.current=null; } },[]);
  return React.createElement('div',{style:{height:height+'px',position:'relative'}},
    React.createElement('canvas',{ref}));
}

window.RDFCharts = { RDFChart, PAL, baseOpts, INK, MUTED, HAIR };
if(window.Chart){
  window.Chart.defaults.font.family="'IBM Plex Mono', monospace";
  window.Chart.defaults.font.size=10;
  window.Chart.defaults.color=MUTED;
}
})();
