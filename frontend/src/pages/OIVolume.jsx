// src/pages/OIVolume.jsx
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend } from "recharts";
import Card, { SectionTitle } from "../components/Card";
import { C, CHART_STYLE } from "../data/constants";
import { getOIByStrike, getVolumeByStrike, getSummary } from "../data/api";

function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a1a0f", border:`1px solid ${C.green}30`, borderRadius:6, padding:"8px 12px", fontSize:10 }}>
      <div style={{ color:C.textDim, marginBottom:4 }}>Strike {label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color }}>{p.name}: {(p.value/100000).toFixed(2)}L</div>)}
    </div>
  );
}

export default function OIVolume({ expiry }) {
  const [oiData,  setOiData]  = useState([]);
  const [volData, setVolData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOIByStrike(expiry), getVolumeByStrike(expiry), getSummary(expiry)])
      .then(([oi, vol, sum]) => {
        // Merge OI change signal (highlight top OI strikes)
        const maxCE = Math.max(...oi.map(d => d.oi_CE));
        const maxPE = Math.max(...oi.map(d => d.oi_PE));
        setOiData(oi.map(d => ({ ...d, isTopCE: d.oi_CE === maxCE, isTopPE: d.oi_PE === maxPE })));
        setVolData(vol);
        setSummary(sum);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [expiry]);

  if (loading) return <Loader />;

  const maxPain    = summary?.max_pain;
  const topCE      = oiData.find(d => d.isTopCE)?.strike;
  const topPE      = oiData.find(d => d.isTopPE)?.strike;

  // Volume skew for thinkorswim-style OI change bars
  const oiChangeBars = oiData.map(d => ({
    strike: d.strike,
    delta:  d.oi_CE - d.oi_PE,   // positive = calls dominate
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* OI Bar chart — thinkorswim style */}
      <Card delay={0} accent={C.green}>
        <SectionTitle>OPEN INTEREST — CALL vs PUT WITH MAX PAIN (THINKORSWIM STYLE)</SectionTitle>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={oiData} style={CHART_STYLE} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" vertical={false} />
            <XAxis dataKey="strike" tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} />
            <YAxis tickFormatter={v => (v/100000).toFixed(1)+"L"} tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize:10, color:C.textDim }} />
            {maxPain && <ReferenceLine x={maxPain} stroke={C.purple} strokeWidth={2} strokeDasharray="5 3" label={{ value:"MAX PAIN", fill:C.purple, fontSize:9, position:"top" }} />}
            {topCE   && <ReferenceLine x={topCE}   stroke={C.red}    strokeWidth={1} strokeDasharray="3 5" label={{ value:"RES",      fill:C.red,    fontSize:9, position:"insideTopLeft" }} />}
            {topPE   && <ReferenceLine x={topPE}   stroke={C.green}  strokeWidth={1} strokeDasharray="3 5" label={{ value:"SUP",      fill:C.green,  fontSize:9, position:"insideTopLeft" }} />}
            <Bar dataKey="oi_CE" name="Call OI" fill={C.green} fillOpacity={0.7} radius={[3,3,0,0]} />
            <Bar dataKey="oi_PE" name="Put OI"  fill={C.red}   fillOpacity={0.7} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* OI Difference — CE minus PE — thinkorswim style */}
      <Card delay={150} accent={C.cyan}>
        <SectionTitle accent={C.cyan}>CE vs PE OI DOMINANCE — THINKORSWIM STYLE (▲ CALL / ▼ PUT)</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={oiChangeBars} style={CHART_STYLE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" vertical={false} />
            <XAxis dataKey="strike" tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} />
            <YAxis tickFormatter={v => (v/100000).toFixed(1)+"L"} tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
            <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
              <div style={{ background:"#0a1a0f", border:`1px solid ${C.green}30`, borderRadius:6, padding:"8px 12px", fontSize:10 }}>
                <div style={{ color:C.textDim }}>Strike {label}</div>
                <div style={{ color: payload[0]?.value > 0 ? C.green : C.red }}>
                  {payload[0]?.value > 0 ? "Calls dominate" : "Puts dominate"}: {Math.abs(payload[0]?.value / 100000).toFixed(2)}L
                </div>
              </div>
            ) : null} />
            <ReferenceLine y={0} stroke={C.muted} strokeWidth={1} />
            <Bar dataKey="delta" name="CE-PE OI">
              {oiChangeBars.map((d, i) => <Cell key={i} fill={d.delta > 0 ? C.green : C.red} fillOpacity={0.75} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Volume chart */}
      <Card delay={300} accent={C.purple}>
        <SectionTitle accent={C.purple}>TRADING VOLUME — CALL vs PUT</SectionTitle>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={volData} style={CHART_STYLE} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" vertical={false} />
            <XAxis dataKey="strike" tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} />
            <YAxis tickFormatter={v => (v/1000).toFixed(0)+"K"} tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
            <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
              <div style={{ background:"#0a1a0f", border:`1px solid ${C.green}30`, borderRadius:6, padding:"8px 12px", fontSize:10 }}>
                <div style={{ color:C.textDim, marginBottom:4 }}>Strike {label}</div>
                {payload.map((p,i) => <div key={i} style={{ color:p.color }}>{p.name}: {(p.value/1000).toFixed(0)}K</div>)}
              </div>
            ) : null} />
            <Legend wrapperStyle={{ fontSize:10, color:C.textDim }} />
            <Bar dataKey="volume_CE" name="Call Vol" fill={C.cyan}   fillOpacity={0.7} radius={[3,3,0,0]} />
            <Bar dataKey="volume_PE" name="Put Vol"  fill={C.purple} fillOpacity={0.7} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}

const Loader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, flexDirection:"column", gap:12 }}>
    <div style={{ width:32, height:32, border:`2px solid ${C.green}30`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <span style={{ fontSize:11, color:C.textDim }}>Loading OI data...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);