import React from 'react';
import { Play } from 'lucide-react';
import { Story } from '../../types';

interface ContinueReadingCardProps {
  story: Story;
  progressPercent: number;
  onContinue: (story: Story) => void;
}

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  story,
  progressPercent,
  onContinue,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#7A284B] to-[#4A152D] text-white rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-[#7A284B]/30">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img
          src={story.coverImage}
          alt={story.teluguTitle}
          className="w-16 h-20 rounded-xl object-cover shrink-0 shadow-md ring-2 ring-white/20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-white/20 text-white">
              చదవడం కొనసాగించండి
            </span>
            <span className="text-xs text-white/80 font-medium">
              {progressPercent}% పూర్తయింది
            </span>
          </div>

          <h3 className="text-lg font-bold font-serif-telugu truncate mb-1">
            {story.teluguTitle}
          </h3>

          <p className="text-xs text-white/80 font-sans truncate">
            రచయిత: {story.author.teluguName}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden mt-3 max-w-xs">
            <div
              className="bg-[#D99A3D] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => onContinue(story)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#7A284B] hover:bg-[#FAF7F2] font-bold text-sm shadow-md transition-all cursor-pointer group shrink-0"
      >
        <span>మళ్లీ ప్రారంభించండి</span>
        <Play className="w-4 h-4 fill-[#7A284B] group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
