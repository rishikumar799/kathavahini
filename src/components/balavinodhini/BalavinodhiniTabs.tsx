import React from 'react';
import { BalavinodhiniTab } from '../../types';

interface BalavinodhiniTabsProps {
  activeTab: BalavinodhiniTab;
  onTabChange: (tab: BalavinodhiniTab) => void;
  counts?: Partial<Record<BalavinodhiniTab, number>>;
}

export interface TabItem {
  id: BalavinodhiniTab;
  label: string;
  icon: string;
  color?: string;
}

export const BALAVINODHINI_ALL_TABS: TabItem[] = [
  { id: 'home', label: 'హోమ్', icon: '🏠' },
  { id: 'today', label: 'ఈరోజు బాలవినోదిని', icon: '✨' },
  { id: 'stories', label: 'బాలల కథలు', icon: '📖' },
  { id: 'science', label: 'బాల విజ్ఞానం', icon: '🔬' },
  { id: 'jokes', label: 'బాలల హాస్యం', icon: '😂' },
  { id: 'riddles', label: 'పొడుపు కథలు', icon: '🧩' },
  { id: 'games', label: 'తెలివితేటల ఆటలు', icon: '🧠' },
  { id: 'history', label: 'మన చరిత్ర', icon: '🏛️' },
  { id: 'nature', label: 'ప్రకృతి & పర్యావరణం', icon: '🌱' },
  { id: 'culture', label: 'మన సంస్కృతి', icon: '🪔' },
  { id: 'creations', label: 'సృజనాత్మక ప్రపంచం', icon: '🎨' },
  { id: 'poems', label: 'బాలల కవితలు', icon: '✍️' },
  { id: 'learning', label: 'చదువు సరదాగా', icon: '📚' },
  { id: 'fun', label: 'బాల వినోదం', icon: '🎮' },
  { id: 'bedtime', label: 'నిద్రపూట కథలు', icon: '🌙' },
  { id: 'my-creations', label: 'నా సృజనలు', icon: '👤' },
];

export const BalavinodhiniTabs: React.FC<BalavinodhiniTabsProps> = ({
  activeTab,
  onTabChange,
  counts = {},
}) => {
  return (
    <div className="w-full overflow-hidden mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#E8E1DA] dark:scrollbar-thumb-[#2E2D36] no-scrollbar">
        {BALAVINODHINI_ALL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold font-serif-telugu transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#7A284B] text-white dark:bg-[#D87591] shadow-md shadow-[#7A284B]/20 scale-102'
                  : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36] hover:bg-[#FAF7F2] dark:hover:bg-[#23222A]'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#FAF7F2] dark:bg-[#23222A] text-[#6F6970] dark:text-[#AAA4AC]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
