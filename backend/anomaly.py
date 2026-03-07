import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

FEATURE_COLS = ["volume_CE", "volume_PE", "oi_CE", "oi_PE", "pcr_vol", "pcr_oi"]

def detect_anomalies(df: pd.DataFrame, contamination: float = 0.03) -> pd.DataFrame:
    df = df.copy()

    X = df[FEATURE_COLS].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    iso = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    df["is_anomaly"]    = iso.fit_predict(X_scaled)   
    df["anomaly_score"] = iso.score_samples(X_scaled) 

    flagged = df[df["is_anomaly"] == -1].copy()
    flagged = flagged.sort_values("anomaly_score", ascending=True)

    return flagged