from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from datetime import datetime
import joblib  # For loading the ML model
import os
model = joblib.load("url_model.pkl")

app = Flask(__name__)
CORS(app)

API_KEY = ""
#AIzaSyCiYSxGnirc3ejfCQDCM02hO45k9PA0x28

# ✅ Load your trained ML model (make sure this file exists)
model_path = "url_model.pkl"
model = joblib.load(model_path) if os.path.exists(model_path) else None

@app.route('/')
def home():
    return "✅ Flask server is running. Use /analyze-url via POST."


@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    url = request.json.get('url')
    print(f"\n📡 Received URL to scan: {url}")

    if not url or len(url) < 5:
        return jsonify({'risk': 'Suspicious ⚠️', 'reason': 'Invalid or empty URL'})

    # Step 1: Google Safe Browsing API
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"
    payload = {
        "client": {"clientId": "yourcompanyname", "clientVersion": "1.5.2"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(endpoint, headers=headers, json=payload)
    result = response.json()
    print("🛡️ Google Safe Browsing result:", result)

    if result.get("matches"):
        return jsonify({'risk': 'Malicious ❌', 'reason': 'Listed in Safe Browsing database'})

    # Step 2: Use basic AI heuristics
    suspicious_keywords = ['free', 'login', 'verify', 'update', 'secure', 'click']
    if (
        len(url) < 8 or len(url) > 100 or
        '.' not in url or
        any(word in url.lower() for word in suspicious_keywords)
    ):
        return jsonify({'risk': 'Suspicious ⚠️', 'reason': 'Heuristics flagged this URL as potentially risky'})

    # Step 3: Predict using trained ML model
    if model:
        length = len(url)
        dots = url.count(".")
        has_suspicious = int(any(word in url.lower() for word in ["free", "login", "verify", "update", "secure", "click"]))
        prediction = model.predict([[length, dots, has_suspicious]])[0]

        print("🧠 ML model prediction:", prediction)

        if prediction == 1:
            return jsonify({'risk': 'Suspicious ⚠️', 'reason': 'AI model flagged this URL as suspicious'})


    # Final fallback
    return jsonify({'risk': 'Safe ✅', 'reason': 'No threats detected'})


@app.route('/report-site', methods=['POST'])
def report_site():
    data = request.get_json()
    url = data.get('url')
    risk = data.get('risk')
    timestamp = datetime.utcnow().isoformat()

    with open('training_data.txt', 'a') as f:
        f.write(f"{timestamp}\t{url}\t{risk}\n")

    return jsonify({'status': 'logged'})


if __name__ == '__main__':
    app.run(debug=True)
