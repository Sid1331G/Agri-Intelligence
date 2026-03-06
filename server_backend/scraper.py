import requests
from bs4 import BeautifulSoup
import re
import json

NAME_MAPPING = {
    "onion big": "Onion",
    "tomato": "Tomato",
    "green chilli": "Green Chilli",
    "beetroot": "Beetroot",
    "potato": "Potato",
    "ash gourd": "Ashgourd",
    "capsicum": "Capsicum",
    "bitter gourd": "Bitter Gourd",
    "bottle gourd": "Bottle Gourd",
    "broad beans": "Broad Beans",
    "cabbage": "Cabbage",
    "carrot": "Carrot",
    "cauliflower": "Cauliflower",
    "cluster beans": "Cluster Beans",
    "drumstick": "Drumstick",
    "pumpkin": "Pumpkin",
    "radish": "Raddish",
    "snake gourd": "Snakeguard",
    "sweet potato": "Sweet Potato",
    "brinjal": "Brinjal",
    "coriander leaves": "Coriander (Leaves)"
}

def get_live_tn_prices():
    url = "https://vegetablemarketprice.com/market/tamilnadu/today"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    live_prices = {}
    try:
        response = session.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.find_all('tr', class_='todayVegetableTableRows')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 4:
                    raw_name = cols[1].get_text(strip=True)
                    english_name_match = re.split(r'\(|\-|[^\x00-\x7F]', raw_name)[0]
                    english_name = english_name_match.strip().lower()
                    
                    raw_price = cols[2].get_text(strip=True)
                    price_val = re.sub(r'[^\d]', '', raw_price)
                    
                    if price_val.isdigit():
                        price_int = int(price_val)
                        matched_key = None
                        for key, mapped_value in NAME_MAPPING.items():
                            if key in english_name:
                                matched_key = mapped_value
                                break
                        if matched_key and matched_key not in live_prices:
                            live_prices[matched_key] = price_int
        return live_prices
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    prices = get_live_tn_prices()
    with open("scraped_data.json", "w", encoding="utf-8") as f:
        json.dump(prices, f, indent=4)
