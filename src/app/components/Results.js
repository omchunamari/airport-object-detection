"use client";

export default function Results({ outputImage, onDetectMore }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-center">Detection Result</h2>
        {outputImage ? (
          <img src={outputImage} alt="Detected" className="w-full h-auto rounded-lg mb-4" />
        ) : (
          <p className="text-center text-gray-500">No image detected.</p>
        )}
        <button onClick={onDetectMore} className="bg-green-500 text-white px-4 py-2 rounded w-full">
          Detect More Images
        </button>
      </div>
    </div>
  );
}
