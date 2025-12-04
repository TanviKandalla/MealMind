import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';

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
import { ChefHat, User as UserIcon, LogOut } from 'lucide-react';

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
  time: number;
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
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  
  // AUTH STATE
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // DATA STATE
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan] = useState<MealPlan[]>([]);

  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);

  // ---------------------------------------------------------
  // 1. FETCH DATA (RECIPES & PANTRY) ON LOAD
  // ---------------------------------------------------------
  // 1. AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup') {
            setCurrentPage('home');
        }
      } else {
        setPantryItems([]);
        setCurrentPage('landing');
      }
    });

    return () => unsubscribe();
  }, [currentPage]);

  // 2. FETCH DATA
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
            skillLevel: (data.skillLevel || "beginner").toLowerCase(),
            ingredients: cleanIngredients,
            instructions: cleanInstructions
          };
        }) as Recipe[];
        setRecipes(recipesList);

        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setPantryItems(userData.pantryItems || []);
            } else {
                setPantryItems([]);
            }
        }
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

    if (!authLoading) {
        fetchData();
    }
  }, [user, authLoading]);

  // 3. ADD ITEM
  const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
    if (!user) return;

    try {
      const newItem = { ...item, id: Date.now().toString() };
      const updatedList = [...pantryItems, newItem];
      const userDocRef = doc(db, "users", user.uid);
      
      await updateDoc(userDocRef, {
        pantryItems: updatedList
      });

      setPantryItems(updatedList);
    } catch (error) {
      console.error("Error adding pantry item:", error);
      try {
          const userDocRef = doc(db, "users", user!.uid);
          await setDoc(userDocRef, { pantryItems: [...pantryItems, { ...item, id: Date.now().toString() }] }, { merge: true });
      } catch (e) {
          alert("Failed to save item. Please try again.");
      }
    }
  };

  // 4. COOK & DEDUCT LOGIC
  const handleMakeRecipe = async (recipe: Recipe) => {
    console.log("Cooking:", recipe.name);
    let deductionCount = 0;

    const updatedPantry = pantryItems.map((pantryItem) => {
      const matchedIngredientString = recipe.ingredients.find(ingStr => 
        ingStr.toLowerCase().includes(pantryItem.name.toLowerCase())
      );

      if (matchedIngredientString) {
        const recipeQtyMatch = matchedIngredientString.match(/(\d+(\.\d+)?)/);
        const pantryQtyMatch = pantryItem.quantity.match(/(\d+(\.\d+)?)/);

        if (recipeQtyMatch && pantryQtyMatch) {
          const recipeQty = parseFloat(recipeQtyMatch[0]);
          const pantryQty = parseFloat(pantryQtyMatch[0]);

          let newQty = pantryQty - recipeQty;
          if (newQty < 0) newQty = 0;

          const newQuantityString = pantryItem.quantity.replace(pantryQtyMatch[0], newQty.toString());
          
          // Update Firebase if changed
          if (newQuantityString !== pantryItem.quantity) {
             deductionCount++;
          }
          
          return { ...pantryItem, quantity: newQuantityString };
        }
      }
      return pantryItem;
    });

    if (deductionCount > 0) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                pantryItems: updatedPantry
            });
            setPantryItems(updatedPantry);
            alert(`Success! Cooked ${recipe.name}. Updated quantities for ${deductionCount} ingredients.`);
        } catch (e) {
            console.error("Failed to update pantry DB:", e);
            alert("Error updating database.");
        }
    } else {
        alert(`Cooked ${recipe.name}! (No matching pantry items found to deduct).`);
    }
  };

  const handleSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  const handleSaveProfile = (profile: UserProfile) => { setUserProfile(profile); setCurrentPage('home'); };

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    if (currentPage === 'landing') return <LandingPage onGetStarted={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('login')} />;
    if (currentPage === 'login') return <Login onLogin={() => {}} onBackToLanding={() => setCurrentPage('landing')} onSwitchToSignUp={() => setCurrentPage('signup')} />;
    if (currentPage === 'signup') return <SignUp onSignUp={() => {}} onBackToLanding={() => setCurrentPage('landing')} onSwitchToLogin={() => setCurrentPage('login')} />;
    return <LandingPage onGetStarted={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('login')} />;
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
              {/* Only show the toggle on the Home page */}
              {currentPage === 'home' && (
                <div className="flex items-center space-x-3">
                  <Label htmlFor="mode-toggle" className="text-sm text-gray-700">{isStructuredMode ? 'Structured' : 'Flexible'}</Label>
                  <Switch id="mode-toggle" checked={isStructuredMode} onCheckedChange={setIsStructuredMode} />
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('profile')}><UserIcon className="size-4" /></Button>
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