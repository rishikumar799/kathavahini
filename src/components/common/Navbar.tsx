import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, BookOpen, Feather, Bell, User as UserIcon, Sun, Moon, Plus, Bookmark, LogIn, Sparkles, ChevronDown, 
  Info, Mail, Flag, HelpCircle, Shield, FileText, Cookie, LogOut, Activity
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { NotificationDrawer } from '../modals/NotificationDrawer';
import { authService } from '../../services/authService';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onOpenWrite: () => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onOpenWrite,
  onOpenAuth,
  onOpenSearch,
  notifications,
  onMarkNotificationRead,
  darkMode,
  setDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Final top navigation items
  const navLinks = [
    { id: 'home', label: 'హోమ్' },
    { id: 'stories', label: 'కథలు' },
    { id: 'novels', label: 'నవలలు' },
    { id: 'jokes', label: 'జోక్స్' },
    { id: 'balavinodhini', label: 'బాలవినోదిని' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMoreOpen(false);
  };

  const handleLogout = async () => {
    setIsMoreOpen(false);
    await authService.logout();
    setCurrentTab('home');
  };

  const isMoreActive = [
    'knowledge', 'authors',
    'about', 'contact', 'report-issue', 'faq', 'help', 
    'privacy-policy', 'terms', 'cookie-policy', 'content-policy'
  ].includes(currentTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 dark:bg-[#101014]/90 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#7A284B] dark:bg-[#D87591] text-white flex items-center justify-center font-serif-telugu font-bold text-2xl shadow-md group-hover:scale-105 transition-transform">
            క
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold font-serif-telugu tracking-tight text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-1">
              కథావాహిని <span className="text-xs font-sans text-[#7A284B] dark:text-[#D87591] font-semibold uppercase tracking-wider">Kathavahini</span>
            </h1>
            <p className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] font-medium tracking-wide">
              తెలుగు సాహితీ ప్రపంచం
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold font-serif-telugu transition-all cursor-pointer ${
                currentTab === link.id
                  ? 'bg-[#7A284B] text-white dark:bg-[#D87591] shadow-sm'
                  : 'text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* 'ఇతరాలు' Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold font-serif-telugu transition-all cursor-pointer ${
                isMoreActive || isMoreOpen
                  ? 'bg-[#7A284B]/15 text-[#7A284B] dark:bg-[#D87591]/20 dark:text-[#D87591]'
                  : 'text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50'
              }`}
            >
              <span>ఇతరాలు</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
                <div className="space-y-3 font-serif-telugu text-xs">
                  {/* Category 0: సాహిత్యం & విజ్ఞానం (Relocated Vignanalu and Rachaitalu) */}
                  <div>
                    <span className="block px-2.5 py-1 text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                      సాహిత్యం & విజ్ఞానం
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      <button
                        onClick={() => handleNavClick('knowledge')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer font-bold ${
                          currentTab === 'knowledge'
                            ? 'bg-[#7A284B]/10 text-[#7A284B] dark:bg-[#D87591]/20 dark:text-[#D87591]'
                            : 'hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
                        <span>విజ్ఞానాలు (Knowledge)</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('authors')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer font-bold ${
                          currentTab === 'authors'
                            ? 'bg-[#7A284B]/10 text-[#7A284B] dark:bg-[#D87591]/20 dark:text-[#D87591]'
                            : 'hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE]'
                        }`}
                      >
                        <Feather className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
                        <span>రచయితలు (Authors)</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60" />

                  {/* Category 1: సైట్ */}
                  <div>
                    <span className="block px-2.5 py-1 text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                      సైట్ (Site)
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      <button
                        onClick={() => handleNavClick('about')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>మా గురించి</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('contact')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>మమ్మల్ని సంప్రదించండి</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('report-issue')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>సమస్యను నివేదించండి</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60" />

                  {/* Category 2: సహాయం */}
                  <div>
                    <span className="block px-2.5 py-1 text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                      సహాయం (Help)
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      <button
                        onClick={() => handleNavClick('faq')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>తరచుగా అడిగే ప్రశ్నలు (FAQ)</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('help')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>సహాయ కేంద్రం</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60" />

                  {/* Category 3: చట్టపరమైన */}
                  <div>
                    <span className="block px-2.5 py-1 text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                      చట్టపరమైన (Legal)
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      <button
                        onClick={() => handleNavClick('privacy-policy')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>గోప్యతా విధానం</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('terms')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>నిబంధనలు & షరతులు</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('cookie-policy')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Cookie className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>కుకీస్ విధానం</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('content-policy')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#6F6970]" />
                        <span>కంటెంట్ & కాపీరైట్ విధానం</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60" />

                  {/* Category 4: ఖాతా (Firebase Auth Aware) */}
                  <div>
                    <span className="block px-2.5 py-1 text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                      ఖాతా (Account)
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {user ? (
                        <>
                          {user.role === 'admin' && (
                            <button
                              onClick={() => handleNavClick('admin')}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-left cursor-pointer transition-colors font-bold"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>అడ్మిన్ ప్యానెల్</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleNavClick('profile')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-[#6F6970]" />
                            <span>నా ప్రొఫైల్</span>
                          </button>
                          <button
                            onClick={() => handleNavClick('library')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#6F6970]" />
                            <span>నా బుక్మార్క్స్</span>
                          </button>
                          <button
                            onClick={() => handleNavClick('library')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] text-left cursor-pointer transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5 text-[#6F6970]" />
                            <span>నా కార్యకలాపాలు</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left cursor-pointer transition-colors font-bold"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>లాగ్ అవుట్ (Logout)</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setIsMoreOpen(false);
                            onOpenAuth();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#7A284B]/10 hover:bg-[#7A284B]/20 text-[#7A284B] dark:bg-[#D87591]/20 dark:text-[#D87591] text-left cursor-pointer transition-colors font-bold"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>లాగిన్ / నమోదు చేసుకోండి</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Search, Library, Write CTA, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50 text-[#17151A] dark:text-[#F7F3EE] transition-colors cursor-pointer"
            title="శోధించండి"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Library Button */}
          <button
            onClick={() => handleNavClick('library')}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              currentTab === 'library'
                ? 'bg-[#7A284B] text-white dark:bg-[#D87591]'
                : 'hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50 text-[#17151A] dark:text-[#F7F3EE]'
            }`}
            title="లైబ్రరీ"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50 text-[#17151A] dark:text-[#F7F3EE] transition-colors cursor-pointer"
            title={darkMode ? 'లైట్ మోడ్' : 'డార్క్ మోడ్'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[#E8E1DA]/50 dark:hover:bg-[#2E2D36]/50 text-[#17151A] dark:text-[#F7F3EE] transition-colors relative cursor-pointer"
              title="నోటిఫికేషన్లు"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#7A284B] dark:bg-[#D87591] ring-2 ring-white dark:ring-[#101014]" />
              )}
            </button>

            <NotificationDrawer
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onMarkRead={onMarkNotificationRead}
            />
          </div>

          {/* Prominent Write CTA */}
          <button
            onClick={onOpenWrite}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>కథ రాయండి</span>
          </button>

          {/* Admin Dashboard Direct Entry */}
          {user && user.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                currentTab === 'admin'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                  : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
              }`}
              title="అడ్మిన్ కంట్రోల్ ప్యానెల్"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>అడ్మిన్ ప్యానెల్</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <button
              onClick={() => handleNavClick('profile')}
              className={`flex items-center gap-2 p-1 rounded-full border transition-all cursor-pointer ${
                currentTab === 'profile'
                  ? 'ring-2 ring-[#7A284B] dark:ring-[#D87591]'
                  : 'border-[#E8E1DA] dark:border-[#2E2D36]'
              }`}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#7A284B] text-[#7A284B] dark:border-[#D87591] dark:text-[#D87591] hover:bg-[#7A284B]/10 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ప్రవేశించు</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
