import pandas as pd

def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    df["datetime"] = pd.to_datetime(df["datetime"])
    df["expiry"]   = pd.to_datetime(df["expiry"])
    
    df = df.drop_duplicates()
    
    return df