from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF
import docx
from resume_utils import extract_info
from werkzeug.utils import secure_filename
from pdfminer.high_level import extract_text


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Determine file type and extract text
    ext = filename.split('.')[-1].lower()
    if ext == "pdf":
        text = extract_text(file_path)
    elif ext == "docx":
        text = extract_text_from_docx(file_path)
    else:
        return jsonify({"error": "Unsupported file type"}), 400

    # NLP extraction
    result = extract_info(text)
    print("Extracted Info:", result)

    return jsonify(result)

    
def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])
    


@app.route('/')
def home():
    return "Flask backend is running."


if __name__ == "__main__":
    app.run(debug=True)
