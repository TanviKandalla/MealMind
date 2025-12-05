import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai.errors import APIError

app = Flask(__name__)
# Crucial for allowing your React app (on a different port) to talk to the Flask server
CORS(app) 

# --- SERVER-SIDE API LOGIC ---
try:
    # Client initializes using the GEMINI_API_KEY environment variable securely set on the server
    client = genai.Client()
    print("Backend: Gemini Client Initialized.")
except Exception as e:
    print(f"Backend Initialization Error: {e}")

@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe_endpoint():
    # Get the JSON data sent from the React frontend
    data = request.json
    if data is None:
        # If the data object is None, it means the client sent a bad JSON request.
        # Check Flask server logs for details about the bad request.
        return jsonify({"error": "Request body missing or invalid JSON format."}), 400

    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        # 1. Call the working Python API logic
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # 2. Return the text response as JSON
        return jsonify({"recipe": response.text})

    except APIError as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"error": f"Gemini API Error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {e}"}), 500

if __name__ == '__main__':
    # Run the server on a different port than your React app (e.g., 5000)
    app.run(port=5000, debug=True)