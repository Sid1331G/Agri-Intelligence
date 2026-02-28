import pickle
import pandas as pd
import xgboost as xgb
import os

# ===============================
# CONFIG
# ===============================

MODEL_PATH = r"..\models\xgboost_model.pkl"
COLUMN_ORDER_PATH = r"..\models\column_order.pkl"

# ===============================
# LOAD MODEL
# ===============================

try:
    print("Loading model...")

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    print("Model loaded successfully.")
    print("Model type:", type(model))

except Exception as e:
    print("❌ Failed to load model:", e)
    exit()

# ===============================
# LOAD COLUMN ORDER
# ===============================

try:
    with open(COLUMN_ORDER_PATH, "rb") as f:
        column_order = pickle.load(f)

    print("Column order loaded successfully.")
    print("Number of features:", len(column_order))

except Exception as e:
    print("❌ Failed to load column order:", e)
    exit()

# ===============================
# CREATE TEST INPUT
# ===============================

try:
    print("Creating test input...")

    test_data = {
        "Min_Price": [1500],
        "Max_Price": [2500],
        "Arrival_Year": [2024],
        "Arrival_Month": [1],
        "Arrival_Day": [10],
    }

    # Fill missing columns with 0
    for col in column_order:
        if col not in test_data:
            test_data[col] = [0]

    test_df = pd.DataFrame(test_data)
    test_df = test_df[column_order]

    print("Test dataframe shape:", test_df.shape)

except Exception as e:
    print("❌ Failed to create test input:", e)
    exit()

# ===============================
# RUN PREDICTION
# ===============================

try:
    print("Running prediction...")

    prediction = model.predict(test_df)

    print("✅ Prediction successful!")
    print("Prediction value:", prediction)

except Exception as e:
    print("❌ Prediction failed:", e)