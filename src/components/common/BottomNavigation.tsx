import React from 'react';
import { Home, Compass, Bookmark, Feather, User as UserIcon } from 'lucide-react';

interface BottomNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenWrite: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenWrite,
}) => {
  const tabs = [
    { id: 'home', label: 'హోమ్', icon: <Home className="w-5 h-5" /> },
    { id: 'stories', label: 'అన్వేషణ', icon: <Compass className="w-5 h-5" /> },
    { id: 'write', label: 'రాయండి', icon: <Feather className="w-5 h-5" />, isAction: true },
    { id: 'library', label: 'లైబ్రరీ', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'profile', label: 'ప్రొఫైల్', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#101014]/95 backdrop-blur-md border-t border-[#E8E1DA] dark:border-[#2E2D36] px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenWrite}
                className="flex flex-col items-center justify-center -mt-5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#7A284B] dark:bg-[#D87591] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <Feather className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#7A284B] dark:text-[#D87591] font-serif-telugu mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#7A284B] dark:text-[#D87591] font-bold'
                  : 'text-[#6F6970] dark:text-[#AAA4AC]'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-serif-telugu mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
