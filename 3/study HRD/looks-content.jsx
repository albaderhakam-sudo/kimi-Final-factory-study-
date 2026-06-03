// Three dashboard look mockups. Real RDF numbers, three visual systems.
// Rendered via dangerouslySetInnerHTML so we can write raw HTML with class=.

const html = (s) => ({ dangerouslySetInnerHTML: { __html: s } });

// ---------- LOOK 1 · LEDGER ----------
function LookLedger() {
  return <div className="l1" {...html(`
    <div class="topbar">
      <div class="brand">Red Dragon Factory<small>Investment · Production · Salary Model</small></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="seg"><button class="on">CNY ¥</button><button>USD $</button></div>
        <div class="seg"><button>Worst</button><button class="on">Base</button><button>Best</button></div>
      </div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="lab">Total investment</div><div class="val num">¥3,000,000</div><div class="sub">runway 14.2 mo @ zero sales</div></div>
      <div class="kpi"><div class="lab">Base monthly sales</div><div class="val num">¥336,199</div><div class="sub">6-mo total ÷ 6</div></div>
      <div class="kpi"><div class="lab">Net profit / mo</div><div class="val num pos">¥62,442</div><div class="sub">margin 18.6%</div></div>
      <div class="kpi"><div class="lab">Labor utilization</div><div class="val num">62%</div><div class="sub">ceiling at +61% sales</div></div>
    </div>
    <div class="cols">
      <div>
        <div class="sechd">Monthly sales → Production plan</div>
        <div class="secsub">Slide the monthly sales number; the plan, costs &amp; payroll recompute live.</div>
        <div class="track">
          <div class="tick" style="left:0%">Worst<b>¥168,100</b></div>
          <div class="tick base" style="left:50%">Base<b>¥336,199</b></div>
          <div class="tick" style="left:100%">Best<b>¥504,299</b></div>
          <div class="fill"></div><div class="knob"></div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Mix %</th><th>Qty / mo</th><th>Material ¥</th></tr></thead>
          <tbody>
            <tr><td>Lifting Clutch 2.5T <span class="grp">· KK Lifting</span></td><td class="num">27.3%</td><td class="num">771</td><td class="num">28,605</td></tr>
            <tr><td>Sealing Cap M16 <span class="grp">· Sealing</span></td><td class="num">1.0%</td><td class="num">16,870</td><td class="num">2,130</td></tr>
            <tr><td>Nailing Plate Lg M30 <span class="grp">· Nailing</span></td><td class="num">3.7%</td><td class="num">10,878</td><td class="num">9,397</td></tr>
            <tr><td>Lifting Clutch 10T <span class="grp">· KK Lifting</span></td><td class="num">21.1%</td><td class="num">175</td><td class="num">32,939</td></tr>
            <tr><td style="color:#7c766a">+ 29 more items</td><td></td><td class="num">…</td><td class="num">98,846</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <div class="sechd">Salary Model Lab</div>
        <div class="secsub">Pay ≥ basic floor, rises with sales, steps up past target.</div>
        <div class="chips"><span class="chip">0 · Fixed</span><span class="chip on">A · Basic + share</span><span class="chip">B · vs target</span><span class="chip">C · Tiered</span></div>
        <div class="payrow"><div class="who">Welder<small>Labor · ¥6,438 floor</small></div><div class="bars"><div class="bar today" style="width:62%">today 6,438</div><div class="bar new" style="width:78%">at base 8,050</div></div></div>
        <div class="payrow"><div class="who">Jia<small>Labor · ¥5,465 floor</small></div><div class="bars"><div class="bar today" style="width:53%">today 5,465</div><div class="bar new" style="width:66%">at base 6,830</div></div></div>
        <div class="payrow"><div class="who">Tangshu<small>QC · ¥4,465 floor</small></div><div class="bars"><div class="bar today" style="width:43%">today 4,465</div><div class="bar new" style="width:54%">at base 5,580</div></div></div>
        <div style="border-top:1px solid #d7d0c0;margin-top:6px;padding-top:14px;display:flex;justify-content:space-between;font-size:13px">
          <span style="color:#7c766a;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.04em">TOTAL PAYROLL · BASE</span>
          <span class="num" style="font-weight:600">¥96,180 <span style="color:#1F6F54">▲ 18%</span></span>
        </div>
      </div>
    </div>
  `)} />;
}

