"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload } from "lucide-react"; // Import upload icon from Lucide

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setOutputImage(null);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);

    // Timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      setLoading(false);
      alert("Server timeout! Try again.");
    }, 10000); // 10 seconds timeout

    const formData = new FormData();
    formData.append("file", image);

    try {
      // Updated API URL to Render's deployment
      const response = await axios.post("https://airport-detection-api.onrender.com/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearTimeout(uploadTimeout); // Clear timeout if successful

      console.log("API Response:", response.data); // Debugging

      if (response.data.filename) {
        setOutputImage(`https://airport-detection-api.onrender.com/outputs/${response.data.filename}`);
      } else {
        alert("Detection failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mt-10 mb-6">Airport Object Detection</h1>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Custom File Upload Button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="mb-4 flex items-center px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-semibold border border-gray-600"
      >
        <Upload className="h-5 w-5 mr-2" /> Choose File
      </button>

      {preview && (
        <div className="mb-4">
          <p className="text-2xl px-6 text-gray-400">Selected Image:</p>
          <img src={preview} alt="Preview" className="w-auto h-auto max-w-[50vw] max-h-[50vw] p-6" />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold flex items-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Detecting...
          </>
        ) : (
          "Detect"
        )}
      </button>

      {outputImage && (
        <div className="mt-6">
          <p className="text-2xl text-gray-400 px-6">Detected Image:</p>
          <img
            src={outputImage}
            alt="Detected"
            className="w-auto h-auto p-6 opacity-0 transition-opacity duration-1000 ease-in-out"
            onLoad={(e) => (e.target.style.opacity = 1)} // Smooth unblur effect
          />
        </div>
      )}
    </div>
  );
}
