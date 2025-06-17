from flask import Flask, request, jsonify, send_file
import requests
from flask_cors import CORS
from datetime import datetime
import joblib
import os

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyCiYSxGnirc3ejfCQDCM02hO45k9PA0x28"

model_path = "url_model.pkl"
model = joblib.load(model_path) if os.path.exists(model_path) else None

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    url = request.json.get('url')
    print(f"\nReceived URL to scan: {url}")

    if not url or len(url) < 5:
        return jsonify({'risk': 'Suspicious ⚠️', 'reason': 'Invalid or empty URL'})

    # Google Safe Browsing API
    endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY
    payload = {
        "client": {"clientId": "Cyber-Shield", "clientVersion": "1.5.2"},
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
    print("Google Safe Browsing result:", result)

    if result.get("matches"):
        return jsonify({'risk': 'Malicious ❌', 'reason': 'Listed in Safe Browsing database'})

    # Basic AI heuristics
    suspicious_keywords = ['free', 'login', 'verify', 'update', 'secure', 'click']
    if (
        len(url) < 8 or len(url) > 100 or
        '.' not in url or
        any(word in url.lower() for word in suspicious_keywords)
    ):
        return jsonify({'risk': 'Suspicious ⚠️', 'reason': 'Heuristics flagged this URL as potentially risky'})

    # Predict using trained ML model
    if model:
        length = len(url)
        dots = url.count(".")
        has_suspicious = int(any(word in url.lower() for word in suspicious_keywords))
        prediction = model.predict([[length, dots, has_suspicious]])[0]

        print("ML model prediction:", prediction)

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
    app.run(debug=True,port=5000)
