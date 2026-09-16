import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, CheckCircle2, XCircle, Zap, Timer, Award } from 'lucide-react';

interface QuickQuestion {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const SPEED_QUESTIONS: QuickQuestion[] = [
  {
    id: 1,
    statement: 'సూర్యుడు ప్రతిరోజూ తూర్పు దిక్కున ఉదయిస్తాడు.',
    isTrue: true,
    explanation: 'నిజం! భూమి పడమర నుండి తూర్పునకు తిరుగుతుండటం వల్ల సూర్యుడు తూర్పున ఉదయిస్తాడు.'
  },
  {
    id: 2,
    statement: 'చేపలు గాలిలో ఎగురుతూ చెట్లపై గూళ్ళు కడతాయి.',
    isTrue: false,
    explanation: 'అబద్ధం! చేపలు నీటిలో మాత్రమే నివసిస్తాయి, మొప్పల ద్వారా శ్వాసిస్తాయి.'
  },
  {
    id: 3,
    statement: 'తామర పువ్వు భారతదేశ జాతీయ పుష్పం.',
    isTrue: true,
    explanation: 'నిజం! పవిత్రమైన తామర పుష్పం భారత జాతీయ పువ్వు.'
  },
  {
    id: 4,
    statement: 'చంద్రుడికి స్వంత కాంతి ఉంటుంది, రాత్రి పూట తానే వెలుగునిస్తాడు.',
    isTrue: false,
    explanation: 'అబద్ధం! చంద్రుడు సూర్యుని కాంతిని పరావర్తనం చెందించడం వల్ల వెలుగుతాడు.'
  },
  {
    id: 5,
    statement: 'ఆకులు ఆకుపచ్చగా ఉండటానికి పత్రహరితం (Chlorophyll) కారణం.',
    isTrue: true,
    explanation: 'నిజం! క్లోరోఫిల్ సూర్యకాంతిని గ్రహించి మొక్కలకు ఆహారాన్ని తయారుచేస్తుంది.'
  },
];

export const QuickQuizGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [completed, setCompleted] = useState(false);

  const q = SPEED_QUESTIONS[currentIdx];

  useEffect(() => {
    if (completed || feedback !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(null); // timed out
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, completed, feedback]);

  const handleAnswer = (userChoice: boolean | null) => {
    const isCorrect = userChoice === q.isTrue;
    if (isCorrect) {
      setScore(s => s + 20);
      setFeedback({ isCorrect: true, text: '🎉 సరైన సమాధానం!' });
    } else {
      setFeedback({ isCorrect: false, text: `తప్పు! ${q.explanation}` });
    }

    setTimeout(() => {
      if (currentIdx < SPEED_QUESTIONS.length - 1) {
        setCurrentIdx(c => c + 1);
        setTimeLeft(15);
        setFeedback(null);
      } else {
        setCompleted(true);
        onComplete?.(score + (isCorrect ? 20 : 0));
      }
    }, 1500);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setTimeLeft(15);
    setScore(0);
    setFeedback(null);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#160E2A] rounded-3xl border border-indigo-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-indigo-100">
            తళుకుబెళుకుల క్విజ్ (Speed Quiz)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="px-3 py-1 rounded-xl bg-indigo-900/60 border border-indigo-500/30 text-cyan-300 font-bold flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            {timeLeft}s
          </span>
          <span className="px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-amber-300 font-bold">
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-indigo-950 rounded-full h-2 overflow-hidden border border-indigo-500/20">
            <div
              className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / SPEED_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Statement Box */}
          <div className="p-6 rounded-2xl bg-[#231742] border border-indigo-500/30 text-center space-y-3 shadow-inner">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-serif-telugu">
              ప్రశ్న {currentIdx + 1} / {SPEED_QUESTIONS.length}
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-serif-telugu text-white leading-relaxed">
              "{q.statement}"
            </h4>
          </div>

          {/* True / False Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={feedback !== null}
              className="py-4 sm:py-5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border-2 border-emerald-400 text-emerald-200 font-bold font-serif-telugu text-lg sm:text-xl transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              ✓ నిజం (True)
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={feedback !== null}
              className="py-4 sm:py-5 rounded-2xl bg-rose-600/30 hover:bg-rose-600/50 border-2 border-rose-400 text-rose-200 font-bold font-serif-telugu text-lg sm:text-xl transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              ✗ అబద్ధం (False)
            </button>
          </div>

          {/* Feedback Overlay */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-serif-telugu font-semibold animate-fadeIn ${
                feedback.isCorrect
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-400 text-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            స్పీడ్ క్విజ్ ముగిసింది! ⚡
          </h4>
          <p className="text-sm font-serif-telugu text-indigo-200">
            మీరు సాధించిన వేగవంతమైన స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong> / 100
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
