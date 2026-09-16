import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, Heart, Share2, Copy, Check } from 'lucide-react';
import { BalavinodhiniItem } from '../../types';

interface BalavinodhiniRiddleCardProps {
  item: BalavinodhiniItem;
  onLikeToggle: (itemId: string) => void;
  onShare: (item: BalavinodhiniItem) => void;
}

export const BalavinodhiniRiddleCard: React.FC<BalavinodhiniRiddleCardProps> = ({
  item,
  onLikeToggle,
  onShare,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🧩 పొడుపు కథ:\n${item.content}\n\nసమాధానం: ${item.riddleAnswer || 'తెలుసుకోండి!'}\n— కథావాహిని బాలవినోదిని`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-500/5 via-white to-orange-500/5 dark:from-[#231E17] dark:via-[#18181D] dark:to-[#221B17] border border-amber-500/20 dark:border-amber-500/30 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E1DA]/50 dark:border-[#2E2D36]/50">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-lg">
            🧩
          </span>
          <div>
            <span className="text-xs font-bold font-serif-telugu text-amber-700 dark:text-amber-400">
              {item.subcategoryId || 'పొడుపు కథ'}
            </span>
            <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] block font-serif-telugu">
              {item.difficulty || 'సులభం'}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-[#F7F3EE] hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-xs flex items-center gap-1 font-serif-telugu"
          title="కాపీ చేయండి"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{copied ? 'కాపీ అయింది!' : 'కాపీ'}</span>
        </button>
      </div>

      {/* Riddle Question Body */}
      <div className="py-4 space-y-3">
        <h4 className="text-sm font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
          {item.teluguTitle || item.title}
        </h4>
        <p className="text-base sm:text-lg font-serif-telugu font-medium text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
          "{item.content}"
        </p>
      </div>

      {/* Answer Reveal Box */}
      <div className="mt-2 pt-3 border-t border-[#E8E1DA]/50 dark:border-[#2E2D36]/50">
        {showAnswer ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 animate-fadeIn flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider block font-serif-telugu text-emerald-600 dark:text-emerald-400">
                సమాధానం:
              </span>
              <span className="text-base font-bold font-serif-telugu">
                {item.riddleAnswer || 'సమాధానం వివరాల్లో ఉంది!'}
              </span>
            </div>
            <button
              onClick={() => setShowAnswer(false)}
              className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
              title="దాచండి"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold font-serif-telugu text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>🤔 సమాధానం చూడండి</span>
          </button>
        )}

        {/* Footer Likes & Share */}
        <div className="mt-3 flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <button
            onClick={() => onLikeToggle(item.id)}
            className={`flex items-center gap-1.5 p-1 rounded-md transition-colors cursor-pointer ${
              item.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-current' : ''}`} />
            <span>{item.likeCount || 0} లైక్స్</span>
          </button>

          <button
            onClick={() => onShare(item)}
            className="flex items-center gap-1 p-1 hover:text-[#17151A] dark:hover:text-[#F7F3EE] transition-colors cursor-pointer font-serif-telugu"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>షేర్</span>
          </button>
        </div>
      </div>
    </div>
  );
};
