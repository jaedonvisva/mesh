import cohere

co = cohere.Client('84i7aNTvY4EVNeiw6MjT1DRbTKZef0awdoD78QKS')

people_db = [
    {
        "name": "Alice Chen",
        "skills": ["MongoDB", "Node.js", "Express", "Database Architecture"],
        "experience": [],
        "background": "Senior Database Engineer with 8 years of experience in NoSQL databases",
        "interests": [],
        "tags": ["backend", "database", "nosql", "mongodb"]
    },
    {
        "name": "Bob Smith",
        "skills": ["Python", "Data Analysis", "Machine Learning"],
        "background": "Data Scientist specializing in aggregation pipelines",
        "tags": ["data science", "machine learning"]
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
...

NO ADDITIONAL WORDS or commentary. Just the list.

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
