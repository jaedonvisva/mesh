import os
from dotenv import load_dotenv
import cohere
from pymongo import MongoClient
import json
from typing import List, Dict
import numpy as np
import yaml


model = "command"
load_dotenv()
# MongoDB Connection
try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["Users"]  # Replace with your database name
    users_collection = db["Users"]  # Replace with your collection name
except Exception as e:
    raise Exception(f"Error connecting to MongoDB: {e}")

# Cohere Setup
try:
    co = cohere.Client(os.getenv("COHERE_API_KEY"))
except Exception as e:
    raise Exception(f"Error initializing Cohere client: {e}")


def get_all_people() -> List[Dict]:
    try:
        users_cursor = users_collection.find()
        users = []
        for user in users_cursor:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string
            users.append(user)
        return users
    except Exception as e:
        raise Exception(f"Error fetching users: {e}")




# Format candidates for embedding
def extract_cohere(query):
    prompt = f"""
    Analyze the following query and extract relevant details based on the given categories. Format the output as a list with the following : "skills", "interests", and "tags".

    - "skills": Extract the technical skills explicitly mentioned or implied, such as programming languages, frameworks, libraries, or technical tools.
    - "interests": Extract any personal or professional interests, hobbies, or focus areas related to the query.
    - "tags": Extract high-level descriptive tags summarizing the type of role or domain requested (e.g., "frontend", "design", "data science", etc.).

    Context: Ensure that the extracted skills, interests, and tags align with industry standards and reflect the most relevant attributes for matching candidates to the query. If a skill or interest is implied but not explicitly mentioned, infer it based on the query's intent. also make sure only the json format is returned

    generate 3 items per category

    Now, analyze this query: "{query}", generating only the JSON object. dont tell me the rational.
    """
    response = co.generate(model=model, prompt=prompt, max_tokens=2000, temperature=0.3)
    return response.generations[0].text.strip()


# Function to calculate dynamic thresholds based on results
def dynamic_thresholds(results):
    scores = [result.relevance_score for result in results.results]
    mean_score = np.mean(scores)
    std_dev_score = np.std(scores)
    median_score = np.median(scores)
    
    good_threshold = mean_score + std_dev_score
    okay_threshold = median_score
    bad_threshold = mean_score - std_dev_score
    
    return good_threshold, okay_threshold, bad_threshold


# Function to categorize and return results in JSON
def categorize_and_return_results(results, documents, good_threshold, okay_threshold, bad_threshold):
    categorized_results = {
        "green": [],
        "yellow": [],
        "red": []
    }
    
    for idx, result in enumerate(results.results):
        score = result.relevance_score
        category = ""
        if score >= good_threshold:
            category = "green"
        elif score >= okay_threshold:
            category = "yellow"
        else:
            category = "red"
        
        categorized_results[category].append(
            documents[result.index]["name"]
        )

    return json.dumps(categorized_results, indent=4)


# Function that combines the steps into one callable process
def process_candidates(query):
    # Format candidates for embedding
    people_db = get_all_people()

    candidates = [
        f"Skills: {', '.join(person['skills'])}. Tags: {', '.join(person['tags'])}. Background: {person['background']}."
        for person in people_db
    ]

    # Extract query details using Cohere
    extracted_prompt = extract_cohere(query)

    # Rerank using Cohere
    yaml_docs = [yaml.dump(doc, sort_keys=False) for doc in people_db]
    results = co.rerank(
        model="rerank-v3.5",
        query=query,
        documents=yaml_docs,
        top_n=len(people_db),
    )

    # Get dynamic thresholds
    good_threshold, okay_threshold, bad_threshold = dynamic_thresholds(results)

    # Get and return the categorized results in JSON format
    return categorize_and_return_results(results, people_db, good_threshold, okay_threshold, bad_threshold)