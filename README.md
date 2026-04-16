# Agri Intelligence - AI-Powered Agricultural Intelligence - AI-Driven Decision Support System for Farmers and Agricultural Dealers

**Agri Intelligence** is a comprehensive, AI-powered platform designed to empower farmers and agricultural dealers with data-driven insights. By combining machine learning, computer vision, and large language models, the system helps users navigate market complexities, identify plant diseases, and optimize their agricultural operations.

---

## 🚀 Key Features

### 🤖 Personalized AI Agricultural Assistant
- **Gemini-Powered Chat**: A sophisticated AI assistant that provides tailored advice based on the user's specific crops, district, and farming profile.
- **Role-Based Intelligence**: Different assistance modes for **Farmers** (crop management, pest control) and **Dealers** (market trends, trading strategies).
- **Multi-language Support**: Communicate in **English, Tamil, Hindi, or Malayalam**.

### 📈 Market Price Prediction
- **Data-Driven Forecasts**: Utilizes historical market data scraped from agricultural ports to predict future price trends for over 30 commodities.
- **XGBoost & ML Models**: Leverages advanced machine learning (XGBoost) for high-accuracy daily price predictions.
- **Visual Trends**: Interactive charts showing 7-day price forecasts to help users decide the best time to sell or buy.

### 🍃 Plant Disease Identification
- **Computer Vision**: Upload photos of infected plants to receive instant disease diagnoses.
- **MobileNetV2**: Powered by a fine-tuned MobileNetV2 model for efficient and accurate identification.
- **Actionable Awareness**: AI-generated reports providing disease overviews, symptoms, causes, and treatment options.

### 👤 User-Centric Dashboard
- **Profile Customization**: Users can set their district, crops, land size, and farming type to receive personalized notifications and advice.
- **Responsive Design**: A modern, mobile-friendly interface built with React and Bootstrap.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Bootstrap 5, Lucide React (Icons)
- **State/Routing**: React Router 7
- **Visualization**: Chart.js, React-Chartjs-2
- **Internationalization**: i18next

### **Backend**
- **Framework**: Flask (Python 3.x)
- **Database**: MongoDB (Atlas)
- **AI/ML**:
  - **Large Language Model**: Google Gemini AI (Vertex AI/GenAI SDK)
  - **Computer Vision**: PyTorch, Torchvision, HuggingFace Transformers
  - **Price Prediction**: Scikit-learn, XGBoost, Pandas, NumPy
- **Authentication**: Werkzeug Security (Hashing)

### **DevOps & Infrastructure**
- **Containerization**: Docker, Docker Compose
- **Web Server**: Gunicorn, Nginx (Frontend)
- **Deployment**: Render (Auto-deploys via `render.yaml`)

---

## 🚀 Deployment to Render

This project is configured for easy deployment on **Render** using the provided `render.yaml` Blueprint.

### Prerequisites
1. A [Render](https://render.com/) account.
2. Your fork of this repository connected to Render.

### Steps to Deploy
1. In the Render Dashboard, click **New +** and select **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect `render.yaml` and suggest creating two services:
   - `agri-backend` (Web Service, Runtime: Docker)
   - `agri-frontend` (Web Service, Runtime: Docker)
4. **Environment Variables**: Render will prompt you for the required environment variables defined in the Blueprint. Ensure you provide:
   - `MONGODB_CONNECTION_STRING`
   - `GEMINI_API_KEY`
   - `HF_TOKEN`
   - `FLASK_SECRET_KEY`
5. Click **Apply** to start the deployment.

---

## ⚙️ Setup and Installation

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [Python 3.10+](https://www.python.org/) (for local development)
- [Node.js 18+](https://nodejs.org/) (for local development)

### Quick Start with Docker
The easiest way to get the system running is using Docker Compose:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aravind22s/Agri-Intelligence.git
   cd Agri-Intelligence
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in `server_backend/` based on `.env.example`:
   ```env
   MONGODB_CONNECTION_STRING=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   HF_TOKEN=your_huggingface_token
   FLASK_SECRET_KEY=your_secret_key
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   The application will be available at `http://localhost:8080`.

### Manual Local Setup

If you prefer to run the components manually without Docker:

#### 1. Backend Setup (Flask)
1. Navigate to the backend directory:
   ```bash
   cd server_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask server:
   ```bash
   python app.py
   ```
   The API will run on `http://localhost:5000`.

#### 2. Frontend Setup (React + Vite)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client_frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## 📁 Project Structure

```text
├── client_frontend/      # React application (Vite)
├── server_backend/       # Flask API, ML models, and Scrapers
│   ├── models/           # Pre-trained ML & CV models
│   ├── static/           # Built frontend assets
│   ├── app.py            # Main API entry point
│   └── daily_prediction.py # Price forecasting logic
├── docker-compose.yml    # Orchestration for containers
└── README.md             # Project documentation
```

---

## 🤝 Contributing
This project was developed as a final year project. Contributions for improving model accuracy or UI/UX are welcome!


"# Agri-Intelligence" 
