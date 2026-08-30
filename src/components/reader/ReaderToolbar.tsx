import React from 'react';
import { Type, Sun, Moon, BookOpen, Bookmark, Share2 } from 'lucide-react';
import { ReadingTheme } from '../../types';

interface ReaderToolbarProps {
  fontSize: number;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  fontFamily: 'serif' | 'sans';
  setFontFamily: (font: 'serif' | 'sans') => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  fontSize,
  setFontSize,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  isBookmarked,
  onToggleBookmark,
  onShare,
}) => {
  return (
    <div className="sticky top-20 z-20 mx-auto max-w-2xl px-4 py-2.5 rounded-full bg-white/90 dark:bg-[#18181D]/90 backdrop-blur-md border border-[#E8E1DA] dark:border-[#2E2D36] shadow-xl flex items-center justify-between gap-2 text-xs text-[#17151A] dark:text-[#F7F3EE]">
      {/* Font Controls */}
      <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#222229] p-1 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36]">
        <button
          onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
          className="px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 font-bold cursor-pointer"
          title="అక్షర సైజు తగ్గించండి"
        >
          A-
        </button>
        <span className="text-[11px] font-semibold px-1 min-w-[20px] text-center">{fontSize}</span>
        <button
          onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
          className="px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 font-bold cursor-pointer"
          title="అక్షర సైజు పెంచండి"
        >
          A+
        </button>
      </div>

      {/* Font Family Selector */}
      <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#222229] p-1 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36]">
        <button
          onClick={() => setFontFamily('serif')}
          className={`px-2.5 py-1 rounded-full font-serif-telugu font-semibold transition-colors cursor-pointer ${
            fontFamily === 'serif' ? 'bg-[#7A284B] text-white' : 'text-[#6F6970] dark:text-[#AAA4AC]'
          }`}
        >
          సేరిఫ్
        </button>
        <button
          onClick={() => setFontFamily('sans')}
          className={`px-2.5 py-1 rounded-full font-sans-telugu font-semibold transition-colors cursor-pointer ${
            fontFamily === 'sans' ? 'bg-[#7A284B] text-white' : 'text-[#6F6970] dark:text-[#AAA4AC]'
          }`}
        >
          సాన్స్
        </button>
      </div>

      {/* Reading Theme selector: Light, Sepia, Dark */}
      <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#222229] p-1 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36]">
        <button
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            theme === 'light' ? 'bg-[#FAF7F2] text-[#17151A] ring-2 ring-[#7A284B]' : 'text-[#6F6970]'
          }`}
          title="లైట్ థీమ్"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setTheme('sepia')}
          className={`px-2 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
            theme === 'sepia' ? 'bg-[#EFE6DD] text-[#2B231D] ring-2 ring-[#8C3827]' : 'text-[#6F6970]'
          }`}
          title="సెపియా థీమ్"
        >
          సెపియా
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            theme === 'dark' ? 'bg-[#101014] text-[#F7F3EE] ring-2 ring-[#D87591]' : 'text-[#6F6970]'
          }`}
          title="డార్క్ థీమ్"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleBookmark}
          className="p-2 rounded-full hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
          title="దాచుకోండి"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#D99A3D] text-[#D99A3D]' : ''}`} />
        </button>

        <button
          onClick={onShare}
          className="p-2 rounded-full hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
          title="షేర్ చేయండి"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
