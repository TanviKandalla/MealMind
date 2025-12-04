import { useState } from 'react';
// These imports assume your UI components are located in src/components/ui/
// relative to this component. Adjust if your structure is different.
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
// Removed Textarea import to avoid "Module not found" errors
import { Sparkles, Loader2, ChefHat } from 'lucide-react';
import type { PantryItem, Recipe } from '../App';

type RecipeGeneratorProps = {
  pantryItems: PantryItem[];
};

// ------------------------------------------------------------------
// 🔑 PASTE YOUR GEMINI API KEY HERE
// ------------------------------------------------------------------
const GEMINI_API_KEY = "AIzaSyDUhmtdLbWMl3I6BJOiAbkmWdvHE78mKD4"; // Example: "AIzaSy..."

export function RecipeGenerator({ pantryItems }: RecipeGeneratorProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Filters
  const [costFilter, setCostFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [userPreferences, setUserPreferences] = useState<string>(''); 

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter out ghost items
  const validPantryItems = pantryItems.filter(item => item.name && item.name.trim() !== '');

  const handleWhatCanIMake = () => {
    if (!GEMINI_API_KEY) {
        alert("Please add your Gemini API Key in src/components/RecipeGenerator.tsx to use this feature!");
        return;
    }
    setShowFilterDialog(true);
  };

  const handleGenerateRecipes = async () => {
    setShowFilterDialog(false);
    setIsGenerating(true);
    setError(null);
    setGeneratedRecipes([]);

    // 1. Construct the Prompt
    const ingredientsList = validPantryItems.map(i => `${i.quantity} ${i.name}`).join(', ');
    
    // We add the user's custom request to the prompt
    const prompt = `
      You are a professional chef. I have these items in my pantry: ${ingredientsList}.
      
      Please create 3 distinct recipes I can make using primarily these ingredients. 
      You can assume I have basic staples like oil, salt, pepper, and water.
      
      Constraints:
      - Cost: ${costFilter} (if 'all', decide reasonably)
      - Time: ${timeFilter} (if 'all', decide reasonably)
      - Skill Level: ${skillFilter} (if 'all', decide reasonably)
      
      USER SPECIAL REQUEST: "${userPreferences}" 
      (Please try to respect this request (e.g. "spicy", "vegan", "soup") if possible using the ingredients provided).

      IMPORTANT: Respond ONLY with a valid JSON array. Do not include markdown formatting like \`\`\`json. 
      Each object in the array must have these fields:
      - name (string)
      - cost (string: 'low', 'medium', or 'high')
      - time (number: minutes)
      - skillLevel (string: 'beginner', 'intermediate', or 'advanced')
      - ingredients (array of strings, include quantities)
      - instructions (string: full cooking steps)
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);
      
      const aiText = data.candidates[0].content.parts[0].text;
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const recipes: Recipe[] = JSON.parse(cleanJson);
      
      const recipesWithIds = recipes.map((r, index) => ({
        ...r,
        id: `ai-gen-${Date.now()}-${index}`,
        skillLevel: r.skillLevel.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
        cost: r.cost.toLowerCase() as 'low' | 'medium' | 'high'
      }));

      setGeneratedRecipes(recipesWithIds);

    } catch (err: any) {
      console.error("AI Error:", err);
      setError("Failed to generate recipes. Please try again or check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-gray-900 mb-4 text-3xl font-bold flex items-center justify-center gap-3">
            <Sparkles className="text-orange-500" /> 
            AI Recipe Generator
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Let Gemini AI analyze your {validPantryItems.length} pantry items and invent a meal for you.
        </p>
        
        {!isGenerating && generatedRecipes.length === 0 && (
            <Button
            onClick={handleWhatCanIMake}
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
            >
            <ChefHat className="mr-2 h-6 w-6" />
            Invent a Recipe for Me
            </Button>
        )}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Consulting the AI Chef...</h2>
            <p className="text-gray-500">Analyzing your ingredients and your specific requests...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8 border border-red-200">
            <p>{error}</p>
            <Button variant="outline" onClick={() => setError(null)} className="mt-2">Try Again</Button>
        </div>
      )}

      {/* Results Section */}
      {generatedRecipes.length > 0 && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chef Gemini Recommends:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="hover:shadow-lg transition-all border-orange-100">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">{recipe.cost}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{recipe.time} min</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">{recipe.skillLevel}</span>
                                </div>

                                <div className="mb-4">
                                    <p className="font-semibold text-sm text-gray-700 mb-1">Ingredients Used:</p>
                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {recipe.ingredients.join(', ')}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm text-gray-700 mb-1">Instructions:</p>
                                    <p className="text-gray-600 text-sm line-clamp-4">
                                        {recipe.instructions}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="text-center mt-12">
                <Button variant="outline" onClick={handleWhatCanIMake}>Generate Different Recipes</Button>
            </div>
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Your AI Chef</DialogTitle>
            <DialogDescription>
              Tell the AI what kind of meal you are looking for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            
            {/* NEW FIELD: User Preferences */}
            <div>
                <Label htmlFor="preferences">What do you feel like eating?</Label>
                {/* Replaced <Textarea> with standard HTML <textarea> to avoid import errors */}
                <textarea 
                    id="preferences"
                    placeholder="e.g. 'Something spicy', 'No dairy', 'Soup weather', 'I want to use up the spinach'" 
                    value={userPreferences}
                    onChange={(e) => setUserPreferences(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <Label>Cost</Label>
                <Select value={costFilter} onValueChange={setCostFilter}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label>Time</Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="quick">Quick (30m)</SelectItem>
                    <SelectItem value="medium">Medium (60m)</SelectItem>
                    <SelectItem value="long">Slow Cook</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            
            <div>
              <Label>Skill Level</Label>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
              <Button onClick={handleGenerateRecipes} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recipes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}