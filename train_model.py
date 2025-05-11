import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load the data
df = pd.read_csv('training_data.txt', sep='\t', names=['timestamp', 'url', 'label'])

# Extract features
df['length'] = df['url'].apply(len)
df['dots'] = df['url'].apply(lambda x: x.count('.'))
df['is_malicious'] = df['label'].str.contains('Malicious').astype(int)

# Train the model
X = df[['length', 'dots']]
y = df['is_malicious']
model = RandomForestClassifier()
model.fit(X, y)

# Save the model
joblib.dump(model, 'url_model.pkl')
print("✅ Model trained and saved as url_model.pkl")
