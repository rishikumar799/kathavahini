import React, { useState } from 'react';
import { X, UserPlus, BookOpen, Feather, CheckCircle2, Lock, Mail, User, Phone, Sparkles } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface AdminAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  adminUid: string;
  adminEmail?: string;
}

export const AdminAddUserModal: React.FC<AdminAddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  adminUid,
  adminEmail,
}) => {
  const [role, setRole] = useState<'reader' | 'writer'>('reader');
  const [name, setName] = useState('');
  const [teluguName, setTeluguName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Kathavahini@2026');
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState('జీవితం, కథలు');
  const [experience, setExperience] = useState('కథావాహిని అధికారిక రచయిత');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError('దయచేసి పేరు మరియు ఈమెయిల్ నమోదు చేయండి.');
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser({
        name: name.trim(),
        teluguName: teluguName.trim() || name.trim(),
        email: email.trim(),
        password: password.trim() || 'Kathavahini@2026',
        role,
        bio: bio.trim(),
        genres: genres.split(',').map(g => g.trim()).filter(Boolean),
        writingExperience: experience.trim(),
      }, adminUid, adminEmail);

      setSuccess(`యూజర్ ఖాతా విజయవంతంగా సృష్టించబడింది (${role === 'writer' ? 'రచయిత' : 'పాఠకుడు'})!`);
      setTimeout(() => {
        onUserCreated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'యూజర్ సృష్టించడంలో విఫలమైంది');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#121118]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center font-bold shadow-md shadow-[#7A284B]/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-telugu">కొత్త యూజర్‌ను జోడించండి (Add User)</h2>
              <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                పాఠకుడు (Reader) లేదా రచయిత (Writer) ఖాతాను నేరుగా సృష్టించండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6F6970] dark:text-[#A29CA6] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-4 bg-white dark:bg-[#18181F] border-b border-[#E8E1DA] dark:border-[#26242E]">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] dark:bg-[#121118] rounded-2xl border border-[#E8E1DA] dark:border-[#26242E]">
            <button
              type="button"
              onClick={() => setRole('reader')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'reader'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>పాఠకుడు (Reader)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('writer')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'writer'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
              }`}
            >
              <Feather className="w-4 h-4" />
              <span>రచయిత (Writer)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">పూర్తి పేరు (Full Name) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 font-serif-telugu">కలం పేరు / తెలుగు పేరు (Pen Name)</label>
              <input
                type="text"
                value={teluguName}
                onChange={e => setTeluguName(e.target.value)}
                placeholder="రమేష్ కుమార్"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">ఈమెయిల్ (Email) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ప్రారంభ పాస్‌వర్డ్ (Default Password)</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none font-mono"
              />
            </div>
          </div>

          {role === 'writer' && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">రచనా ప్రక్రియలు (Genres / Categories)</label>
                <input
                  type="text"
                  value={genres}
                  onChange={e => setGenres(e.target.value)}
                  placeholder="జీవితం, కుటుంబం, ప్రేమ, ఆధ్యాత్మికం"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">రచయిత పరిచయం / బయో (Bio)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="తెలుగు సాహిత్యాభిలాషి మరియు కథారచయిత..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              రద్దు
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>సృష్టిస్తోంది...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ఖాతా సృష్టించండి (Create Account)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
