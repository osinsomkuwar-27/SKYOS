// src/components/Card.jsx
import { useState, useEffect } from "react";
import { C } from "../data/constants";

export default function Card({ children, style = {}, accent = C.green, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      background:     C.surface,
      border:         `1px solid ${accent}22`,
      borderRadius:   10,
      padding:        16,
      backdropFilter: "blur(16px)",
      boxShadow:      `0 0 30px ${accent}08, inset 0 1px 0 ${accent}15`,
      opacity:        show ? 1 : 0,
      transform:      show ? "translateY(0)" : "translateY(16px)",
      transition:     `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, accent = C.green }) {
  return (
    <div style={{
      fontSize:      9,
      color:         C.textDim,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom:  12,
      display:       "flex",
      alignItems:    "center",
      gap:           8,
    }}>
      <span style={{ width: 16, height: 1, background: accent, display: "inline-block" }} />
      {children}
    </div>
  );
}