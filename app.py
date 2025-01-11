import cohere

co = cohere.Client('')

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
Based on the following database of people, answer this question by listing each relevant person with a color-coded ranking:
- Green = perfect match (the prompt keywords exist in the person's tags, skills, or background)
- Yellow = partial match (some relevant experience)
- Red = no match at all (keywords do not appear)

Use the format:
1. Alice Chen - Green
2. Bob Smith - Yellow
3. and so on... 
...

Rank everyone in the database from green to red. 

Explain why you selected what you did.

Prompt: "{query}"

{context}
Response:
""".strip()

    try:
        response = co.generate(
            prompt=prompt,
            model='command',
            max_tokens=300,
            temperature=0.7,
            stop_sequences=[],
            return_likelihoods='NONE'
        )
        return response.generations[0].text.strip()
    except Exception as e:
        return f"Error generating response: {str(e)}"


def main():
    print("Mesh!")
    print("Enter 'quit' to exit\n")

    while True:
        query = input("\nEnter your prompt: ").strip()

        if query.lower() == 'quit':
            print("Goodbye!")
            break

        if not query:
            print("Please enter a valid query")
            continue

        print("\nGenerating response...")
        response = get_llm_response(query)
        print(f"\n{response}")


if __name__ == "__main__":
    main()
