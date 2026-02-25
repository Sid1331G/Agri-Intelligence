import os
import io
import random
import pickle
import numpy as np
import pandas as pd
import torch
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
from torchvision import models, transforms
import torch.nn as nn
import google.generativeai as genai
from transformers import AutoImageProcessor, AutoModelForImageClassification

# ===============================
# 1️⃣ FLASK APP SETUP
# ===============================
app = Flask(__name__)
CORS(app, supports_credentials=True,
     origins=["http://localhost:5173", "http://localhost:3000"])
app.secret_key = "your_super_secret_key"

# ===============================
# 2️⃣ GEMINI AI SETUP
# ===============================
import google.generativeai as genai

# Your provided API Key
API_KEY = "AIzaSyBYcvnmdxi1f8LuywK0cORF8tbxRy1_e3E"

model_gemini = None

def initialize_gemini():
    global model_gemini
    try:
        api_key = os.environ.get("AIzaSyBYcvnmdxi1f8LuywK0cORF8tbxRy1_e3E", API_KEY)
        if api_key:
            genai.configure(api_key=api_key)
            
            # FIX: Use 'gemini-flash-latest' directly to avoid the 404
            model_name = "gemini-flash-latest" 
            model_gemini = genai.GenerativeModel(model_name)
            
            # Simple test to confirm it's active
            model_gemini.generate_content("test")
            print(f"✅ Gemini Initialized successfully using {model_name}")
        else:
            print("⚠️ Gemini API key missing")
    except Exception as e:
        print(f"❌ Gemini Init Error: {e}")
        model_gemini = None

initialize_gemini()

# ===============================
# 3️⃣ MONGODB CONNECTION
# ===============================
try:
    client_mongo = MongoClient("mongodb+srv://aravindans2004:Aravindans2004@userauth.joa6bii.mongodb.net/")
    db1 = client_mongo['auth_db']
    users_collection = db1['users']
    print("✅ MongoDB Connected")
except Exception as e:
    print(f"❌ MongoDB Error: {e}")

# ===============================
# 4️⃣ PRICE PREDICTION MODEL
# ===============================
price_model = None
column_order = []

def load_price_model():
    global price_model, column_order
    try:
        xgboost_path = os.path.join("models", "xgboost_model.pkl")
        columns_path = os.path.join("models", "column_order.pkl")

        if os.path.exists(xgboost_path) and os.path.exists(columns_path):
            with open(xgboost_path, "rb") as f:
                price_model = pickle.load(f)
            with open(columns_path, "rb") as f:
                column_order = pickle.load(f)
            print("✅ XGBoost Price Model Loaded")
        else:
            print("⚠️ Price model files not found")
    except Exception as e:
        print(f"❌ Price Model Error: {e}")

load_price_model()

COMMODITY_PRICE_RANGES = {
    'Tomato': {"min": (1000, 1500), "max": (1500, 2000)},
    'Onion': {"min": (1000, 1500), "max": (2000, 2500)},
    'Potato': {"min": (2000, 2500), "max": (2500, 3500)},
}

def generate_weekly_predictions(commodity_name, num_weeks=5):
    predictions = []
    start_date = datetime.today()
    ranges = COMMODITY_PRICE_RANGES.get(
        commodity_name, {"min": (1000, 2000), "max": (2000, 3000)})

    for i in range(num_weeks):
        future_date = start_date + timedelta(weeks=i)
        predictions.append({
            'Date': future_date.strftime('%Y-%m-%d'),
            'Min_Price': ranges["min"][0],
            'Max_Price': ranges["max"][1],
            'Predicted_Modal_Price': random.randint(ranges["min"][0], ranges["max"][1])
        })
    return predictions

# ===============================
# 5️⃣ DISEASE DETECTION MODEL
# ===============================
MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
BASE_PROCESSOR = "google/mobilenet_v2_1.0_224"

processor = None
disease_model = None

def load_disease_model():
    global processor, disease_model
    try:
        processor = AutoImageProcessor.from_pretrained(BASE_PROCESSOR)
        disease_model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
        disease_model.eval()
        print("✅ Plant Disease Model Loaded Successfully")
    except Exception as e:
        print(f"❌ Disease Model Load Error: {e}")

load_disease_model()

def predict_disease(image_bytes):
    if processor is None or disease_model is None:
        return "Model not loaded", 0.0
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = disease_model(**inputs)
        scores = torch.softmax(outputs.logits, dim=-1)[0]
    confidence, idx = scores.max(0)
    label = disease_model.config.id2label[idx.item()]
    return label, float(confidence.item())

def get_treatment_advice(label):
    label_lower = label.lower()
    if "healthy" in label_lower:
        return "The plant appears healthy. Maintain proper watering and sunlight."
    elif "blight" in label_lower:
        return "Use copper-based fungicide and remove infected leaves."
    elif "mosaic" in label_lower:
        return "Control aphids and remove infected plants immediately."
    elif "rust" in label_lower:
        return "Improve air circulation and apply sulfur-based fungicides."
    elif "scab" in label_lower:
        return "Prune infected branches and apply fungicides during budding."
    else:
        return "Consult an agricultural officer for tailored treatment."

# ===============================
# 6️⃣ API ROUTES
# ===============================

@app.route('/api/predict', methods=['POST'])
def predict_price():
    variety = request.json.get("variety", "Tomato")
    return jsonify({"weekly_predictions": generate_weekly_predictions(variety)})

@app.route('/api/chat', methods=['POST'])
def chat_assistant():
    if not model_gemini:
        return jsonify({"reply": "AI Assistant is currently offline."}), 503
    
    try:
        data = request.json
        user_message = data.get('message')

        # This context defines the bot's behavior for your Agri-Horticultural project
        system_context = (
            "You are Pandam AI, a specialized assistant for the Agri-Horticultural sector. "
            "You provide insights on crop price trends, disease prevention (like Blight or Rust), "
            "and modern farming techniques like Hydroponics. Keep answers helpful and concise."
        )

        # Generate response using the verified 'gemini-flash-latest' model
        response = model_gemini.generate_content(f"{system_context}\n\nUser: {user_message}")
        
        return jsonify({
            "reply": response.text,
            "status": "success"
        })
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        # If you hit a 429 quota error here, the user gets a friendly message
        return jsonify({"reply": "I'm a bit busy right now. Please try again in a minute."}), 500

@app.route('/api/detect_disease', methods=['POST'])
def detect_disease():
    if not disease_model:
        return jsonify({"error": "Disease model not loaded"}), 500
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img_bytes = file.read()
    label, confidence = predict_disease(img_bytes)
    advice = get_treatment_advice(label)

    return jsonify({
        "status": "success",
        "disease": label,
        "confidence": f"{confidence*100:.2f}%",
        "advice": advice
    })

@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({"message": "Login successful"}), 200

# ===============================
# 7️⃣ SERVER START
# ===============================
if __name__ == "__main__":
    from waitress import serve
    print("🚀 Pandam Backend Running on Port 5000")
    serve(app, host="0.0.0.0", port=5000, threads=6)