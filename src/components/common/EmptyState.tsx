import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  teluguTitle: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  teluguTitle,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#FFFFFF] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] my-6">
      <div className="w-14 h-14 rounded-full bg-[#FAF7F2] dark:bg-[#222229] flex items-center justify-center text-[#7A284B] dark:text-[#D87591] mb-4 shadow-sm">
        {icon || <BookOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1">
        {teluguTitle}
      </h3>
      <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] uppercase tracking-wider mb-2 font-medium">
        {title}
      </p>
      <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
