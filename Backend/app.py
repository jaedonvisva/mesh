from flask import Flask, request, jsonify
from flask_cors import CORS
from usergen import User
from prompt import process_candidates
from resume_parse import parse_resume
import re
import requests

app = Flask(__name__)
CORS(app)

def sanitize_filename(filename):
    # Remove invalid characters and return a safe filename
    return re.sub(r'[<>:"/\\|?*]', '', filename)

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

@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['resume']
    #auth0_id = request.form.get('auth0_id')

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file:
        # Use the Auth0 ID as the filename, sanitize it to remove invalid characters
        #sanitized_id = sanitize_filename(auth0_id)

        # Call the /regestration endpoint and send the file without saving
        try:
            response = requests.post(
                "http://127.0.0.1:5000/regestration",
                files={'resume': (file.filename, file.stream, file.content_type)}
            )
            # Return the response from /regestration
            return jsonify(response.json()), response.status_code
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
