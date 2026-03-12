import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/overview');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-dark-900 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] animate-blob-bounce"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] animate-blob-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] animate-blob-bounce" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 glass p-10 relative z-10 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-violet-600 mb-6 shadow-lg shadow-primary-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create a tenant
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="pl-10 appearance-none bg-white/50 backdrop-blur-sm rounded-xl relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm shadow-sm hover:border-primary-300"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 appearance-none bg-white/50 backdrop-blur-sm rounded-xl relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm shadow-sm hover:border-primary-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-200 hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
