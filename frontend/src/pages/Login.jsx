import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Activity, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const { token, user } = response.data;
      
      onLogin(token, user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // DEMO MODE: Auto-login if backend is unreachable
      if (!err.response || err.message.includes('Network Error')) {
        console.log('🎬 DEMO MODE: Using mock login');
        const mockToken = 'demo-token-' + Date.now();
        const mockUser = {
          id: '1',
          email: email,
          firstName: 'Alice',
          lastName: 'Johnson',
          role: 'nurse',
          department: 'ICU'
        };
        onLogin(mockToken, mockUser);
        navigate('/dashboard');
        return;
      }
      
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <Activity className="w-16 h-16 text-primary-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            MediFlow AI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Intelligent Hospital Coordination System
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="nurse@mediflow.ai"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>👩‍⚕️ alice.nurse@mediflow.ai / demo123</p>
              <p>👨‍⚕️ bob.nurse@mediflow.ai / demo123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
