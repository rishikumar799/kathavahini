import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface MathQuestion {
  id: number;
  prompt: string;
  visualEmoji: string;
  countA: number;
  countB: number;
  operator: '+' | '-' | '×';
  options: number[];
  answer: number;
}

const MATH_QUESTIONS: MathQuestion[] = [
  {
    id: 1,
    prompt: '7 తామర పువ్వులకు 5 పువ్వులు కలిపితే మొత్తం ఎన్ని?',
    visualEmoji: '🪷',
    countA: 7,
    countB: 5,
    operator: '+',
    options: [10, 11, 12, 14],
    answer: 12,
  },
  {
    id: 2,
    prompt: 'చెట్టు మీద 15 మామిడి పండ్లు ఉండగా 6 పండ్లు కోశారు. ఇంకా ఎన్ని ఉన్నాయి?',
    visualEmoji: '🥭',
    countA: 15,
    countB: 6,
    operator: '-',
    options: [8, 9, 10, 11],
    answer: 9,
  },
  {
    id: 3,
    prompt: 'ఒక్కో బుట్టలో 4 ఆపిల్స్ ఉన్నాయి. 3 బుట్టల్లో మొత్తం ఎన్ని ఆపిల్స్?',
    visualEmoji: '🍎',
    countA: 4,
    countB: 3,
    operator: '×',
    options: [7, 10, 12, 15],
    answer: 12,
  },
  {
    id: 4,
    prompt: '20 చాక్లెట్లలో 8 చాక్లెట్లు మిత్రులకు పంచారు. మిగిలినవి ఎన్ని?',
    visualEmoji: '🍫',
    countA: 20,
    countB: 8,
    operator: '-',
    options: [10, 11, 12, 14],
    answer: 12,
  },
  {
    id: 5,
    prompt: '6 గుంపులలో ఒక్కోదానిలో 5 నక్షత్రాలు ఉంటే మొత్తం ఎన్ని?',
    visualEmoji: '⭐',
    countA: 6,
    countB: 5,
    operator: '×',
    options: [25, 30, 35, 36],
    answer: 30,
  },
];

export const MathChallengeGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = MATH_QUESTIONS[currentIdx];

  const handleSelect = (val: number) => {
    if (isAnswered) return;
    setSelectedOpt(val);
    setIsAnswered(true);
    if (val === q.answer) {
      setScore(s => s + 20 + streak * 5);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < MATH_QUESTIONS.length - 1) {
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
    setStreak(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#211608] rounded-3xl border border-amber-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">➗</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-amber-100">
            గణిత మాయ (Math Challenge)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-amber-300">
            ప్రశ్న: <strong className="text-white">{currentIdx + 1}</strong> / {MATH_QUESTIONS.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          {/* Question Box */}
          <div className="p-4 rounded-2xl bg-[#33220B] border border-amber-500/30 space-y-2">
            <h4 className="text-base sm:text-lg font-bold font-serif-telugu text-white leading-relaxed">
              {q.prompt}
            </h4>

            {/* Visual Formula */}
            <div className="flex items-center justify-center gap-3 py-3 bg-[#1A1105] rounded-xl font-bold text-xl sm:text-2xl text-amber-200">
              <span>{q.countA}</span>
              <span className="text-amber-400 text-2xl font-black">{q.operator}</span>
              <span>{q.countB}</span>
              <span className="text-amber-400">=</span>
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                ?
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === q.answer;
              let style = 'bg-[#3A270D] hover:bg-[#4E3411] border-amber-500/30 text-amber-100';

              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                } else if (isSelected) {
                  style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                } else {
                  style = 'bg-[#1D1305] opacity-50 border-amber-900/30 text-amber-300/50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  disabled={isAnswered}
                  className={`py-3.5 rounded-2xl border font-bold text-xl transition-all shadow cursor-pointer ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Next Action */}
          {isAnswered && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs sm:text-sm font-bold font-serif-telugu text-amber-200">
                {selectedOpt === q.answer ? '🎉 అద్భుతమైన జవాబు!' : `సరైన సమాధానం: ${q.answer}`}
              </span>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIdx < MATH_QUESTIONS.length - 1 ? 'తరువాతి ప్రశ్న' : 'పూర్తయింది'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            గణిత సవాలును జయించారు! 🏆
          </h4>
          <p className="text-sm font-serif-telugu text-amber-200">
            మీరు సాధించిన మొత్తం స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong>
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
