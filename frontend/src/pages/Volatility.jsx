// src/pages/Volatility.jsx
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend } from "recharts";
import Card, { SectionTitle } from "../components/Card";
import { C, CHART_STYLE } from "../data/constants";
import { getOIByStrike, getPCRTimeseries } from "../data/api";

function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a1a0f", border:`1px solid ${C.green}30`, borderRadius:6, padding:"8px 12px", fontSize:10 }}>
      <div style={{ color:C.textDim, marginBottom:4 }}>Strike {label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color }}>{p.name}: {typeof p.value==="number"?p.value.toFixed(2):p.value}</div>)}
    </div>
  );
}

export default function Volatility({ expiry }) {
  const [oiData,  setOiData]  = useState([]);
  const [pcrData, setPcrData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOIByStrike(expiry), getPCRTimeseries(expiry)])
      .then(([oi, pcr]) => {
        // Derive implied skew proxy from OI ratio per strike
        setOiData(oi.map(d => ({
          strike:    d.strike,
          oi_CE:     d.oi_CE,
          oi_PE:     d.oi_PE,
          skewRatio: d.oi_PE / (d.oi_CE + 1),  // PE/CE ratio as skew proxy
          oiTotal:   d.oi_CE + d.oi_PE,
        })));
        setPcrData(pcr.map(d => ({ time: d.datetime.slice(11,16), pcr: d.pcr_oi })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [expiry]);

  if (loading) return <Loader />;

  // Find ATM as strike with highest total OI
  const atmStrike = oiData.reduce((a, d) => d.oiTotal > a.oiTotal ? d : a, oiData[0] || {})?.strike;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* OI Skew — proxy for IV smile */}
      <Card delay={0} accent={C.purple}>
        <SectionTitle accent={C.purple}>OI SKEW — PUT/CALL OI RATIO BY STRIKE (IV SMILE PROXY)</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={oiData} style={CHART_STYLE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" />
            <XAxis dataKey="strike" tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} />
            <YAxis domain={["auto","auto"]} tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize:10, color:C.textDim }} />
            {atmStrike && <ReferenceLine x={atmStrike} stroke={C.amber} strokeDasharray="4 4" label={{ value:"ATM", fill:C.amber, fontSize:9, position:"top" }} />}
            <Line type="monotone" dataKey="skewRatio" name="PE/CE OI Ratio" stroke={C.purple} strokeWidth={2} dot={{ fill:C.purple, r:3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

        {/* PCR over time as term structure proxy */}
        <Card delay={200} accent={C.amber}>
          <SectionTitle accent={C.amber}>PCR EVOLUTION — SENTIMENT OVER TIME</SectionTitle>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={pcrData} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" />
              <XAxis dataKey="time" tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} />
              <YAxis domain={["auto","auto"]} tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div style={{ background:"#0a1a0f", border:`1px solid ${C.amber}30`, borderRadius:6, padding:"8px 12px", fontSize:10 }}>
                  <div style={{ color:C.textDim }}>{label}</div>
                  <div style={{ color:C.amber }}>PCR: {payload[0]?.value?.toFixed(3)}</div>
                </div>
              ) : null} />
              <ReferenceLine y={1} stroke={C.amber} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="pcr" name="PCR" stroke={C.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Skew bar chart */}
        <Card delay={300} accent={C.cyan}>
          <SectionTitle accent={C.cyan}>PE/CE OI RATIO BY STRIKE</SectionTitle>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={oiData} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" vertical={false} />
              <XAxis dataKey="strike" tick={{ fill:C.textDim, fontSize:8 }} tickLine={false} />
              <YAxis tick={{ fill:C.textDim, fontSize:9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CTip />} />
              <ReferenceLine y={1} stroke={C.amber} strokeDasharray="3 3" />
              <Bar dataKey="skewRatio" name="PE/CE Ratio">
                {oiData.map((d,i) => <Cell key={i} fill={d.skewRatio > 1 ? C.red : C.green} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 3D surface placeholder */}
      <Card delay={400} accent={C.purple} style={{ minHeight:100 }}>
        <SectionTitle accent={C.purple}>3D VOLATILITY SURFACE — OPTIONAL ENHANCEMENT</SectionTitle>
        <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center", border:`1px dashed ${C.purple}30`, borderRadius:8, color:C.textDim, fontSize:11, flexDirection:"column", gap:6 }}>
          <span>npm install react-plotly.js plotly.js</span>
          <span style={{ fontSize:9, color:C.muted }}>Then render: type:"surface", x:strikes, y:dates, z:heatmap.values</span>
        </div>
      </Card>

    </div>
  );
}

const Loader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, flexDirection:"column", gap:12 }}>
    <div style={{ width:32, height:32, border:`2px solid ${C.purple}30`, borderTop:`2px solid ${C.purple}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <span style={{ fontSize:11, color:C.textDim }}>Loading volatility data...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);