import React from 'react';
import { 
  BookOpen, 
  FlaskConical, 
  Smile, 
  Puzzle, 
  Gamepad2, 
  Landmark, 
  Leaf, 
  Flame, 
  Pencil, 
  Lightbulb, 
  Moon, 
  Palette, 
  LayoutGrid 
} from 'lucide-react';
import { BalavinodhiniTab } from '../../types';

interface BalavinodhiniCategoryGridProps {
  activeTab: BalavinodhiniTab;
  onSelectTab: (tab: BalavinodhiniTab) => void;
  categoryCounts?: Record<string, number>;
}

interface CategoryItem {
  id: BalavinodhiniTab;
  label: string;
  icon: React.ReactNode;
  bgGradient: string;
  iconColor: string;
  borderColor: string;
}

export const BalavinodhiniCategoryGrid: React.FC<BalavinodhiniCategoryGridProps> = ({
  activeTab,
  onSelectTab,
  categoryCounts = {},
}) => {
  const categories: CategoryItem[] = [
    {
      id: 'stories',
      label: 'కథలు',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-blue-600/20 to-cyan-600/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    },
    {
      id: 'science',
      label: 'విజ్ఞానం',
      icon: <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-teal-600/20 to-emerald-600/20',
      iconColor: 'text-teal-300',
      borderColor: 'border-teal-500/30 hover:border-teal-400',
    },
    {
      id: 'jokes',
      label: 'హాస్యం',
      icon: <Smile className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-yellow-600/20 to-amber-600/20',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30 hover:border-yellow-400',
    },
    {
      id: 'riddles',
      label: 'పొడుపు కథలు',
      icon: <Puzzle className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-green-600/20 to-lime-600/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/30 hover:border-green-400',
    },
    {
      id: 'games',
      label: 'ఆటలు',
      icon: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-purple-600/20 to-fuchsia-600/20',
      iconColor: 'text-purple-300',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
    },
    {
      id: 'history',
      label: 'చరిత్ర',
      icon: <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-emerald-700/20 to-teal-700/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    },
    {
      id: 'nature',
      label: 'ప్రకృతి',
      icon: <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-green-600/20 to-emerald-600/20',
      iconColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    },
    {
      id: 'culture',
      label: 'సంస్కృతి',
      icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-amber-600/20 to-orange-600/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
    },
    {
      id: 'poems',
      label: 'కవితలు',
      icon: <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-pink-600/20 to-rose-600/20',
      iconColor: 'text-pink-400',
      borderColor: 'border-pink-500/30 hover:border-pink-400',
    },
    {
      id: 'learning',
      label: 'చదువు సరదాగా',
      icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-yellow-600/20 to-orange-600/20',
      iconColor: 'text-yellow-300',
      borderColor: 'border-yellow-500/30 hover:border-yellow-400',
    },
    {
      id: 'bedtime',
      label: 'నిద్రపాట కథలు',
      icon: <Moon className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-indigo-600/20 to-purple-600/20',
      iconColor: 'text-indigo-300',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
    },
    {
      id: 'creations',
      label: 'సృజనాత్మక ప్రపంచం',
      icon: <Palette className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-rose-600/20 to-purple-600/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
    },
    {
      id: 'today',
      label: 'మరిన్ని',
      icon: <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgGradient: 'from-sky-600/20 to-blue-600/20',
      iconColor: 'text-sky-300',
      borderColor: 'border-sky-500/30 hover:border-sky-400',
    },
  ];

  return (
    <div className="w-full mb-8">
      {/* 12+ Category Icons Container with smooth scrollbar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#171333]/90 border border-purple-500/20 backdrop-blur-md shadow-xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-2 sm:gap-2.5">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectTab(cat.id)}
                className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center relative ${
                  isActive
                    ? 'bg-gradient-to-b from-purple-500/30 to-pink-500/20 border-pink-400 shadow-lg shadow-pink-500/20 scale-105 ring-2 ring-pink-400/40'
                    : `bg-[#1E1940]/70 ${cat.borderColor} hover:bg-[#25204E] hover:scale-102`
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center mb-1.5 shadow-inner transition-transform group-hover:scale-110`}
                >
                  <span className={cat.iconColor}>{cat.icon}</span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold font-serif-telugu text-purple-100/90 group-hover:text-white line-clamp-1">
                  {cat.label}
                </span>
                {categoryCounts[cat.id] ? (
                  <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/40 text-purple-200">
                    {categoryCounts[cat.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
