// src/App.jsx
import { useState, useEffect } from "react";
import "./App.css";
import Ticker     from "./components/Ticker";
import Overview   from "./pages/Overview";
import OIVolume   from "./pages/OIVolume";
import Heatmap    from "./pages/Heatmap";
import Volatility from "./pages/Volatility";
import AIInsights from "./pages/AIInsights";
import { C }      from "./data/constants";
import { getMeta } from "./data/api";

const TABS = [
  { id:"overview", label:"OVERVIEW",    icon:"⬡" },
  { id:"oi",       label:"OI & VOLUME", icon:"▦" },
  { id:"heatmap",  label:"HEATMAP",     icon:"⬛" },
  { id:"vol",      label:"VOLATILITY",  icon:"◈" },
  { id:"ai",       label:"AI INSIGHTS", icon:"◉" },
];

export default function App() {
  const [page,     setPage]     = useState("overview");
  const [pulse,    setPulse]    = useState(true);
  const [time,     setTime]     = useState(new Date());
  const [expiries, setExpiries] = useState([]);
  const [expiry,   setExpiry]   = useState(null);

  useEffect(() => {
    getMeta()
      .then(meta => { setExpiries(meta.expiries||[]); if(meta.expiries?.length) setExpiry(meta.expiries[0]); })
      .catch(() => console.warn("Backend offline — no expiries loaded"));
  }, []);

  useEffect(() => {
    const t = setInterval(() => { setPulse(p=>!p); setTime(new Date()); }, 1000);
    return () => clearInterval(t);
  }, []);

  const renderPage = () => {
    const props = { expiry };
    if (page==="overview") return <Overview   {...props}/>;
    if (page==="oi")       return <OIVolume   {...props}/>;
    if (page==="heatmap")  return <Heatmap    {...props}/>;
    if (page==="vol")      return <Volatility {...props}/>;
    if (page==="ai")       return <AIInsights {...props}/>;
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, backgroundImage:`radial-gradient(ellipse at 10% 10%,${C.green}07 0%,transparent 50%),radial-gradient(ellipse at 90% 90%,${C.cyan}05 0%,transparent 50%)`, fontFamily:"'JetBrains Mono',monospace", color:C.text }}>

      <div style={{ borderBottom:`1px solid ${C.green}15`, padding:"11px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(3,10,5,0.97)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:100 }}>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.green},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:`0 0 16px ${C.green}40` }}>◈</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#e2e8f0", letterSpacing:-0.5 }}>OPTIX</div>
            <div style={{ fontSize:7, color:C.muted, letterSpacing:3 }}>OPTIONS ANALYTICS PLATFORM</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setPage(t.id)} style={{ background:page===t.id?`${C.green}12`:"transparent", border:page===t.id?`1px solid ${C.green}35`:"1px solid transparent", borderRadius:6, padding:"7px 14px", cursor:"pointer", color:page===t.id?C.green:C.textDim, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:1.2, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s", boxShadow:page===t.id?`0 0 12px ${C.green}15`:"none" }}
              onMouseEnter={e=>{if(page!==t.id){e.currentTarget.style.color=C.green;e.currentTarget.style.borderColor=`${C.green}20`;}}}
              onMouseLeave={e=>{if(page!==t.id){e.currentTarget.style.color=C.textDim;e.currentTarget.style.borderColor="transparent";}}}
            ><span>{t.icon}</span>{t.label}</button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {expiries.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:9, color:C.textDim, letterSpacing:2 }}>EXPIRY</span>
              <select value={expiry||""} onChange={e=>setExpiry(e.target.value)}
                style={{ background:"#0a1a0f", color:C.green, border:`1px solid ${C.green}30`, borderRadius:6, padding:"5px 10px", fontSize:11, fontFamily:"'JetBrains Mono',monospace", cursor:"pointer", outline:"none" }}>
                {expiries.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, opacity:pulse?1:0.25, transition:"opacity 0.4s", boxShadow:`0 0 8px ${C.green}` }}/>
            <span style={{ fontSize:10, color:C.textDim }}>LIVE</span>
            <span style={{ fontSize:9, color:C.muted, marginLeft:4 }}>
              {time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} IST
            </span>
          </div>
        </div>
      </div>

      <Ticker expiry={expiry}/>
      <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>{renderPage()}</div>
    </div>
  );
}