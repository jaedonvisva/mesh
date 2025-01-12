from flask import Flask, request, jsonify
from flask_cors import CORS
from usergen import User
from prompt import process_candidates
from resume_parse import parse_resume

import json

app = Flask(__name__)
CORS(app)


@app.route("/")
def generate():
    return "Hello World"
@app.route("/regestration", methods=["POST"])
def regestration():
    # Handle the uploaded PDF file
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files['resume']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
   

    # Process the file (parse_resume function processes the PDF file)
    try:
        resume_data = parse_resume(file)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    user = User(**resume_data)
    user.save()
    return jsonify({"message": "Registration successful", "data": resume_data})
@app.route("/prompt", methods=["POST"])
def prompt():
    data = request.json
    prompt = process_candidates(data.get("prompt"))
    return prompt




if __name__ == "__main__":
    app.run(debug=True)