import cohere
import os
import json

co = cohere.ClientV2(os.getenv("COHERE_API_KEY"))

def generate_user_data(data):
    prompt = f"""
Extract the following details from the user text and format the output as a JSON object with the specified keys:

"name": The full name of the person.
"skills": A list of technical skills (e.g., programming languages, frameworks, tools).
"experience": A list of work experiences, each containing the company name, role, and duration.
"background": A summary of the person's professional background.
"interests": A list of personal interests or hobbies.
"tags": A list of descriptive tags summarizing the user data.

User text:
{data}

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
    return json.loads(result)