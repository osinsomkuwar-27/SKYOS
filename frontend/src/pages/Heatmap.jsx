// src/pages/Heatmap.jsx
import { useState, useEffect } from "react";
import Card, { SectionTitle } from "../components/Card";
import { C } from "../data/constants";
import { getHeatmap, getOIByStrike } from "../data/api";

export default function Heatmap({ expiry }) {
  const [heatmap, setHeatmap] = useState(null);
  const [oiData,  setOiData]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getHeatmap(expiry), getOIByStrike(expiry)])
      .then(([h, oi]) => { setHeatmap(h); setOiData(oi); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [expiry]);

  if (loading) return <Loader />;
  if (!heatmap) return null;

  const maxVal = Math.max(...heatmap.values.flat());

  // Volume skew — TradingView style
  const skewData = oiData.map(d => ({
    strike:    d.strike,
    skewRatio: (d.oi_CE - d.oi_PE) / (d.oi_CE + d.oi_PE + 1),
    totalOI:   d.oi_CE + d.oi_PE,
    label:     d.oi_CE > d.oi_PE ? "CALL DOM" : "PUT DOM",
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Volume Skew Heatmap — TradingView style */}
      <Card delay={0} accent={C.green}>
        <SectionTitle>OI SKEW HEATMAP — TRADINGVIEW STYLE (GREEN=CALLS, RED=PUTS DOMINATE)</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${skewData.length},1fr)`, gap:4, marginTop:8 }}>
          {skewData.map((d, i) => {
            const intensity = Math.abs(d.skewRatio);
            const isCall    = d.skewRatio > 0;
            return (
              <div key={i}
                title={`Strike ${d.strike}: ${d.label}\nTotal OI: ${(d.totalOI/100000).toFixed(2)}L`}
                style={{ background: isCall ? `rgba(0,255,136,${0.1+intensity*0.7})` : `rgba(255,61,90,${0.1+intensity*0.7})`, border:`1px solid ${isCall?C.green:C.red}30`, borderRadius:6, padding:"12px 4px", textAlign:"center", cursor:"pointer", transition:"transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ fontSize:9, color:"#e2e8f0", fontWeight:700 }}>{d.strike}</div>
                <div style={{ fontSize:8, color:isCall?C.green:C.red, marginTop:3 }}>{d.label}</div>
                <div style={{ fontSize:7, color:C.textDim, marginTop:2 }}>{(d.totalOI/100000).toFixed(1)}L</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, fontSize:10, color:C.textDim }}>
          <span><span style={{ color:C.green }}>■</span> Call OI dominant</span>
          <span><span style={{ color:C.red }}>■</span> Put OI dominant</span>
        </div>
      </Card>

      {/* Volume Heatmap — Strike × Date — real backend data */}
      <Card delay={150} accent={C.cyan}>
        <SectionTitle accent={C.cyan}>TOTAL VOLUME HEATMAP — STRIKE × DATE (REAL DATA)</SectionTitle>
        <div style={{ overflowX:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3, minWidth: heatmap.strikes.length * 50 }}>
            {heatmap.dates.map((date, di) => (
              <div key={date} style={{ display:"flex", alignItems:"center", gap:3 }}>
                <div style={{ width:72, fontSize:8, color:C.textDim, textAlign:"right", paddingRight:8, flexShrink:0 }}>{date}</div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${heatmap.strikes.length},1fr)`, flex:1, gap:3 }}>
                  {heatmap.strikes.map((s, si) => {
                    const val       = heatmap.values[si]?.[di] ?? 0;
                    const intensity = maxVal > 0 ? val / maxVal : 0;
                    return (
                      <div key={s}
                        title={`${date} | Strike ${s}: ${(val/1000).toFixed(0)}K vol`}
                        style={{ background:`rgba(0,212,255,${0.05+intensity*0.75})`, borderRadius:4, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:intensity>0.5?"#e2e8f0":C.textDim, cursor:"pointer", transition:"transform 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
                        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                      >
                        {val > 0 ? (val/1000).toFixed(0)+"K" : "—"}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Strike labels */}
            <div style={{ display:"flex", gap:3, marginTop:4 }}>
              <div style={{ width:72 }} />
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${heatmap.strikes.length},1fr)`, flex:1, gap:3 }}>
                {heatmap.strikes.map(s => <div key={s} style={{ fontSize:7, color:C.textDim, textAlign:"center" }}>{s}</div>)}
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}

const Loader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, flexDirection:"column", gap:12 }}>
    <div style={{ width:32, height:32, border:`2px solid ${C.cyan}30`, borderTop:`2px solid ${C.cyan}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <span style={{ fontSize:11, color:C.textDim }}>Loading heatmap...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);