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
Extract the following details from the resume and format the output as a JSON object with the specified keys:

"name": The full name of the person.
"skills": A list of technical skills (e.g., programming languages, frameworks, tools).
"experience": A list of work experiences, each containing the company name, role, and duration.
"background": A summary of the person's professional background.
"interests": A list of personal interests or hobbies.
"tags": A list of descriptive tags summarizing the resume content.

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
    "tags": ["backend", "python"],
    "background": "Senior Software Engineer with 5 years of experience in web development",
    "interests": ["Reading", "Traveling", "Gaming"]
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

