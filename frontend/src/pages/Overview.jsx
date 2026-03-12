import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, Database } from 'lucide-react';
import api from '../utils/api';

const Overview = () => {
  const [usage, setUsage] = useState({ currentUsage: 0, limit: 1000 });
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usageRes, reportRes] = await Promise.all([
          api.get('/billing/usage'),
          api.get('/usage/report')
        ]);
        setUsage(usageRes.data);
        setReport(reportRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading dashboard...</div>;
  }

  const usagePercentage = Math.min((usage.currentUsage / usage.limit) * 100, 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-600 shadow-inner">
                <Activity className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate mb-1">API Requests</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900 font-display">{usage.currentUsage} <span className="text-lg font-medium text-gray-500">/ {usage.limit}</span></div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500">Monthly Quota</span>
              <span className="text-xs font-bold text-gray-700">{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-primary-500 to-violet-500'}`} 
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 shadow-inner">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate mb-1">Active Members</dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900 font-display">Manage Team</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 text-violet-600 shadow-inner">
                <Database className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate mb-1">Storage</dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900 font-display">0 <span className="text-lg font-medium text-gray-500">GB</span></div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 font-display">API Usage Trends</h3>
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
            <option>Last 30 days</option>
            <option>This month</option>
            <option>Last month</option>
          </select>
        </div>
        <div className="h-80 w-full">
          {report.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="_id" stroke="#6B7280" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis stroke="#6B7280" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="calls" name="Requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Activity className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-medium">No usage data visible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
