// src/components/InsightItem.jsx
import { useState, useEffect } from "react";
import { C } from "../data/mockData";

const SEV_COLOR = { HIGH: C.red, MED: C.amber, LOW: C.cyan };

export default function InsightItem({ ins, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const color = SEV_COLOR[ins.sev];

  return (
    <div style={{
      background:  "#060f08",
      border:      `1px solid ${color}22`,
      borderLeft:  `4px solid ${color}`,
      borderRadius: 8,
      padding:     "14px 18px",
      opacity:     show ? 1 : 0,
      transform:   show ? "translateX(0)" : "translateX(-24px)",
      transition:  "opacity 0.4s ease, transform 0.4s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: `${color}15`, border: `1px solid ${color}40`,
            color, borderRadius: 4, padding: "2px 8px", fontSize: 9, letterSpacing: 1,
          }}>
            {ins.type}
          </span>
          <span style={{ background: `${color}10`, color, borderRadius: 4, padding: "2px 6px", fontSize: 9 }}>
            {ins.sev}
          </span>
        </div>
        <span style={{ fontSize: 10, color: C.textDim }}>{ins.time} IST</span>
      </div>
      <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{ins.text}</div>
    </div>
  );
}