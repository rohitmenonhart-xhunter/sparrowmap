import React, { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import bcryptjs from 'bcryptjs';

interface PlotterData {
  name: string;
  dob: string;
  email: string;
  phone: string;
  bio: string;
  password: string;
  created_at: string;
  isVerified: boolean;
}

export default function PlotterSignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session
  useEffect(() => {
    const plotterId = localStorage.getItem('plotterId');
    const plotterEmail = localStorage.getItem('plotterEmail');
    
    if (plotterId && plotterEmail) {
      navigate('/plotter');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Get all users
      const usersRef = ref(database, 'plotters');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};

      // Find user by email
      const entries = Object.entries(users);
      const userEntry = entries.find(entry => 
        (entry[1] as PlotterData).email === formData.email
      );

      if (!userEntry) {
        toast.error('Invalid email or password');
        return;
      }

      const [userId, userData] = userEntry;
      const user = userData as PlotterData;

      // Verify password
      const isPasswordValid = await bcryptjs.compare(formData.password, user.password);
      if (!isPasswordValid) {
        toast.error('Invalid email or password');
        return;
      }

      // Store user info in localStorage or context for session management
      localStorage.setItem('plotterId', userId);
      localStorage.setItem('plotterEmail', user.email);

      toast.success('Signed in successfully!');
      navigate('/plotter');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back, plotter!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/plotter-signup')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create new account
              </button>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 