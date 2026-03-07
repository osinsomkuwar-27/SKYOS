# NiftyLens 🔭
### AI-Powered NIFTY Options Analytics Platform

> A full-stack options market analytics terminal for NIFTY derivatives traders — combining interactive visualizations, ML-based anomaly detection, and AI-generated market insights.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Dataset](#dataset)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
  - [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Feature Engineering](#feature-engineering)
- [Anomaly Detection](#anomaly-detection)
- [AI Insights](#ai-insights)
- [Screenshots](#screenshots)
- [Team](#team)

---

## Overview

NiftyLens processes **147,051 rows** of 5-minute interval NIFTY options data across **3 weekly expiries** and **101 strike levels** (23100–28100). It delivers a dark-themed trading terminal UI inspired by Zerodha Kite, with automated analytics layers that go beyond what standard brokerage platforms offer.

**Built for:** CodeForge Hackathon 2026

---

## Features

| Feature | Description |
|---|---|
| 📊 **Option Chain Table** | Kite-style CE OI / Strike / PE OI table with ATM row highlighted |
| 📈 **OI Distribution Chart** | CE vs PE open interest bar chart across all strikes |
| 📉 **PCR Time Series** | Put-Call Ratio trend over the intraday session |
| 🌡️ **Volume Heatmap** | Strike × Date × Volume intensity heatmap |
| 🎯 **Max Pain Marker** | Auto-computed Max Pain strike shown as annotated line on OI chart |
| 🟢 **Support / Resistance** | OI-derived support (max PE OI) and resistance (max CE OI) levels |
| 🔴 **Sentiment Badge** | Real-time BULLISH / BEARISH / NEUTRAL badge from PCR in the header |
| 🤖 **Anomaly Detection** | Isolation Forest flags ~3% of rows as unusual trading activity |
| 🧠 **AI Insights** | Gemini API generates structured market analysis from anomaly + PCR data |

---

## Project Structure

```
options-analytics-platform/
│
├── data/
│   └── raw/
│       └── clean_options_data.csv        ← Dataset goes here
│
├── backend/
│   ├── main.py                           ← FastAPI app + all 9 API routes
│   ├── loader.py                         ← Load CSV into DataFrame
│   ├── cleaner.py                        ← Parse datetimes, dedup, sort
│   ├── features.py                       ← PCR, Max Pain, IV proxy, moneyness
│   ├── anomaly.py                        ← Isolation Forest detection
│   ├── insights.py                       ← Gemini API call
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                       ← Main app + routing
│       ├── main.jsx
│       ├── index.css                     ← Dark theme styles
│       └── components/
│           ├── Sidebar.jsx               ← Navigation + expiry selector
│           ├── Header.jsx                ← Spot price + sentiment badge
│           ├── StatCards.jsx             ← PCR, Max Pain, OI cards
│           ├── OIChart.jsx               ← OI bar chart with annotations
│           ├── PCRChart.jsx              ← PCR line chart
│           ├── OptionChain.jsx           ← Option chain table
│           ├── VolumeHeatmap.jsx         ← Volume heatmap
│           ├── AnomalyTable.jsx          ← Anomaly detection table
│           └── AIInsights.jsx            ← AI insights panel
│
├── .env                                  ← API keys (never commit this)
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Dataset

| Property | Value |
|---|---|
| File | `clean_options_data.csv` |
| Rows | 147,051 |
| Columns | 12 |
| Asset | NIFTY (NSE Index) |
| Expiries | 2026-02-17, 2026-02-24, 2026-03-02 |
| Strikes | 23100 to 28100 (50-point intervals, 101 levels) |
| Interval | 5-minute intraday |
| Null values | None |

**Columns:** `symbol`, `datetime`, `expiry`, `strike`, `CE`, `PE`, `oi_CE`, `oi_PE`, `volume_CE`, `volume_PE`, `spot_close`, `ATM`

> Place the dataset at `data/raw/clean_options_data.csv` before running.

---

## Tech Stack

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API framework
- [Pandas](https://pandas.pydata.org/) + [NumPy](https://numpy.org/) — Data processing
- [Scikit-learn](https://scikit-learn.org/) — Isolation Forest anomaly detection
- [google-genai](https://github.com/googleapis/python-genai) — Gemini AI insights
- [python-dotenv](https://pypi.org/project/python-dotenv/) — Environment config
- [Uvicorn](https://www.uvicorn.org/) — ASGI server

**Frontend:**
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) — SPA framework
- [Plotly.js](https://plotly.com/javascript/) + [react-plotly.js](https://github.com/plotly/react-plotly.js/) — All charts
- [Axios](https://axios-http.com/) — HTTP client
- Custom CSS — Dark terminal theme

**DevOps:**
- [Docker](https://www.docker.com/) + [docker-compose](https://docs.docker.com/compose/) — Containerized deployment

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+
- A Gemini API key — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

### Environment Setup

Create a `.env` file in the **project root** (not inside `backend/`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit `.env` to version control. It is already in `.gitignore`.

---

### Running the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

Verify it's working:
```
http://localhost:8000/api/meta
```

Expected response:
```json
{
  "expiries": ["2026-02-17", "2026-02-24", "2026-03-02"],
  "strikes": [23100, 23150, ..., 28100],
  "total_rows": 147051
}
```

---

### Running the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> Make sure the backend is running on port 8000 before opening the frontend.

---

### Running with Docker

```bash
# From the project root
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |

To stop:
```bash
docker-compose down
```

---

## API Reference

Base URL: `http://localhost:8000`

All endpoints accept an optional `?expiry=YYYY-MM-DD` query parameter. Defaults to the nearest expiry if not provided.

| Endpoint | Method | Description |
|---|---|---|
| `/api/meta` | GET | Expiry list, strike list, total row count |
| `/api/summary` | GET | Spot price, PCR, Max Pain, total OI, support/resistance |
| `/api/oi_by_strike` | GET | Latest OI per strike — CE and PE |
| `/api/volume_by_strike` | GET | Total volume per strike — CE and PE |
| `/api/pcr_timeseries` | GET | PCR_OI values over the intraday session |
| `/api/heatmap` | GET | Strike × Date × Volume pivot for heatmap |
| `/api/option_chain` | GET | Full chain with ATM flag |
| `/api/anomalies` | GET | Isolation Forest flagged rows |
| `/api/insights` | GET | Gemini AI markdown analysis |

### Example Responses

**GET /api/summary?expiry=2026-02-17**
```json
{
  "spot": 25715.95,
  "pcr": 1.11,
  "max_pain": 25700.0,
  "total_ce_oi": 174275660.0,
  "total_pe_oi": 193472500.0
}
```

**GET /api/option_chain?expiry=2026-02-17**
```json
[
  { "strike": 25700, "oi_CE": 45000, "volume_CE": 12000, "oi_PE": 43000, "volume_PE": 11500, "is_atm": true },
  ...
]
```

**GET /api/anomalies?expiry=2026-02-17**
```json
[
  { "datetime": "2026-02-10T11:35:00", "strike": 25700, "volume_CE": 98000, "volume_PE": 74000, "anomaly_score": -0.842 },
  ...
]
```

---

## Feature Engineering

All features are computed in `features.py` at server startup:

| Feature | Formula | Purpose |
|---|---|---|
| `pcr_oi` | `oi_PE / (oi_CE + 1)` | Primary sentiment ratio |
| `pcr_vol` | `volume_PE / (volume_CE + 1)` | Intraday volume sentiment |
| `total_oi` | `oi_CE + oi_PE` | Total open interest |
| `total_vol` | `volume_CE + volume_PE` | Total activity |
| `oi_diff` | `oi_CE - oi_PE` | OI directional skew |
| `vol_diff` | `volume_CE - volume_PE` | Volume directional skew |
| `moneyness` | `strike - ATM` | Distance from ATM |
| `iv_proxy` | `(CE + PE) / (spot_close * 0.01)` | Approximate IV |
| `expiry_str` | formatted string | API filtering key |

**Max Pain:**
```
pain[S] = Σ max(0, S-K) × oi_CE[K]  +  Σ max(0, K-S) × oi_PE[K]
max_pain = strike S with minimum pain[S]
```

**Support / Resistance:**
```python
support_strike    = df.groupby('strike')['oi_PE'].mean().idxmax()
resistance_strike = df.groupby('strike')['oi_CE'].mean().idxmax()
```

---

## Anomaly Detection

**File:** `anomaly.py`  
**Model:** `sklearn.ensemble.IsolationForest`

```
Features used: volume_CE, volume_PE, oi_CE, oi_PE, pcr_vol, pcr_oi

Pipeline:
  1. StandardScaler → normalize all 6 features
  2. IsolationForest(contamination=0.03, n_estimators=100, random_state=42)
  3. Flag rows where is_anomaly == -1
  4. Sort by anomaly_score ascending (most suspicious first)
```

The model is fit independently per expiry subset. Approximately 3% of rows are flagged per expiry.

---

## AI Insights

**File:** `insights.py`  
**Model:** `gemini-2.0-flash` via `google-genai` SDK

The `/api/insights` endpoint:
1. Filters data by expiry
2. Runs anomaly detection
3. Computes PCR and Max Pain
4. Sends top 10 anomalies + summary stats to Gemini API
5. Returns structured markdown response

**Output format:**
```
**Market Sentiment:** Bullish / Bearish / Neutral
**Support Level:** XXXXX
**Resistance Level:** XXXXX
**Unusual Activity:** ...
**Summary:** 2-3 lines
```

> ℹ️ The `/api/insights` endpoint takes 3-5 seconds due to the Gemini API call. A loading spinner is shown in the frontend.

---

| Page | Description |
|---|---|
| Dashboard | StatCards + OI Chart + PCR Chart |
| Option Chain | Kite-style table with ATM highlight |
| Heatmap | Volume intensity across strikes and dates |
| Anomalies | ML-flagged rows table |
| AI Insights | Gemini-generated markdown analysis |

---

## Team

Built with ❤️ for CodeForge Hackathon 2026

| Role | Responsibility |
|---|---|
| Backend Lead | FastAPI, data pipeline, ML model |
| Frontend Lead | React, Plotly charts, UI design |
| Data Engineer | Feature engineering, dataset preprocessing |
| AI/ML Engineer | Anomaly detection, Gemini API integration |

---

## License

MIT License — free to use, modify, and distribute.

---
