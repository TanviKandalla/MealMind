import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ChefHat, Sparkles, Clock, DollarSign } from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ChefHat className="size-8 text-orange-600" />
            <span className="text-gray-900 text-xl">RecipeAI</span>
          </div>
          <Button variant="ghost" onClick={onLogin}>
            Log In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-gray-900 mb-6">
          Stop asking "What's for dinner?"
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your pantry knows more than you think. Turn random ingredients into restaurant-worthy meals.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" onClick={onGetStarted} className="px-8 py-6 text-lg">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" onClick={onLogin} className="px-8 py-6 text-lg">
            Log In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center size-16 bg-orange-100 rounded-full mb-4">
                <Sparkles className="size-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-3">Zero food waste, infinite possibilities</h3>
              <p className="text-gray-600">
                AI-powered recipe generation that adapts to what you already have. No more sad wilted vegetables.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center size-16 bg-orange-100 rounded-full mb-4">
                <Clock className="size-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-3">From chaos to meal plan in seconds</h3>
              <p className="text-gray-600">
                Switch to structured mode and get a full week planned. Because decision fatigue is real.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center size-16 bg-orange-100 rounded-full mb-4">
                <DollarSign className="size-8 text-orange-600" />
              </div>
              <h3 className="text-gray-900 mb-3">Your budget, your rules</h3>
              <p className="text-gray-600">
                Filter by cost, time, and skill level. Gourmet on a ramen budget? We got you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-gray-900 text-center mb-12">How it works</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 size-10 bg-orange-600 text-white rounded-full flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Track your pantry</h3>
                <p className="text-gray-600">
                  Add ingredients as you buy them. We'll remember so you don't have to.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 size-10 bg-orange-600 text-white rounded-full flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Set your vibe</h3>
                <p className="text-gray-600">
                  Quick weeknight dinner? Fancy date night? Hangover cure? Just tell us.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 size-10 bg-orange-600 text-white rounded-full flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Cook with confidence</h3>
                <p className="text-gray-600">
                  Get personalized recipes with step-by-step instructions. Gordon Ramsay not included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-gray-900 mb-6">Ready to cook smarter?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of home cooks who've escaped the dinner rut.
        </p>
        <Button size="lg" onClick={onGetStarted} className="px-8 py-6 text-lg">
          Start Cooking Better Today
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 RecipeAI. Because life's too short for boring meals.</p>
        </div>
      </footer>
    </div>
  );
}