// ---------- LOOK 2 · CONTROL ROOM ----------
function LookControl() {
  return <div className="l2" {...html(`
    <div class="topbar">
      <div class="brand"><span class="dot"></span>RED DRAGON FACTORY <small>v1 · live model</small></div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="seg"><button class="on">CNY ¥</button><button>USD $</button></div>
        <div class="seg"><button>worst</button><button class="on">base</button><button>best</button></div>
      </div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="lab">Total investment</div><div class="val num">¥3,000,000</div><div class="sub">runway 14.2 mo</div></div>
      <div class="kpi"><div class="lab">Base monthly sales</div><div class="val num">¥336,199</div><div class="sub">6-mo ÷ 6</div></div>
      <div class="kpi"><div class="lab">Net / mo</div><div class="val num pos">¥62,442</div><div class="sub">margin 18.6%</div></div>
      <div class="kpi"><div class="lab">Labor util.</div><div class="val num">62%</div><div class="sub">ceiling +61%</div></div>
    </div>
    <div class="cols">
      <div class="panel">
        <div class="sechd">Sales → Production</div>
        <div class="secsub">Drag monthly sales · everything recomputes</div>
        <div class="track">
          <div class="tick" style="left:0%">worst<b>168,100</b></div>
          <div class="tick base" style="left:50%">base<b>336,199</b></div>
          <div class="tick" style="left:100%">best<b>504,299</b></div>
          <div class="fill"></div><div class="knob"></div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Mix</th><th>Qty/mo</th><th>Matl ¥</th></tr></thead>
          <tbody>
            <tr><td>Lifting Clutch 2.5T <span class="grp">KK</span></td><td class="num">27.3%</td><td class="num">771</td><td class="num">28,605</td></tr>
            <tr><td>Sealing Cap M16 <span class="grp">SEAL</span></td><td class="num">1.0%</td><td class="num">16,870</td><td class="num">2,130</td></tr>
            <tr><td>Nailing Plate Lg M30 <span class="grp">NAIL</span></td><td class="num">3.7%</td><td class="num">10,878</td><td class="num">9,397</td></tr>
            <tr><td>Lifting Clutch 10T <span class="grp">KK</span></td><td class="num">21.1%</td><td class="num">175</td><td class="num">32,939</td></tr>
            <tr><td style="color:#8f8f80">+ 29 more</td><td></td><td class="num">…</td><td class="num">98,846</td></tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <div class="sechd">Salary Model Lab</div>
        <div class="secsub">pay ≥ floor · rises with sales · steps past target</div>
        <div class="chips"><span class="chip">0·fixed</span><span class="chip on">A·share</span><span class="chip">B·target</span><span class="chip">C·tiered</span></div>
        <div class="payrow"><div class="who">Welder<small>¥6,438 floor</small></div><div class="bars"><div class="bar today" style="width:62%">6,438</div><div class="bar new" style="width:78%">8,050</div></div></div>
        <div class="payrow"><div class="who">Jia<small>¥5,465 floor</small></div><div class="bars"><div class="bar today" style="width:53%">5,465</div><div class="bar new" style="width:66%">6,830</div></div></div>
        <div class="payrow"><div class="who">Tangshu<small>¥4,465 floor</small></div><div class="bars"><div class="bar today" style="width:43%">4,465</div><div class="bar new" style="width:54%">5,580</div></div></div>
        <div style="border-top:1px solid #2e3026;margin-top:6px;padding-top:14px;display:flex;justify-content:space-between;font-size:13px">
          <span class="num" style="color:#8f8f80;font-size:10px;letter-spacing:.1em">TOTAL PAYROLL · BASE</span>
          <span class="num" style="font-weight:600">¥96,180 <span style="color:#34b07a">▲18%</span></span>
        </div>
      </div>
    </div>
  `)} />;
}

