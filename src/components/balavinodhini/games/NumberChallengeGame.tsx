import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface NumberPuzzle {
  id: number;
  prompt: string;
  sequence: (number | string)[];
  missingIndex: number;
  options: number[];
  correctAnswer: number;
  explanation: string;
}

const PUZZLES: NumberPuzzle[] = [
  {
    id: 1,
    prompt: 'తప్పిపోయిన సంఖ్యను కనుక్కోండి (2 యొక్క గుణిజాలు):',
    sequence: [2, 4, 6, '?', 10],
    missingIndex: 3,
    options: [7, 8, 9, 12],
    correctAnswer: 8,
    explanation: 'ప్రతి సంఖ్యకు 2 కలుపుతూ వెళ్తున్నారు: 2, 4, 6, 8, 10.'
  },
  {
    id: 2,
    prompt: 'సరైన సంఖ్యను ఎంచుకోండి (5 యొక్క పట్టిక):',
    sequence: [5, 10, '?', 20, 25],
    missingIndex: 2,
    options: [12, 14, 15, 18],
    correctAnswer: 15,
    explanation: '5, 10, 15, 20, 25 అనేది 5 యొక్క గుణిజాల క్రమం.'
  },
  {
    id: 3,
    prompt: 'సంఖ్యల వరుస క్రమాన్ని పూర్తి చేయండి:',
    sequence: [10, 20, 30, 40, '?'],
    missingIndex: 4,
    options: [45, 50, 60, 100],
    correctAnswer: 50,
    explanation: 'ప్రతి సంఖ్యకు 10 కలుపుతున్నారు: 10, 20, 30, 40, 50.'
  },
  {
    id: 4,
    prompt: 'రివర్స్ క్రమం (తగ్గుతున్న సంఖ్యలు):',
    sequence: [20, 18, 16, '?', 12],
    missingIndex: 3,
    options: [15, 14, 13, 10],
    correctAnswer: 14,
    explanation: 'ప్రతి సంఖ్య నుండి 2 తీసివేస్తున్నారు: 20, 18, 16, 14, 12.'
  },
  {
    id: 5,
    prompt: 'వర్గ సంఖ్యల సరదా నమూనా:',
    sequence: [1, 4, 9, '?', 25],
    missingIndex: 3,
    options: [12, 15, 16, 20],
    correctAnswer: 16,
    explanation: '1x1=1, 2x2=4, 3x3=9, 4x4=16, 5x5=25.'
  },
];

export const NumberChallengeGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const puzzle = PUZZLES[currentIdx];

  const handleChoose = (num: number) => {
    if (isAnswered) return;
    setSelectedOpt(num);
    setIsAnswered(true);
    if (num === puzzle.correctAnswer) {
      setScore(s => s + 20);
    }
  };

  const handleNext = () => {
    if (currentIdx < PUZZLES.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(score);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#13172E] rounded-3xl border border-blue-500/20 text-white shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔢</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-blue-100">
            సంఖ్యల సవాలు (Number Challenge)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-blue-300">
            పజిల్: <strong className="text-white">{currentIdx + 1}</strong> / {PUZZLES.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-900/60 border border-blue-500/30 text-amber-300 font-bold">
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          <p className="text-sm sm:text-base font-serif-telugu font-semibold text-blue-200">
            {puzzle.prompt}
          </p>

          {/* Sequence Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 px-2 bg-[#1B2245] rounded-2xl border border-blue-500/30 overflow-x-auto">
            {puzzle.sequence.map((item, idx) => {
              const isMissing = idx === puzzle.missingIndex;
              const displayVal = isMissing && isAnswered ? selectedOpt : item;

              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-2xl transition-all shadow-md ${
                    isMissing
                      ? isAnswered
                        ? selectedOpt === puzzle.correctAnswer
                          ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 scale-105'
                          : 'bg-rose-500/30 border-2 border-rose-400 text-rose-200 scale-105'
                        : 'bg-amber-500/20 border-2 border-dashed border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-blue-950/80 border border-blue-500/30 text-white'
                  }`}
                >
                  {displayVal}
                </div>
              );
            })}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {puzzle.options.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === puzzle.correctAnswer;
              let style = 'bg-[#1E2650] hover:bg-[#28336A] border-blue-500/30 text-blue-100';

              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                } else if (isSelected) {
                  style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                } else {
                  style = 'bg-[#161B3B] opacity-50 border-blue-900/30 text-blue-300/50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChoose(opt)}
                  disabled={isAnswered}
                  className={`py-3.5 rounded-2xl border font-bold text-lg transition-all shadow cursor-pointer ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="p-3.5 rounded-2xl bg-blue-950/80 border border-blue-400/40 text-xs sm:text-sm font-serif-telugu text-blue-200 space-y-1 animate-fadeIn">
              <strong className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                వివరణ:
              </strong>
              <p>{puzzle.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIdx < PUZZLES.length - 1 ? 'తరువాతి పజిల్' : 'ఫలితాలు'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            సంఖ్యల సవాలు ముగిసింది! 🌟
          </h4>
          <p className="text-sm font-serif-telugu text-blue-200">
            మీరు సాధించిన మొత్తం స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong> / 100
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
