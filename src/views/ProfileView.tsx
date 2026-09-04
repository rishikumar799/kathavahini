import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  BookOpen, 
  LogOut, 
  Sun, 
  Moon, 
  Feather, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  Camera,
  Edit3,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { User, ReadingTheme } from '../types';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

const PRESET_AVATARS = [
  { id: 'writer-1', name: 'తెలుగు పండితుడు', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=telugu-scholar' },
  { id: 'writer-2', name: 'సాహితీవేత్త', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarada-telugu' },
  { id: 'writer-3', name: 'రచయిత్రి', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=padmavathi' },
  { id: 'writer-4', name: 'కథకుడు', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raghava-rao' },
  { id: 'writer-5', name: 'కవితామూర్తి', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya-telugu' },
  { id: 'writer-6', name: 'యువ రచయిత', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chaitanya-v' },
  { id: 'reader-1', name: 'పుస్తక ప్రియుడు', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=krishna-reader' },
  { id: 'reader-2', name: 'నిత్య పాఠకురాలు', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lakshmi-reader' },
];

interface ProfileViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onSelectTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenAuth,
  onSelectTab,
  darkMode,
  setDarkMode,
}) => {
  const [fontSize, setFontSize] = useState<number>(user?.preferences?.fontSize || 18);
  const [notifsEnabled, setNotifsEnabled] = useState<boolean>(user?.preferences?.notifications ?? true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editTeluguName, setEditTeluguName] = useState(user?.teluguName || user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editTeluguBio, setEditTeluguBio] = useState(user?.teluguBio || user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || user?.photoURL || '');
  const [avatarTab, setAvatarTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelected = async (file: File) => {
    if (!user) return;
    setProfileMsg(null);
    const validation = storageService.validateImageFile(file);
    if (!validation.isValid) {
      setProfileMsg({ type: 'error', text: validation.error || 'సరైన చిత్రాన్ని ఎంచుకోండి.' });
      return;
    }

    setIsUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const uploadRes = await storageService.uploadProfileImage(user.id, file, (percent) => {
        setUploadProgress(percent);
      });
      setAvatarUrl(uploadRes.downloadUrl);
      setProfileMsg({ type: 'success', text: 'ప్రొఫైల్ చిత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది!' });
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setProfileMsg({ 
        type: 'error', 
        text: err.message || 'చిత్రాన్ని అప్‌లోడ్ చేయడంలో సమస్య ఎదురైంది. దయచేసి ఇమేజ్ URL లేదా ప్రీసెట్ అవతార్‌ను ఎంచుకోండి.' 
      });
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    setProfileMsg(null);

    try {
      const resolvedTeluguName = editTeluguName.trim() || editName.trim() || user.name;
      const resolvedName = editName.trim() || user.name;
      const resolvedAvatar = avatarUrl.trim() || user.avatar || user.photoURL;

      await authService.updateProfile({
        name: resolvedName,
        displayName: resolvedTeluguName,
        teluguName: resolvedTeluguName,
        bio: editBio.trim(),
        teluguBio: editTeluguBio.trim() || editBio.trim(),
        avatar: resolvedAvatar,
        photoURL: resolvedAvatar,
      });

      setProfileMsg({ type: 'success', text: 'మీ ప్రొఫైల్ వివరాలు విజయవంతంగా నవీకరించబడ్డాయి!' });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setProfileMsg({ type: 'error', text: err.message || 'ప్రొఫైల్ నవీకరించడంలో లోపం ఎదురైంది.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center mx-auto shadow-md">
          <UserIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            మీరు ప్రవేశించలేదు
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-1 font-serif-telugu">
            మీ లైబ్రరీని నిర్వహించుకోవడానికి మరియు కథలు రాయడానికి దయచేసి ప్రవేశించండి
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
        >
          ప్రవేశించండి / ఖాతా తెరవండి
        </button>
      </div>
    );
  }

  const handleFontSizeChange = (newSize: number) => {
    const clamped = Math.min(28, Math.max(14, newSize));
    setFontSize(clamped);
    if (user) {
      authService.updateProfile({
        preferences: {
          ...user.preferences,
          fontSize: clamped,
        }
      }).catch(err => console.warn('Error saving font size preference:', err));
    }
  };

  const handleToggleNotifications = () => {
    const nextVal = !notifsEnabled;
    setNotifsEnabled(nextVal);
    if (user) {
      authService.updateProfile({
        preferences: {
          ...user.preferences,
          notifications: nextVal,
        }
      }).catch(err => console.warn('Error saving notifications preference:', err));
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onSelectTab('home');
  };

  const isAdmin = user.role === 'admin';
  const isApprovedWriter = user.role === 'writer' && user.status === 'active';
  const isPendingWriter = user.role === 'writer' && user.status === 'pending';
  const isReader = user.role === 'reader' || (!isAdmin && !isApprovedWriter && !isPendingWriter);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group shrink-0">
            <img
              src={user.avatar || user.photoURL}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#7A284B] shadow-md"
            />
            <button
              type="button"
              onClick={() => {
                setEditName(user.name || '');
                setEditTeluguName(user.teluguName || user.name || '');
                setEditBio(user.bio || '');
                setEditTeluguBio(user.teluguBio || user.bio || '');
                setAvatarUrl(user.avatar || user.photoURL || '');
                setProfileMsg(null);
                setIsEditModalOpen(true);
              }}
              title="ప్రొఫైల్ చిత్రం / సమాచారం మార్చండి"
              className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer shadow-inner"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-bold">మార్చండి</span>
            </button>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {user.teluguName || user.name}
              </h1>

              <button
                type="button"
                onClick={() => {
                  setEditName(user.name || '');
                  setEditTeluguName(user.teluguName || user.name || '');
                  setEditBio(user.bio || '');
                  setEditTeluguBio(user.teluguBio || user.bio || '');
                  setAvatarUrl(user.avatar || user.photoURL || '');
                  setProfileMsg(null);
                  setIsEditModalOpen(true);
                }}
                className="p-1 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] hover:bg-[#7A284B]/10 transition-colors cursor-pointer"
                title="ప్రొఫైల్ సవరించండి (Edit Profile)"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[11px] font-bold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>అడ్మిన్ (Admin)</span>
                </span>
              )}

              {isApprovedWriter && (
                <span className="px-3 py-1 rounded-full bg-[#3E8065]/15 text-[#3E8065] text-[11px] font-bold inline-flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5" />
                  <span>రచయిత (Writer)</span>
                </span>
              )}

              {isPendingWriter && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-bold inline-flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5" />
                  <span>రచయిత దరఖాస్తు పరిశీలనలో ఉంది (Pending)</span>
                </span>
              )}

              {isReader && (
                <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6F6970] dark:text-[#AAA4AC] text-[11px] font-bold">
                  పాఠకుడు (Reader)
                </span>
              )}
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-1">{user.email}</p>
            <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] mt-2 max-w-md">
              {user.teluguBio || user.bio || 'కథావాహిని కథా వేదిక సభ్యులు'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons according to Role */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>అడ్మిన్ ప్యానెల్ →</span>
            </button>
          )}

          {(isApprovedWriter || isAdmin) && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className="px-5 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold hover:bg-[#7A284B] hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>రచయిత స్టూడియో →</span>
            </button>
          )}

          {isPendingWriter && (
            <button
              onClick={() => onSelectTab('apply-writer')}
              className="px-5 py-2.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>దరఖాస్తు స్థితి చూడండి →</span>
            </button>
          )}

          {isReader && (
            <button
              onClick={() => onSelectTab('apply-writer')}
              className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>రచయితగా మారండి →</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Writer Status Banner */}
      {isPendingWriter && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                మీ రచయిత దరఖాస్తు పరిశీలనలో ఉంది (Application Pending Review)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu mt-0.5">
                మీ దరఖాస్తు ప్రస్తుతం నిర్వాహకుల పరిశీలనలో ఉంది. అడ్మిన్ ఆమోదం పొందిన తర్వాత కథల ప్రచురణ సదుపాయం యాక్టివేట్ అవుతుంది.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reader Callout if reader */}
      {isReader && (
        <div 
          onClick={() => onSelectTab('apply-writer')}
          className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#222229] dark:to-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm hover:border-[#7A284B] cursor-pointer transition-all flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center shrink-0">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                కథావాహిని వేదికపై మీ కథలను ప్రచురించాలనుకుంటున్నారా?
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu mt-0.5">
                రచయితగా దరఖాస్తు చేసుకోండి. సూపర్ అడ్మిన్ ఆమోదం తర్వాత మీ రచనలు ప్రచురించబడతాయి.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6F6970] group-hover:text-[#7A284B] group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      )}

      {/* Reading Preferences */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#7A284B]" />
          <span>పఠన ప్రాధాన్యతలు (Reading Settings)</span>
        </h2>

        <div className="space-y-4 divide-y divide-[#E8E1DA] dark:divide-[#2E2D36]">
          {/* App Appearance */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">యాప్ థీమ్</p>
              <p className="text-xs text-[#6F6970]">లైట్ / డార్క్ మోడ్ మార్చండి</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] text-[#17151A] dark:text-[#F7F3EE] font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'డార్క్ మోడ్' : 'లైట్ మోడ్'}</span>
            </button>
          </div>

          {/* Reader Font Size */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">డిఫాల్ట్ అక్షర పరిమాణం</p>
              <p className="text-xs text-[#6F6970]">కథల రీడర్‌లో డిఫాల్ట్ సైజు ({fontSize}px)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFontSizeChange(fontSize - 2)}
                className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#222229] font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
              <button
                onClick={() => handleFontSizeChange(fontSize + 2)}
                className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#222229] font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">నోటిఫికేషన్లు</p>
              <p className="text-xs text-[#6F6970]">కొత్త అధ్యాయాలు మరియు అప్‌డేట్‌ల సమాచారం</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                notifsEnabled ? 'bg-[#3E8065] text-white' : 'bg-gray-300 text-black'
              }`}
            >
              {notifsEnabled ? 'ఆన్' : 'ఆఫ్'}
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>అకౌంట్ నుండి నిర్గమించండి (Logout)</span>
      </button>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                    ప్రొఫైల్ సవరణ (Edit Profile)
                  </h3>
                  <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">
                    మీ అవతార్ మరియు రచనా వివరాలను నవీకరించండి
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#6F6970] dark:text-[#AAA4AC] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Message */}
            {profileMsg && (
              <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                profileMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400'
              }`}>
                {profileMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Photo Selector Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  ప్రొఫైల్ చిత్రం (Avatar Photo)
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl || user.avatar || user.photoURL}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#7A284B] shrink-0 shadow-sm"
                  />

                  {/* Avatar Mode Buttons */}
                  <div className="flex-1 flex flex-wrap gap-1 bg-[#FAF7F2] dark:bg-[#222229] p-1 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36]">
                    <button
                      type="button"
                      onClick={() => setAvatarTab('upload')}
                      className={`flex-1 min-w-[70px] py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        avatarTab === 'upload'
                          ? 'bg-[#7A284B] text-white shadow-xs'
                          : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>అప్‌లోడ్</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarTab('preset')}
                      className={`flex-1 min-w-[70px] py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        avatarTab === 'preset'
                          ? 'bg-[#7A284B] text-white shadow-xs'
                          : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>అవతార్లు</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarTab('url')}
                      className={`flex-1 min-w-[70px] py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        avatarTab === 'url'
                          ? 'bg-[#7A284B] text-white shadow-xs'
                          : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>లింక్</span>
                    </button>
                  </div>
                </div>

                {/* Subview: Upload from Device */}
                {avatarTab === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleAvatarFileSelected(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      disabled={isUploadingAvatar || isSavingProfile}
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar || isSavingProfile}
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] bg-[#FAF7F2]/60 dark:bg-[#222229]/60 text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#7A284B]" />
                          <span>అప్‌లోడ్ చేస్తోంది... {uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-[#7A284B]" />
                          <span>పరికరం నుండి చిత్రాన్ని ఎంచుకోండి (గరిష్టంగా 5MB)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Subview: Curated Presets */}
                {avatarTab === 'preset' && (
                  <div className="grid grid-cols-4 gap-2 p-1">
                    {PRESET_AVATARS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(p.url);
                          setProfileMsg(null);
                        }}
                        className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          avatarUrl === p.url
                            ? 'border-[#7A284B] bg-[#7A284B]/10 ring-2 ring-[#7A284B]'
                            : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#222229] hover:border-[#7A284B]/50'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-10 h-10 rounded-full" />
                        <span className="text-[10px] font-serif-telugu truncate w-full text-center text-[#17151A] dark:text-[#F7F3EE]">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Subview: Direct Image URL */}
                {avatarTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrl.trim()) {
                          setAvatarUrl(customAvatarUrl.trim());
                          setProfileMsg(null);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#7A284B] text-white text-xs font-bold hover:bg-[#631F3C] transition-colors cursor-pointer"
                    >
                      వర్తింపజేయి
                    </button>
                  </div>
                )}
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  పూర్తి పేరు (Name)
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-medium text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                  placeholder="మీ పేరు..."
                />
              </div>

              {/* Telugu / Pen Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  కలం పేరు / తెలుగు పేరు (Pen Name / Telugu Name)
                </label>
                <input
                  type="text"
                  value={editTeluguName}
                  onChange={(e) => setEditTeluguName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-medium text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-[#7A284B] focus:outline-none font-serif-telugu"
                  placeholder="ఉదా: శ్రీశ్రీ లేదా మీ కలం పేరు"
                />
              </div>

              {/* Telugu Bio Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  రచయిత పరిచయం / బయో (Telugu Bio)
                </label>
                <textarea
                  rows={3}
                  value={editTeluguBio}
                  onChange={(e) => setEditTeluguBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-medium text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-[#7A284B] focus:outline-none font-serif-telugu resize-none"
                  placeholder="కథావాహిని పాఠకులకు మీ గురించి కొన్ని మాటలు..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold text-[#6F6970] dark:text-[#AAA4AC] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  రద్దు చేయండి
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || isUploadingAvatar}
                  className="px-6 py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>భద్రపరుస్తోంది...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>భద్రపరచండి (Save)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
