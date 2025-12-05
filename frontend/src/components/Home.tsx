import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import type { PantryItem, MealPlan } from '../App';

// Define the expected structure from the AI JSON response for a single day
type RawMealPlanDay = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
};

// Define the full plan structure expected from the AI
type RawMealPlanResponse = {
  plan: RawMealPlanDay[];
};

type HomeProps = {
  pantryItems: PantryItem[];
  isStructuredMode: boolean;
  mealPlan: MealPlan[];
  onNavigateToPantry: () => void;
  fetchRecipesByFilters: (filters: { costOfIngredients: string; timeTakenToCook: string; skillLevel: string; }) => Promise<string[]>;
};

export function Home({ pantryItems, isStructuredMode, mealPlan, onNavigateToPantry, fetchRecipesByFilters }: HomeProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [costFilter, setCostFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null);
  const [showMealPlanDialog, setShowMealPlanDialog] = useState(false);
  const [mealPlanBudget, setMealPlanBudget] = useState<string>('all');
  const [mealPlanTime, setMealPlanTime] = useState<string>('all');
  const [mealPlanSkill, setMealPlanSkill] = useState<string>('all');

  // NEW STATE: Loading indicator and raw response storage for meal plan
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);
  const [rawMealPlanResponse, setRawMealPlanResponse] = useState<string | null>(null);
  // State to hold the final parsed, structured meal plan for display
  const [generatedMealPlan, setGeneratedMealPlan] = useState<RawMealPlanDay[] | null>(null);

  const handleWhatCanIMake = () => {
    setShowFilterDialog(true);
  };

  const handleShowRecipe = (meal: MealPlan) => {
    setSelectedMeal(meal);
    setShowRecipeDialog(true);
  };

  // Renamed for clarity: handleFilterRecipes is used when filtering for single recipe generation
  const handleFilterRecipes = async () => {
    setShowFilterDialog(false);

    // NOTE: For the "What Can I Make Now?" path, you would typically
    // run the filters here and immediately generate a recipe using the result.
    // For now, we'll just log and reset filters.
    console.log('Filters:', { costFilter, timeFilter, skillFilter, additionalNotes });

    // Reset filters
    setCostFilter('all');
    setTimeFilter('all');
    setSkillFilter('all');
    setAdditionalNotes('');
  };

  const handleFilterAndGenerateMealPlan = async () => {
    setIsGeneratingMealPlan(true);
    setGeneratedMealPlan(null);
    setRawMealPlanResponse(null);
    setShowMealPlanDialog(false);

    // 1. FILTER AND FETCH RECIPE NAMES FROM FIREBASE
    const filters = {
      costOfIngredients: mealPlanBudget,
      timeTakenToCook: mealPlanTime,
      skillLevel: mealPlanSkill
    };

    let availableRecipeNames: string[] = [];
    try {
      console.log("Fetching recipes from Firebase with filters:", filters);
      // Execute the function passed from props
      availableRecipeNames = await fetchRecipesByFilters(filters);
      console.log("Successfully retrieved recipes:", availableRecipeNames.length);

      if (availableRecipeNames.length === 0) {
        alert("No recipes found matching your filters. Generating plan with all recipes/common suggestions.");
      }

    } catch (error) {
      console.error("Error retrieving recipes from Firebase:", error);
      alert("Error fetching recipes. Generating plan without recipe constraints.");
      // Fallback: If fetching fails, proceed with an empty list.
      availableRecipeNames = [];
    }

    // 2. GENERATE PLAN WITH THE FILTERED NAMES
    await handleGenerateMealPlan(availableRecipeNames);
  };

  const handleGenerateMealPlan = async (availableRecipeNames: string[]) => {
    setIsGeneratingMealPlan(true);
    setGeneratedMealPlan(null); // Clear previous plan
    setRawMealPlanResponse(null); // Clear previous debug response
    setShowMealPlanDialog(false); // Close the dialog immediately

    // 1. Collect Ingredients
    const ingredientsList = pantryItems
    .map(item => `${item.quantity} of ${item.name}`)
    .join(', ');

    // 2. Collect Available Recipe Names (Now passed as argument)
    const recipeNamesList = availableRecipeNames.join(', ');

    // 3. Construct the Dynamic Prompt
    const prompt = `
      You are an expert chef and meal planner. Generate a 5-day meal plan (Monday to Friday) based on the following:

      Available Ingredients (for reference): ${ingredientsList || 'None listed.'}
      Available Recipes in Database: [${recipeNamesList}]
      
      Instructions:
      1. For the meal plan, you **MUST ONLY** use recipe names found in the [${recipeNamesList}] list.
      2. If a recipe from the list is not suitable for a specific meal (e.g., a "Dinner" recipe for "Breakfast"), suggest a generic snack or simple item like "Toast and Jam" or "Quick Salad" if no appropriate recipe name is available for that slot.
      
      Budget Preference: ${mealPlanBudget}
      Time Preference: ${mealPlanTime}
      Skill Level: ${mealPlanSkill}
      
      The output MUST be a JSON object with the following structure:
            {
              "plan": [
                { "day": "Monday", "breakfast": "Recipe Name for Breakfast", "lunch": "Recipe Name for Lunch", "dinner": "Recipe Name for Dinner", "snack": "Snack Idea" },
                // ... Tuesday to Friday ...
              ]
            }
            Do not include any introductory or concluding text outside of the JSON block.
        `;

    try {
      // Assuming a new backend endpoint for meal plan generation (Using existing endpoint for demo)
      const backendUrl = 'http://localhost:5000/api/generate-recipe';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawTextResponse = data.recipe; // The key is 'recipe' from the Python response

      console.log('Successfully generated meal plan data:', rawTextResponse);

      // 3. PARSE AND STRUCTURE THE JSON RESPONSE
      try {
        // ✅ FIX 1: Use regex to find and isolate the JSON block.
        // This regex captures content starting from the first { and ending at the last }
        const jsonMatch = rawTextResponse.match(/\{[\s\S]*\}/);

        if (!jsonMatch || jsonMatch.length === 0) {
          throw new Error("Could not find a valid JSON object within the AI's response.");
        }

        const jsonString = jsonMatch[0]; // The captured JSON string

        const parsedData: RawMealPlanResponse = JSON.parse(jsonString);

        if (parsedData.plan && Array.isArray(parsedData.plan)) {
          setGeneratedMealPlan(parsedData.plan); // Set the structured plan for display
        } else {
          throw new Error("Invalid 'plan' array structure returned by the AI.");
        }
      } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", rawTextResponse, jsonError);
        // Display a more specific message about the parsing failure
        setRawMealPlanResponse(`AI output was received but failed to parse as JSON. Raw output starts: ${rawTextResponse.substring(0, 300)}...`);
        setGeneratedMealPlan(null);
      }

      // Set the raw response for debugging (even if parsing succeeded)
      setRawMealPlanResponse(rawTextResponse);


    } catch (error) {
      console.error('Error fetching meal plan from backend:', error);
      setRawMealPlanResponse(`Failed to fetch meal plan. Error: ${error instanceof Error ? error.message : String(error)}`);
      setGeneratedMealPlan(null);
    }

    setIsGeneratingMealPlan(false);

    // Reset filters
    setMealPlanBudget('all');
    setMealPlanTime('all');
    setMealPlanSkill('all');
  };

  // Determine which meal plan to display
  const currentPlan = generatedMealPlan || mealPlan;

  // Function to render a single meal card in the new structure
  const renderNewMealCard = (meal: RawMealPlanDay) => (
      <Card key={meal.day}>
        <CardContent className="flex flex-col p-4 space-y-2">
          <span className="text-gray-900 font-bold border-b pb-1 mb-2">{meal.day}</span>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-semibold text-orange-600">Breakfast:</span> {meal.breakfast}</p>
            <p><span className="font-semibold text-orange-600">Lunch:</span> {meal.lunch}</p>
            <p><span className="font-semibold text-orange-600">Dinner:</span> {meal.dinner}</p>
            <p><span className="font-semibold text-orange-600">Snack:</span> {meal.snack}</p>
          </div>
        </CardContent>
      </Card>
  );

  // The existing mealPlan prop uses a different structure, so we need a render function for it
  const renderOldMealCard = (meal: MealPlan) => (
      <Card key={meal.id}>
        <CardContent className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-900 min-w-[100px] font-medium">{meal.day}</span>
            {/* Displaying just the recipe name for brevity */}
            <span className="text-gray-700">{meal.recipe.name}</span>
          </div>
          <Button
              variant="outline"
              size="sm"
              onClick={() => handleShowRecipe(meal)}
          >
            Show Recipe
          </Button>
        </CardContent>
      </Card>
  );

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-gray-900 mb-6 text-3xl font-bold">Welcome to Your Recipe Assistant</h1>

          {!isStructuredMode ? (
              <Button
                  onClick={handleWhatCanIMake}
                  size="lg"
                  className="px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white"
              >
                What can I make now?
              </Button>
          ) : (
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-gray-900 text-xl font-semibold">
                    {generatedMealPlan ? 'AI-Generated Meal Plan' : 'Your Default Meal Plan'}
                  </h2>
                  <Button onClick={() => setShowMealPlanDialog(true)} disabled={isGeneratingMealPlan}>
                    {isGeneratingMealPlan ? 'Generating...' : 'Generate New Meal Plan'}
                  </Button>
                </div>
                <div className="space-y-3">
                  {/* Updated Display Logic */}
                  {generatedMealPlan ? (
                      // Render the new, detailed AI-generated plan
                      generatedMealPlan.map(renderNewMealCard)
                  ) : (
                      // Fallback to rendering the existing mealPlan prop
                      mealPlan.map(renderOldMealCard)
                  )}
                </div>

                {/* DEBUG OUTPUT: Show raw response only if the structured parsing failed */}
                {rawMealPlanResponse && !generatedMealPlan && (
                    <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded-md whitespace-pre-wrap text-xs text-red-700">
                      <h3 className="font-semibold mb-2">Error: Failed to Parse Structured Plan</h3>
                      <p>{rawMealPlanResponse}</p>
                    </div>
                )}
              </div>
          )}
        </div>

      {/* Pantry Preview Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gray-900 text-xl font-semibold">Current Pantry</h2>
          <Button variant="outline" onClick={onNavigateToPantry}>
            Show More
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pantryItems
            // FIX: Filter out empty "ghost" items before displaying
            .filter(item => item.name && item.name.trim() !== '')
            .slice(0, 8)
            .map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{item.quantity}</p>
                </CardContent>
              </Card>
          ))}
          {pantryItems.filter(item => item.name && item.name.trim() !== '').length === 0 && (
             <div className="col-span-full text-center py-8 bg-gray-50 border border-dashed rounded-lg">
                <p className="text-gray-500">Your pantry is empty.</p>
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
              Choose your preferences to find recipes that match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cost-filter">Cost</Label>
              <Select
                value={costFilter}
                onValueChange={setCostFilter}
              >
                <SelectTrigger id="cost-filter" className="mt-2">
                  <SelectValue placeholder="Any cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time-filter">Time</Label>
              <Select
                value={timeFilter}
                onValueChange={setTimeFilter}
              >
                <SelectTrigger id="time-filter" className="mt-2">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Any</SelectItem>
                  <SelectItem value="quick">Quick (30 min or less)</SelectItem>
                  <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                  <SelectItem value="long">Long (60+ min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-filter">Skill Level</Label>
              <Select
                value={skillFilter}
                onValueChange={setSkillFilter}
              >
                <SelectTrigger id="skill-filter" className="mt-2">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Any</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="additional-notes">Additional Notes</Label>
              <Textarea
                id="additional-notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="mt-2"
                placeholder="E.g., Italian cuisine, comfort food, vegan options, etc."
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleFilterRecipes} className="bg-orange-600 hover:bg-orange-700 text-white">
                Find Recipes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Detail Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMeal?.recipe.name}</DialogTitle>
            <DialogDescription>
              {selectedMeal?.day}'s meal
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-gray-900 mb-2 font-semibold">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedMeal.recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 mb-2 font-semibold">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMeal.recipe.instructions}</p>
              </div>
              <div className="flex space-x-4 text-sm border-t pt-4">
                <span className="text-gray-600">Time: {selectedMeal.recipe.time} min</span>
                <span className="text-gray-600">Skill: {selectedMeal.recipe.skillLevel}</span>
                <span className="text-gray-600">Cost: {selectedMeal.recipe.cost}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Generate Meal Plan Dialog */}
        <Dialog open={showMealPlanDialog} onOpenChange={setShowMealPlanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Meal Plan</DialogTitle>
              <DialogDescription>
                Set your preferences for the weekly meal plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* ... (Budget, Time, Skill Selects remain unchanged) ... */}
              <div>
                <Label htmlFor="budget-filter">Budget</Label>
                <Select
                    value={mealPlanBudget}
                    onValueChange={setMealPlanBudget}
                >
                  <SelectTrigger id="budget-filter" className="mt-2">
                    <SelectValue placeholder="Any budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time-to-cook-filter">Time to Cook</Label>
                <Select
                    value={mealPlanTime}
                    onValueChange={setMealPlanTime}
                >
                  <SelectTrigger id="time-to-cook-filter" className="mt-2">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="quick">Quick (30 min or less)</SelectItem>
                    <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                    <SelectItem value="long">Long (60+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skill-level-filter">Skill Level</Label>
                <Select
                    value={mealPlanSkill}
                    onValueChange={setMealPlanSkill}
                >
                  <SelectTrigger id="skill-level-filter" className="mt-2">
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowMealPlanDialog(false)} disabled={isGeneratingMealPlan}>
                  Cancel
                </Button>
                <Button
                    onClick={handleFilterAndGenerateMealPlan} // <-- UPDATED CALL
                    disabled={isGeneratingMealPlan}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isGeneratingMealPlan ? 'Filtering & Generating...' : 'Generate Plan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}