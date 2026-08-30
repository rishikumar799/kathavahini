import React from 'react';
import { UserCheck, UserPlus, BookOpen, Users } from 'lucide-react';
import { Author } from '../../types';

interface AuthorCardProps {
  author: Author;
  onSelect: (author: Author) => void;
  onFollowToggle?: (authorId: string, e: React.MouseEvent) => void;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  onSelect,
  onFollowToggle,
}) => {
  return (
    <div
      onClick={() => onSelect(author)}
      className="group flex flex-col bg-[#FFFFFF] dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="relative shrink-0">
          <img
            src={author.avatar}
            alt={author.teluguName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#7A284B]/20 dark:ring-[#D87591]/20 group-hover:scale-105 transition-transform"
          />
          {author.isVerified && (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7A284B] dark:bg-[#D87591] text-white flex items-center justify-center text-[10px] font-bold shadow"
              title="ధృవీకరించబడిన రచయిత"
            >
              ✓
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors truncate">
            {author.teluguName}
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] truncate font-sans">
            {author.name}
          </p>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
            📍 {author.location || 'ఆంధ్రప్రదేశ్'}
          </p>
        </div>
      </div>

      {/* Bio excerpt */}
      <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-sans-telugu line-clamp-2 leading-relaxed mb-4 flex-1">
        {author.teluguBio}
      </p>

      {/* Stats & Follow Button */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
        <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
            {(author.followersCount / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#D99A3D]" />
            {author.storiesCount} కథలు
          </span>
        </div>

        {onFollowToggle && (
          <button
            onClick={(e) => onFollowToggle(author.id, e)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              author.isFollowing
                ? 'bg-[#E8E1DA] dark:bg-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-red-100 hover:text-red-600'
                : 'bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white shadow-sm'
            }`}
          >
            {author.isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>అనుసరిస్తున్నారు</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>అనుసరించండి</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
