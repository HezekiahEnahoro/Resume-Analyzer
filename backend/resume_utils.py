# resume_utils.py
import re
import spacy
import phonenumbers
from typing import List, Dict, Tuple, Optional
from datetime import datetime

# ---- Safe spaCy model load ----
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

JOB_ROLES: Dict[str, List[str]] = {
    "Data Analyst": ["Python", "Pandas", "NumPy", "SQL", "Tableau", "Excel"],
    "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "Tailwind", "Redux"],
    "Backend Developer": ["Python", "Flask", "Django", "Node", "PostgreSQL", "APIs"],
    "Full Stack Developer": ["JavaScript", "React", "Node", "Python", "SQL", "APIs"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Jenkins"],
    "Data Scientist": ["Python", "Machine Learning", "TensorFlow", "R", "Statistics", "Pandas"],
}

DEGREE_WORDS = [
    "bachelor", "master", "phd", "ph.d", "msc", "m.sc", "bsc", "b.sc", "mba",
    "b.eng", "btech", "b.tech", "m.eng", "mtech", "m.tech", "associate", "diploma",
    "computer science", "data science", "software engineering", "information technology",
]

# Expanded skill bank for better detection
SKILLS_KEYWORDS = [
    "Python", "JavaScript", "React", "Angular", "Vue", "Flask", "Django", "FastAPI",
    "Node", "Express", "SQL", "PostgreSQL", "MongoDB", "MySQL", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "CI/CD", "Jenkins", "Linux", "Bash", "REST",
    "GraphQL", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning",
    "HTML", "CSS", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby",
    "PHP", "Swift", "Kotlin", "Pandas", "NumPy", "Tableau", "Power BI", "Excel",
    "Agile", "Scrum", "Jira", "Redis", "Elasticsearch", "Kafka", "RabbitMQ"
]

EMAIL_RE = re.compile(r"\b\S+@\S+\.\S+\b")
YEAR_RE = re.compile(r"\b(20\d{2}|19\d{2})\b", re.I)

# ATS Keywords that boost scores
ATS_POSITIVE_KEYWORDS = [
    "achieved", "improved", "increased", "decreased", "developed", "created",
    "managed", "led", "implemented", "delivered", "optimized", "streamlined",
    "reduced", "generated", "launched", "coordinated", "analyzed", "designed",
    "built", "established", "executed", "facilitated"
]

def _clean_lines(text: str) -> List[str]:
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.splitlines()]
    return [ln for ln in lines if ln]

def _extract_email(text: str) -> Optional[str]:
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None

def _extract_phone(text: str) -> Optional[str]:
    """Return first plausible international-format number."""
    for match in phonenumbers.PhoneNumberMatcher(text, None):
        try:
            num = phonenumbers.format_number(
                match.number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
            )
            return num
        except Exception:
            continue
    return None

def _extract_education(text: str) -> List[Dict]:
    """Return list of {'text': line, 'years': [years] or None} that look like education."""
    results: List[Dict] = []
    for ln in _clean_lines(text):
        low = ln.lower()
        if any(w in low for w in DEGREE_WORDS):
            years = YEAR_RE.findall(ln)
            results.append({"text": ln, "years": years or None})
    return results

def _extract_skills(text: str) -> List[str]:
    found = []
    low = text.lower()
    for s in SKILLS_KEYWORDS:
        if s.lower() in low:
            found.append(s)
    # dedupe preserve order
    seen, uniq = set(), []
    for s in found:
        if s not in seen:
            seen.add(s)
            uniq.append(s)
    return uniq

def _explicit_years_of_exp(text: str) -> Optional[int]:
    """Find explicit patterns like '5 years', '7+ years'."""
    m = re.search(r"\b(\d+)\+?\s+years?\b", text.lower())
    if m:
        try:
            return int(m.group(1))
        except Exception:
            return None
    return None

