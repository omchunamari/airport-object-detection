"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Flask API URL
  const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setOutputImage(null); // Reset detected image
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image); // ✅ Match Flask's expected key

    try {
      const response = await axios.post(`${API_BASE_URL}/detect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // ✅ Receive image as a file
      });

      const imageUrl = URL.createObjectURL(response.data);
      setOutputImage(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Server error! Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mt-8 mb-6">Airport Object Detection</h1>

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

      {/* Full-Page Image Display */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full mt-6 gap-6">
        {preview && (
          <div className="text-center w-full flex flex-col items-center">
            <p className="text-xl text-gray-400 mb-2">Selected Image</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full md:w-[45vw] h-auto max-h-[80vh] object-contain border-4 border-gray-600 p-4 rounded-lg"
            />
          </div>
        )}

        {outputImage && (
          <div className="text-center w-full flex flex-col items-center">
            <p className="text-xl text-gray-400 mb-2">Detected Image</p>
            <img
              src={outputImage}
              alt="Detected"
              className="w-full md:w-[45vw] h-auto max-h-[80vh] object-contain border-4 border-blue-600 p-4 rounded-lg opacity-0 transition-opacity duration-1000 ease-in-out"
              onLoad={(e) => (e.target.style.opacity = 1)}
            />
          </div>
        )}
      </div>

      {/* Detect Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold flex items-center text-lg"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-6 w-6 mr-2 text-white"
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
    </div>
  );
}
