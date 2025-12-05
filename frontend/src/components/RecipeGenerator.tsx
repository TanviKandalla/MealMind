import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // Assuming you have this component
import ReactMarkdown from 'react-markdown'; // Library needed for displaying Markdown
import type { PantryItem } from '../App';
// NOTE: The generateRecipe import is no longer used, but kept for type reference
import { generateRecipe } from '../lib/gemini';

type RecipeGeneratorProps = {
  pantryItems: PantryItem[];
};

export function RecipeGenerator({ pantryItems }: RecipeGeneratorProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [costFilter, setCostFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [userNotes, setUserNotes] = useState<string>('');

  // State for AI Generation
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  const handleWhatCanIMake = () => {
    setGeneratedRecipe(null); // Clear previous recipe
    setShowFilterDialog(true);
  };

  const handleGenerateRecipes = async () => {
    setShowFilterDialog(false);
    setIsLoading(true);

    // 1. COLLECT INGREDIENT LIST FROM PROPS
    const ingredientsList = pantryItems
    .map(item => `${item.quantity} of ${item.name}`)
    .join(', ');

    // 2. CONSTRUCT THE DYNAMIC PROMPT USING STATE VARIABLES
    const prompt = `
      You are an expert chef and recipe generator. Create one detailed recipe based on the following:

      Available Ingredients: ${ingredientsList || 'None listed. Suggest a recipe with common items.'}
      Cost Preference: ${costFilter}
      Time Preference: ${timeFilter}
      Skill Level: ${skillFilter}
      
      Additional Notes/Dietary Restrictions: ${userNotes || 'N/A'}

      The recipe must include:
      1. A creative recipe title.
      2. A short description.
      3. A clear list of ingredients (with required amounts).
      4. Step-by-step instructions. (These MUST be in paragraph format, comma-separated. Do not use bullet points.)
      
      Please present the output in **Markdown format** for easy reading.
      Ensure that the output is extremely short. Keep it under 20 lines of text.
    `;

    try {
      const backendUrl = 'http://localhost:5000/api/generate-recipe'; // <-- MATCH PYTHON PORT

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt}), // Sending the dynamic prompt
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Use the recipe returned from the Python server
      setGeneratedRecipe(data.recipe);

    } catch (error) {
      console.error('Error fetching recipe from backend:', error);
      setGeneratedRecipe("Failed to load recipe. Check if the Python backend server is running.");
    }

    setIsLoading(false);
    setShowRecipeDialog(true);
    // Reset filters and notes
    setCostFilter('all');
    setTimeFilter('all');
    setSkillFilter('all');
    setUserNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-gray-900 mb-4">🍽️ Recipe Generator</h1>
        <p className="text-gray-600 mb-8">
          Generate recipes based on what you have in your pantry
        </p>
        <Button
          onClick={handleWhatCanIMake}
          size="lg"
          className="px-8 py-6 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'The AI Chef is Cooking...' : 'What can I make now?'}
        </Button>
      </div>

      {/* Pantry Preview Section (showing items from App.tsx) */}
      <div className="mt-16">
        <h2 className="text-gray-900 mb-6">Available Items in Your Pantry</h2>
        {/* ... (Pantry Item Card rendering remains the same) ... */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pantryItems.length > 0 ? (
            pantryItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <p className="text-gray-900">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.quantity}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No items in your pantry yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Recipes</DialogTitle>
            <DialogDescription>
              Select filters and notes to narrow down the recipes based on your preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Cost, Time, Skill Selects */}
            {/* ... (omitted for brevity, but they use state: costFilter, timeFilter, skillFilter) ... */}
            <div><Label htmlFor="cost-filter">Cost</Label><Select id="cost-filter" value={costFilter} onValueChange={setCostFilter} className="mt-2"><SelectTrigger><SelectValue placeholder="Select cost range">{costFilter}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="time-filter">Preparation Time</Label><Select id="time-filter" value={timeFilter} onValueChange={setTimeFilter} className="mt-2"><SelectTrigger><SelectValue placeholder="Select time range">{timeFilter}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="quick">Quick (30 min or less)</SelectItem><SelectItem value="medium">Medium (30-60 min)</SelectItem><SelectItem value="long">Long (60+ min)</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="skill-filter">Skill Level</Label><Select id="skill-filter" value={skillFilter} onValueChange={setTimeFilter} className="mt-2"><SelectTrigger><SelectValue placeholder="Select skill level">{skillFilter}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>

            {/* Additional Notes Textarea (using id="notes-filter" for the Label fix) */}
            <div>
              <Label htmlFor="notes-filter">Additional Notes (e.g., dietary restrictions, flavor profile)</Label>
              <Textarea
                id="notes-filter" // <--- Important: Matches Label htmlFor
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g., Must be gluten-free, or needs to be a spicy dish."
                className="mt-2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleGenerateRecipes} disabled={isLoading}>
                Generate Recipes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Result Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        {/*
          CRITICAL CLASSES:
          1. max-w-xl: Sets a maximum width.
          2. h-[80vh]: Sets the dialog to a fixed height (80% of viewport height).
          3. flex flex-col: Makes the content children stack vertically and allows flex-grow to work.
        */}
        <DialogContent className="max-w-xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>🎉 Your AI-Generated Recipe!</DialogTitle>
            <DialogDescription>
              Here is the recipe created for you based on your ingredients and preferences.
            </DialogDescription>
          </DialogHeader>

          {/*
            SCROLLABLE CONTENT AREA:
            1. flex-grow: Takes up all available vertical space in the flex column (the 80vh dialog).
            2. overflow-y-auto: Enables vertical scrolling when content exceeds the allotted height.
          */}
          <div className="flex-grow overflow-y-auto p-4 border rounded-md bg-gray-50">
            {generatedRecipe ? (
                <>
                  {/* Cleaned up console.log to be a valid expression followed by ReactMarkdown */}
                  {console.log("DEBUG: Generated Recipe Content (Length:", generatedRecipe.length, "):", generatedRecipe)}
                  <ReactMarkdown>
                    {generatedRecipe}
                  </ReactMarkdown>
                </>
            ) : (
                <p className="text-gray-500">No recipe generated yet. Try again!</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowRecipeDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}