import os
from google import genai
from google.genai.errors import APIError

# 1. SET UP YOUR API KEY
# For security, the best practice is to set your API key as an environment variable.
# On Linux/macOS: export GEMINI_API_KEY="YOUR_API_KEY"
# On Windows (Command Prompt): set GEMINI_API_KEY="YOUR_API_KEY"
# On Windows (PowerShell): $env:GEMINI_API_KEY="YOUR_API_KEY"
# 
# The genai.Client() constructor will automatically look for the 
# GEMINI_API_KEY variable.
# --------------------------------------------------------------------------
# ⚠️ If you absolutely must, you can uncomment and use this line, 
# but it is NOT recommended for production code:
# client = genai.Client(api_key="PASTE_YOUR_API_KEY_HERE")
# --------------------------------------------------------------------------

def test_gemini_api_call():
    """
    Tests the connection to the Gemini API by generating simple content.
    """
    try:
        # Initialize the client. It automatically uses the GEMINI_API_KEY 
        # environment variable if set, otherwise it will try to find it 
        # in other standard locations.
        client = genai.Client()

        print("Successfully initialized Gemini client.")
        
        # Define a simple prompt
        prompt = "What is the capital of France?"
        print(f"\nSending prompt: '{prompt}'")

        # Call the API
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        # Print the response text
        print("\n--- API Response ---")
        print(f"Status: Success (Response received)")
        print(f"Model Output:\n{response.text}")
        print("--------------------")

    except APIError as e:
        # This catches errors specific to the Google GenAI SDK, 
        # often related to an invalid key, insufficient permissions, 
        # or quota issues.
        print("\n--- ERROR ---")
        print(f"API Error Occurred: {e}")
        print("This usually means the API key is incorrect, expired, or the service is inaccessible.")
        print("-------------")
        
    except Exception as e:
        # This catches other potential errors, like the API key environment 
        # variable not being set if you didn't pass it directly.
        print("\n--- GENERAL ERROR ---")
        print(f"An unexpected error occurred: {e}")
        print("Ensure you have installed the correct library and set your API key.")
        print("---------------------")

if __name__ == "__main__":
    test_gemini_api_call()