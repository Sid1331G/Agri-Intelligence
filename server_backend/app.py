from flask import Flask, request, jsonify, session, render_template, send_from_directory, send_file
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os
import requests
from io import BytesIO
from PIL import Image
from torchvision import models, transforms
import torch
import torch.nn as nn
from google import genai
from transformers import AutoImageProcessor, AutoModelForImageClassification
from huggingface_hub import login
from dotenv import load_dotenv
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
load_dotenv()

# Flask Setup
app = Flask(__name__, static_folder='static', )
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5173"])
app.secret_key = os.getenv("FLASK_SECRET_KEY")

# MongoDB Setup
try:
    client = MongoClient(
        os.getenv("MONGODB_CONNECTION_STRING"),
        serverSelectionTimeoutMS=5000  # 5 sec timeout
    )

    # Test connection
    client.admin.command("ping")

    print("✅ MongoDB Connected")

    db = client["market_data"]
    commodities = db["commodities"]

    db1 = client["auth_db"]
    users_collection = db1["users"]

except ConnectionFailure:
    print("❌ MongoDB Not Connected")
    client = None

# GEMINI AI SETUP

gemini_client = None

SYSTEM_PROMPT = """
You are an intelligent agricultural AI assistant.
Help farmers with:
- Crop disease advice
- Market price guidance
- Farming best practices
- Seasonal recommendations
- Fertilizer and irrigation advice

Keep responses:
- Practical
- Clear
- Actionable
- Concise but helpful
"""

def initialize_gemini():
    global gemini_client
    try:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            print("⚠️ GEMINI_API_KEY missing")
            return

        gemini_client = genai.Client(api_key=api_key)

        # Quick health check
        test_response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Hello"
        )

        print("✅ Gemini Client Initialized Successfully")

    except Exception as e:
        print(f"❌ Gemini Init Error: {e}")
        gemini_client = None


