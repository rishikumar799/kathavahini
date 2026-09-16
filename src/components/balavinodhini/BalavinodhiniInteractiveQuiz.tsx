import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { BALAVINODHINI_QUIZ_BANK, BalavinodhiniQuizQuestion } from '../../services/balavinodhiniService';

interface BalavinodhiniInteractiveQuizProps {
  onOpenAllQuizzes?: () => void;
}

export const BalavinodhiniInteractiveQuiz: React.FC<BalavinodhiniInteractiveQuizProps> = ({
  onOpenAllQuizzes,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const question = BALAVINODHINI_QUIZ_BANK[currentIndex];
  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleSelectOption = (optIndex: number) => {
    if (selectedOption !== null) return; // Prevent changing after answer
    setSelectedOption(optIndex);
    if (optIndex === question.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < BALAVINODHINI_QUIZ_BANK.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#1C1635] via-[#16122C] to-[#100C22] border border-pink-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold">🧠</span>
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-white">
              క్విజ్ – మీకు పరీక్ష!
            </h3>
          </div>
          <button
            onClick={onOpenAllQuizzes}
            className="text-xs font-serif-telugu font-semibold text-pink-300 hover:text-pink-200 transition-colors cursor-pointer"
          >
            అన్నీ చూడండి ➔
          </button>
        </div>

        {!isFinished ? (
          <>
            {/* Question */}
            <div className="mb-4">
              <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-white leading-snug">
                {question.question}
              </h4>
            </div>

            {/* Options Grid (2x2 on desktop, or stacked) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === question.correctIndex;
                const showFeedback = selectedOption !== null;

                let btnStyle = 'bg-[#231B45] border-white/10 text-purple-100 hover:bg-[#2C2355] hover:border-pink-500/40';

                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-[#1C1635] border-white/5 text-purple-300/40 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {optionLabels[idx]}
                      </span>
                      <span className="font-semibold truncate">{opt}</span>
                    </div>

                    {showFeedback && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Explanation */}
            {selectedOption !== null && (
              <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-[11px] font-serif-telugu text-purple-200 mb-2">
                💡 <span className="font-bold">వివరణ:</span> {question.explanation}
              </div>
            )}
          </>
        ) : (
          /* Finished Screen */
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
              <Trophy className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold font-serif-telugu text-white">
              క్విజ్ పూర్తయింది! 🎉
            </h4>
            <p className="text-xs font-serif-telugu text-purple-200">
              మీరు <span className="text-amber-300 font-bold text-sm">{BALAVINODHINI_QUIZ_BANK.length}</span> ప్రశ్నలకు గాను{' '}
              <span className="text-emerald-400 font-bold text-sm">{score}</span> మార్కులు సాధించారు!
            </p>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
        {!isFinished ? (
          <>
            <button
              disabled={selectedOption === null}
              onClick={handleNext}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-telugu flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOption !== null
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-105 shadow-md'
                  : 'bg-white/5 text-purple-400/40 cursor-not-allowed'
              }`}
            >
              <span>తదుపరి ప్రశ్న</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold font-serif-telugu text-purple-300/80">
              {currentIndex + 1} / {BALAVINODHINI_QUIZ_BANK.length}
            </span>
          </>
        ) : (
          <button
            onClick={handleRestart}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-serif-telugu flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>మళ్ళీ ఆడండి</span>
          </button>
        )}
      </div>
    </div>
  );
};
