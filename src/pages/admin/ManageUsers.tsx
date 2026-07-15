import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Trash2, X, Check, Search, ShieldAlert } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  role: string;
  current_membership: string;
  membership_expires_at: string | null;
  created_at: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editMembership, setEditMembership] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setIsLoading(false);
  }

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${email}?`)) return;
    
    // Optimistic UI update
    setUsers(prev => prev.filter(u => u.id !== id));
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
      
    if (error) {
      alert(`Error deleting user: ${error.message}`);
      fetchUsers(); // Revert on error
    }
  };

  const handleEditClick = (user: Profile) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditMembership(user.current_membership);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    
    const updates = {
      role: editRole,
      current_membership: editMembership
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', editingUser.id);
      
    if (error) {
      alert(`Error updating user: ${error.message}`);
    } else {
      // Update local state
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
      setEditingUser(null);
    }
    setIsSaving(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || (u.current_membership === filter && u.role === 'user');
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-hanken font-bold text-on-surface">Manage Users</h1>
          <p className="font-inter text-sm text-on-surface-variant mt-1">View, edit, and control system access for all registered accounts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input 
              type="text" 
              placeholder="Search email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 border border-outline-variant rounded-lg font-inter text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface text-on-surface shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 text-on-surface-variant" size={16} />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="free">Free Users</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </header>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Email</th>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Role</th>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Membership</th>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Valid Until</th>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Joined At</th>
                <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-on-surface-variant font-medium">Loading user database...</p>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 font-inter text-sm font-medium text-on-surface">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="font-inter text-xs text-outline font-semibold">N/A</span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.current_membership === 'platinum' ? 'bg-slate-800 text-slate-100' :
                        user.current_membership === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        user.current_membership === 'silver' ? 'bg-slate-200 text-slate-800' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {user.current_membership}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-inter text-xs text-on-surface-variant">
                    {user.role === 'admin' ? '-' : (user.membership_expires_at ? new Date(user.membership_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never')}
                  </td>
                  <td className="px-6 py-4 font-inter text-xs text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 bg-surface border border-outline-variant rounded-lg text-primary hover:bg-primary-container hover:border-primary-container transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={14} />
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(user.id, user.email)}
                          className="p-1.5 bg-surface border border-outline-variant rounded-lg text-error hover:bg-error-container hover:border-error-container transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="bg-surface-container w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
                      <Search size={24} />
                    </div>
                    <p className="text-sm font-semibold text-on-surface">No users found</p>
                    <p className="text-xs text-on-surface-variant mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl border border-outline-variant overflow-hidden animate-fade-in-up" style={{ animationDuration: '200ms' }}>
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-hanken text-lg font-bold text-on-surface">Edit User Account</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <p className="font-inter text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Account Email</p>
                <p className="font-inter text-sm font-medium text-on-surface">{editingUser.email}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="font-inter text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Role</label>
                  <select 
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {editRole === 'admin' && (
                    <p className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-amber-600">
                      <ShieldAlert size={12} /> Granting admin role gives full system access.
                    </p>
                  )}
                </div>
                
                {editRole !== 'admin' && (
                  <div>
                    <label className="font-inter text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Membership Level</label>
                    <select 
                      value={editMembership}
                      onChange={(e) => setEditMembership(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="free">Free</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg font-inter text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-inter text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check size={16} />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