// ---------- LOOK 3 · WORKSHOP ----------
function LookWorkshop() {
  return <div className="l3">
    <div {...html(`
    <div class="topbar">
      <div class="brand">RED DRAGON <span>FACTORY</span><small>INVESTMENT · PRODUCTION · SALARY MODEL</small></div>
      <div style="display:flex;gap:12px">
        <div class="seg"><button class="on">CNY ¥</button><button>USD $</button></div>
        <div class="seg"><button>WORST</button><button class="on">BASE</button><button>BEST</button></div>
      </div>
    </div>
    <div class="body">
      <div class="kpis">
        <div class="kpi"><div class="lab">Total investment</div><div class="val num">¥3,000,000</div><div class="sub">runway 14.2 mo</div></div>
        <div class="kpi"><div class="lab">Base monthly sales</div><div class="val num">¥336,199</div><div class="sub">6-mo total ÷ 6</div></div>
        <div class="kpi accent"><div class="lab">Net profit / mo</div><div class="val num">¥62,442</div><div class="sub">margin 18.6%</div></div>
        <div class="kpi"><div class="lab">Labor utilization</div><div class="val num">62%</div><div class="sub">ceiling at +61%</div></div>
      </div>
      <div class="cols">
        <div class="card">
          <div class="sechd">Sales → Production <span class="tag">DRIVER</span></div>
          <div class="secsub">Slide monthly sales; the build plan and costs follow.</div>
          <div class="track">
            <div class="tick" style="left:0%">WORST<b>168,100</b></div>
            <div class="tick base" style="left:50%">BASE<b>336,199</b></div>
            <div class="tick" style="left:100%">BEST<b>504,299</b></div>
            <div class="fill"></div><div class="knob"></div>
          </div>
          <table>
            <thead><tr><th>Item</th><th>Mix %</th><th>Qty / mo</th><th>Material ¥</th></tr></thead>
            <tbody>
              <tr><td>Lifting Clutch 2.5T <span class="grp">· KK</span></td><td class="num">27.3%</td><td class="num">771</td><td class="num">28,605</td></tr>
              <tr><td>Sealing Cap M16 <span class="grp">· Sealing</span></td><td class="num">1.0%</td><td class="num">16,870</td><td class="num">2,130</td></tr>
              <tr><td>Nailing Plate Lg M30 <span class="grp">· Nailing</span></td><td class="num">3.7%</td><td class="num">10,878</td><td class="num">9,397</td></tr>
              <tr><td>Lifting Clutch 10T <span class="grp">· KK</span></td><td class="num">21.1%</td><td class="num">175</td><td class="num">32,939</td></tr>
              <tr><td style="color:#6f6857">+ 29 more items</td><td></td><td class="num">…</td><td class="num">98,846</td></tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <div class="sechd">Salary Model Lab <span class="tag">CENTERPIECE</span></div>
          <div class="secsub">Pay ≥ basic floor · rises with sales · jumps past target.</div>
          <div class="chips"><span class="chip">0 · FIXED</span><span class="chip on">A · SHARE</span><span class="chip">B · TARGET</span><span class="chip">C · TIERED</span></div>
          <div class="payrow"><div class="who">Welder<small>¥6,438 floor</small></div><div class="bars"><div class="bar today" style="width:62%">today 6,438</div><div class="bar new" style="width:78%">base 8,050</div></div></div>
          <div class="payrow"><div class="who">Jia<small>¥5,465 floor</small></div><div class="bars"><div class="bar today" style="width:53%">today 5,465</div><div class="bar new" style="width:66%">base 6,830</div></div></div>
          <div class="payrow"><div class="who">Tangshu<small>¥4,465 floor</small></div><div class="bars"><div class="bar today" style="width:43%">today 4,465</div><div class="bar new" style="width:54%">base 5,580</div></div></div>
          <div style="border-top:1.5px solid #1a1813;margin-top:6px;padding-top:14px;display:flex;justify-content:space-between;font-size:13px">
            <span class="num" style="color:#6f6857;font-size:10px;letter-spacing:.1em">TOTAL PAYROLL · BASE</span>
            <span class="num" style="font-weight:700">¥96,180 <span style="color:#1F6F54">▲ 18%</span></span>
          </div>
        </div>
      </div>
    </div>
    `)} />
  </div>;
}

Object.assign(window, { LookLedger, LookControl, LookWorkshop });
