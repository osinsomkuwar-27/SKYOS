// src/components/StatCard.jsx
import { useState, useEffect } from "react";
import Card from "./Card";
import { C, SENT_COLOR } from "../data/constants";

export default function StatCard({ label, value, sub, accent = C.green, delay = 0, prefix = "", badge = null }) {
  const [count, setCount] = useState(0);
  const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    let start = null;
    const animate = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1100, 1);
      setCount(num * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(animate);
    };
    const t = setTimeout(() => requestAnimationFrame(animate), delay + 300);
    return () => clearTimeout(t);
  }, [num, delay]);

  const display = num > 100000
    ? (count / 100000).toFixed(2) + "L"
    : num % 1 !== 0
      ? count.toFixed(2)
      : Math.round(count).toLocaleString();

  return (
    <Card delay={delay} accent={accent}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent, letterSpacing: -1 }}>
        {prefix}{display}
      </div>
      {badge && (
        <div style={{
          display: "inline-block", marginTop: 6,
          background: `${SENT_COLOR[badge]}15`,
          border: `1px solid ${SENT_COLOR[badge]}40`,
          color: SENT_COLOR[badge],
          borderRadius: 4, padding: "2px 8px", fontSize: 10, letterSpacing: 1,
        }}>
          {badge}
        </div>
      )}
      {sub && !badge && (
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{sub}</div>
      )}
    </Card>
  );
}