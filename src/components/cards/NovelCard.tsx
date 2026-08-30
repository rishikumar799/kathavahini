import React from 'react';
import { BookOpen, Star, Bookmark } from 'lucide-react';
import { Novel } from '../../types';

interface NovelCardProps {
  novel: Novel;
  onSelect: (novel: Novel) => void;
  onBookmarkToggle?: (novelId: string, e: React.MouseEvent) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onSelect,
  onBookmarkToggle,
}) => {
  return (
    <div
      onClick={() => onSelect(novel)}
      className="group relative flex bg-[#FFFFFF] dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] p-3.5 gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Book Cover Style Aspect Ratio */}
      <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden shrink-0 shadow-md bg-[#FAF7F2] dark:bg-[#222229]">
        <img
          src={novel.coverImage}
          alt={novel.teluguTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Novel Status Badge */}
        <span
          className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
            novel.status === 'ongoing' ? 'bg-[#D99A3D]' : 'bg-[#3E8065]'
          }`}
        >
          {novel.status === 'ongoing' ? 'కొనసాగుతోంది' : 'పూర్తయింది'}
        </span>
      </div>

      {/* Novel Details */}
      <div className="flex flex-col flex-1 justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-[#7A284B] dark:text-[#D87591]">
              {novel.category}
            </span>
            {onBookmarkToggle && (
              <button
                onClick={(e) => onBookmarkToggle(novel.id, e)}
                className="p-1 text-[#6F6970] hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer"
              >
                <Bookmark className={`w-4 h-4 ${novel.isBookmarked ? 'fill-[#D99A3D] text-[#D99A3D]' : ''}`} />
              </button>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors line-clamp-1 mb-1">
            {novel.teluguTitle}
          </h3>

          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] line-clamp-2 leading-relaxed mb-2 font-sans">
            {novel.teluguDescription}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={novel.author.avatar}
              alt={novel.author.teluguName}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-[#17151A] dark:text-[#F7F3EE] font-medium truncate">
              {novel.author.teluguName}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 border-t border-[#E8E1DA]/50 dark:border-[#2E2D36]/50">
            <span className="flex items-center gap-1 font-medium text-[#7A284B] dark:text-[#D87591]">
              <BookOpen className="w-3.5 h-3.5" />
              {novel.chaptersCount} అధ్యాయాలు
            </span>

            <span className="flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 text-[#D99A3D] fill-[#D99A3D]" />
              {novel.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
