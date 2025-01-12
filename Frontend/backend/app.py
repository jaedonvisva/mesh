from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re

app = Flask(__name__)

# Enable CORS for your frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Folder to store uploaded resumes
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the uploads folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Sanitize the filename by replacing invalid characters
def sanitize_filename(filename):
    return re.sub(r'[\\\\/:*?"<>|]', '_', filename)


# Route to handle resume uploads
@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['resume']
    auth0_id = request.form.get('auth0_id')

    if not auth0_id:
        return jsonify({"message": "Missing Auth0 ID"}), 400

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file:
        # Use the Auth0 ID as the filename, sanitize it to remove invalid characters
        sanitized_id = sanitize_filename(auth0_id)
        filename = f"{sanitized_id}.pdf"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Save the file and overwrite if it exists
        file.save(file_path)
        return jsonify({"message": "Resume uploaded successfully!", "file_path": file_path}), 200

if __name__ == "__main__":
    app.run(debug=True)
