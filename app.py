from flask import Flask, request, jsonify, send_file
import torch
import os
import ssl
import sys
from PIL import Image
import psutil
from flask_cors import CORS  # Import CORS for frontend integration
import multiprocessing

app = Flask(__name__)
CORS(app)  

# 🔥 Disable SSL Verification for Torch Hub (Fixes SSL errors)
ssl._create_default_https_context = ssl._create_unverified_context

# ✅ Explicitly Disable CUDA (Force CPU)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # ❌ Disable GPU
device = torch.device("cpu")  # ✅ Force CPU usage

# ✅ Load YOLOv5 model on CPU
MODEL_PATH = "windowsyolov5best.pt" if os.name == "nt" else "yolov5best.pt"
model = torch.hub.load(
    "ultralytics/yolov5",
    "custom",
    path=MODEL_PATH,
    force_reload=True,
    trust_repo=True
).to(device)  # ✅ Force running on CPU

# ✅ Set process affinity to use only CPU Core 0 (Windows only)
if os.name == "nt":
    p = psutil.Process()
    p.cpu_affinity([0])

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

def print_system_stats():
    """ Print system stats when image is detected """
    cpu_usage = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    print("\n===== System Stats =====")
    print(f"CPU Usage: {cpu_usage}% (Core 0 only)" if os.name == "nt" else f"CPU Usage: {cpu_usage}%")
    print(f"Memory Usage: {memory.percent}%")
    print(f"Available RAM: {memory.available / (1024 ** 3):.2f} GB")
    print(f"Disk Usage: {disk.percent}%")
    print("========================\n")

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
    
    # 📊 Display system stats only when detection occurs
    print_system_stats()

    return send_file(output_path, mimetype="image/jpeg")

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 4000
    print("🚀 Starting Flask app on CPU Core 0...")

    if os.name == "nt":
        from waitress import serve
        print(f"🟢 Running on Windows using Waitress...")
        print(f"✅ Hosted on: http://127.0.0.1:{port}/")
        serve(app, host=host, port=port, threads=1)
    else:
        import gunicorn.app.base

        class StandaloneGunicornApp(gunicorn.app.base.BaseApplication):
            """ Gunicorn application to run Flask inside Python script """

            def __init__(self, app, options=None):
                self.options = options or {}
                self.application = app
                super().__init__()

            def load_config(self):
                for key, value in self.options.items():
                    self.cfg.set(key, value)

            def load(self):
                return self.application

        cpu_cores = multiprocessing.cpu_count()
        print(f"🟢 Running on Linux/macOS using Gunicorn ({cpu_cores} worker(s))...")
        print(f"✅ Hosted on: http://127.0.0.1:{port}/")
        
        options = {
            "bind": f"{host}:{port}",
            "workers": 1,  # Ensures only 1 worker is used
        }
        StandaloneGunicornApp(app, options).run()
