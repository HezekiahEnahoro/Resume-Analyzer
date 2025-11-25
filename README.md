# 📄 Resume Analyzer

> An NLP-powered resume analyzer that extracts key details (name, email, phone, education, skills, experience) from resumes and optionally compares them against job descriptions to highlight best matches and missing skills.

---

## 🔗 Quick Access
| Badge | Link |
|-------|------|
| 🌍 Live Demo | [Live App](https://resume-analyzer-iota-three.vercel.app/) |
| 🎥 Video Demo | [Watch Here](https://shorturl.at/4f1N8) |
| 💻 GitHub Repo | [Repo Link](https://github.com/HezekiahEnahoro/Resume-Analyzer) |
| 📝 Docs | [Documentation](#) |

---

## 🛠 Tech Stack
**Frontend:** React (Vite, TailwindCSS, Framer Motion)  
**Backend:** Flask + Gunicorn (WSGI)  
**NLP:** spaCy (en_core_web_sm), regex, rapidfuzz, phonenumbers, dateparser  
**File Parsing:** PyMuPDF (PDF), python-docx (DOCX)  
**Deployment:** Vercel (frontend), Render (backend)  

---

## ⚙️ Features
- 📤 Upload resumes in **PDF or DOCX** format  
- 🔎 Extract **Name, Email, Phone, Education, Skills, Experience**  
- 📈 Estimate **Years of Experience** from earliest year found  
- 🆚 Compare against Job Descriptions (JD) to get:  
  - Best matching role  
  - Match scores per role  
  - Missing keywords  
- 🌐 Deployed with **Vercel (frontend)** + **Render (backend)**  
- 🛡 File validation (size/type), CORS protection, secure parsing  

---
## 📂 Project Structure

Resume-analyzer/
├── frontend/
│ └── React app (UI)
├── backend/
│ ├── app.py (Flask API)
│ ├── utils.py (NLP logic)
│ ├── .env
│ ├── runtime.txt
│ ├── requirements.txt

## 🚀 Setup

### Clone Repo
git clone https://github.com/your-username/resume-analyzer.git
cd resume-analyzer

### Backend Setup
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
gunicorn -k gthread app:app --bind 0.0.0.0:8000 --threads 4 --timeout 120

### Frontend Setup
cd frontend
npm install
npm run dev

### Environment Example
Create a .env in backend:
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app

### ☁️ Deployment
Render (**Backend**)
Add runtime.txt in backend/: python-3.11.9

Build Command: 
pip install --upgrade pip && pip install -r requirements.txt

Start Command:
gunicorn -k gthread app:app --bind 0.0.0.0:$PORT --threads 4 --timeout 120

Vercel (**Frontend**)
Deploy React frontend

Set env var VITE_RESUME_API=https://your-backend.onrender.com



👤 Author
Hezekiah Enahoro
🌐 [Portfolio] https://my-portfolio-chi-inky-93.vercel.app/
💼 [LinkedIn] (https://www.linkedin.com/in/hezekiah-enahoro/)
🐙 [GitHub](https://github.com/HezekiahEnahoro)
