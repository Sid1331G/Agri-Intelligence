import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scraper import get_live_tn_prices

# We fetch the live prices ONCE when the module loads
print("✅ Fetching Live Prices for Baseline...")
LIVE_PRICES_CACHE = get_live_tn_prices()

# Load the models relative to this file
import os
base_dir = os.path.dirname(os.path.abspath(__file__))

try:
    with open(os.path.join(base_dir, "models", "xgboost_model.pkl"), "rb") as model_file:
        model = pickle.load(model_file)
    with open(os.path.join(base_dir, "models", "column_order.pkl"), "rb") as columns_file:
        column_order = pickle.load(columns_file)
except Exception as e:
    print(f"Error loading models: {e}")
    model = None
    column_order = None

def generate_daily_predictions(commodity_name, num_days=7):
    """
    Generates a consecutive day-by-day price prediction using the real-time scraped
    price as the absolute baseline for Day 0.
    """
    if model is None or column_order is None:
        return {"error": "Models not loaded correctly"}

    predictions = []
    start_date = datetime.today()

    # Get the REAL price today from the Scraper!
    # The scraped price is per kg. The model predicts per Quintal (100kg).
    live_price_per_kg = None
    if LIVE_PRICES_CACHE and not "error" in LIVE_PRICES_CACHE:
        live_price_per_kg = LIVE_PRICES_CACHE.get(commodity_name)
    
    # Fallback to standard 50rs if scraper fails or commodity not tracked
    if not live_price_per_kg:
        print(f"Warning: {commodity_name} not found in scraped live data. Using fallback 50rs.")
        live_price_per_kg = 50 
        
    current_market_price_quintal = live_price_per_kg * 100 

    for i in range(num_days):
        future_date = start_date + timedelta(days=i)

        # For Day 1 (Today), we output the EXACT scraped price instantly without running ML.
        if i == 0:
            predictions.append({
                'Day': f"Day {i+1} (Today)",
                'Date': future_date.strftime('%Y-%m-%d'),
                'Type': 'Today Price',
                'Predicted_Modal_Price_Quintal': round(current_market_price_quintal, 2),
                'Predicted_Price_Per_kg': round(current_market_price_quintal / 100, 2)
            })
            continue

        # For future days, we use the model with slight rolling variance based on the day.
        # This prevents flatlining outputs and simulates real market fluctuation bounds.
        variance_multiplier = 0.03 + (i * 0.003) 
        
        future_data = {
            'Min_Price': [current_market_price_quintal * (1.0 - variance_multiplier)], 
            'Max_Price': [current_market_price_quintal * (1.0 + variance_multiplier)], 
            'Arrival_Year': [future_date.year],
            'Arrival_Month': [future_date.month],
            'Arrival_Day': [future_date.day]
        }

        # Align with the one-hot encoded format of the model
        for col in column_order:
            if col not in future_data:
                future_data[col] = [0]

        commodity_col = f'Commodity_{commodity_name}'
        if commodity_col in column_order:
            future_data[commodity_col] = [1]

        future_df = pd.DataFrame(future_data)
        future_df = future_df[column_order]

        # Model prediction generates the price for the NEXT day
        future_price_quintal = model.predict(future_df)[0]
        future_price_quintal = float(future_price_quintal)

        predictions.append({
            'Day': f"Day {i+1}",
            'Date': future_date.strftime('%Y-%m-%d'),
            'Type': 'Predicted Price',
            'Predicted_Modal_Price_Quintal': round(future_price_quintal, 2),
            'Predicted_Price_Per_kg': round(future_price_quintal / 100, 2)
        })
        
        # CHAINING: Update the current market price to the newly predicted price for the *next* day's loop
        current_market_price_quintal = future_price_quintal

    return predictions

if __name__ == "__main__":
    # Test the standalone function
    import json
    print("\nPredicting next 7 days for Tomato:")
    tomato_preds = generate_daily_predictions("Tomato", num_days=7)
    print(json.dumps(tomato_preds, indent=4))
    
    print("\nPredicting next 7 days for Onion:")
    onion_preds = generate_daily_predictions("Onion", num_days=7)
    print(json.dumps(onion_preds, indent=4))
