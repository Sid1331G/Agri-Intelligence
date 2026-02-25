import React, { useState } from "react";
import axios from "axios";

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Detect disease
  const handleDetect = async () => {
    if (!selectedFile) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/detect_disease",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Safe healthy check
  const isHealthy =
    result?.disease?.toLowerCase().includes("healthy") || false;

  // Convert confidence string "92.34%" to number
  const confidenceValue = result?.confidence
    ? parseFloat(result.confidence)
    : 0;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "850px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "#12191d" }}>
          🌿 Pandam - AI Plant Disease Detection
        </h2>
        <p style={{ color: "#020649" }}>
          Upload a leaf image to get instant diagnosis & treatment advice.
        </p>
      </div>

      {/* Upload Box */}
      <div
        style={{
          border: "3px dashed #cbd5e1",
          borderRadius: "15px",
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="upload"
        />

        <label htmlFor="upload" style={{ cursor: "pointer" }}>
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{
                maxHeight: "300px",
                maxWidth: "100%",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: "50px", marginBottom: "10px" }}>
                📁
              </div>
              <p style={{ color: "#475569" }}>
                Click to Upload Leaf Image (JPG/PNG)
              </p>
            </>
          )}
        </label>
      </div>

      {/* Detect Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleDetect}
          disabled={loading || !selectedFile}
          style={{
            padding: "12px 45px",
            fontSize: "18px",
            backgroundColor: loading ? "#94a3b8" : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            boxShadow: "0 5px 15px rgba(34,197,94,0.4)",
          }}
        >
          {loading ? "Analyzing..." : "Detect Disease"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            borderRadius: "15px",
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            borderLeft: isHealthy
              ? "8px solid #22c55e"
              : "8px solid #ef4444",
          }}
        >
          <h3
            style={{
              color: isHealthy ? "#15803d" : "#b91c1c",
              marginBottom: "10px",
            }}
          >
            {isHealthy
              ? "✅ Plant is Healthy"
              : "⚠️ Disease Detected"}
          </h3>

          <h4 style={{ marginBottom: "10px", textTransform: "capitalize" }}>
            🧪 {result.disease}
          </h4>

          {/* Confidence Bar */}
          <div style={{ marginBottom: "15px" }}>
            <p style={{ marginBottom: "5px" }}>
              Confidence: {result.confidence}
            </p>
            <div
              style={{
                height: "10px",
                backgroundColor: "#e2e8f0",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: `${confidenceValue}%`,
                  height: "100%",
                  backgroundColor: isHealthy
                    ? "#22c55e"
                    : "#ef4444",
                  borderRadius: "10px",
                  transition: "width 0.5s ease",
                }}
              ></div>
            </div>
          </div>

          {/* Advice */}
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "#eff6ff",
              borderRadius: "10px",
            }}
          >
            <strong style={{ color: "#1d4ed8" }}>
              📋 Suggested Treatment:
            </strong>
            <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
              {result.advice || "No advice available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;