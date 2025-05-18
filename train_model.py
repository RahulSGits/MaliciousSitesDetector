import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/report-site', methods=['POST'])
def report_site():
    data = request.get_json()
    url = data.get('url')
    risk = data.get('risk')
    timestamp = datetime.utcnow().isoformat()

    # Append new data line to training_data.txt
    with open('training_data.txt', 'a') as f:
        f.write(f"{timestamp}\t{url}\t{risk}\n")

    return jsonify({'status': 'logged'})


# Step 1: Load training data
df = pd.read_csv("training_data.txt", sep="\t", header=None, names=["timestamp", "url", "label"])

# Step 2: Feature Engineering
df["length"] = df["url"].apply(len)
df["dots"] = df["url"].apply(lambda x: x.count('.'))
df["has_suspicious_words"] = df["url"].apply(
    lambda x: int(any(word in x.lower() for word in ["free", "login", "verify", "update", "secure", "click"]))
)

# Step 3: Label Encoding (1 = malicious, 0 = safe)
df["is_malicious"] = df["label"].str.contains("Malicious").astype(int)

# Step 4: Prepare training data
X = df[["length", "dots", "has_suspicious_words"]]
y = df["is_malicious"]

# Step 5: Train model
model = RandomForestClassifier()
model.fit(X, y)

# Step 6: Save model
joblib.dump(model, "url_model.pkl")
print("✅ Model trained and saved as url_model.pkl")
