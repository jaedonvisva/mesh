import os
from dotenv import load_dotenv
import cohere

load_dotenv()
co = cohere.Client(os.getenv('COHERE_API_KEY'))

people_db = [
{
        "name": "Alice Chen",
        "skills": ["MongoDB", "Node.js", "Express", "Database Architecture"],
        "background": "Senior Database Engineer with 8 years of experience in NoSQL databases",
        "tags": ["backend", "database", "nosql", "mongodb"]
    },
    {
        "name": "Bob Smith",
        "skills": ["Python", "Data Analysis", "Machine Learning"],
        "background": "Data Scientist specializing in aggregation pipelines",
        "tags": ["data science", "machine learning"]
    },
    {
        "name": "Charlie Johnson",
        "skills": ["React", "JavaScript", "HTML", "CSS"],
        "background": "Frontend Developer with 5 years of experience building single-page applications",
        "tags": ["frontend", "javascript", "react"]
    },
    {
        "name": "Diana Robinson",
        "skills": ["AWS", "DevOps", "Docker", "Kubernetes"],
        "background": "DevOps Engineer with 7 years of experience automating CI/CD pipelines",
        "tags": ["devops", "cloud", "aws", "docker"]
    },
    {
        "name": "Ethan Brown",
        "skills": ["C++", "Embedded Systems", "Real-Time OS"],
        "background": "Firmware Engineer with 4 years of experience in IoT product development",
        "tags": ["firmware", "iot", "embedded"]
    },
    {
        "name": "Fiona Anderson",
        "skills": ["UI/UX Design", "Figma", "Sketch", "Prototyping"],
        "background": "UI/UX Designer with 5 years of experience leading design teams in startups",
        "tags": ["design", "ui/ux", "visual"]
    },
    {
        "name": "George Wilson",
        "skills": ["Angular", "TypeScript", "RxJS", "NgRx"],
        "background": "Senior Frontend Engineer with extensive experience in enterprise Angular apps",
        "tags": ["frontend", "angular", "typescript"]
    },
    {
        "name": "Hannah Lee",
        "skills": ["Project Management", "Scrum", "Agile"],
        "background": "Agile Project Manager with 6 years of experience in software development cycle planning",
        "tags": ["project management", "scrum", "agile"]
    },
    {
        "name": "Ian Davis",
        "skills": ["iOS Development", "Swift", "Objective-C"],
        "background": "Mobile Developer with 5 years of experience in building native iOS applications",
        "tags": ["mobile", "ios", "swift"]
    },
    {
        "name": "Jasmine Patel",
        "skills": ["Java", "Spring Boot", "Microservices", "SQL"],
        "background": "Backend Developer specializing in microservice architecture for financial applications",
        "tags": ["backend", "java", "microservices", "sql"]
    }
]


def format_database_context():
    """Format the database information into a context string"""
    context = "Here are the details of people in the database:\n\n"
    for person in people_db:
        context += f"Name: {person['name']}\n"
        context += f"Skills: {', '.join(person['skills'])}\n"
        context += f"Background: {person['background']}\n"
        context += f"Tags: {', '.join(person['tags'])}\n\n"
    return context


def get_llm_response(query: str) -> str:
    context = format_database_context()

    prompt = f"""
You are a smart assistant tasked with ranking people from a database based on how well their skills, background, and tags match the user's query. Follow these steps:

1. Compare the keywords from the query with the "skills," "background," and "tags" fields of each person. 
2. Assign a ranking based on relevance:
   - **Green**: Perfect match. The query keywords exist explicitly in their "skills," "background," or "tags."
   - **Yellow**: Partial match. They have related experience or skills that could reasonably apply to the query.
   - **Red**: No match. There is no connection to the query in their "skills," "background," or "tags."

Output the response as a JSON object with the colours as the keys, and a list of the people's names only as the values
Prompt: "{query}"

{context}
Response:
""".strip()

    try:
        response = co.generate(
            prompt=prompt,
            model='command',
            max_tokens=500,
            temperature=0.3,
            stop_sequences=[],
            return_likelihoods='NONE'
        )
        return response.generations[0].text.strip()
    except Exception as e:
        return f"Error generating response: {str(e)}"




