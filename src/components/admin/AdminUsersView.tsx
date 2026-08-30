import React, { useState } from 'react';
import {
  Search,
  Filter,
  Users,
  ShieldCheck,
  Feather,
  BookOpen,
  UserX,
  UserCheck,
  Lock,
  Mail,
  Calendar,
  AlertCircle,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { User, UserRole, AccountStatus } from '../../types';

interface AdminUsersViewProps {
  users: User[];
  onToggleStatus: (user: User, newStatus: AccountStatus) => void;
  onPromoteToWriter?: (user: User) => void;
  onOpenAddUser?: () => void;
  actionLoading: boolean;
  filterRole?: 'all' | 'reader' | 'writer' | 'admin';
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  onToggleStatus,
  onPromoteToWriter,
  onOpenAddUser,
  actionLoading,
  filterRole = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'reader' | 'writer' | 'admin'>(filterRole);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [promoteModalUser, setPromoteModalUser] = useState<User | null>(null);
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');

  const filteredUsers = users.filter(u => {
    const nameMatch = (u.displayName || u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const uidMatch = (u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || uidMatch;

    const normalizedRole = u.role === 'author' ? 'writer' : (u.role === 'superadmin' ? 'admin' : (u.role || 'reader'));
    const matchesRole = roleFilter === 'all' || normalizedRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleConfirmPromote = () => {
    if (!promoteModalUser || !onPromoteToWriter) return;
    onPromoteToWriter({
      ...promoteModalUser,
      displayName: penName || promoteModalUser.displayName,
      teluguName: penName || promoteModalUser.teluguName,
      bio: bio || promoteModalUser.bio,
    });
    setPromoteModalUser(null);
    setPenName('');
    setBio('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Add User Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            యూజర్ల నిర్వహణ (User Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            ఖాతాల స్థితి, పాత్రలు (Reader, Writer, Admin) మరియు యాక్సెస్ నియంత్రణ
          </p>
        </div>

        {onOpenAddUser && (
          <button
            onClick={onOpenAddUser}
            className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>కొత్త యూజర్‌ను జోడించండి (Add User)</span>
          </button>
        )}
      </div>

      {/* Search & Filters Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="పేరు, ఇమెయిల్ లేదా యూజర్ ఐడీతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#FAF7F2] dark:bg-[#121118] p-1 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E]">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              అందరూ ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('writer')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'writer' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              రచయితలు ({users.filter(u => u.role === 'writer' || u.role === 'author').length})
            </button>
            <button
              onClick={() => setRoleFilter('reader')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'reader' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              పాఠకులు ({users.filter(u => u.role === 'reader' || !u.role).length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'admin' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              అడ్మిన్ ({users.filter(u => u.role === 'admin' || u.role === 'superadmin' || u.email === 'kathavahini@gmail.com').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#121118] border-b border-[#E8E1DA] dark:border-[#26242E] text-[#6F6970] dark:text-[#A29CA6] uppercase font-bold">
              <tr>
                <th className="py-3 px-4">యూజర్</th>
                <th className="py-3 px-4">పాత్ర (Role)</th>
                <th className="py-3 px-4">ఖాతా స్థితి (Status)</th>
                <th className="py-3 px-4">కథలు</th>
                <th className="py-3 px-4 text-right">నియంత్రణ చర్యలు</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1DA] dark:divide-[#26242E]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#6F6970] dark:text-[#A29CA6]">
                    యూజర్లు ఎవరూ కనుగొనబడలేదు.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const normalizedRole = user.role === 'author' ? 'writer' : (user.role === 'superadmin' ? 'admin' : (user.role || 'reader'));
                  const isReader = normalizedRole === 'reader';
                  const isWriter = normalizedRole === 'writer';
                  const isAdmin = normalizedRole === 'admin' || user.email === 'kathavahini@gmail.com';
                  const isSuspended = user.status === 'suspended' || user.status === 'banned';

                  return (
                    <tr key={user.id} className="hover:bg-[#FAF7F2]/50 dark:hover:bg-[#121118]/50 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E8E1DA] dark:border-[#26242E]"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                              {user.teluguName || user.displayName || user.name}
                            </p>
                            <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6] truncate font-mono">
                              {user.email || user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmin && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] border border-[#7A284B]/20 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {isWriter && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 inline-flex items-center gap-1 font-serif-telugu">
                            <Feather className="w-3 h-3" />
                            Writer (రచయిత)
                          </span>
                        )}
                        {isReader && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 inline-flex items-center gap-1 font-serif-telugu">
                            <BookOpen className="w-3 h-3" />
                            Reader (పాఠకుడు)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600">
                            సస్పెండ్ చేయబడింది
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            యాక్టివ్
                          </span>
                        )}
                      </td>

                      {/* Content stats */}
                      <td className="py-3.5 px-4 text-[#6F6970] dark:text-[#A29CA6]">
                        {user.publishedCount || user.savedStoriesCount || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reader to Writer Promotion Action */}
                          {isReader && onPromoteToWriter && (
                            <button
                              onClick={() => {
                                setPromoteModalUser(user);
                                setPenName(user.teluguName || user.displayName || user.name || '');
                                setBio(user.bio || '');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="ఈ పాఠకుడిని రచయితగా అప్‌గ్రేడ్ చేయండి"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>రచయితగా మార్చు</span>
                            </button>
                          )}

                          {/* Suspend / Reactivate */}
                          {!isAdmin && (
                            <button
                              onClick={() => onToggleStatus(user, isSuspended ? 'active' : 'suspended')}
                              disabled={actionLoading}
                              className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                              }`}
                              title={isSuspended ? 'ఖాతాను పునరుద్ధరించండి' : 'ఖాతాను సస్పెండ్ చేయండి'}
                            >
                              {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote Modal */}
      {promoteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#7A284B] dark:text-[#D87591]">
              <Feather className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">రచయితగా ప్రమోట్ చేయండి</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              {promoteModalUser.displayName || promoteModalUser.name} ఖాతాను పాఠకుడి నుండి అధికారిక రచయితగా మార్చబడుతుంది.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">రచయిత కలం పేరు</label>
                <input
                  type="text"
                  value={penName}
                  onChange={e => setPenName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">రచయిత పరిచయం</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPromoteModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={handleConfirmPromote}
                className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold cursor-pointer"
              >
                రచయితగా నియమించు
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