def _infer_years_from_earliest(text: str) -> Tuple[Optional[int], Optional[int]]:
    """Infer experience years from the earliest year seen in the text."""
    clean = EMAIL_RE.sub(" ", text)
    clean = re.sub(r"https?://\S+", " ", clean)
    years = [int(y) for y in YEAR_RE.findall(clean)]
    if not years:
        return None, None
    earliest = min(years)
    now = datetime.now().year
    if earliest < 1990 or earliest > now:
        return None, None
    return max(0, now - earliest), earliest

def match_job_role(resume_skills: List[str]) -> Tuple[str, Dict[str, int]]:
    matches: Dict[str, int] = {}
    resume_set = {s.lower() for s in resume_skills}
    for role, required in JOB_ROLES.items():
        req_set = {s.lower() for s in required}
        overlap = resume_set & req_set
        score = round(100 * len(overlap) / max(1, len(req_set)))
        matches[role] = score
    best_match = max(matches, key=matches.get) if matches else "N/A"
    return best_match, matches

def calculate_ats_score(text: str, extracted_data: Dict) -> int:
    """
    Calculate ATS compatibility score (0-100) based on multiple factors.
    
    Scoring breakdown:
    - Contact info (name, email, phone): 15 points
    - Skills detection: 25 points
    - Education: 15 points
    - Experience/Years: 15 points
    - Action verbs usage: 15 points
    - Formatting indicators: 15 points
    """
    score = 0
    
    # Contact Information (15 points)
    if extracted_data.get("name") and extracted_data["name"] != "Not found":
        score += 5
    if extracted_data.get("email") and extracted_data["email"] != "Not found":
        score += 5
    if extracted_data.get("phone") and extracted_data["phone"] != "Not found":
        score += 5
    
    # Skills (25 points)
    skills_count = len(extracted_data.get("skills", []))
    if skills_count >= 10:
        score += 25
    elif skills_count >= 6:
        score += 20
    elif skills_count >= 3:
        score += 15
    elif skills_count >= 1:
        score += 10
    
    # Education (15 points)
    education = extracted_data.get("education", [])
    if len(education) >= 2:
        score += 15
    elif len(education) == 1:
        score += 10
    
    # Experience (15 points)
    exp_years = extracted_data.get("experience_years")
    if exp_years and exp_years != "Not found":
        if exp_years >= 5:
            score += 15
        elif exp_years >= 2:
            score += 12
        elif exp_years >= 1:
            score += 8
    
    # Action Verbs (15 points) - Strong verbs indicate accomplishments
    text_lower = text.lower()
    action_verb_count = sum(1 for verb in ATS_POSITIVE_KEYWORDS if verb in text_lower)
    if action_verb_count >= 10:
        score += 15
    elif action_verb_count >= 6:
        score += 12
    elif action_verb_count >= 3:
        score += 8
    elif action_verb_count >= 1:
        score += 5
    
    # Formatting indicators (15 points)
    has_bullets = bool(re.search(r'[•\-\*]\s', text))
    has_sections = len(re.findall(r'\n[A-Z][A-Za-z\s]+\n', text)) >= 2
    reasonable_length = 500 <= len(text) <= 3000
    
    if has_bullets:
        score += 5
    if has_sections:
        score += 5
    if reasonable_length:
        score += 5
    
    return min(100, score)

