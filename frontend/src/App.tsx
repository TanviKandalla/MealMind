import { useState } from 'react';
import { Home } from './components/Home';
import { RecipeDiscovery } from './components/RecipeDiscovery';
import { SmartPantry } from './components/SmartPantry';
import { RecipeGenerator } from './components/RecipeGenerator';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';

export type PantryItem = {
  id: string;
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  name: string;
  cost: 'low' | 'medium' | 'high';
  time: number; // in minutes
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  ingredients: string[];
  instructions: string;
};

export type MealPlan = {
  id: string;
  day: string;
  recipe: Recipe;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'discovery' | 'pantry' | 'generator'>('home');
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    { id: '1', name: 'Chicken Breast', quantity: '2 lbs' },
    { id: '2', name: 'Rice', quantity: '1 bag' },
    { id: '3', name: 'Tomatoes', quantity: '5' },
    { id: '4', name: 'Onions', quantity: '3' },
    { id: '5', name: 'Garlic', quantity: '1 bulb' },
    { id: '6', name: 'Olive Oil', quantity: '1 bottle' },
    { id: '7', name: 'Pasta', quantity: '2 boxes' },
    { id: '8', name: 'Eggs', quantity: '12' },
  ]);

  const [recipes] = useState<Recipe[]>([
    {
      id: '1',
      name: 'Chicken Stir Fry',
      cost: 'medium',
      time: 30,
      skillLevel: 'beginner',
      ingredients: ['Chicken Breast', 'Rice', 'Onions', 'Garlic'],
      instructions: 'Cook chicken, add vegetables, serve with rice.',
    },
    {
      id: '2',
      name: 'Pasta Primavera',
      cost: 'low',
      time: 25,
      skillLevel: 'beginner',
      ingredients: ['Pasta', 'Tomatoes', 'Garlic', 'Olive Oil'],
      instructions: 'Boil pasta, sauté vegetables, combine.',
    },
    {
      id: '3',
      name: 'Spanish Tortilla',
      cost: 'low',
      time: 45,
      skillLevel: 'intermediate',
      ingredients: ['Eggs', 'Onions', 'Olive Oil'],
      instructions: 'Cook onions, add eggs, flip carefully.',
    },
    {
      id: '4',
      name: 'Tomato Rice',
      cost: 'low',
      time: 35,
      skillLevel: 'beginner',
      ingredients: ['Rice', 'Tomatoes', 'Onions', 'Garlic'],
      instructions: 'Sauté aromatics, add rice and tomatoes, cook until done.',
    },
    {
      id: '5',
      name: 'Garlic Chicken',
      cost: 'medium',
      time: 40,
      skillLevel: 'intermediate',
      ingredients: ['Chicken Breast', 'Garlic', 'Olive Oil'],
      instructions: 'Season chicken, cook with garlic, serve hot.',
    },
  ]);

  const [mealPlan] = useState<MealPlan[]>([
    { id: '1', day: 'Monday', recipe: recipes[0] },
    { id: '2', day: 'Tuesday', recipe: recipes[1] },
    { id: '3', day: 'Wednesday', recipe: recipes[2] },
    { id: '4', day: 'Thursday', recipe: recipes[3] },
    { id: '5', day: 'Friday', recipe: recipes[4] },
    { id: '6', day: 'Saturday', recipe: recipes[0] },
    { id: '7', day: 'Sunday', recipe: recipes[1] },
  ]);

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    setPantryItems([...pantryItems, newItem]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  currentPage === 'home'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('discovery')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  currentPage === 'discovery'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Recipe Discovery
              </button>
              <button
                onClick={() => setCurrentPage('pantry')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  currentPage === 'pantry'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Smart Pantry
              </button>
              <button
                onClick={() => setCurrentPage('generator')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  currentPage === 'generator'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Recipe Generator
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Label htmlFor="mode-toggle" className="text-sm text-gray-700">
                {isStructuredMode ? 'Structured' : 'Flexible'}
              </Label>
              <Switch
                id="mode-toggle"
                checked={isStructuredMode}
                onCheckedChange={setIsStructuredMode}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === 'home' && (
          <Home
            pantryItems={pantryItems}
            isStructuredMode={isStructuredMode}
            mealPlan={mealPlan}
            onNavigateToPantry={() => setCurrentPage('pantry')}
          />
        )}
        {currentPage === 'discovery' && <RecipeDiscovery recipes={recipes} />}
        {currentPage === 'pantry' && (
          <SmartPantry pantryItems={pantryItems} onAddItem={addPantryItem} />
        )}
        {currentPage === 'generator' && <RecipeGenerator pantryItems={pantryItems} />}
      </main>
    </div>
  );
}
