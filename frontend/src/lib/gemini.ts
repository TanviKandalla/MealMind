// frontend/src/lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ WARNING: Hardcoding the API key is highly insecure. 
// It is exposed in the client-side code. Use a secure backend/serverless function
// or properly configure environment variables.
const GEMINI_API_KEY = "AIzaSyCaRAD5pJs15tovcHpnlKCFufzGw78RHPM"; 
// The check is now purely for logging since the key is hardcoded:
if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY environment variable is missing!");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generates a recipe using the Gemini model based on user inputs.
 * @param ingredients A list of pantry items.
 * @param filters The selected cost, time, and skill level.
 * @param notes Any additional user notes.
 * @returns The generated recipe as a string (which will likely be formatted in Markdown).
 */
export async function generateRecipe({ ingredients, filters, notes = '' }: {
    ingredients: { name: string, quantity: string }[];
    filters: { cost: string, time: string, skill: string };
    notes?: string;
  }) {
    const ingredientsList = ingredients.map(item => `${item.quantity} of ${item.name}`).join(', ');
  
    const prompt = `
      You are an expert chef and recipe generator. Create one detailed recipe based on the following:
  
      Available Ingredients: ${ingredientsList || 'None listed. Suggest a recipe with common items.'}
      Recipe Filters:
      - Cost: ${filters.cost}
      - Preparation Time: ${filters.time}
      - Skill Level: ${filters.skill}
      
      Additional Notes: ${notes || 'N/A'}
  
      The recipe must include:
      1. A creative recipe title.
      2. A short description.
      3. A clear list of ingredients (with required amounts).
      4. Step-by-step instructions.
      
      Please present the output in **Markdown format** for easy reading.
    `;
  
    try {
      const response = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent({
        // Correct Content structure for the prompt
        contents: [{ role: "user", parts: [{ text: prompt }] }], 
      });
      
      // Use type assertion to resolve TypeScript error on '.text'
      return (response as any).text; 
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Return a user-friendly error message if the API call fails
      return 'An error occurred while generating the recipe. Please check your network connection and API key.';
    }
}