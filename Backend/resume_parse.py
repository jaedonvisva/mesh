import json
from PyPDF2 import PdfReader
import cohere
import os
from dotenv import load_dotenv

load_dotenv()

co = cohere.Client(os.getenv("COHERE_API_KEY"))

def parse_resume(file) -> dict:
    """Extract and parse resume from PDF"""
    try:
        pdf_text = extract_text_from_pdf(file)
        
        prompt = f"""
Extract these details from the resume and return as JSON:
1. name: Full name
2. skills: List of technical skills
3. experience: List of work history (company, role, dates)
4. education: Academic background
5. projects: Notable projects
6. tags: Key areas of expertise

Resume text:
{pdf_text}

Return ONLY valid JSON like:
{{
    "name": "John Smith",
    "skills": ["Python", "JavaScript"],
    "experience": [
        {{
            "company": "Tech Corp",
            "role": "Senior Dev",
            "dates": "2020-2023"
        }}
    ],
    "education": "BS Computer Science",
    "projects": ["Built API", "Led team"],
    "tags": ["backend", "python"]
}}
"""
        response = co.generate(
            model='command-r-08-2024',
            prompt=prompt,
            max_tokens=2000,
            temperature=0.3        )
        
        result = response.generations[0].text.strip()
        result = result.replace("```json", "")
        result = result.replace("```", "")        
        print(result)
        return json.loads(result)

    except Exception as e:
        raise Exception(f"Resume parsing failed: {str(e)}")


def extract_text_from_pdf(file) -> str:
    """Extract text content from PDF file"""
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")

