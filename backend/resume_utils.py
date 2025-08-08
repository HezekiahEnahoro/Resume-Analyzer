import spacy
import re

nlp = spacy.load("en_core_web_sm")

JOB_ROLES = {
    "Data Analyst": ["Python", "Pandas", "NumPy", "SQL", "Tableau", "Excel"],
    "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "Tailwind", "Redux"],
    "Backend Developer": ["Python", "Flask", "Django", "Node", "PostgreSQL", "APIs"]
}


def extract_info(text):
    doc = nlp(text)

    # Extract name (first PERSON entity)
    name = next((ent.text for ent in doc.ents if ent.label_ == "PERSON"), "Not found")

    # Extract email using regex
    email_match = re.search(r'\S+@\S+', text)
    email = email_match.group() if email_match else "Not found"

    # Extract skills (very basic keyword match — you can expand it later)
    skills_keywords = ["Python", "JavaScript", "React", "Flask", "SQL", "Docker"]
    skills = [word for word in skills_keywords if word.lower() in text.lower()]

    # Extract years of experience (pattern: "X years")
    exp_match = re.search(r'(\d+)\+?\s+years', text.lower())
    years_exp = exp_match.group(1) if exp_match else "Not found"

    best_match, matches = match_job_role(skills)

    return {
        "name": name,
        "email": email,
        "skills": skills,
        "experience_years": years_exp,
        "best_match": best_match,
        "match_scores": matches
    }

def match_job_role(resume_skills):
    matches = {}

    for role, required_skills in JOB_ROLES.items():
        overlap = set(skill.lower() for skill in resume_skills) & set(s.lower() for s in required_skills)
        score = round(100 * len(overlap) / len(required_skills))
        matches[role] = score

    best_match = max(matches, key=matches.get)
    return best_match, matches
