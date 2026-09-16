import React from 'react';
import { Heart, Clock, Bookmark, MessageCircle, Share2, BookOpen, Volume2 } from 'lucide-react';
import { BalavinodhiniItem } from '../../types';

interface BalavinodhiniStoryCardProps {
  item: BalavinodhiniItem;
  onSelect: (item: BalavinodhiniItem) => void;
  onLikeToggle: (itemId: string) => void;
  onBookmarkToggle?: (itemId: string) => void;
  onShare: (item: BalavinodhiniItem) => void;
  isBookmarked?: boolean;
  onOpenCreatorProfile?: (authorName: string, authorBio?: string, authorAvatar?: string) => void;
}

export const BalavinodhiniStoryCard: React.FC<BalavinodhiniStoryCardProps> = ({
  item,
  onSelect,
  onLikeToggle,
  onBookmarkToggle,
  onShare,
  isBookmarked = false,
  onOpenCreatorProfile,
}) => {
  const getAgeBadge = (ageGroup: string) => {
    switch (ageGroup) {
      case '4-6': return { label: '4–6 సం.', color: 'from-amber-400 to-orange-500' };
      case '7-9': return { label: '7–9 సం.', color: 'from-orange-500 to-pink-500' };
      case '10-12': return { label: '10–12 సం.', color: 'from-purple-500 to-indigo-500' };
      case '13-15': return { label: '13–15 సం.', color: 'from-blue-500 to-cyan-500' };
      default: return { label: 'అందరికీ', color: 'from-pink-500 to-purple-600' };
    }
  };

  const ageBadge = getAgeBadge(item.ageGroup);

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-[#1D183B] border border-purple-500/20 hover:border-pink-500/40 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Top Image & Floating Badges */}
      <div 
        onClick={() => onSelect(item)}
        className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#241E47] cursor-pointer"
      >
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.teluguTitle || item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            📖
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D183B] via-transparent to-black/30 pointer-events-none" />

        {/* Top Right Age Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${ageBadge.color} shadow-md flex items-center gap-1`}>
            <span>🌟</span>
            <span>{ageBadge.label}</span>
          </span>
        </div>

        {/* Audio badge */}
        {item.audioUrl && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="p-1.5 rounded-full bg-emerald-500/90 text-white text-[11px] shadow-md flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Metadata Row: Reading Time & Subcategory */}
          <div className="flex items-center gap-2 text-[11px] font-serif-telugu">
            <span className="flex items-center gap-1 text-purple-300/80">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{item.readingTimeMinutes || 3} నిమిషాలు</span>
            </span>
            <span className="text-purple-400/40">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-pink-300 border border-purple-500/30">
              {item.subcategoryId || 'బాలల కథ'}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(item)}
            className="text-base sm:text-lg font-bold font-serif-telugu text-white group-hover:text-pink-300 transition-colors line-clamp-1 cursor-pointer leading-snug"
          >
            {item.teluguTitle || item.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs sm:text-sm text-purple-200/70 font-serif-telugu line-clamp-2 leading-relaxed">
            {item.teluguDescription || item.description || item.content.slice(0, 100)}
          </p>
        </div>

        {/* Card Footer: Likes, Comments, Bookmark */}
        <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Likes */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle(item.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                item.isLiked ? 'text-pink-400' : 'text-purple-300/70 hover:text-pink-400'
              }`}
              title="లైక్ చేయండి"
            >
              <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current text-pink-500' : ''}`} />
              <span>{item.likeCount || 0}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => onSelect(item)}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/70 hover:text-purple-200 cursor-pointer"
              title="వ్యాఖ్యలు"
            >
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span>{item.commentCount || 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bookmark */}
            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(item.id);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-purple-300/70 hover:text-amber-400 hover:bg-white/5'
                }`}
                title="బుక్‌మార్క్ చేయండి"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-400' : ''}`} />
              </button>
            )}

            {/* Read Button */}
            <button
              onClick={() => onSelect(item)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold font-serif-telugu hover:scale-105 transition-transform cursor-pointer shadow-md"
            >
              చదవండి
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

