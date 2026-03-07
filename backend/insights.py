from google import genai
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_insights(
    anomalies_df: pd.DataFrame,
    pcr: float,
    max_pain: float,
    expiry: str,
    spot: float,
) -> str:

    top_anomalies = anomalies_df.head(10)
    anomaly_text = top_anomalies[
        ["datetime", "strike", "volume_CE", "volume_PE", "oi_CE", "oi_PE", "anomaly_score"]
    ].to_string(index=False)

    prompt = f"""You are an expert NIFTY options market analyst.
Analyze the following data and provide structured insights.

Expiry Date: {expiry}
NIFTY Spot Price: {spot:.2f}
Put-Call Ratio (OI): {pcr:.4f}
Max Pain Strike: {max_pain:.0f}

Top Anomalous Rows detected by Isolation Forest:
{anomaly_text}

Respond in EXACTLY this format:

**Market Sentiment:** Bullish / Bearish / Neutral
**Support Level:** XXXXX
**Resistance Level:** XXXXX
**Unusual Activity:** Describe suspicious volume or OI spikes and what they indicate
**Summary:** 2-3 lines on market outlook, key levels, and trader positioning
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text