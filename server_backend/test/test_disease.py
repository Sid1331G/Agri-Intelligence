import requests
import json

# Change if deployed (Render URL etc.)
URL = "http://127.0.0.1:5000/api/detect_disease"

# Path to test image
IMAGE_PATH = "OIP.jpg"  # Change to your test image path

def test_disease_api():
    try:
        with open(IMAGE_PATH, "rb") as img_file:
            files = {"file": img_file}

            response = requests.post(URL, files=files)

        print("Status Code:", response.status_code)

        try:
            print("Response JSON:")
            print(json.dumps(response.json(), indent=4))
        except:
            print("Raw Response:", response.text)

    except FileNotFoundError:
        print("❌ Test image not found. Place image as 'test_leaf.jpg'")
    except Exception as e:
        print("❌ Request failed:", str(e))


if __name__ == "__main__":
    test_disease_api()