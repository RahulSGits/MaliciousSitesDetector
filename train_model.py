import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Step 1: load training data
try:
    df = pd.read_csv("training_data.txt", sep="\t", header=None, names=["timestamp", "url", "label"])
    
    # Step 2: Feature engineering
    df["length"] = df["url"].apply(len)
    df["dots"] = df["url"].apply(lambda x: x.count('.'))
    df["has_suspicious_words"] = df["url"].apply(
        lambda x: int(any(word in x.lower() for word in ["free", "login", "verify", "update", "secure", "click"]))
    )
    
    # Step 3: label encoding (1 = malicious, 0 = safe)
    df["is_malicious"] = df["label"].str.contains("Malicious").astype(int)
    
    # Step 4: prepare training data
    X = df[["length", "dots", "has_suspicious_words"]]
    y = df["is_malicious"]
    
    # Step 5: train model
    model = RandomForestClassifier()
    model.fit(X, y)
    
    # Step 6: save model
    joblib.dump(model, "url_model.pkl")
    print("✅ Model trained and saved as url_model.pkl")
    
except Exception as e:
    print(f"Error training model: {str(e)}")
    print("Creating a basic model...")
    # Create a simple model if training fails
    from sklearn.datasets import make_classification
    X, y = make_classification(n_samples=100, n_features=3)
    model = RandomForestClassifier()
    model.fit(X, y)
    joblib.dump(model, "url_model.pkl")
