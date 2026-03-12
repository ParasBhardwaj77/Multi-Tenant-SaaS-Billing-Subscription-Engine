import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight, Zap } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { 
        name, 
        companyName, 
        email, 
        password 
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/overview');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-dark-900 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-blob-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-600/20 blur-[120px] animate-blob-bounce" style={{ animationDelay: '3s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] animate-blob-bounce" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 glass p-10 relative z-10 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-primary-600 mb-6 shadow-lg shadow-violet-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create your instance
          </h2>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-10 appearance-none bg-white/50 backdrop-blur-sm rounded-xl relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm shadow-sm hover:border-primary-300"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="pl-10 appearance-none bg-white/50 backdrop-blur-sm rounded-xl relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm shadow-sm hover:border-primary-300"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-700 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-lg shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
