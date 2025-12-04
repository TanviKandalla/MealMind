import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Search } from 'lucide-react';
import type { Recipe } from '../App';

type RecipeDiscoveryProps = {
  recipes: Recipe[];
};

export function RecipeDiscovery({ recipes = [] }: RecipeDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  const handleShowMore = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDialog(true);
  };

  // --- SAFETY LAYER: DEFENSIVE FILTERING ---
  const filteredRecipes = recipes.filter((recipe) => {
    // 1. If recipe is somehow null/undefined, skip it
    if (!recipe) return false;

    // 2. Safe access to name (defaults to empty string if missing)
    const name = recipe.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCost = costFilter === 'all' || recipe.cost === costFilter;
    
    // 3. Safe access to time (defaults to 0 if missing)
    const time = recipe.time || 0;
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'quick' && time <= 30) ||
      (timeFilter === 'medium' && time > 30 && time <= 60) ||
      (timeFilter === 'long' && time > 60);
      
    const matchesSkill = skillFilter === 'all' || recipe.skillLevel === skillFilter;

    return matchesSearch && matchesCost && matchesTime && matchesSkill;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-gray-900 mb-8">Recipe Discovery</h1>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cost-filter">Cost</Label>
            <Select value={costFilter} onValueChange={setCostFilter}>
              <SelectTrigger id="cost-filter">
                <SelectValue placeholder="All costs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All costs</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time-filter">Time</Label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger id="time-filter">
                <SelectValue placeholder="All times" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All times</SelectItem>
                <SelectItem value="quick">Quick ({'<'} 30 min)</SelectItem>
                <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                <SelectItem value="long">Long ({'>'} 60 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skill-filter">Skill Level</Label>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger id="skill-filter">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="space-y-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <Card key={recipe.id || Math.random()}> {/* Fallback key if ID missing */}
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-2">{recipe.name || 'Untitled Recipe'}</h3>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Cost: {recipe.cost || 'N/A'}</span>
                      <span>Time: {recipe.time || 0} min</span>
                      <span>Skill: {recipe.skillLevel || 'N/A'}</span>
                    </div>
                    <p className="text-gray-700 mt-2">
                      {/* Safe Join: Checks if ingredients is an array before joining */}
                      Ingredients: {(recipe.ingredients || []).join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleShowMore(recipe)}
                  >
                    Show More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRecipe?.name || 'Recipe Details'}</DialogTitle>
            <DialogDescription>
              Full recipe information
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-gray-900 mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {/* Safe Map: Checks if ingredients is an array before mapping */}
                  {(selectedRecipe.ingredients || []).map((ingredient, index) => (
                    <li key={index} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Instructions</h3>
                <p className="text-gray-700">{selectedRecipe.instructions || 'No instructions provided.'}</p>
              </div>
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-600">Time: {selectedRecipe.time} min</span>
                <span className="text-gray-600">Skill: {selectedRecipe.skillLevel}</span>
                <span className="text-gray-600">Cost: {selectedRecipe.cost}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}