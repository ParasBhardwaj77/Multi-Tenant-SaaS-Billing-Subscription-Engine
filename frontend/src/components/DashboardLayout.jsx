import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Receipt, LogOut, Zap, Bell, ChevronDown, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const { data } = await api.get('/tenants/me');
        setTenant(data);
      } catch (error) {
        console.error("Failed to fetch tenant info:", error);
      }
    };
    fetchTenant();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Plans & Billing', path: '/plans', icon: CreditCard },
  ];

  if (user.role === 'owner' || user.role === 'admin') {
    navItems.push({ name: 'Team Members', path: '/members', icon: Users });
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      {/* Suspended Banner */}
      {tenant?.status === 'suspended' && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white z-50 px-4 py-2 flex items-center justify-center shadow-md">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p className="text-sm font-medium">Your account is currently suspended due to a billing issue. Some features may be restricted.</p>
        </div>
      )}

      {/* Animated Subtle Background */}
      <div className={`absolute left-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#f8fafc] ${tenant?.status === 'suspended' ? 'top-10' : 'top-0'}`}>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-600/5 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Sidebar */}
      <div className={`w-72 hidden md:flex flex-col z-10 m-4 rounded-2xl glass border border-white/60 shadow-xl shadow-gray-200/50 ${tenant?.status === 'suspended' ? 'mt-14' : ''}`}>
        <div className="h-20 flex items-center px-8 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-primary-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-display">
              SaaS Engine
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</p>
          </div>
          <nav className="space-y-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50' 
                      : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4 rounded-xl border border-gray-100 bg-white/40 mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-100 to-violet-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200/50">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100"
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden z-10 m-4 ml-0 ${tenant?.status === 'suspended' ? 'mt-14' : ''}`}>
        <header className="h-20 glass rounded-2xl border border-white/60 shadow-sm mb-4 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-900 capitalize font-display">
            {location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto rounded-2xl p-2">
          <div className="animate-fade-in h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
