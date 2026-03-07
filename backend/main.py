from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import Optional

from loader import get_dataframe
from cleaner import clean
from features import engineer_features, compute_max_pain
from anomaly import detect_anomalies
from insights import generate_insights

app = FastAPI(title="Options Analytics Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_df: pd.DataFrame = None

def get_df() -> pd.DataFrame:
    global _df
    if _df is None:
        raw     = get_dataframe()
        cleaned = clean(raw)
        _df     = engineer_features(cleaned)
    return _df


def filter_expiry(df: pd.DataFrame, expiry: Optional[str]) -> pd.DataFrame:
    if expiry:
        return df[df["expiry_str"] == expiry]
    nearest = df["expiry_str"].min()
    return df[df["expiry_str"] == nearest]


def safe_float(val):
    try:
        v = float(val)
        return 0.0 if (np.isnan(v) or np.isinf(v)) else v
    except:
        return 0.0


@app.get("/api/meta")
def meta():
    df = get_df()
    return {
        "expiries":   sorted(df["expiry_str"].unique().tolist()),
        "strikes":    sorted([int(s) for s in df["strike"].unique().tolist()]),
        "total_rows": len(df),
    }


@app.get("/api/summary")
def summary(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    latest      = sub.sort_values("datetime").groupby("strike").last().reset_index()
    spot        = safe_float(sub["spot_close"].iloc[-1])
    total_ce_oi = safe_float(latest["oi_CE"].sum())
    total_pe_oi = safe_float(latest["oi_PE"].sum())
    pcr         = safe_float(total_pe_oi / (total_ce_oi + 1))
    max_pain    = safe_float(compute_max_pain(sub))

    return {
        "spot":        spot,
        "pcr":         pcr,
        "max_pain":    max_pain,
        "total_ce_oi": total_ce_oi,
        "total_pe_oi": total_pe_oi,
    }


@app.get("/api/oi_by_strike")
def oi_by_strike(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    latest = sub.sort_values("datetime").groupby("strike")[["oi_CE", "oi_PE"]].last().reset_index()
    latest = latest.sort_values("strike")

    return [
        {
            "strike": int(row["strike"]),
            "oi_CE":  safe_float(row["oi_CE"]),
            "oi_PE":  safe_float(row["oi_PE"]),
        }
        for _, row in latest.iterrows()
    ]


@app.get("/api/volume_by_strike")
def volume_by_strike(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    agg = sub.groupby("strike")[["volume_CE", "volume_PE"]].sum().reset_index()
    agg = agg.sort_values("strike")

    return [
        {
            "strike":    int(row["strike"]),
            "volume_CE": safe_float(row["volume_CE"]),
            "volume_PE": safe_float(row["volume_PE"]),
        }
        for _, row in agg.iterrows()
    ]


@app.get("/api/pcr_timeseries")
def pcr_timeseries(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    ts = (
        sub.groupby("datetime")
           .apply(lambda x: (x["oi_PE"].sum()) / (x["oi_CE"].sum() + 1))
           .reset_index()
    )
    ts.columns = ["datetime", "pcr_oi"]
    ts = ts.sort_values("datetime")

    return [
        {
            "datetime": row["datetime"].strftime("%Y-%m-%dT%H:%M:%S"),
            "pcr_oi":   safe_float(row["pcr_oi"]),
        }
        for _, row in ts.iterrows()
    ]


@app.get("/api/heatmap")
def heatmap(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    sub = sub.copy()
    sub["date"] = sub["datetime"].dt.strftime("%Y-%m-%d")

    pivot = sub.groupby(["strike", "date"])["total_vol"].sum().unstack(fill_value=0)
    pivot = pivot.sort_index()

    strikes = [int(s) for s in pivot.index.tolist()]
    dates   = pivot.columns.tolist()
    values  = pivot.values.tolist()

    return {
        "strikes": strikes,
        "dates":   dates,
        "values":  values,
    }


@app.get("/api/option_chain")
def option_chain(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    latest = (
        sub.sort_values("datetime")
           .groupby("strike")[["oi_CE", "oi_PE", "volume_CE", "volume_PE", "ATM"]]
           .last()
           .reset_index()
           .sort_values("strike")
    )

    atm = safe_float(latest["ATM"].iloc[0])

    return [
        {
            "strike":    int(row["strike"]),
            "oi_CE":     safe_float(row["oi_CE"]),
            "volume_CE": safe_float(row["volume_CE"]),
            "oi_PE":     safe_float(row["oi_PE"]),
            "volume_PE": safe_float(row["volume_PE"]),
            "is_atm":    int(row["strike"]) == int(atm),
        }
        for _, row in latest.iterrows()
    ]


@app.get("/api/anomalies")
def anomalies(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    flagged = detect_anomalies(sub)

    return [
        {
            "datetime":     row["datetime"].strftime("%Y-%m-%dT%H:%M:%S"),
            "strike":       int(row["strike"]),
            "volume_CE":    safe_float(row["volume_CE"]),
            "volume_PE":    safe_float(row["volume_PE"]),
            "oi_CE":        safe_float(row["oi_CE"]),
            "oi_PE":        safe_float(row["oi_PE"]),
            "anomaly_score": safe_float(row["anomaly_score"]),
        }
        for _, row in flagged.iterrows()
    ]


@app.get("/api/insights")
def insights(expiry: Optional[str] = Query(None)):
    df  = get_df()
    sub = filter_expiry(df, expiry)
    if sub.empty:
        raise HTTPException(status_code=404, detail="No data for expiry")

    latest      = sub.sort_values("datetime").groupby("strike").last().reset_index()
    spot        = safe_float(sub["spot_close"].iloc[-1])
    total_ce_oi = safe_float(latest["oi_CE"].sum())
    total_pe_oi = safe_float(latest["oi_PE"].sum())
    pcr         = safe_float(total_pe_oi / (total_ce_oi + 1))
    max_pain    = safe_float(compute_max_pain(sub))

    flagged  = detect_anomalies(sub)
    markdown = generate_insights(flagged, pcr, max_pain, expiry or sub["expiry_str"].iloc[0], spot)

    return {"markdown": markdown}