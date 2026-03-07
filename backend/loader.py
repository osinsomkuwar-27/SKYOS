import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "clean_options_data.csv")

def get_dataframe() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    return df