def generate_suggestions(text: str, extracted_data: Dict, ats_score: int) -> List[Dict]:
    """Generate actionable improvement suggestions based on analysis."""
    suggestions = []
    
    # Contact Information Suggestions
    if not extracted_data.get("email") or extracted_data["email"] == "Not found":
        suggestions.append({
            "icon": "AlertTriangle",
            "title": "Missing Email Address",
            "description": "Add a professional email address at the top of your resume. This is crucial for recruiters to contact you.",
            "priority": "high"
        })
    
    if not extracted_data.get("phone") or extracted_data["phone"] == "Not found":
        suggestions.append({
            "icon": "AlertTriangle",
            "title": "Missing Phone Number",
            "description": "Include a phone number where employers can reach you. Use international format if applying globally.",
            "priority": "medium"
        })
    
    # Skills Suggestions
    skills_count = len(extracted_data.get("skills", []))
    if skills_count < 5:
        suggestions.append({
            "icon": "Lightbulb",
            "title": "Add More Technical Skills",
            "description": f"You have {skills_count} skills listed. Add 5-10 relevant technical skills to improve ATS matching. Include tools, frameworks, and technologies.",
            "priority": "high"
        })
    
    # Education Suggestions
    if not extracted_data.get("education") or len(extracted_data["education"]) == 0:
        suggestions.append({
            "icon": "AlertTriangle",
            "title": "Education Section Missing",
            "description": "Add your educational background. Include degree, institution, and graduation year.",
            "priority": "medium"
        })
    
    # Experience Suggestions
    exp_years = extracted_data.get("experience_years")
    if not exp_years or exp_years == "Not found":
        suggestions.append({
            "icon": "Lightbulb",
            "title": "Clarify Your Experience",
            "description": "Make your years of experience clear. Add dates to your work history or include a summary statement.",
            "priority": "medium"
        })
    
    # Action Verbs Suggestion
    text_lower = text.lower()
    action_verb_count = sum(1 for verb in ATS_POSITIVE_KEYWORDS if verb in text_lower)
    if action_verb_count < 5:
        suggestions.append({
            "icon": "Lightbulb",
            "title": "Use More Action Verbs",
            "description": "Start bullet points with strong action verbs like 'Developed', 'Improved', 'Led', 'Achieved'. This makes your accomplishments stand out.",
            "priority": "medium"
        })
    
    # Quantification Suggestion
    has_numbers = bool(re.search(r'\d+%|\$\d+|\d+\+', text))
    if not has_numbers:
        suggestions.append({
            "icon": "Lightbulb",
            "title": "Quantify Your Achievements",
            "description": "Add numbers and metrics to your accomplishments (e.g., 'Increased sales by 30%', 'Led team of 5 developers').",
            "priority": "high"
        })
    
    # Length Suggestion
    word_count = len(text.split())
    if word_count < 200:
        suggestions.append({
            "icon": "AlertTriangle",
            "title": "Resume Too Short",
            "description": f"Your resume has ~{word_count} words. Aim for 400-600 words to provide enough detail about your experience.",
            "priority": "high"
        })
    elif word_count > 1000:
        suggestions.append({
            "icon": "Lightbulb",
            "title": "Consider Condensing",
            "description": f"Your resume has ~{word_count} words. Consider condensing to 600-800 words for better readability.",
            "priority": "low"
        })
    
    # If score is good, add positive reinforcement
    if ats_score >= 80 and len(suggestions) < 2:
        suggestions.append({
            "icon": "CheckCircle",
            "title": "Great Job!",
            "description": "Your resume is well-structured and ATS-friendly. Just minor tweaks suggested above.",
            "priority": "low"
        })
    
    return suggestions

def extract_info(text: str) -> Dict:
    """Main extraction function with ATS scoring."""
    doc = nlp(text)

    # Name: first PERSON entity
    name = next((ent.text for ent in doc.ents if ent.label_ == "PERSON"), None)

    # Email / Phone
    email = _extract_email(text)
    phone = _extract_phone(text)

    # Skills
    skills = _extract_skills(text)

    # Education
    education = _extract_education(text)

    # Experience years
    exp_years = _explicit_years_of_exp(text)
    inferred_years, earliest_year = _infer_years_from_earliest(text)
    if exp_years is None:
        exp_years = inferred_years

    # Role match scores
    best_match, matches = match_job_role(skills)

    # Build extracted data dict
    extracted_data = {
        "name": name or "Not found",
        "email": email or "Not found",
        "phone": phone or "Not found",
        "skills": skills,
        "education": education,
        "experience_years": exp_years if exp_years is not None else "Not found",
        "earliest_year_seen": earliest_year,
        "best_match": best_match,
        "match_scores": matches,
    }

    # Calculate ATS score
    ats_score = calculate_ats_score(text, extracted_data)
    extracted_data["ats_score"] = ats_score

    # Generate suggestions
    suggestions = generate_suggestions(text, extracted_data, ats_score)
    extracted_data["suggestions"] = suggestions

    return extracted_data