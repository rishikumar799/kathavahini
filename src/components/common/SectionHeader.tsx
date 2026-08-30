import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  teluguTitle?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  teluguTitle,
  subtitle,
  actionText = 'అన్నీ చూడండి',
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between mb-6 pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7A284B] dark:bg-[#D87591]"></span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-telugu tracking-tight text-[#17151A] dark:text-[#F7F3EE]">
            {teluguTitle || title}
          </h2>
          {teluguTitle && title !== teluguTitle && (
            <span className="text-xs uppercase tracking-wider text-[#6F6970] dark:text-[#AAA4AC] font-sans font-medium hidden sm:inline-block">
              ({title})
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer group transition-all"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};
