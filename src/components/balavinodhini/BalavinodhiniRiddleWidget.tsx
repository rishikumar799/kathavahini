import React, { useState } from 'react';
import { Puzzle, Sparkles, HelpCircle, RotateCcw } from 'lucide-react';

interface BalavinodhiniRiddleWidgetProps {
  onOpenAllRiddles?: () => void;
}

const SAMPLE_RIDDLES = [
  {
    id: 1,
    question: 'నీట్లో పుట్టి, గాల్లో ఎగురుతా, రంగులతో అందరినీ అలరిస్తా. నేనెవరు?',
    answer: 'సబ్బు బుడగ (Soap Bubble) 🫧',
    hint: 'పిల్లలు గాల్లోకి ఊది ఆడుకుంటారు!',
  },
  {
    id: 2,
    question: 'ఎర్రని టోపీ పెట్టిన పచ్చని చిన్నోడు, తీయని మాటలు పలుకుతాడు. నేనెవరు?',
    answer: 'రామచిలక (Parrot) 🦜',
    hint: 'జామపండ్లు ఇష్టంగా తింటుంది.',
  },
  {
    id: 3,
    question: 'కాళ్ళు లేవు గానీ వేగంగా పాకుతుంది, చెవులు లేవు గానీ రాగాలకు ఊగుతుంది. నేనెవరు?',
    answer: 'పాము (Snake) 🐍',
    hint: 'నాగస్వరానికి నృత్యం చేస్తుంది.',
  },
];

export const BalavinodhiniRiddleWidget: React.FC<BalavinodhiniRiddleWidgetProps> = ({
  onOpenAllRiddles,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const riddle = SAMPLE_RIDDLES[currentIdx];

  const handleNext = () => {
    setIsRevealed(false);
    setCurrentIdx((prev) => (prev + 1) % SAMPLE_RIDDLES.length);
  };

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#241A16] via-[#1B1310] to-[#120B08] border border-amber-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">🧩</span>
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-white">
              పొడుపు కథ
            </h3>
          </div>
          <button
            onClick={onOpenAllRiddles}
            className="text-xs font-serif-telugu font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            అన్నీ చూడండి ➔
          </button>
        </div>

        {/* Riddle Quote Card */}
        <div className="my-3 p-4 rounded-2xl bg-[#2D211B] border border-amber-500/30 text-center relative overflow-hidden shadow-inner">
          <span className="text-4xl text-amber-400/20 font-serif absolute -top-1 left-2">“</span>
          <p className="text-sm sm:text-base font-bold font-serif-telugu text-amber-100 leading-relaxed z-10 relative px-2">
            {riddle.question}
          </p>
          <span className="text-4xl text-amber-400/20 font-serif absolute -bottom-4 right-2">”</span>
        </div>

        {/* Reveal Answer Box */}
        {isRevealed && (
          <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-400/50 text-center animate-fadeIn">
            <span className="text-xs text-amber-200 font-serif-telugu block">సమాధానం:</span>
            <span className="text-base sm:text-lg font-bold font-serif-telugu text-amber-300 block mt-0.5">
              {riddle.answer}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2">
        {!isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <span>💡 సమాధానం చూడండి</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>మరో పొడుపు కథ ➔</span>
          </button>
        )}
      </div>
    </div>
  );
};
