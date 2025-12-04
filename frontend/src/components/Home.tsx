import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import type { PantryItem, MealPlan } from '../App';

type HomeProps = {
  pantryItems: PantryItem[];
  isStructuredMode: boolean;
  mealPlan: MealPlan[];
  onNavigateToPantry: () => void;
};

export function Home({ pantryItems, isStructuredMode, mealPlan, onNavigateToPantry }: HomeProps) {
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

  const handleWhatCanIMake = () => {
    setShowFilterDialog(true);
  };

  const handleShowRecipe = (meal: MealPlan) => {
    setSelectedMeal(meal);
    setShowRecipeDialog(true);
  };

  const handleFindRecipes = () => {
    // In a real app, this would filter recipes based on the selected filters
    console.log('Filters:', { costFilter, timeFilter, skillFilter, additionalNotes });
    setShowFilterDialog(false);
    // Reset filters
    setCostFilter('all');
    setTimeFilter('all');
    setSkillFilter('all');
    setAdditionalNotes('');
  };

  const handleGenerateMealPlan = () => {
    // In a real app, this would generate a new meal plan based on the selected filters
    console.log('Meal Plan Filters:', { budget: mealPlanBudget, time: mealPlanTime, skill: mealPlanSkill });
    setShowMealPlanDialog(false);
    // Reset filters
    setMealPlanBudget('all');
    setMealPlanTime('all');
    setMealPlanSkill('all');
  };

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
              <h2 className="text-gray-900 text-xl font-semibold">Your Meal Plan for the Week</h2>
              <Button onClick={() => setShowMealPlanDialog(true)}>
                Generate New Meal Plan
              </Button>
            </div>
            <div className="space-y-3">
              {mealPlan.map((meal) => (
                <Card key={meal.id}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-900 min-w-[100px] font-medium">{meal.day}</span>
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
              ))}
            </div>
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
                  <SelectItem value="all">Any</SelectItem>
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
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
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
              <Button onClick={handleFindRecipes} className="bg-orange-600 hover:bg-orange-700 text-white">
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
              <Button variant="outline" onClick={() => setShowMealPlanDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateMealPlan} className="bg-orange-600 hover:bg-orange-700 text-white">
                Generate Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}