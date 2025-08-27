# resume_utils.py
import re
import phonenumbers
from rapidfuzz import fuzz, process
import dateparser

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
URL_RE = re.compile(r"(https?://[^\s)]+)")
# very loose name guess: first non-empty line with at least a space (Two Words)
NAME_RE = re.compile(r"^[A-Za-z][A-Za-z\-\.' ]{2,}[ ]+[A-Za-z\-\.' ]{2,}$")

DEGREE_WORDS = [
    "bachelor", "master", "phd", "ph.d", "msc", "m.sc", "bsc", "b.sc", "mba",
    "b.eng", "btech", "b.tech", "m.eng", "mtech", "m.tech", "associate", "diploma"
]
SKILL_BANK = [
    # add to taste
    "python","javascript","typescript","react","next.js","node.js","flask","fastapi",
    "django","postgresql","mysql","mongodb","redis",
    "aws","gcp","azure","docker","kubernetes","terraform",
    "pandas","numpy","scikit-learn","pytorch","tensorflow","nlp",
    "html","css","tailwind","vite","git","github","ci/cd","linux"
]

def _clean_lines(text: str):
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.splitlines()]
    return [ln for ln in lines if ln]

def _extract_email(text: str):
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None

def _extract_urls(text: str):
    return list({u.rstrip(").,]") for u in URL_RE.findall(text)})

def _extract_phone(text: str):
    # Try to find the first valid number anywhere in text
    for match in phonenumbers.PhoneNumberMatcher(text, None):
        num = phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
        return num
    return None

def _guess_name(lines):
    # Heuristic: first line that looks like "Firstname Lastname"
    for ln in lines[:8]:  # only look near top
        if 2 <= len(ln.split()) <= 6 and NAME_RE.match(ln):
            # avoid lines that are clearly emails/links
            if EMAIL_RE.search(ln) or URL_RE.search(ln):
                continue
            return ln
    return None

def _extract_education(lines):
    edu = []
    for ln in lines:
        low = ln.lower()
        if any(w in low for w in DEGREE_WORDS):
            # try to pull year range
            years = re.findall(r"(20\d{2}|19\d{2})", ln)
            edu.append({"text": ln, "years": years or None})
    return edu

def _extract_experience(lines):
    exp = []
    # naive block finder based on keywords + years
    KEYWORDS = ["experience", "work history", "employment", "professional experience"]
    # gather lines following a header for a short window
    capture = False
    buf = []
    for ln in lines:
        low = ln.lower()
        if any(k in low for k in KEYWORDS):
            if buf:
                exp.append(" ".join(buf)); buf = []
            capture = True
            continue
        if capture:
            if len(buf) > 0 and (ln.strip() == "" or ln.isupper()):
                exp.append(" ".join(buf)); buf = []; capture = False
            else:
                buf.append(ln)
    if buf: exp.append(" ".join(buf))

    # If nothing captured, fallback: pick lines with a year pattern
    if not exp:
        blocks = []
        block = []
        for ln in lines:
            if re.search(r"(20\d{1}|19\d{2})", ln):
                block.append(ln)
            elif block:
                blocks.append(" ".join(block)); block = []
        if block: blocks.append(" ".join(block))
        exp = blocks

    # normalize to simple items
    out = []
    for b in exp[:6]:
        # extract simple date expressions
        dates = re.findall(r"((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(20\d{2}|19\d{2}))", b, flags=re.I)
        out.append({"text": b, "dates": list({d[0] for d in dates}) or None})
    return out

def _extract_skills(text: str):
    found = []
    low = text.lower()
    for s in SKILL_BANK:
        # fuzzy match to catch minor variations
        score = fuzz.partial_ratio(s, low)
        if score >= 80:
            found.append(s)
    # dedupe while preserving order
    seen, uniq = set(), []
    for s in found:
        if s not in seen:
            seen.add(s); uniq.append(s)
    return uniq[:30]

def extract_info(text: str):
    lines = _clean_lines(text)
    email = _extract_email(text)
    phone = _extract_phone(text)
    urls = _extract_urls(text)
    name = _guess_name(lines)
    education = _extract_education(lines)
    experience = _extract_experience(lines)
    skills = _extract_skills(text)

    # Optional: try to parse any date-like strings for "years of experience" guess
    years = re.findall(r"(20\d{2}|19\d{2})", text)
    first_year = min(map(int, years)) if years else None
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "links": urls,
        "skills": skills,
        "education": education,
        "experience": experience,
        "earliest_year_seen": first_year
    }
