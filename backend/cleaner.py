import pandas as pd

def clean_data(df):

    df = df.drop_duplicates()

    df.columns = df.columns.str.strip()

    numeric_cols = [
        "CE","PE",
        "oi_CE","oi_PE",
        "volume_CE","volume_PE",
        "strike","spot_close"
    ]

    df[numeric_cols] = df[numeric_cols].apply(
        pd.to_numeric,
        errors="coerce"
    )

    df = df.dropna()

    df["datetime"] = pd.to_datetime(df["datetime"])

    df = df.sort_values("datetime")

    df = df.reset_index(drop=True)

    return df


def save_processed_data(df):
    df.to_csv("data/processed/clean_options_data.csv", index=False)