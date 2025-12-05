import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChefHat } from 'lucide-react';

import { auth, db } from '../firebase'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore'; 

type SignUpProps = {
  onSignUp: () => void;         
  onBackToLanding: () => void;
  onSwitchToLogin: () => void;  
};

export function SignUp({ onSignUp, onBackToLanding, onSwitchToLogin }: SignUpProps) {
  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for user sign-up, performing three steps:
   * 1. Create user in Firebase Authentication.
   * 2. Update the Auth profile with the display name.
   * 3. Create a corresponding user document in Firestore.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Update Firebase Auth profile with the display name
      await updateProfile(user, {
        displayName: name,
      });

      // Step 3: Store base user data in Firestore under the 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
        // Note: Additional data like profile settings, etc., would be added here or in a separate step
      });

      alert("Account created! Welcome 🎉");
      onSignUp(); // Navigate user to the main application screen
    } catch (err: any) {
      // Display error message from Firebase
      alert(err.message);
    } finally {
      // Ensure loading is set to false regardless of success or failure
      setLoading(false);
    }
  };

  return (
    // Centered container with background gradient
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Header/Branding Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="size-10 text-orange-600" />
            <span className="text-gray-900 text-2xl">MealMind</span>
          </div>
          <h1 className="text-gray-900 mb-2">Start your journey</h1>
          <p className="text-gray-600">Better meals are just a sign-up away</p>
        </div>

        {/* Sign Up Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input Field */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="mt-2"
                />
              </div>
              {/* Email Input Field */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-2"
                />
              </div>
              {/* Password Input Field */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-2"
                />
              </div>
              {/* Submit Button: Disabled while 'loading' */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            {/* Navigation Links (Log In and Back to Home) */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-orange-600 hover:underline"
                >
                  Log in
                </button>
              </p>
              <button
                onClick={onBackToLanding}
                className="text-gray-600 text-sm hover:underline"
              >
                Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}