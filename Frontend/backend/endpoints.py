from flask import Flask, request, jsonify, render_template
import cohere
from flask_cors import CORS
from PyPDF2 import PdfReader
import json
from datetime import datetime
import logging
from typing import Dict, List
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# ----------------------------------------------------------------------
# 1. Configuration & Setup
# ----------------------------------------------------------------------
# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

if not COHERE_API_KEY:
    logger.error("Cohere API Key not found. Please set COHERE_API_KEY in .env file.")
    exit(1)

if not MONGODB_CONNECTION_STRING:
    logger.error("MongoDB connection string not found. Please set MONGODB_CONNECTION_STRING in .env file.")
    exit(1)

# ----------------------------------------------------------------------
# 2. MongoDB Setup
# ----------------------------------------------------------------------
try:
    client = MongoClient(MONGODB_CONNECTION_STRING)
    db = client["Mesh"]  # Replace 'Mesh' with your database name if different
    users_collection = db["users"]  # Replace 'users' with your collection name
    logger.info("Connected to MongoDB successfully.")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    exit(1)

# ----------------------------------------------------------------------
# 3. Cohere Setup
# ----------------------------------------------------------------------
try:
    co = cohere.Client(COHERE_API_KEY)
    logger.info("Cohere client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Cohere client: {str(e)}")
    exit(1)

# ----------------------------------------------------------------------
# 4. Helper Functions
# ----------------------------------------------------------------------
def get_all_people() -> List[Dict]:
    """Return all users from MongoDB"""
    try:
        users_cursor = users_collection.find()
        users = []
        for user in users_cursor:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string for JSON serialization
            users.append(user)
        return users
    except Exception as e:
        logger.error(f"Failed to fetch users from MongoDB: {str(e)}")
        return []

def format_database_context() -> str:
    """Format mock data for Cohere prompt"""
    people = get_all_people()
    context = ""
    for person in people:
        context += f"""
Name: {person['name']}
Skills: {', '.join(person['skills'])}
Background: {person['background']}
Tags: {', '.join(person['tags'])}

"""
    return context

def search_people(query: str) -> Dict:
    """Search users using Cohere"""
    try:
        people = get_all_people()
        if not people:
            logger.warning("No users found in the database.")
            return {"error": "No users found in the database."}

        context = format_database_context()
        prompt = f"""
Based on the following database of people, find matches for this search query: "{query}"

Rate each person as:
- Perfect match (GREEN): Keywords appear in their tags, skills, or background
- Partial match (YELLOW): Has related/transferable skills
- No match (RED): No relevant skills or experience

Return response as valid JSON with this format:
{{
    "green": ["name1", "name2"],
    "yellow": ["name3", "name4"], 
    "red": ["name5", "name6"]
}}

Database entries:
{context}
"""
        logger.info("Sending prompt to Cohere for search.")
        response = co.generate(
            model='command',
            prompt=prompt,
            max_tokens=500,
            temperature=0.3,
            stop_sequences=['}'],
            return_likelihoods='NONE'
        )
        result = response.generations[0].text.strip()

        # Log the raw response from Cohere
        logger.info(f"Cohere response: {result}")

        # Ensure the JSON is properly closed
        if not result.endswith("}"):
            result += "}"
        parsed_result = json.loads(result)
        logger.info("Search parsed successfully.")
        return parsed_result
    except json.JSONDecodeError as jde:
        logger.error(f"JSON decoding failed: {str(jde)}")
        logger.error(f"Raw Cohere response: {result}")
        return {"error": "Invalid JSON response from Cohere."}
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        return {"error": str(e)}

def parse_resume(file) -> Dict:
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
        logger.info("Sending prompt to Cohere for resume parsing.")
        response = co.generate(
            model='command-r-08-2024',  # Ensure this model name is correct
            prompt=prompt,
            max_tokens=2000,
            temperature=0.3,
            stop_sequences=['}'],
            return_likelihoods='NONE'
        )

        result = response.generations[0].text.strip()
        # Clean the response if necessary
        result = result.replace("```json", "").replace("```", "")
        logger.info(f"Cohere response for resume parsing: {result}")
        if not result.endswith("}"):
            result += "}"
        parsed_result = json.loads(result)
        logger.info("Resume parsing successful.")
        return parsed_result

    except json.JSONDecodeError as jde:
        logger.error(f"JSON decoding failed during resume parsing: {str(jde)}")
        logger.error(f"Raw Cohere response: {result}")
        return {"error": "Invalid JSON response from Cohere during resume parsing."}
    except Exception as e:
        logger.error(f"Resume parsing failed: {str(e)}")
        return {"error": str(e)}

def extract_text_from_pdf(file) -> str:
    """Extract text content from PDF file"""
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise Exception(f"PDF extraction failed: {str(e)}")

# ----------------------------------------------------------------------
# 5. Routes
# ----------------------------------------------------------------------
@app.route("/")
def index():
    """Serve the index HTML"""
    return render_template("index.html")

@app.route("/api/search", methods=["POST"])
def api_search():
    """Search endpoint"""
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Query required"}), 400

        query = data["query"].strip()
        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        result = search_people(query)
        return jsonify({"results": result}), 200
    except Exception as e:
        logger.error(f"api_search failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/parse-resume", methods=["POST"])
def api_parse_resume():
    """Resume parsing endpoint"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files allowed"}), 400

        result = parse_resume(file)
        return jsonify({"parsed_data": result}), 200
    except Exception as e:
        logger.error(f"api_parse_resume failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    try:
        users_count = users_collection.count_documents({})
    except Exception as e:
        logger.error(f"Failed to count users in MongoDB: {str(e)}")
        users_count = "Unavailable"

    return jsonify({
        "status": "healthy",
        "mode": "mongodb",
        "users_count": users_count,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route("/api/get_users", methods=["GET"])
def get_users():
    """Endpoint to get all users"""
    try:
        users = get_all_people()
        return jsonify({"users": users}), 200
    except Exception as e:
        logger.error(f"api_get_users failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------------------------
# 6. Main Entry Point
# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("Starting server on port 5000...")
    try:
        users_count = users_collection.count_documents({})
        print(f"Connected to MongoDB with {users_count} users.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
    app.run(debug=True, port=5000)
