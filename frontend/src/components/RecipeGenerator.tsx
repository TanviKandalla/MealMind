import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { PantryItem } from '../App';

type RecipeGeneratorProps = {
  pantryItems: PantryItem[];
};

export function RecipeGenerator({ pantryItems }: RecipeGeneratorProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [costFilter, setCostFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const handleWhatCanIMake = () => {
    setShowFilterDialog(true);
  };

  const handleGenerateRecipes = () => {
    // In a real app, this would filter recipes based on the selected filters
    console.log('Filters:', { costFilter, timeFilter, skillFilter });
    setShowFilterDialog(false);
    // Reset filters
    setCostFilter('all');
    setTimeFilter('all');
    setSkillFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-gray-900 mb-4">Recipe Generator</h1>
        <p className="text-gray-600 mb-8">
          Generate recipes based on what you have in your pantry
        </p>
        <Button
          onClick={handleWhatCanIMake}
          size="lg"
          className="px-8 py-6 text-lg"
        >
          What can I make now?
        </Button>
      </div>

      {/* Pantry Preview Section */}
      <div className="mt-16">
        <h2 className="text-gray-900 mb-6">Available Items in Your Pantry</h2>
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
              Select filters to narrow down the recipes based on your preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cost-filter">Cost</Label>
              <Select
                id="cost-filter"
                value={costFilter}
                onValueChange={setCostFilter}
                className="mt-2"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost range">
                    {costFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time-filter">Preparation Time</Label>
              <Select
                id="time-filter"
                value={timeFilter}
                onValueChange={setTimeFilter}
                className="mt-2"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time range">
                    {timeFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="quick">Quick (30 min or less)</SelectItem>
                  <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                  <SelectItem value="long">Long (60+ min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-filter">Skill Level</Label>
              <Select
                id="skill-filter"
                value={skillFilter}
                onValueChange={setSkillFilter}
                className="mt-2"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level">
                    {skillFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateRecipes}>
                Generate Recipes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}