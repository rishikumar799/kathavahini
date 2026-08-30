import React, { useState } from 'react';
import { User as UserIcon, Settings, Bell, BookOpen, LogOut, Sun, Moon, Feather, ShieldCheck, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { User, ReadingTheme } from '../types';
import { authService } from '../services/authService';

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

  const isAdmin = user.role === 'admin' && user.email === 'kathavahini@gmail.com';
  const isWriter = user.role === 'writer';
  const isReader = !isAdmin && !isWriter;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-[#7A284B]"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {user.teluguName || user.name}
              </h1>

              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[11px] font-bold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>అడ్మిన్ (Admin)</span>
                </span>
              )}

              {isWriter && (
                <span className="px-3 py-1 rounded-full bg-[#3E8065]/15 text-[#3E8065] text-[11px] font-bold inline-flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5" />
                  <span>రచయిత (Writer)</span>
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

          {(isWriter || isAdmin) && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className="px-5 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold hover:bg-[#7A284B] hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>రచయిత స్టూడియో →</span>
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
    </div>
  );
};
