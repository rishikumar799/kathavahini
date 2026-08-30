import React from 'react';

interface ReadingProgressProps {
  progressPercent: number;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ progressPercent }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#E8E1DA]/40 dark:bg-[#2E2D36]/40">
      <div
        className="h-full bg-gradient-to-r from-[#7A284B] to-[#D99A3D] transition-all duration-150"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};
