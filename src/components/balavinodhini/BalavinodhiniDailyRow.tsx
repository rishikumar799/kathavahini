import React from 'react';
import { 
  BookOpen, 
  Orbit, 
  Gamepad2, 
  HelpCircle, 
  Brain, 
  Paintbrush 
} from 'lucide-react';
import { BalavinodhiniTodayConfig, BalavinodhiniTab } from '../../types';

interface BalavinodhiniDailyRowProps {
  todayConfig: BalavinodhiniTodayConfig;
  onOpenStory: () => void;
  onOpenScience: () => void;
  onOpenGame: () => void;
  onOpenQuiz: () => void;
  onOpenRiddle: () => void;
  onOpenCreative: () => void;
}

export const BalavinodhiniDailyRow: React.FC<BalavinodhiniDailyRowProps> = ({
  todayConfig,
  onOpenStory,
  onOpenScience,
  onOpenGame,
  onOpenQuiz,
  onOpenRiddle,
  onOpenCreative,
}) => {
  const dailyCards = [
    {
      id: 'story',
      title: 'ఈరోజు కథ',
      subtitle: 'ప్రత్యేక కథ',
      icon: <BookOpen className="w-5 h-5" />,
      gradient: 'from-[#0d4f3e] to-[#0a352a]',
      border: 'border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      onClick: onOpenStory,
    },
    {
      id: 'science',
      title: 'ఈరోజు విజ్ఞానం',
      subtitle: 'కొత్త విషయం',
      icon: <Orbit className="w-5 h-5" />,
      gradient: 'from-[#133c64] to-[#0d2640]',
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300',
      onClick: onOpenScience,
    },
    {
      id: 'game',
      title: 'ఈరోజు ఆట',
      subtitle: 'ఆడి నేర్చుకోండి',
      icon: <Gamepad2 className="w-5 h-5" />,
      gradient: 'from-[#633a17] to-[#3d230d]',
      border: 'border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300',
      onClick: onOpenGame,
    },
    {
      id: 'quiz',
      title: 'ఈరోజు క్విజ్',
      subtitle: 'మీ జ్ఞానాన్ని పరీక్షించండి',
      icon: <HelpCircle className="w-5 h-5" />,
      gradient: 'from-[#461b6b] to-[#2b1042]',
      border: 'border-purple-500/30 hover:border-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300',
      onClick: onOpenQuiz,
    },
    {
      id: 'riddle',
      title: 'ఈరోజు పొడుపు కథ',
      subtitle: 'ఆలోచించండి',
      icon: <Brain className="w-5 h-5" />,
      gradient: 'from-[#661b2b] to-[#3b0e18]',
      border: 'border-rose-500/30 hover:border-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
      onClick: onOpenRiddle,
    },
    {
      id: 'creative',
      title: 'ఈరోజు సృజనాత్మక పని',
      subtitle: 'గీయండి / రాయండి',
      icon: <Paintbrush className="w-5 h-5" />,
      gradient: 'from-[#104b50] to-[#092d30]',
      border: 'border-teal-500/30 hover:border-teal-400',
      iconBg: 'bg-teal-500/20 text-teal-300',
      onClick: onOpenCreative,
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dailyCards.map((card) => (
          <button
            key={card.id}
            onClick={card.onClick}
            className={`group p-3.5 rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} shadow-lg hover:scale-102 hover:shadow-xl transition-all duration-200 cursor-pointer text-left flex items-center gap-3 relative overflow-hidden`}
          >
            {/* Subtle light effect on hover */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div
              className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold font-serif-telugu text-white leading-tight line-clamp-1">
                {card.title}
              </h4>
              <p className="text-[11px] text-purple-200/70 font-serif-telugu line-clamp-1 mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
