import React from 'react';
import { 
  Heart, Users, Smile, Compass, Zap, Laugh, Key, ShieldAlert, Sparkles, BookOpen, Moon, Feather 
} from 'lucide-react';
import { StoryCategory } from '../../types';

interface CategoryCardProps {
  category: {
    name: StoryCategory;
    description: string;
    icon: string;
    count: number;
  };
  onSelect: (categoryName: StoryCategory) => void;
  selected?: boolean;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Heart': return <Heart className="w-5 h-5" />;
    case 'Users': return <Users className="w-5 h-5" />;
    case 'Smile': return <Smile className="w-5 h-5" />;
    case 'Compass': return <Compass className="w-5 h-5" />;
    case 'Zap': return <Zap className="w-5 h-5" />;
    case 'Laugh': return <Laugh className="w-5 h-5" />;
    case 'Key': return <Key className="w-5 h-5" />;
    case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
    case 'Sparkles': return <Sparkles className="w-5 h-5" />;
    case 'BookOpen': return <BookOpen className="w-5 h-5" />;
    case 'Moon': return <Moon className="w-5 h-5" />;
    case 'Feather': return <Feather className="w-5 h-5" />;
    default: return <BookOpen className="w-5 h-5" />;
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onSelect,
  selected = false,
}) => {
  return (
    <div
      onClick={() => onSelect(category.name)}
      className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        selected
          ? 'bg-[#7A284B] dark:bg-[#D87591] text-white border-transparent shadow-lg scale-[1.02]'
          : 'bg-[#FFFFFF] dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B]/40 hover:shadow-md'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          selected
            ? 'bg-white/20 text-white'
            : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#7A284B] dark:text-[#D87591] group-hover:bg-[#7A284B] group-hover:text-white'
        }`}
      >
        {getIconComponent(category.icon)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`font-bold font-serif-telugu text-sm sm:text-base truncate ${
              selected ? 'text-white' : 'text-[#17151A] dark:text-[#F7F3EE]'
            }`}
          >
            {category.name}
          </h4>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              selected
                ? 'bg-white/20 text-white'
                : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] dark:text-[#AAA4AC]'
            }`}
          >
            {category.count}
          </span>
        </div>
        <p
          className={`text-xs font-sans-telugu truncate mt-0.5 ${
            selected ? 'text-white/80' : 'text-[#6F6970] dark:text-[#AAA4AC]'
          }`}
        >
          {category.description}
        </p>
      </div>
    </div>
  );
};
