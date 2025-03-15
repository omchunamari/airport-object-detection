from flask import Flask, request, jsonify, send_file
import torch
import os
import ssl
from PIL import Image
import io
from flask_cors import CORS  # Import CORS for frontend integration

app = Flask(__name__)
CORS(app)  

# 🔥 Disable SSL Verification for Torch Hub (Fixes SSL errors)
ssl._create_default_https_context = ssl._create_unverified_context

# ✅ Explicitly Disable CUDA (Force CPU)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # ❌ Disable GPU
device = torch.device("cpu")  # ✅ Force CPU usage

# ✅ Load YOLOv5 model on CPU
MODEL_PATH = "windowsyolov5best.pt"
model = torch.hub.load(
    "ultralytics/yolov5",
    "custom",
    path=MODEL_PATH,
    force_reload=True,
    trust_repo=True
).to(device)  # ✅ Force running on CPU

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["image"]
    
    # ✅ Validate file size (Max 8MB)
    if len(file.read()) > 8 * 1024 * 1024:
        return jsonify({"error": "File size exceeds 8MB limit"}), 400

    file.seek(0)  # Reset file pointer after reading
    
    filename = file.filename
    image_path = os.path.join("uploads", filename)
    output_path = os.path.join("outputs", filename)
    
    # ✅ Save uploaded image
    file.save(image_path)

    image = Image.open(image_path).convert("RGB")  # ✅ Convert image to RGB

    # 🔥 Run YOLOv5 inference on CPU only
    results = model(image)

    # 🖼️ Render bounding boxes
    results.render()
    
    # ✅ Save detected image
    detected_image = Image.fromarray(results.ims[0])
    detected_image.save(output_path, format="JPEG")
    
    return send_file(output_path, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)  # ✅ Allow external access
