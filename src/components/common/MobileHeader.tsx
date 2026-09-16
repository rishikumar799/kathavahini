import React, { useState } from 'react';
import { 
  Search, Sun, Moon, Menu, X, BookOpen, Feather, Sparkles, Smile, Info, Mail, 
  Flag, HelpCircle, Shield, FileText, Cookie, User as UserIcon, Bookmark, LogIn, LogOut, ChevronDown 
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface MobileHeaderProps {
  user: User | null;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onSelectTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  onOpenSearch,
  onOpenAuth,
  onSelectTab,
  darkMode,
  setDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLegalExpanded, setIsLegalExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await authService.logout();
    onSelectTab('home');
  };

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 w-full bg-[#FAF7F2]/95 dark:bg-[#101014]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-[#17151A] dark:text-[#F7F3EE] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            aria-label="మెనూ"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#7A284B] dark:bg-[#D87591] text-white flex items-center justify-center font-serif-telugu font-bold text-xl shadow-sm">
              క
            </div>
            <span className="font-serif-telugu font-bold text-lg text-[#17151A] dark:text-[#F7F3EE]">
              కథావాహిని
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#17151A] dark:text-[#F7F3EE] cursor-pointer"
            title="శోధించండి"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#17151A] dark:text-[#F7F3EE] cursor-pointer"
            title={darkMode ? 'లైట్ మోడ్' : 'డార్క్ మోడ్'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <button
              onClick={() => handleNav('profile')}
              className="p-0.5 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] cursor-pointer"
            >
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              ప్రవేశించు
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-[#FAF7F2] dark:bg-[#101014] overflow-y-auto p-4 space-y-6 pb-24 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 font-serif-telugu">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              హోమ్ (Home)
            </button>
            <button
              onClick={() => handleNav('stories')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              కథలు (Stories)
            </button>
            <button
              onClick={() => handleNav('novels')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              నవలలు (Novels)
            </button>
            <button
              onClick={() => handleNav('jokes')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              జోక్స్ (Jokes)
            </button>
            <button
              onClick={() => handleNav('balavinodhini')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 dark:from-amber-950/20 dark:to-rose-950/20 font-bold text-[#7A284B] dark:text-[#D87591] shadow-sm border border-amber-500/30 flex items-center justify-between"
            >
              <span>బాలవినోదిని (Balavinodhini)</span>
              <span className="text-base">🎈</span>
            </button>
            <button
              onClick={() => handleNav('knowledge')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              విజ్ఞానాలు (Knowledge Articles)
            </button>
            <button
              onClick={() => handleNav('authors')}
              className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#17151A] dark:text-[#F7F3EE] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]"
            >
              రచయితలు (Authors)
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-left px-4 py-3 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/20 font-bold text-[#7A284B] dark:text-[#D87591] shadow-sm border border-[#7A284B]/30 flex items-center justify-between"
              >
                <span>అడ్మిన్ ప్యానెల్ (Admin Panel)</span>
                <Shield className="w-4 h-4" />
              </button>
            )}

            {user && user.role === 'writer' && user.status === 'active' && (
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-4 py-3 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/20 font-bold text-[#7A284B] dark:text-[#D87591] shadow-sm border border-[#7A284B]/30 flex items-center justify-between"
              >
                <span>రచయిత స్టూడియో (Creator Studio)</span>
                <Feather className="w-4 h-4" />
              </button>
            )}

            {user && user.role === 'writer' && user.status === 'pending' && (
              <button
                onClick={() => handleNav('apply-writer')}
                className="w-full text-left px-4 py-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 font-bold text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/30 flex items-center justify-between text-sm"
              >
                <span>రచయిత దరఖాస్తు పరిశీలనలో ఉంది (Pending)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </button>
            )}

            {(!user || user.role === 'reader') && (
              <button
                onClick={() => handleNav('apply-writer')}
                className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] font-bold text-[#7A284B] dark:text-[#D87591] shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between"
              >
                <span>రచయితగా చేరండి (Join as Writer)</span>
                <Feather className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Site & Help Links */}
          <div className="bg-white dark:bg-[#18181D] rounded-3xl p-4 border border-[#E8E1DA] dark:border-[#2E2D36] space-y-4 font-serif-telugu">
            <div>
              <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider block mb-2">
                సైట్ సమాచారం
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('about')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Info className="w-4 h-4 text-[#6F6970]" />
                  <span>మా గురించి</span>
                </button>
                <button
                  onClick={() => handleNav('contact')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Mail className="w-4 h-4 text-[#6F6970]" />
                  <span>మమ్మల్ని సంప్రదించండి</span>
                </button>
                <button
                  onClick={() => handleNav('report-issue')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Flag className="w-4 h-4 text-[#6F6970]" />
                  <span>సమస్యను నివేదించండి</span>
                </button>
              </div>
            </div>

            <div className="border-t border-[#E8E1DA] dark:border-[#2E2D36] pt-3">
              <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider block mb-2">
                సహాయం & మార్గదర్శకాలు
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('faq')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <HelpCircle className="w-4 h-4 text-[#6F6970]" />
                  <span>తరచుగా అడిగే ప్రశ్నలు (FAQ)</span>
                </button>
                <button
                  onClick={() => handleNav('help')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <BookOpen className="w-4 h-4 text-[#6F6970]" />
                  <span>సహాయ కేంద్రం</span>
                </button>
              </div>
            </div>

            <div className="border-t border-[#E8E1DA] dark:border-[#2E2D36] pt-3">
              <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider block mb-2">
                చట్టపరమైన విధానాలు
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('privacy-policy')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Shield className="w-4 h-4 text-[#6F6970]" />
                  <span>గోప్యతా విధానం</span>
                </button>
                <button
                  onClick={() => handleNav('terms')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <FileText className="w-4 h-4 text-[#6F6970]" />
                  <span>నిబంధనలు & షరతులు</span>
                </button>
                <button
                  onClick={() => handleNav('cookie-policy')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Cookie className="w-4 h-4 text-[#6F6970]" />
                  <span>కుకీస్ విధానం</span>
                </button>
                <button
                  onClick={() => handleNav('content-policy')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-[#17151A] dark:text-[#F7F3EE]"
                >
                  <Shield className="w-4 h-4 text-[#6F6970]" />
                  <span>కంటెంట్ & కాపీరైట్ విధానం</span>
                </button>
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full flex items-center gap-2.5 py-2 px-2 text-sm text-purple-700 dark:text-purple-400 font-medium"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>అడ్మిన్ లాగిన్ పోర్టల్ (Admin)</span>
                </button>
              </div>
            </div>

            {user && (
              <div className="border-t border-[#E8E1DA] dark:border-[#2E2D36] pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-2 px-2 text-sm font-bold text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>లాగ్ అవుట్ (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
