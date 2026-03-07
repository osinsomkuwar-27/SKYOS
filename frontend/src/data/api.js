// src/data/api.js
// ─────────────────────────────────────────────────────────────────────────────
//  Real API calls mapped exactly to backend/main.py endpoints
//  All endpoints support optional ?expiry=YYYY-MM-DD query param
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000"; // change if backend runs on different port

async function get(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status} on ${endpoint}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/meta
//  Returns: { expiries: string[], strikes: number[], total_rows: number }
// ─────────────────────────────────────────────────────────────────────────────
export async function getMeta() {
  return get("/api/meta");
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/summary?expiry=
//  Returns: { spot, pcr, max_pain, total_ce_oi, total_pe_oi }
// ─────────────────────────────────────────────────────────────────────────────
export async function getSummary(expiry = null) {
  return get("/api/summary", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/oi_by_strike?expiry=
//  Returns: [{ strike, oi_CE, oi_PE }]
// ─────────────────────────────────────────────────────────────────────────────
export async function getOIByStrike(expiry = null) {
  return get("/api/oi_by_strike", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/volume_by_strike?expiry=
//  Returns: [{ strike, volume_CE, volume_PE }]
// ─────────────────────────────────────────────────────────────────────────────
export async function getVolumeByStrike(expiry = null) {
  return get("/api/volume_by_strike", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/pcr_timeseries?expiry=
//  Returns: [{ datetime, pcr_oi }]
// ─────────────────────────────────────────────────────────────────────────────
export async function getPCRTimeseries(expiry = null) {
  return get("/api/pcr_timeseries", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/heatmap?expiry=
//  Returns: { strikes: number[], dates: string[], values: number[][] }
// ─────────────────────────────────────────────────────────────────────────────
export async function getHeatmap(expiry = null) {
  return get("/api/heatmap", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/option_chain?expiry=
//  Returns: [{ strike, oi_CE, volume_CE, oi_PE, volume_PE, is_atm }]
// ─────────────────────────────────────────────────────────────────────────────
export async function getOptionChain(expiry = null) {
  return get("/api/option_chain", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/anomalies?expiry=
//  Returns: [{ datetime, strike, volume_CE, volume_PE, oi_CE, oi_PE, anomaly_score }]
// ─────────────────────────────────────────────────────────────────────────────
export async function getAnomalies(expiry = null) {
  return get("/api/anomalies", { expiry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/insights?expiry=
//  Returns: { markdown: string }  ← AI generated markdown summary
// ─────────────────────────────────────────────────────────────────────────────
export async function getInsights(expiry = null) {
  return get("/api/insights", { expiry });
}