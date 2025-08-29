from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import fitz            
import docx            
from werkzeug.utils import secure_filename
from resume_utils import extract_info
from dotenv import load_dotenv
import os
load_dotenv()


app = Flask(__name__)

allowed_origins = os.getenv("ALLOWED_ORIGINS")
CORS(app)

# --- hardening ---
ALLOWED_EXTS = {"pdf", "docx"}
MAX_MB = 5
app.config["MAX_CONTENT_LENGTH"] = MAX_MB * 1024 * 1024  # 5 MB limit

def allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS

def extract_text_from_upload(filename: str, data: bytes) -> str:
    ext = filename.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        # Parse PDF from bytes (no temp file)
        doc = fitz.open(stream=data, filetype="pdf")
        return " ".join(page.get_text() for page in doc)
    elif ext == "docx":
        # Parse DOCX from bytes
        f = io.BytesIO(data)
        d = docx.Document(f)
        return "\n".join(p.text for p in d.paragraphs)
    else:
        raise ValueError("Unsupported file type")

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file uploaded"}), 400
    if not f.filename:
        return jsonify({"error": "Empty filename"}), 400
    if not allowed(f.filename):
        return jsonify({"error": "Unsupported file type. Use PDF or DOCX."}), 400

    # read into memory
    data = f.read()
    if not data:
        return jsonify({"error": "Empty file"}), 400

    # extract text
    try:
        text = extract_text_from_upload(secure_filename(f.filename), data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # avoid leaking internal details
        return jsonify({"error": "Failed to parse document"}), 500

    # NLP extraction
    result = extract_info(text)
    return jsonify(result), 200

@app.route("/")
def home():
    return "Flask backend is running."


if __name__ == "__main__":
    app.run(debug=True)
