import pandas as pd
import numpy as np


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["datetime"] = pd.to_datetime(df["datetime"])
    df["expiry"] = pd.to_datetime(df["expiry"])

    df["pcr_oi"]  = df["oi_PE"]     / (df["oi_CE"]     + 1)
    df["pcr_vol"] = df["volume_PE"] / (df["volume_CE"] + 1)

    df["total_oi"]  = df["oi_CE"]     + df["oi_PE"]
    df["total_vol"] = df["volume_CE"] + df["volume_PE"]
    df["oi_diff"]   = df["oi_CE"]     - df["oi_PE"]
    df["vol_diff"]  = df["volume_CE"] - df["volume_PE"]

    df["moneyness"] = df["strike"] - df["ATM"]
    df["iv_proxy"]  = (df["CE"] + df["PE"]) / (df["spot_close"] * 0.01 + 1e-9)

    df["expiry_str"] = df["expiry"].dt.strftime("%Y-%m-%d")

    return df


def compute_max_pain(df: pd.DataFrame) -> float:
    """
    Accepts a DataFrame already filtered by expiry.
    Uses the last available timestamp per strike (latest OI snapshot).
    Returns the strike with minimum total pain.
    """
    latest = (
        df.sort_values("datetime")
          .groupby("strike")[["oi_CE", "oi_PE"]]
          .last()
          .reset_index()
    )

    strikes  = latest["strike"].values
    oi_ce    = dict(zip(latest["strike"], latest["oi_CE"]))
    oi_pe    = dict(zip(latest["strike"], latest["oi_PE"]))

    pain = {}
    for s in strikes:
        call_loss = sum(max(0.0, float(s) - float(k)) * float(oi_ce.get(k, 0)) for k in strikes)
        put_loss  = sum(max(0.0, float(k) - float(s)) * float(oi_pe.get(k, 0)) for k in strikes)
        pain[s]   = call_loss + put_loss

    if not pain:
        return 0.0

    return float(min(pain, key=pain.get))