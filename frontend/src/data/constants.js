// src/data/constants.js
// Design tokens only — no mock data

export const C = {
  bg:      "#030a05",
  surface: "rgba(8,20,12,0.92)",
  green:   "#00ff88",
  cyan:    "#00d4ff",
  red:     "#ff3d5a",
  amber:   "#ffaa00",
  purple:  "#9d6fff",
  muted:   "#334155",
  text:    "#94a3b8",
  textDim: "#475569",
};

export const CHART_STYLE = {
  backgroundColor: "transparent",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
};

export const SENT_COLOR = {
  BULLISH: "#00ff88",
  BEARISH: "#ff4466",
  NEUTRAL: "#ffaa00",
};

export function getSentiment(pcr) {
  return pcr > 1.3 ? "BEARISH" : pcr < 0.8 ? "BULLISH" : "NEUTRAL";
}