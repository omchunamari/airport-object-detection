"use client";

import { useState } from "react";
import axios from "axios";

export default function Home({ setSelectedImage, setOutputImage, onDetect }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setSelectedImage(file);
    }
  };

  const handleDetect = async () => {
    if (!image) return alert("Please upload an image first!");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://127.0.0.1:5000/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOutputImage(response.data.outputUrl);
      onDetect();
    } catch (error) {
      console.error("Detection error:", error);
      alert("Error detecting objects. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-center">Upload Image</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4 w-full" />
        {preview && <img src={preview} alt="Selected" className="w-full h-auto rounded-lg mb-4" />}
        <button onClick={handleDetect} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Detect
        </button>
      </div>
    </div>
  );
}
