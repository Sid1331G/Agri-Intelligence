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
import json

warnings.filterwarnings("ignore", category=UserWarning)
load_dotenv()

# Flask Setup
app = Flask(__name__, static_folder='static')
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")
print("Allowed origins:", allowed_origins)
CORS(app, supports_credentials=True, origins=allowed_origins)
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

# Load website knowledge JSON
WEBSITE_INFO = {}
try:
    _info_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "website_info.json")
    with open(_info_path, "r", encoding="utf-8") as _f:
        WEBSITE_INFO = json.load(_f)
    print("✅ Website Info JSON Loaded")
except Exception as _e:
    print(f"⚠️ Could not load website_info.json: {_e}")

WEBSITE_INFO_STR = json.dumps(WEBSITE_INFO, indent=2)


def build_float_system_prompt():
    """System prompt for the floating chatbot — website guide ONLY."""
    return f"""You are the official Agri Intelligence website guide assistant.

Your ONLY job is to help users understand and navigate the Agri Intelligence website.

WEBSITE KNOWLEDGE BASE:
{WEBSITE_INFO_STR}

Strict Rules:
- ONLY answer questions about the Agri Intelligence website, its features, pages, and how to use them.
- Do NOT give farming advice, crop tips, disease treatment, or market strategy — refer users to the AI Assistant page for that.
- If asked about something outside the website, politely say: "For personalized farming and market advice, please visit the AI Assistant page after logging in."
- Always be friendly, concise, and helpful.
- Guide users step by step when they ask how to use a feature.
- Support responses in English, Tamil, Hindi, or Malayalam based on the user's message language.
"""


