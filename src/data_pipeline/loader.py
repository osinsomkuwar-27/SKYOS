import pandas as pd

def load_data():
    df1 = pd.read_csv("data/raw/2026-02-17_exp.csv")
    df2 = pd.read_csv("data/raw/2026-02-24_exp.csv")
    df3 = pd.read_csv("data/raw/2026-03-02_exp.csv")
    df = pd.concat([df1, df2, df3], ignore_index=True)
    return df