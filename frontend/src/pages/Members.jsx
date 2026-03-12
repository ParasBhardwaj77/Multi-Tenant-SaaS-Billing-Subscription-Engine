import { useState, useEffect } from 'react';
import { UserPlus, Shield, User, X } from 'lucide-react';
import api from '../utils/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });
  const [isInviting, setIsInviting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/users');
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus({ type: '', message: '' });
    setIsInviting(true);

    try {
      await api.post('/users/invite', { email: inviteEmail, role: inviteRole });
      setInviteStatus({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      fetchMembers(); // Refresh the list
    } catch (err) {
      setInviteStatus({ 
        type: 'error', 
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to invite user.' 
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) return <div className="flex justify-center h-full items-center">Loading team members...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Invite Section */}
      {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
        <div className="glass-card border border-white/60 p-8 shadow-sm animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-600 flex items-center justify-center mr-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Invite Team Member</h3>
              <p className="text-sm text-gray-500 font-medium">Add colleagues to your workspace to collaborate.</p>
            </div>
          </div>
          
          {inviteStatus.message && (
            <div className={`p-4 mb-6 rounded-xl animate-fade-in ${
              inviteStatus.type === 'success' ? 'bg-green-50/80 backdrop-blur border border-green-200 text-green-800' : 'bg-red-50/80 backdrop-blur border border-red-200 text-red-800'
            }`}>
              <p className="font-medium text-sm">{inviteStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-5 items-start sm:items-end bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
            <div className="flex-1 w-full relative">
              <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                id="invite-email"
                className="focus:ring-2 focus:ring-primary-500 focus:border-transparent block w-full text-sm border-gray-200 rounded-xl py-3 px-4 bg-white shadow-sm transition-all hover:border-primary-300"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="w-full sm:w-56 relative">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Role</label>
              <select
                id="role"
                name="role"
                className="block w-full text-sm border-gray-200 rounded-xl py-3 px-4 bg-white shadow-sm transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting || !inviteEmail}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md shadow-primary-500/20 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5 ${
                (isInviting || !inviteEmail) ? 'opacity-60 cursor-not-allowed hover:translate-y-0 shadow-none' : ''
              }`}
            >
              {isInviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Members Directory */}
      <div className="glass-card overflow-hidden border border-white/60 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="px-8 py-6 border-b border-gray-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-display">Directory</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium">All members in your current workspace.</p>
          </div>
        </div>
        
        <ul className="divide-y divide-gray-100/50 bg-white/40">
          {members.map((member) => (
            <li key={member._id} className="p-6 hover:bg-white/80 transition-colors flex items-center justify-between group">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-lg font-bold text-gray-600">
                      {member.name ? member.name.charAt(0).toUpperCase() : (member.email ? member.email.charAt(0).toUpperCase() : 'U')}
                    </span>
                  </div>
                  {member.role === 'owner' && (
                    <div className="absolute -bottom-1 -right-1 bg-violet-100 p-1 rounded-full border-2 border-white">
                      <Shield className="w-3 h-3 text-violet-600" />
                    </div>
                  )}
                </div>
                <div className="ml-5">
                  <div className="text-base font-bold text-gray-900">{member.name || 'Pending Invite'}</div>
                  <div className="text-sm font-medium text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                  member.role === 'owner' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                  member.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {member.role === 'owner' && <Shield className="w-3.5 h-3.5 mr-1.5" />}
                  {member.role === 'admin' && <Shield className="w-3.5 h-3.5 mr-1.5" />}
                  {member.role === 'member' && <User className="w-3.5 h-3.5 mr-1.5" />}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                
                {currentUser._id !== member._id && currentUser.role === 'owner' && (
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg focus:outline-none transition-colors opacity-0 group-hover:opacity-100">
                    <X className="w-5 h-5 pointer-events-none" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Members;
