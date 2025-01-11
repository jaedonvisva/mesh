from flask import Flask, request, jsonify
from flask_cors import CORS
from usergen import User
from prompt import get_llm_response
app = Flask(__name__)
CORS(app)


@app.route("/")
def generate():
    return "Hello World"
@app.route("/regestration", methods=["POST"])
def regestration():
    data = request.json
    user = User(**data)
    user.save()
    return jsonify({"message": "User generated successfully"})
@app.route("/prompt", methods=["POST"])
def prompt():
    data = request.json
    prompt = get_llm_response(data.get("prompt"))
    return prompt




if __name__ == "__main__":
    app.run(debug=True)