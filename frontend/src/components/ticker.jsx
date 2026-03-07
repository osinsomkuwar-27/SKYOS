// src/components/Ticker.jsx
import { useState, useEffect } from "react";
import { C } from "../data/constants";
import { getSummary } from "../data/api";

export default function Ticker({ expiry }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSummary(expiry).then(setData).catch(() => {});
  }, [expiry]);

  const items = data ? [
    `NIFTY SPOT ₹${data.spot?.toLocaleString("en-IN")}`,
    `PCR ${data.pcr?.toFixed(2)}`,
    `MAX PAIN ₹${data.max_pain?.toLocaleString("en-IN")}`,
    `TOTAL CE OI ${(data.total_ce_oi/100000)?.toFixed(1)}L`,
    `TOTAL PE OI ${(data.total_pe_oi/100000)?.toFixed(1)}L`,
    `SENTIMENT ${data.pcr > 1.3 ? "BEARISH ▼" : data.pcr < 0.8 ? "BULLISH ▲" : "NEUTRAL →"}`,
  ] : [
    "NIFTY SPOT —", "PCR —", "MAX PAIN —", "LOADING DATA...",
  ];

  return (
    <div style={{ overflow:"hidden", borderBottom:`1px solid ${C.green}15`, padding:"5px 0", background:`${C.green}06` }}>
      <div style={{ display:"inline-flex", gap:48, whiteSpace:"nowrap", animation:"ticker 28s linear infinite", fontSize:11, color:C.green }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ opacity:0.85 }}>
            <span style={{ color:C.muted, marginRight:14 }}>◆</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}