initialize_gemini()

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        if not gemini_client:
            return jsonify({"error": "Gemini not initialized"}), 500

        data = request.get_json()
        user_message = data.get("message")
        history = data.get("history", [])

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # First message → inject system prompt
        if not history:
            history.append({
                "role": "user",
                "parts": [{"text": SYSTEM_PROMPT}]
            })

        history.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=history
        )

        history.append({
            "role": "model",
            "parts": [{"text": response.text}]
        })

        return jsonify({
            "reply": response.text,
            "history": history
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Load model and column order
with open(r"models/xgboost_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)
with open(r"models/column_order.pkl", "rb") as columns_file:
    column_order = pickle.load(columns_file)


# COMMODITY_PRICE_RANGES omitted here for brevity — keep yours as is
COMMODITY_PRICE_RANGES = {
# Vegetables
    'Ashgourd': {"min_price_range": (1000, 1500), "max_price_range": (1800, 2500)}, # Adjusted for Ashgourd
    'Broad Beans': {"min_price_range": (2000, 3000), "max_price_range": (3000, 4000)}, # Adjusted for Broad Beans
    'Bitter Gourd': {"min_price_range": (2000, 3000), "max_price_range": (3700, 4000)}, # Adjusted for Bitter Gourd
    'Bottle Gourd': {"min_price_range": (1000, 2500), "max_price_range": (2500, 3500)}, # Adjusted for Bottle Gourd
    'Brinjal': {"min_price_range": (2000, 3300), "max_price_range": (3400, 4000)}, # Adjusted for Brinjal
    'Cabbage': {"min_price_range": (1000, 1500), "max_price_range": (1500, 2000)}, # Adjusted for Cabbage
    'Capsicum': {"min_price_range": (3000, 3800), "max_price_range": (3900, 4600)}, # Adjusted for Capsicum
    'Carrot': {"min_price_range": (3000, 3700), "max_price_range": (3700, 4200)}, # Adjusted for Carrot
    'Cluster Beans': {"min_price_range": (3000, 3700), "max_price_range": (3800, 4300)}, # Adjusted for Cluster Beans
    'Coriander (Leaves)': {"min_price_range": (500, 800), "max_price_range": (800, 1300)}, # Adjusted for Coriander
    'Cauliflower': {"min_price_range": (1800, 2800), "max_price_range": (2500, 3000)}, # Adjusted for Cauliflower
    'Drumstick': {"min_price_range": (7000, 7500), "max_price_range": (7800, 8400)}, # Adjusted for Drumstick
    'Green Chilli': {"min_price_range": (2000, 3200), "max_price_range": (3000, 4500)}, # Adjusted for Green Chilli
    'Onion': {"min_price_range": (1000, 1500), "max_price_range": (2000, 2500)}, # Adjusted for Onion
    'Potato': {"min_price_range": (2000, 2500), "max_price_range": (2500, 3500)}, # Adjusted for Potato
    'Pumpkin': {"min_price_range": (900, 1700), "max_price_range": (1800, 2400)}, # Adjusted for Pumpkin
    'Raddish': {"min_price_range": (2000, 2000), "max_price_range": (2200, 3000)}, # Adjusted for Raddish
    'Snakeguard': {"min_price_range": (1400, 2500), "max_price_range": (2700, 3400)}, # Adjusted for Snakeguard
    'Sweet Potato': {"min_price_range": (4500, 5700), "max_price_range": (5500, 6500)},
    'Tomato': {"min_price_range": (1000, 1500), "max_price_range": (1500, 2000)}, # Adjusted for Tomato
    # Pulses
    "Arhar (Tur/Red Gram)(Whole)": {"min_price_range": (2000, 4500), "max_price_range": (4800, 6000)},
    "Bengal Gram (Gram)(Whole)": {"min_price_range": (3000, 3800), "max_price_range": (4000, 4500)},
    "Bengal Gram Dal (Chana Dal)": {"min_price_range": (6000, 8000), "max_price_range": (8000, 10000)},
    "Black Gram (Urd Beans)(Whole)": {"min_price_range": (6000, 7600), "max_price_range": (7700, 8500)},
    "Black Gram Dal (Urd Dal)": {"min_price_range": (9000, 13500), "max_price_range": (13000, 15000)},
    "Green Gram (Moong)(Whole)": {"min_price_range": (6000, 7000), "max_price_range": (7000, 8000)},
    "Green Gram Dal (Moong Dal)": {"min_price_range": (8000, 9000), "max_price_range": (9200, 10000)},
    "Kabuli Chana (Chickpeas-White)": {"min_price_range": (6000, 8500), "max_price_range": (8000, 9000)},
    "Kulthi (Horse Gram)": {"min_price_range": (4000, 5300), "max_price_range": (5500, 6500)},
    "Moath Dal": {"min_price_range": (1700, 1900), "max_price_range": (1900, 2400)},
    
}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

def generate_weekly_predictions(commodity_name, num_weeks=10):
    predictions = []
    start_date = datetime.today()

    price_ranges = COMMODITY_PRICE_RANGES[commodity_name]
    min_price_range = price_ranges["min_price_range"]
    max_price_range = price_ranges["max_price_range"]

    for i in range(num_weeks):
        future_date = start_date + timedelta(weeks=i)

        future_data = {
            'Min_Price': [random.randint(*min_price_range)],
            'Max_Price': [random.randint(*max_price_range)],
            'Arrival_Year': [future_date.year],
            'Arrival_Month': [future_date.month],
            'Arrival_Day': [future_date.day]
        }

        for col in column_order:
            if col not in future_data:
                future_data[col] = [0]

        commodity_col = f'Commodity_{commodity_name}'
        if commodity_col in column_order:
            future_data[commodity_col] = [1]

        future_df = pd.DataFrame(future_data)
        future_df = future_df[column_order]

        future_price = model.predict(future_df)[0]

        predictions.append({
            'Date': future_date.strftime('%Y-%m-%d'),
            'Min_Price': future_data['Min_Price'][0],
            'Max_Price': future_data['Max_Price'][0],
            'Predicted_Modal_Price': round(float(future_price), 2),
            'Price_Per_kg': round(float(future_price) / 100, 2)
        })

    return predictions

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        category = data.get("category")
        variety = data.get("variety")

        if not category or not variety:
            return jsonify({"error": "Missing 'category' or 'variety' in request"}), 400

        variety = variety.title()

        if variety not in COMMODITY_PRICE_RANGES:
            return jsonify({"error": f"Unknown commodity: {variety}"}), 400

        weekly_predictions = generate_weekly_predictions(variety, num_weeks=5)
        return jsonify({"weekly_predictions": weekly_predictions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/<commodity>', methods=['GET'])
def predict_commodity(commodity):
    try:
        variety = commodity.title()
        if variety not in COMMODITY_PRICE_RANGES:
            return jsonify({"error": f"Unknown commodity: {variety}"}), 400

        weekly_predictions = generate_weekly_predictions(variety, num_weeks=5)
        return jsonify({
            "commodity": variety,
            "weekly_predictions": weekly_predictions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Plant Disease Detection Setup
    
MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
BASE_PROCESSOR = "google/mobilenet_v2_1.0_224"

processor = None
disease_model = None

def load_disease_model():
    global processor, disease_model
    try:
        hf_token = os.getenv("HF_TOKEN")
        if hf_token:
            login(hf_token)

        processor = AutoImageProcessor.from_pretrained(
            BASE_PROCESSOR,
            use_fast=True  # use False only if reproducibility matters
        )

        disease_model = AutoModelForImageClassification.from_pretrained(
            MODEL_NAME
        )

        disease_model.eval()
        print("✅ Plant Disease Model Loaded Successfully")

    except Exception as e:
        print(f"❌ Disease Model Load Error: {e}")

load_disease_model()

def predict_disease(image_bytes):
    if processor is None or disease_model is None:
        return "Model not loaded", 0.0
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = disease_model(**inputs)
        scores = torch.softmax(outputs.logits, dim=-1)[0]
    confidence, idx = scores.max(0)
    label = disease_model.config.id2label[idx.item()]
    return label, float(confidence.item())

def generate_disease_awareness(disease_label, confidence):
    try:
        if not gemini_client:
            return "AI explanation unavailable. Gemini not initialized."

        prompt = f"""
You are an agricultural expert assisting farmers.

The plant disease detection model predicted:

Disease: {disease_label}
Confidence: {confidence*100:.2f}%

Provide response in this format:

## Disease Overview
Explain what this disease is.

## Symptoms
Explain visible symptoms farmers should observe.

## Causes
Explain why this disease occurs.

## Chemical Treatment
Recommend practical chemical solutions.

## Organic Treatment
Recommend eco-friendly solutions.

## Prevention
Explain how to prevent recurrence.

## Farmer Action Plan
Provide step-by-step guidance farmers can follow.

Keep language simple and practical.
"""

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:
        return f"AI explanation error: {str(e)}"

@app.route('/api/detect_disease', methods=['POST'])
def detect_disease():

    if not disease_model:
        return jsonify({"error": "Disease model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img_bytes = file.read()

    # Step 1: Predict disease
    label, confidence = predict_disease(img_bytes)

    if label is None:
        return jsonify({"error": "Disease prediction failed"}), 500

    # Step 2: Generate AI awareness only if confidence > threshold
    if confidence >= 0.60:
        ai_explanation = generate_disease_awareness(label, confidence)
    else:
        ai_explanation = "Model confidence is low. Please upload a clearer image."

    return jsonify({
        "status": "success",
        "disease": label,
        "confidence": f"{confidence*100:.2f}%",
        "ai_explanation": ai_explanation
    })
    

# Signup/Login routes (already present)
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if users_collection.find_one({"username": username}):
            return jsonify({"error": "Username already exists"}), 400

        hashed_password = generate_password_hash(password)
        users_collection.insert_one({
            "username": username,
            "email": email,
            "password": hashed_password
        })

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        user = users_collection.find_one({"username": username})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401

        session["user"] = username
        return jsonify({"message": "Login successful"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out successfully"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