def build_assistant_system_prompt(user_profile):
    """System prompt for the dedicated AI Assistant page — deeply personalized."""
    role = user_profile.get("role", "user")
    username = user_profile.get("username", "User")
    profile = user_profile.get("profile", {})

    if role == "farmer":
        role_context = f"""You are a personalized agricultural assistant for {username}, a farmer in {profile.get('district', 'Tamil Nadu')}.
- They grow: {', '.join(profile.get('crops', [])) or 'various crops'}
- Land size: {profile.get('land_size_acres', 'unknown')} Acres
- Farming type: {profile.get('farming_type', 'conventional')}
- Irrigation source: {profile.get('irrigation', 'unknown')}

Help them with:
- Price trends for their specific crops
- Pest and disease identification and control
- Irrigation and fertilizer guidance based on their farming type
- Seasonal crop recommendations for their district
- When is the best time to sell their produce"""
    else:
        role_context = f"""You are a personalized market assistant for {username}, a commodity dealer in {profile.get('district', 'Tamil Nadu')}.
- Business type: {profile.get('business_type', 'trader')}
- Market location: {profile.get('market_location', 'Tamil Nadu')}
- Commodities traded: {', '.join(profile.get('commodities', [])) or 'various commodities'}
- Trading volume: {profile.get('trading_volume', 'medium')} scale

Help them with:
- Price trends for their specific commodities
- Best times to buy and sell based on market predictions
- Market strategy and demand forecasting
- Regional price variations across Tamil Nadu markets"""

    return f"""{role_context}

ALSO use this website knowledge to answer platform-related questions:
{WEBSITE_INFO_STR}

Rules:
- Always personalize to their crops or commodities.
- Be practical, concise, and data-driven.
- Respond in the language preferred by the user.
- Keep responses clear and actionable for field use.
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
    """Floating chatbot — website guide ONLY. No login required."""
    try:
        if not gemini_client:
            return jsonify({"error": "Gemini not initialized"}), 500

        data = request.get_json()
        user_message = data.get("message")
        history = data.get("history", [])

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # First message → inject website-only system prompt
        if not history:
            system_prompt = build_float_system_prompt()
            history.append({
                "role": "user",
                "parts": [{"text": system_prompt}]
            })
            history.append({
                "role": "model",
                "parts": [{"text": "Understood! I'm ready to help."}]
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


@app.route("/api/assistant-chat", methods=["POST"])
def assistant_chat():
    """Dedicated AI Assistant page — deeply personalized using user profile from DB."""
    try:
        if not gemini_client:
            return jsonify({"error": "Gemini not initialized"}), 500

        username = session.get("user")
        if not username:
            # Fallback: accept username from request body (for cross-origin session issues)
            body = request.get_json(silent=True) or {}
            username = body.get("username") or request.args.get("username")
        if not username:
            return jsonify({"error": "Not authenticated"}), 401

        data = request.get_json()
        user_message = data.get("message")
        history = data.get("history", [])

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Fetch user profile from MongoDB
        user_doc = users_collection.find_one({"username": username}, {"_id": 0})
        if not user_doc or not user_doc.get("profile_complete"):
            return jsonify({"error": "Profile not complete. Please complete your profile setup."}), 403

        user_profile = {
            "username": username,
            "role": user_doc.get("role", "farmer"),
            "profile": user_doc.get("profile", {})
        }

        if not history:
            system_prompt = build_assistant_system_prompt(user_profile)
            history.append({
                "role": "user",
                "parts": [{"text": system_prompt}]
            })
            history.append({
                "role": "model",
                "parts": [{"text": "Understood! I'm ready to assist you."}]
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


# Prediction Model logic is now handled in daily_prediction.py

VALID_COMMODITIES = {
    'Ashgourd', 'Broad Beans', 'Bitter Gourd', 'Bottle Gourd', 'Brinjal', 'Cabbage',
    'Capsicum', 'Carrot', 'Cluster Beans', 'Coriander (Leaves)', 'Cauliflower', 'Drumstick',
    'Green Chilli', 'Onion', 'Potato', 'Pumpkin', 'Raddish', 'Snakeguard', 'Sweet Potato', 'Tomato',
    'Arhar (Tur/Red Gram)(Whole)', 'Bengal Gram (Gram)(Whole)', 'Bengal Gram Dal (Chana Dal)',
    'Black Gram (Urd Beans)(Whole)', 'Black Gram Dal (Urd Dal)', 'Green Gram (Moong)(Whole)',
    'Green Gram Dal (Moong Dal)', 'Kabuli Chana (Chickpeas-White)', 'Kulthi (Horse Gram)', 'Moath Dal'
}

from daily_prediction import generate_daily_predictions

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        category = data.get("category")
        variety = data.get("variety")

        if not category or not variety:
            return jsonify({"error": "Missing 'category' or 'variety' in request"}), 400

        variety = variety.title()

        if variety not in VALID_COMMODITIES:
            return jsonify({"error": f"Unknown commodity: {variety}"}), 400

        daily_predictions = generate_daily_predictions(variety, num_days=7)
        return jsonify({"daily_predictions": daily_predictions})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/predict/<commodity>', methods=['GET'])
def predict_commodity(commodity):
    try:
        variety = commodity.title()
        if variety not in VALID_COMMODITIES:
            return jsonify({"error": f"Unknown commodity: {variety}"}), 400

        daily_predictions = generate_daily_predictions(variety, num_days=7)
        return jsonify({
            "commodity": variety,
            "daily_predictions": daily_predictions
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
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

Provide a VERY SHORT response. MAX 3 bullet points per section. One sentence per bullet. No extra explanation.

## Disease Overview
One sentence only.

## Symptoms
- Key symptom 1.
- Key symptom 2.

## Causes
- Main cause.
- Contributing factor.

## Treatment
- Treatment option 1.
- Treatment option 2.

STRICT: Keep every bullet under 30 words. Be direct.
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
    if confidence >= 0.50:
        ai_explanation = generate_disease_awareness(label, confidence)
    else:
        ai_explanation = "Model confidence is low. Please upload a clearer image."

    return jsonify({
        "status": "success",
        "disease": label,
        "confidence": f"{confidence*100:.2f}%",
        "ai_explanation": ai_explanation
    })
    

# Profile Setup & Get Routes

TN_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Villupuram", "Virudhunagar"
]

TN_MARKETS = [
    "Chennai - Koyambedu", "Coimbatore - Ukkadam", "Madurai - Mattuthavani",
    "Salem - Kondampatti", "Tiruchirappalli - Ariyamangalam", "Tirunelveli",
    "Vellore", "Erode", "Namakkal", "Dindigul", "Thanjavur", "Cuddalore",
    "Dharmapuri", "Krishnagiri", "Villupuram"
]


@app.route('/profile/setup', methods=['POST'])
def profile_setup():
    try:
        username = session.get("user")
        # Also support username passed in body (for right-after-signup flow)
        data = request.get_json()
        if not username:
            username = data.get("username")
        if not username:
            return jsonify({"error": "Not authenticated"}), 401

        role = data.get("role")
        profile_data = data.get("profile", {})

        if not role or role not in ["farmer", "dealer"]:
            return jsonify({"error": "Invalid role. Must be 'farmer' or 'dealer'."}), 400

        # Validate required fields
        if not profile_data.get("district"):
            return jsonify({"error": "District is required."}), 400

        users_collection.update_one(
            {"username": username},
            {"$set": {
                "role": role,
                "profile": profile_data,
                "profile_complete": True
            }}
        )

        return jsonify({"message": "Profile saved successfully", "profile_complete": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/profile/get', methods=['GET'])
def profile_get():
    try:
        username = session.get("user")
        if not username:
            # Fallback: accept username from query string (for cross-origin session issues)
            username = request.args.get("username")
        if not username:
            return jsonify({"error": "Not authenticated"}), 401

        user_doc = users_collection.find_one({"username": username}, {"_id": 0, "password": 0})
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "username": username,
            "email": user_doc.get("email", ""),
            "role": user_doc.get("role", None),
            "profile": user_doc.get("profile", {}),
            "profile_complete": user_doc.get("profile_complete", False)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/profile/meta', methods=['GET'])
def profile_meta():
    """Returns dropdown data for profile setup form."""
    return jsonify({
        "districts": TN_DISTRICTS,
        "markets": TN_MARKETS,
        "commodities": sorted(list(VALID_COMMODITIES))
    }), 200


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
