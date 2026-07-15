import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.current_membership === filter && u.role === 'user');

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="free">Free</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Membership Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-400">
                        N/A
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        user.current_membership === 'platinum' ? 'bg-slate-800 text-slate-100' :
                        user.current_membership === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        user.current_membership === 'silver' ? 'bg-slate-200 text-slate-800' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {user.current_membership}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.role === 'admin' ? '-' : (user.membership_expires_at ? new Date(user.membership_expires_at).toLocaleDateString() : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
