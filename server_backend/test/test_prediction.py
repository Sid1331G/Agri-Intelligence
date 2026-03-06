import json
import sys
import os

# Add the server_backend directory to the python path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# ===============================
# CONFIG
# ===============================

test_client = app.test_client()
test_client.testing = True

print("===============================")
print("TESTING PREDICTION ENDPOINTS")
print("===============================\n")

# ===============================
# TEST 1: POST /predict (Valid)
# ===============================

try:
    print("Testing POST /predict with valid commodity (Tomato)...")
    payload = {
        "category": "Vegetables",
        "variety": "Tomato"
    }
    response = test_client.post('/predict',
                                data=json.dumps(payload),
                                content_type='application/json')
    
    if response.status_code == 200:
        data = json.loads(response.data.decode('utf-8'))
        if "daily_predictions" in data and len(data["daily_predictions"]) == 7:
            if data["daily_predictions"][0].get("Type") == "Today Price":
                print("✅ POST /predict (Valid) successful!")
            else:
                print("❌ POST /predict failed: First day missing 'Today Price' label.")
        else:
             print("❌ POST /predict failed: Did not return exactly 7 days of predictions.")
    else:
        print(f"❌ POST /predict failed with status code: {response.status_code}")
except Exception as e:
    print("❌ POST /predict test encountered an error:", e)

print("\n-------------------------------\n")

# ===============================
# TEST 2: POST /predict (Invalid)
# ===============================

try:
    print("Testing POST /predict with invalid commodity (Unicorn)...")
    payload = {
        "category": "vegetables",
        "variety": "Unicorn"
    }
    response = test_client.post('/predict',
                                data=json.dumps(payload),
                                content_type='application/json')
    
    if response.status_code == 400:
         print("✅ POST /predict (Invalid) successfully caught error (Status 400)!")
    else:
         print(f"❌ POST /predict (Invalid) failed. Expected 400, got: {response.status_code}")
except Exception as e:
    print("❌ POST /predict (Invalid) test encountered an error:", e)

print("\n-------------------------------\n")

# ===============================
# TEST 3: GET /predict/<commodity>
# ===============================

try:
    print("Testing GET /predict/onion (Case Insensitive)...")
    response = test_client.get('/predict/onion')
    
    if response.status_code == 200:
        data = json.loads(response.data.decode('utf-8'))
        if "commodity" in data and data["commodity"] == "Onion":
            if "daily_predictions" in data and len(data["daily_predictions"]) == 7:
                 print("✅ GET /predict/<commodity> successful!")
            else:
                 print("❌ GET /predict/<commodity> failed: Did not return exactly 7 days of predictions.")
        else:
            print("❌ GET /predict/<commodity> failed: Returned wrong commodity name.")
    else:
         print(f"❌ GET /predict/<commodity> failed with status code: {response.status_code}")
except Exception as e:
    print("❌ GET /predict/<commodity> test encountered an error:", e)

print("\n===============================")
print("ALL TESTS COMPLETED")
print("===============================\n")
