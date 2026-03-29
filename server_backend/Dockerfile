FROM python:3.10-slim
 
WORKDIR /app
 
# FIX: Install system dependencies for torch CPU-only (saves ~600 MB vs default)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*
 
COPY requirements.txt .
 
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . .
 
# FIX 4: Use $PORT from Render's env var, not hardcoded 5000
# Also increase timeout to 300s because model loading on first request takes time
CMD gunicorn --workers 1 --threads 2 --timeout 300 -b 0.0.0.0:${PORT:-5000} app:app