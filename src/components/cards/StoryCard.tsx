import React from 'react';
import { Bookmark, Heart, Eye, Clock, Star, Share2 } from 'lucide-react';
import { Story } from '../../types';
import { resolveAvatarUrl } from '../../utils/avatarUtils';
import { resolveContentAuthor, getAuthorDisplayName } from '../../utils/authorResolver';
import { shareContent } from '../../utils/shareUtils';

interface StoryCardProps {
  story: Story;
  onSelect: (story: Story) => void;
  onBookmarkToggle?: (storyId: string, e: React.MouseEvent) => void;
  onLikeToggle?: (storyId: string, e: React.MouseEvent) => void;
  compact?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelect,
  onBookmarkToggle,
  onLikeToggle,
  compact = false,
}) => {
  const resolvedAuthor = resolveContentAuthor(story);
  const authorName = getAuthorDisplayName(resolvedAuthor);
  const authorAvatar = resolveAvatarUrl(resolvedAuthor.avatar, authorName);

  return (
    <div
      onClick={() => onSelect({ ...story, author: resolvedAuthor })}
      className={`group relative flex flex-col bg-[#FFFFFF] dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
        compact ? 'w-64 sm:w-72 shrink-0' : 'w-full'
      }`}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF7F2] dark:bg-[#222229]">
        <img
          src={story.coverImage}
          alt={story.teluguTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-[#18181D]/90 backdrop-blur-md text-[#7A284B] dark:text-[#D87591] shadow-sm">
          {story.category}
        </span>

        {/* Bookmark Button */}
        {onBookmarkToggle && (
          <button
            onClick={(e) => onBookmarkToggle(story.id, e)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
            title="దాచుకోండి"
          >
            <Bookmark
              className={`w-4 h-4 ${
                story.isBookmarked ? 'fill-[#D99A3D] text-[#D99A3D]' : 'text-white'
              }`}
            />
          </button>
        )}

        {/* Rating & Reading Time */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          {story.rating && story.rating > 0 ? (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 text-[#D99A3D] fill-[#D99A3D]" />
              <span>{story.rating.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] text-white/90">
              <span>కొత్త రచన</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>{story.readingTimeMinutes} నిమి</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors line-clamp-1 mb-1">
          {story.teluguTitle}
        </h3>

        {/* Telugu Excerpt */}
        <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] line-clamp-2 leading-relaxed mb-4 flex-1">
          {story.teluguExcerpt}
        </p>

        {/* Footer info: Author & Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
          <div className="flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = resolveAvatarUrl(null, authorName);
              }}
            />
            <span className="text-xs font-medium text-[#17151A] dark:text-[#F7F3EE] truncate max-w-[110px]">
              {authorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
            <span className="flex items-center gap-1" title={`${story.viewCount} వీక్షణలు`}>
              <Eye className="w-3.5 h-3.5" />
              {story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}k` : story.viewCount}
            </span>

            <button
              onClick={(e) => onLikeToggle && onLikeToggle(story.id, e)}
              className="flex items-center gap-1 hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer"
              title="లైక్ చేయండి"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  story.isLiked ? 'fill-[#7A284B] text-[#7A284B] dark:fill-[#D87591] dark:text-[#D87591]' : ''
                }`}
              />
              <span>{story.likeCount}</span>
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                await shareContent({
                  contentType: 'story',
                  id: story.id,
                  title: story.teluguTitle,
                  text: story.teluguExcerpt,
                  coverImage: story.coverImage,
                });
              }}
              className="p-1 text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer"
              title="కథను షేర్ చేయండి"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
