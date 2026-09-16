import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface WordPuzzleItem {
  id: number;
  clue: string;
  category: string;
  targetWord: string;
  scrambledParts: string[];
}

const WORD_PUZZLES: WordPuzzleItem[] = [
  {
    id: 1,
    category: 'రుచికరమైన పండు',
    clue: 'రాజసం ఉట్టిపడే పండ్లలో రాజు (3 అక్షరాలు)',
    targetWord: 'మామిడి',
    scrambledParts: ['డి', 'మా', 'మి'],
  },
  {
    id: 2,
    category: 'పుస్తకం & జ్ఞానం',
    clue: 'మనం చదువుకునే అక్షర భాండాగారం',
    targetWord: 'పుస్తకం',
    scrambledParts: ['కం', 'పు', 'స్త'],
  },
  {
    id: 3,
    category: 'ఆకాశంలో వెన్నెల',
    clue: 'రాత్రిపూట చల్లని వెన్నెల కురిపించే చందమామ',
    targetWord: 'జాబిలి',
    scrambledParts: ['లి', 'జా', 'బి'],
  },
  {
    id: 4,
    category: 'పవిత్ర నది',
    clue: 'దక్షిణ భారతదేశంలో ప్రవహించే జీవనది',
    targetWord: 'గోదావరి',
    scrambledParts: ['రి', 'గో', 'వ', 'దా'],
  },
  {
    id: 5,
    category: 'మహాకావ్యం',
    clue: 'పాండవులు, కౌరవుల ధర్మయుద్ధ కథ',
    targetWord: 'భారతం',
    scrambledParts: ['తం', 'భా', 'ర'],
  },
];

export const WordPuzzleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const puzzle = WORD_PUZZLES[currentIdx];

  const handlePickLetter = (letter: string, index: number) => {
    if (usedIndices.includes(index) || isSuccess !== null) return;
    const newLetters = [...userLetters, letter];
    const newUsed = [...usedIndices, index];
    setUserLetters(newLetters);
    setUsedIndices(newUsed);

    if (newLetters.length === puzzle.scrambledParts.length) {
      const constructed = newLetters.join('');
      if (constructed === puzzle.targetWord) {
        setIsSuccess(true);
        setScore(s => s + 20);
      } else {
        setIsSuccess(false);
      }
    }
  };

  const handleClearLetters = () => {
    setUserLetters([]);
    setUsedIndices([]);
    setIsSuccess(null);
  };

  const handleNext = () => {
    if (currentIdx < WORD_PUZZLES.length - 1) {
      setCurrentIdx(c => c + 1);
      setUserLetters([]);
      setUsedIndices([]);
      setIsSuccess(null);
    } else {
      setCompleted(true);
      onComplete?.(score);
    }
  };

  const handleResetAll = () => {
    setCurrentIdx(0);
    setUserLetters([]);
    setUsedIndices([]);
    setIsSuccess(null);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#211126] rounded-3xl border border-pink-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-pink-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧩</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-pink-100">
            తెలుగు పద పజిల్ (Word Puzzle)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-pink-300">
            పదం: <strong className="text-white">{currentIdx + 1}</strong> / {WORD_PUZZLES.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-pink-950/60 border border-pink-500/30 text-amber-300 font-bold">
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          {/* Clue Box */}
          <div className="p-4 rounded-2xl bg-[#32193A] border border-pink-500/30 space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold font-serif-telugu">
              {puzzle.category}
            </span>
            <p className="text-sm sm:text-base font-serif-telugu font-semibold text-white">
              {puzzle.clue}
            </p>
          </div>

          {/* User Constructed Word Slots */}
          <div className="space-y-2">
            <p className="text-xs font-serif-telugu text-pink-300/80">మీరు రూపొందించిన పదం:</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[64px] p-3 rounded-2xl bg-[#180B1C] border border-pink-500/30">
              {userLetters.length === 0 ? (
                <span className="text-xs sm:text-sm font-serif-telugu text-pink-400/50">
                  కింది అక్షరాలను క్రమంలో నొక్కండి
                </span>
              ) : (
                userLetters.map((char, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white font-bold text-lg sm:text-xl font-serif-telugu flex items-center justify-center shadow-md animate-scaleUp"
                  >
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scrambled Syllable Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-serif-telugu text-pink-300/80">అక్షరాలు ఎంచుకోండి:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {puzzle.scrambledParts.map((letter, idx) => {
                const isUsed = usedIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handlePickLetter(letter, idx)}
                    disabled={isUsed || isSuccess !== null}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border font-bold text-xl sm:text-2xl font-serif-telugu transition-all cursor-pointer shadow-md ${
                      isUsed
                        ? 'bg-pink-950/40 border-pink-900/30 text-pink-500/30 opacity-40 scale-95'
                        : 'bg-[#3A1B43] hover:bg-[#4E245A] border-pink-500/40 text-pink-100 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClearLetters}
              disabled={userLetters.length === 0 || isSuccess === true}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-pink-200 text-xs font-bold font-serif-telugu cursor-pointer disabled:opacity-30"
            >
              మళ్ళీ ప్రయత్నించండి (Clear)
            </button>

            {isSuccess === true && (
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold font-serif-telugu text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  సరైన సమాధానం! 🎉
                </span>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold font-serif-telugu shadow hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIdx < WORD_PUZZLES.length - 1 ? 'తరువాతి పదం' : 'పూర్తయింది'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isSuccess === false && (
              <span className="text-xs sm:text-sm font-bold font-serif-telugu text-rose-400">
                తప్పు క్రమం! "Clear" నొక్కి మళ్ళీ ప్రయత్నించండి.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-500/20 text-pink-400 border border-pink-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            పద పజిల్ అద్భుతంగా పూర్తి చేశారు! 🌟
          </h4>
          <p className="text-sm font-serif-telugu text-pink-200">
            మీరు సాధించిన స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong> / 100
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleResetAll}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>మళ్ళీ ఆడండి</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
