# Airport Object Detection

This project is an AI-powered object detection system for airport runways using YOLOv5. The system detects objects such as aircraft, baggage, and airport vehicles.

## 📌 Features
- Uses YOLOv5 for object detection.
- Supports Windows, Linux, and MacOS with the appropriate model file.
- Built using Flask for the backend and Next.js for the frontend.

## 🛠️ Requirements
- Python 3.10
- Node.js (for Next.js frontend)
- pip (Python package manager)

## 📦 Dependencies
Install the required Python libraries using:

```bash
pip install -r requirements.txt
```

### Python Dependencies
- `torch`
- `flask`
- `flask-cors`
- `PIL` (Pillow)
- `numpy`
- `opencv-python`
- `ultralytics`

## 🚀 Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/omchunamari/airport-object-detection.git
cd airport-object-detection
```

### 2️⃣ Model File Selection
- **Windows users** should use `windowsyolov5best.pt`.
- **Linux/macOS users** should use `yolov5best.pt`.
- Ensure the correct model file is set in `app.py`.

### 3️⃣ Run the Flask Backend
```bash
python app.py
```

By default, the backend runs on port **4000**.

### 4️⃣ Set Up the Frontend
Create a `.env.local` file in the project root and add:
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000
```

Then, install frontend dependencies and start the Next.js app:
```bash
npm install
npm run dev
```

### 5️⃣ Run the Detection
- Upload an image file (max size 8MB).
- Only image formats are allowed.
- The detected objects will be displayed on the webpage.

## 🖼️ Example Output
After uploading an image, the system will return the processed image with detected objects.

---

💡 **For issues or contributions, feel free to open a PR!** 🚀
