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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile name
      await updateProfile(user, {
        displayName: name,
      });

      // Store extra user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      alert("Account created! Welcome 🎉");
      onSignUp(); // navigate forward
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="size-10 text-orange-600" />
            <span className="text-gray-900 text-2xl">MealMind</span>
          </div>
          <h1 className="text-gray-900 mb-2">Start your journey</h1>
          <p className="text-gray-600">Better meals are just a sign-up away</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

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

