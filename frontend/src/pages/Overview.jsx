// src/pages/Overview.jsx
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Card, { SectionTitle } from "../components/Card";
import StatCard from "../components/StatCard";
import { C, CHART_STYLE, SENT_COLOR, getSentiment } from "../data/constants";
import { getSummary, getPCRTimeseries, getAnomalies } from "../data/api";

function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a1a0f", border: `1px solid ${C.green}30`, borderRadius: 6, padding: "8px 12px", fontSize: 10 }}>
      <div style={{ color: C.textDim, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}</div>)}
    </div>
  );
}

function PCRBar({ pcr }) {
  const rank = Math.min((pcr / 2) * 100, 100);
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(rank), 600); }, [rank]);
  const color = rank > 65 ? C.red : rank > 40 ? C.amber : C.green;
  return (
    <Card accent={C.cyan} delay={400}>
      <SectionTitle accent={C.cyan}>PUT-CALL RATIO PRESSURE</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: C.textDim }}>Bullish</span>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{pcr.toFixed(2)}<span style={{ fontSize: 11, color: C.textDim }}> PCR</span></span>
        <span style={{ fontSize: 10, color: C.textDim }}>Bearish</span>
      </div>
      <div style={{ background: "#0f1f14", borderRadius: 4, height: 10, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${width}%`, background: `linear-gradient(90deg,${C.green},${color})`, borderRadius: 4, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 10px ${color}60` }} />
        {[25,50,75].map(m => <div key={m} style={{ position:"absolute", left:`${m}%`, top:0, width:1, height:"100%", background:"#1e293b" }}/>)}
      </div>
      <div style={{ fontSize: 9, color: C.textDim, marginTop: 6 }}>
        {pcr > 1.3 ? "⚠ High PCR — bearish pressure" : pcr < 0.8 ? "Low PCR — bullish sentiment" : "Neutral PCR — balanced market"}
      </div>
    </Card>
  );
}

function SentimentBadge({ sentiment, pcr }) {
  const color = SENT_COLOR[sentiment];
  const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1200); return () => clearInterval(t); }, []);
  return (
    <Card accent={color} delay={200}>
      <SectionTitle accent={color}>MARKET SENTIMENT</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color, textShadow: `0 0 30px ${color}60`, letterSpacing: -1, fontFamily: "'Syne',sans-serif" }}>{sentiment}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: C.textDim }}>PCR: <span style={{ color }}>{pcr.toFixed(2)}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, opacity: pulse ? 1 : 0.25, transition: "opacity 0.4s" }} />
            <span style={{ fontSize: 9, color: C.textDim }}>LIVE</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Overview({ expiry }) {
  const [summary,   setSummary]   = useState(null);
  const [pcrData,   setPcrData]   = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    Promise.all([getSummary(expiry), getPCRTimeseries(expiry), getAnomalies(expiry)])
      .then(([s, pcr, anom]) => {
        setSummary(s);
        setPcrData(pcr.map(d => ({ time: d.datetime.slice(11,16), pcr: d.pcr_oi })));
        setAnomalies(anom.slice(0, 4));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [expiry]);

  if (loading) return <Loader />;
  if (error || !summary) return <Err />;

  const sentiment = getSentiment(summary.pcr);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        <StatCard label="NIFTY Spot"     value={summary.spot}        prefix="₹" accent={C.green}                 delay={0}   sub="underlying" />
        <StatCard label="Total CE OI"    value={summary.total_ce_oi}            accent={C.cyan}                  delay={80}  sub="call OI" />
        <StatCard label="Total PE OI"    value={summary.total_pe_oi}            accent={C.purple}                delay={160} sub="put OI" />
        <StatCard label="Put-Call Ratio" value={summary.pcr}                    accent={SENT_COLOR[sentiment]}   delay={240} badge={sentiment} />
        <StatCard label="Max Pain"       value={summary.max_pain}   prefix="₹"  accent={C.amber}                 delay={320} sub="expiry magnet" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
        <PCRBar pcr={summary.pcr} />
        <SentimentBadge sentiment={sentiment} pcr={summary.pcr} />
      </div>

      <Card delay={500} accent={C.green}>
        <SectionTitle>PCR TIMESERIES — LIVE DATA</SectionTitle>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={pcrData} style={CHART_STYLE}>
            <defs>
              <linearGradient id="pcrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f2a1a" />
            <XAxis dataKey="time" tick={{ fill: C.textDim, fontSize: 9 }} tickLine={false} />
            <YAxis domain={["auto","auto"]} tick={{ fill: C.textDim, fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CTip />} />
            <ReferenceLine y={1}   stroke={C.amber} strokeDasharray="4 4" label={{ value:"PCR=1",   fill:C.amber, fontSize:9, position:"insideTopRight" }} />
            <ReferenceLine y={1.3} stroke={C.red}   strokeDasharray="3 6" label={{ value:"BEARISH", fill:C.red,   fontSize:9, position:"insideTopRight" }} />
            <Area type="monotone" dataKey="pcr" stroke={C.green} strokeWidth={2} fill="url(#pcrGrad)" dot={false} name="PCR" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card delay={650} accent={C.red}>
        <SectionTitle accent={C.red}>AI ANOMALIES — TOP DETECTIONS</SectionTitle>
        {anomalies.length === 0
          ? <div style={{ color: C.textDim, fontSize: 12 }}>No anomalies detected.</div>
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {anomalies.map((a, i) => (
                <div key={i} style={{ background:"#060f08", border:`1px solid ${C.red}22`, borderLeft:`3px solid ${C.red}`, borderRadius:6, padding:"10px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ background:`${C.red}15`, border:`1px solid ${C.red}40`, color:C.red, borderRadius:3, padding:"1px 6px", fontSize:8, letterSpacing:1 }}>ANOMALY</span>
                    <span style={{ fontSize:9, color:C.muted }}>Strike {a.strike}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.text }}>Score: <span style={{ color:C.red }}>{a.anomaly_score.toFixed(3)}</span> · CE: {(a.volume_CE/1000).toFixed(0)}K · PE: {(a.volume_PE/1000).toFixed(0)}K</div>
                  <div style={{ fontSize:9, color:C.textDim, marginTop:4 }}>{a.datetime.slice(0,16).replace("T"," ")}</div>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}

const Loader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, flexDirection:"column", gap:12 }}>
    <div style={{ width:32, height:32, border:`2px solid ${C.green}30`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <span style={{ fontSize:11, color:C.textDim }}>Loading from backend...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const Err = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, flexDirection:"column", gap:8 }}>
    <span style={{ fontSize:20 }}>⚠</span>
    <span style={{ color:C.red, fontSize:13 }}>Backend not reachable.</span>
    <span style={{ color:C.textDim, fontSize:11 }}>Make sure FastAPI is on http://localhost:8000</span>
  </div>
);