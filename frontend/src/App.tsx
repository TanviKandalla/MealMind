import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { ProfileSettings, UserProfile } from './components/ProfileSettings';
import { Home } from './components/Home';
import { RecipeDiscovery } from './components/RecipeDiscovery';
import { SmartPantry } from './components/SmartPantry';
import { RecipeGenerator } from './components/RecipeGenerator';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { ChefHat, User, LogOut } from 'lucide-react';

export type PantryItem = {
  id: string;
  name: string;
  quantity: string;
};

export type ShoppingListItem = {
  id: string;
  name: string;
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
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'profile' | 'home' | 'discovery' | 'pantry' | 'generator'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  
  // State for data from Firebase
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan] = useState<MealPlan[]>([]); // Placeholder for now

  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);

  // ---------------------------------------------------------
  // 1. FETCH DATA (RECIPES & PANTRY) ON LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch & Clean Recipes
        const recipeSnapshot = await getDocs(collection(db, "Recipes"));
        const recipesList = recipeSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Clean Ingredients: Handle both strings and objects from DB
          let cleanIngredients: string[] = [];
          if (Array.isArray(data.ingredients)) {
            cleanIngredients = data.ingredients.map((ing: any) => {
              if (typeof ing === 'string') return ing; 
              // Combine parts: "2" + "cups" + "Rice"
              const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
              return parts.join(' '); 
            });
          }

          // Clean Instructions: Handle both string and array of steps
          let cleanInstructions = "No instructions provided.";
          if (data.instructions) {
            cleanInstructions = data.instructions;
          } else if (Array.isArray(data.steps)) {
            cleanInstructions = data.steps.join(' ');
          }

          // Smart Defaults for missing data
          const derivedTime = Number(data.time) || Math.floor(Math.random() * (90 - 15 + 1)) + 15;
          const costs = ['low', 'medium', 'high'];
          const derivedCost = data.cost || costs[Math.floor(Math.random() * costs.length)];
          const rawSkill = data.skillLevel || "beginner";

          return {
            id: doc.id,
            name: data.recipeName || data.name || "Untitled Recipe",
            cost: derivedCost,
            time: derivedTime,
            skillLevel: rawSkill.toLowerCase(), 
            ingredients: cleanIngredients,
            instructions: cleanInstructions
          };
        }) as Recipe[];
        setRecipes(recipesList);

        // B. Fetch Smart Pantry
        const pantrySnapshot = await getDocs(collection(db, "SmartPantry"));
        const pantryList = pantrySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PantryItem[];
        setPantryItems(pantryList);

        const shoppingListSnapshot = await getDocs(collection(db, "ShoppingList"));
        const shoppingList = shoppingListSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() // Assuming only 'name' is stored
        })) as ShoppingListItem[];
        setShoppingListItems(shoppingList);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ---------------------------------------------------------
  // 2. ADD ITEM TO DATABASE
  // ---------------------------------------------------------
  const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
    try {
      // 1. Write to Firestore
      const docRef = await addDoc(collection(db, "SmartPantry"), item);
      
      // 2. Update Local State
      const newItem = { ...item, id: docRef.id };
      setPantryItems([...pantryItems, newItem]);
    } catch (error) {
      console.error("Error adding pantry item:", error);
      alert("Failed to save item to database. Check console.");
    }
  };

  // ---------------------------------------------------------
  // 3. COOK & DEDUCT LOGIC
  // ---------------------------------------------------------
  const handleMakeRecipe = async (recipe: Recipe) => {
    console.log("Cooking:", recipe.name);
    let deductionCount = 0;

    // We use Promise.all to wait for all database updates to finish
    const updatedPantry = await Promise.all(pantryItems.map(async (pantryItem) => {
      
      // Check if recipe ingredients match pantry item name
      const matchedIngredientString = recipe.ingredients.find(ingStr => 
        ingStr.toLowerCase().includes(pantryItem.name.toLowerCase())
      );

      if (matchedIngredientString) {
        // Extract numbers (e.g. "2" from "2 lbs", "10" from "10 tomatoes")
        const recipeQtyMatch = matchedIngredientString.match(/(\d+(\.\d+)?)/);
        const pantryQtyMatch = pantryItem.quantity.match(/(\d+(\.\d+)?)/);

        if (recipeQtyMatch && pantryQtyMatch) {
          const recipeQty = parseFloat(recipeQtyMatch[0]);
          const pantryQty = parseFloat(pantryQtyMatch[0]);
          
          // Calculate new quantity
          let newQty = pantryQty - recipeQty;
          if (newQty < 0) newQty = 0;

          // Replace the old number string with the new number
          const newQuantityString = pantryItem.quantity.replace(pantryQtyMatch[0], newQty.toString());
          
          // Update Firebase if changed
          if (newQuantityString !== pantryItem.quantity) {
             try {
                const itemRef = doc(db, "SmartPantry", pantryItem.id);
                await updateDoc(itemRef, { quantity: newQuantityString });
                deductionCount++;
             } catch (e) {
                console.error("Failed to update pantry DB:", e);
             }
          }
          
          return { ...pantryItem, quantity: newQuantityString };
        }
      }
      return pantryItem;
    }));

    setPantryItems(updatedPantry);
    
    if (deductionCount > 0) {
        alert(`Success! Cooked ${recipe.name}. Updated quantities for ${deductionCount} ingredients in your pantry.`);
    } else {
        alert(`Cooked ${recipe.name}! (No matching pantry items found to deduct automatically).`);
    }
  };

  // ---------------------------------------------------------
  // NAVIGATION & AUTH
  // ---------------------------------------------------------
  const handleLogin = () => { setIsAuthenticated(true); setCurrentPage('home'); };
  const handleSignUp = () => { setIsAuthenticated(true); setCurrentPage('home'); };
  const handleSignOut = () => { setIsAuthenticated(false); setCurrentPage('landing'); };
  const handleSaveProfile = (profile: UserProfile) => { setUserProfile(profile); setCurrentPage('home'); };

  if (!isAuthenticated) {
    if (currentPage === 'landing') return <LandingPage onGetStarted={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('login')} />;
    if (currentPage === 'login') return <Login onLogin={handleLogin} onBackToLanding={() => setCurrentPage('landing')} onSwitchToSignUp={() => setCurrentPage('signup')} />;
    if (currentPage === 'signup') return <SignUp onSignUp={handleSignUp} onBackToLanding={() => setCurrentPage('landing')} onSwitchToLogin={() => setCurrentPage('login')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 mr-4">
                <ChefHat className="size-6 text-orange-600" />
                <span className="text-gray-900">MealMind</span>
              </div>
              <button onClick={() => setCurrentPage('home')} className={`inline-flex items-center px-1 pt-1 border-b-2 ${currentPage === 'home' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Home</button>
              <button onClick={() => setCurrentPage('discovery')} className={`inline-flex items-center px-1 pt-1 border-b-2 ${currentPage === 'discovery' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Recipe Discovery</button>
              <button onClick={() => setCurrentPage('pantry')} className={`inline-flex items-center px-1 pt-1 border-b-2 ${currentPage === 'pantry' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Smart Pantry</button>
              <button onClick={() => setCurrentPage('generator')} className={`inline-flex items-center px-1 pt-1 border-b-2 ${currentPage === 'generator' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Recipe Generator</button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Label htmlFor="mode-toggle" className="text-sm text-gray-700">{isStructuredMode ? 'Structured' : 'Flexible'}</Label>
                <Switch id="mode-toggle" checked={isStructuredMode} onCheckedChange={setIsStructuredMode} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('profile')}><User className="size-4" /></Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="size-4" /></Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {currentPage === 'profile' && <ProfileSettings profile={userProfile} onSave={handleSaveProfile} onBack={() => setCurrentPage('home')} />}
        {currentPage === 'home' && <Home pantryItems={pantryItems} isStructuredMode={isStructuredMode} mealPlan={mealPlan} onNavigateToPantry={() => setCurrentPage('pantry')} />}
        
        {/* Pass props to RecipeDiscovery: List of recipes AND the Cook Handler */}
        {currentPage === 'discovery' && <RecipeDiscovery recipes={recipes} onMakeRecipe={handleMakeRecipe} />}
        
        {/* Pass props to SmartPantry: List of pantry items AND the Add Handler */}
        {currentPage === 'pantry' && < SmartPantry pantryItems={pantryItems} onAddItem={addPantryItem} shoppingListItems={shoppingListItems}/>}
        
        {currentPage === 'generator' && <RecipeGenerator pantryItems={pantryItems} />}
      </main>
    </div>
  );
}