import cohere
import re
import json
import os
from PyPDF2 import PdfReader

co = cohere.Client(os.getenv('COHERE_API_KEY'))
model = "command-r-08-2024"

def extract_from_pdf(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text



def extract_cohere(file):
    prompt = f"""
    Extract the following details from the resume and format the output as a JSON object with the specified keys:
    
    1. "name": The full name of the person.
    2. "skills": A list of technical skills (e.g., programming languages, frameworks, tools).
    3. "experience": A list of work experiences, each containing the company name, role, and duration.
    4. "background": A summary of the person's professional background.
    5. "interests": A list of personal interests or hobbies.
    6. "tags": A list of descriptive tags summarizing the resume content.

    Resume text:
    {extract_from_pdf(file)}

    Format the output as JSON. For example:
    """

    response = co.generate(model=model, prompt=prompt, max_tokens=500, temperature=0.3)
    
    return response.generations[0].text.strip()

if __name__ == "__main__":
    pass