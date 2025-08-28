# util.py
import re
import spacy
import phonenumbers
from typing import List, Dict, Tuple, Optional

# ---- Safe spaCy model load ----
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Optional: auto-download in dev; comment this out if your host blocks downloads
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

JOB_ROLES: Dict[str, List[str]] = {
    "Data Analyst": ["Python", "Pandas", "NumPy", "SQL", "Tableau", "Excel"],
    "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "Tailwind", "Redux"],
    "Backend Developer": ["Python", "Flask", "Django", "Node", "PostgreSQL", "APIs"],
}

# Degree keywords (tune to your audience)
DEGREE_WORDS = [
    "bachelor", "master", "phd", "ph.d", "msc", "m.sc", "bsc", "b.sc", "mba",
    "b.eng", "btech", "b.tech", "m.eng", "mtech", "m.tech", "associate", "diploma",
    "computer science", "data science", "software engineering", "information technology",
]

# Simple skill bank used for detection (extend as needed)
SKILLS_KEYWORDS = ["Python", "JavaScript", "React", "Flask", "Django", "SQL", "Docker", "Node"]

EMAIL_RE = re.compile(r"\b\S+@\S+\.\S+\b")
YEAR_RE = re.compile(r"\b(20\d{2}|19\d{2})\b", re.I)

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
            seen.add(s); uniq.append(s)
    return uniq

def _explicit_years_of_exp(text: str) -> Optional[int]:
    """
    Find explicit patterns like '5 years', '7+ years'.
    Returns an int if found, otherwise None.
    """
    m = re.search(r"\b(\d+)\+?\s+years?\b", text.lower())
    if m:
        try:
            return int(m.group(1))
        except Exception:
            return None
    return None

def _infer_years_from_earliest(text: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Infer experience years from the earliest year seen in the text.
    Returns (years_of_experience, earliest_year_seen).
    """
    # Avoid years inside emails/links interfering
    clean = EMAIL_RE.sub(" ", text)
    clean = re.sub(r"https?://\S+", " ", clean)
    years = [int(y) for y in YEAR_RE.findall(clean)]
    if not years:
        return None, None
    earliest = min(years)
    from datetime import datetime
    now = datetime.now().year
    # Basic sanity window
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

def extract_info(text: str) -> Dict:
    doc = nlp(text)

    # Name: first PERSON entity
    name = next((ent.text for ent in doc.ents if ent.label_ == "PERSON"), None)

    # Email / Phone
    email = _extract_email(text)
    phone = _extract_phone(text)

    # Skills (keyword-based; keep simple here)
    skills = _extract_skills(text)

    # Education
    education = _extract_education(text)

    # Experience years: explicit > inferred
    exp_years = _explicit_years_of_exp(text)
    inferred_years, earliest_year = _infer_years_from_earliest(text)
    if exp_years is None:
        exp_years = inferred_years

    # Role match scores
    best_match, matches = match_job_role(skills)

    return {
        "name": name or "Not found",
        "email": email or "Not found",
        "phone": phone or "Not found",
        "skills": skills,
        "education": education,                  # list of {text, years}
        "experience_years": exp_years if exp_years is not None else "Not found",
        "earliest_year_seen": earliest_year,     # may be None
        "best_match": best_match,
        "match_scores": matches,
    }
