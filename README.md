# 📄 Resume Analyzer

A full-stack web application that helps users upload their resumes (PDF or DOCX) and automatically extract useful information such as **name**, **email**, **skills**, and **years of experience** using NLP techniques.

Built with **React (frontend)** and **Flask (backend)**.

---

## 🚀 Features

- Upload resumes (PDF/DOCX)
- Extract:
  - Name
  - Email
  - Skills
  - Years of experience
- NLP-powered parsing (spaCy + Regex)
- Animated result display
- Clean and responsive UI
- Error handling for unsupported files

---

## 🔧 Tech Stack

### Frontend:
- React
- Tailwind CSS
- Axios
- Framer Motion (animations)

### Backend:
- Flask
- Flask-Mail
- Flask-CORS
- spaCy
- python-docx / PyMuPDF / pdfminer
- dotenv

---

## 📂 Project Structure

Resume-analyzer/
├── frontend/
│ └── React app (UI)
├── backend/
│ ├── app.py (Flask API)
│ ├── utils.py (NLP logic)
│ ├── config.env
│ ├── requirements.txt