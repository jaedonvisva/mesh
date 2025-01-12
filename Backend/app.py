from flask import Flask, request, jsonify
from flask_cors import CORS
from usergen import User, collection
from prompt import process_candidates
from resume_parse import parse_resume
from bson import ObjectId
from new_user_cohere import generate_user_data

import json

app = Flask(__name__)
CORS(app)

from usergen import collection


@app.route("/")
def generate():
    return "Hello World"

@app.route("/manual_add", methods=["POST"])
def manual_add():
    data = request.json
    name = data.get('name')
    bio = data.get('bio')

    input = str(name) + ": " + str(bio)

    user_data = generate_user_data(input)

    user = User(**user_data)

    user.save()
    return jsonify({"message": "User added successfully", "data": user_data})


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

@app.route('/api/update-connection', methods=['POST'])
def update_connection():
    try:
        data = request.get_json()
        current_user_id = data.get('current_user_id')
        target_user_id = data.get('target_user_id')
        accept = data.get('accept')

        if not current_user_id or not target_user_id:
            return jsonify({'error': 'Both current_user_id and target_user_id are required'}), 400

        # If declined, just return success (no database update needed)
        if not accept:
            return jsonify({'message': 'User declined'}), 200

        try:
            # First, check if the connections field exists
            current_user = collection.find_one({'_id': ObjectId(current_user_id)})
            target_user = collection.find_one({'_id': ObjectId(target_user_id)})

            # Initialize connections if they don't exist
            if 'connections' not in current_user:
                collection.update_one(
                    {'_id': ObjectId(current_user_id)},
                    {'$set': {'connections': []}}
                )
            
            if 'connections' not in target_user:
                collection.update_one(
                    {'_id': ObjectId(target_user_id)},
                    {'$set': {'connections': []}}
                )

            # Now update the connections
            collection.update_one(
                {'_id': ObjectId(current_user_id)},
                {'$addToSet': {'connections': str(target_user_id)}}
            )

            collection.update_one(
                {'_id': ObjectId(target_user_id)},
                {'$addToSet': {'connections': str(current_user_id)}}
            )

            # Verify the update
            updated_user = collection.find_one({'_id': ObjectId(current_user_id)})
            print(f"Updated connections for user {current_user_id}: {updated_user.get('connections', [])}")

            return jsonify({'message': 'Connection updated successfully'}), 200

        except Exception as e:
            print(f"MongoDB operation error: {str(e)}")
            return jsonify({'error': f'Database operation failed: {str(e)}'}), 500

    except Exception as e:
        print(f"Error updating connection: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/get-users', methods=['POST'])
def get_users():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400

        current_user_id = data.get('current_user_id')
        connections = data.get('connections', [])

        if not current_user_id:
            return jsonify({'error': 'current_user_id is required'}), 400

        try:
            # Convert string IDs to ObjectId
            current_user_oid = ObjectId(current_user_id)
            connections_oids = [ObjectId(conn_id) for conn_id in connections]
        except Exception as e:
            return jsonify({'error': f'Invalid ObjectId format: {str(e)}'}), 400

        # Query to find users not in connections and not the current user
        query = {
            '_id': {'$nin': [current_user_oid] + connections_oids}
        }

        users = list(collection.find(query))

        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])

        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 400

@app.route('/api/current-user', methods=['GET'])
def get_current_user():
    try:
        current_user = collection.find_one()
        
        if not current_user:
            return jsonify({
                'error': 'No user found'
            }), 404
            
        # Convert ObjectId to string for JSON serialization
        current_user['_id'] = str(current_user['_id'])
        
        # Return the user directly without nested structure
        return jsonify({
            'user': current_user
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/reset-connections', methods=['POST'])
def reset_connections():
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        try:
            # Get current user's connections first
            current_user = collection.find_one({'_id': ObjectId(user_id)})
            if not current_user:
                return jsonify({'error': 'User not found'}), 404

            current_connections = current_user.get('connections', [])

            # Reset current user's connections
            collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'connections': []}}
            )

            for connection_id in current_connections:
                collection.update_one(
                    {'_id': ObjectId(connection_id)},
                    {'$pull': {'connections': user_id}}
                )

            print(f"Reset connections for user {user_id}")
            return jsonify({'message': 'Connections reset successfully'}), 200

        except Exception as e:
            print(f"MongoDB operation error: {str(e)}")
            return jsonify({'error': f'Database operation failed: {str(e)}'}), 500

    except Exception as e:
        print(f"Error resetting connections: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/all-users', methods=['GET'])
def all_users():
    try:
        users = list(collection.find())
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)