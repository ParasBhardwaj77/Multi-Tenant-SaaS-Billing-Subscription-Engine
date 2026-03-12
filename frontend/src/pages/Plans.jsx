import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Assuming a generic endpoint to fetch the tenant's current user to resolve their tier
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const { data } = await api.get('/plans');
      setPlans(data);
      
      // Temporary stub for current plan since we don't have a GET /tenant endpoint exposed
      // In a real app we'd fetch the tenant details to highlight the active plan
      setCurrentPlan(data[0]?.name); 
    } catch (err) {
      setError('Failed to load pricing plans.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId, planName) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(planId);
      
      await api.post('/billing/subscribe', { planId });
      setCurrentPlan(planName);
      setSuccess(`Successfully subscribed to ${planName} plan!`);
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      setError('');
      setSuccess('');
      setActionLoading('cancel');
      
      await api.post('/billing/cancel');
      setSuccess('Subscription cancelled. It will remain active until the end of your billing period.');
    } catch (err) {
      setError(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center h-full items-center">Loading plans...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 border-b border-gray-100/50 mb-8 animate-slide-up">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Subscription Plans</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your current plan and billing details here.</p>
        </div>
        <button 
          onClick={cancelSubscription}
          disabled={actionLoading === 'cancel'}
          className="px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm animate-fade-in">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50/80 backdrop-blur-sm border-l-4 border-primary-500 p-4 rounded-r-xl mb-6 shadow-sm animate-fade-in">
          <div className="flex">
            <Check className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <div 
            key={plan._id} 
            className={`relative rounded-3xl glass-card border flex flex-col transition-all duration-300 animate-slide-up hover:-translate-y-1 ${
              currentPlan === plan.name ? 'border-primary-500 ring-2 ring-primary-500/50 shadow-xl shadow-primary-500/10' : 'border-gray-200 hover:shadow-xl hover:border-primary-300/50'
            }`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {currentPlan === plan.name && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-violet-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                  Current Plan
                </span>
              </div>
            )}
            <div className="p-8 pb-6">
              <h3 className="text-2xl font-bold text-gray-900 font-display">{plan.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight font-display">${plan.price}</span>
                <span className="ml-2 text-lg font-medium text-gray-500">/{plan.interval}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed font-medium">
                Perfect for growing businesses that need robust features.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col justify-between p-8 pt-6 border-t border-gray-100/50 bg-gray-50/30 rounded-b-3xl">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-sm font-medium text-gray-700">{plan.limits?.seats} Team Seats</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-sm font-medium text-gray-700">{new Intl.NumberFormat().format(plan.limits?.apiCallsPerMonth)} API Calls / mo</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-sm font-medium text-gray-700">{plan.limits?.storageGB}GB Storage</p>
                </li>
              </ul>
              
              <div className="mt-8">
                <button
                  onClick={() => subscribeToPlan(plan._id, plan.name)}
                  disabled={actionLoading === plan._id || currentPlan === plan.name}
                  className={`block w-full text-center rounded-xl px-6 py-4 text-sm font-bold transition-all duration-200 shadow-sm ${
                    currentPlan === plan.name
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 cursor-default shadow-none'
                      : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md focus:ring-4 focus:ring-gray-200 disabled:bg-gray-400 disabled:shadow-none'
                  }`}
                >
                  {currentPlan === plan.name 
                    ? 'Active' 
                    : actionLoading === plan._id 
                      ? 'Upgrading...' 
                      : 'Upgrade to ' + plan.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
