import React, { useState } from 'react';
import { Sparkles, Trophy, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight } from 'lucide-react';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category?: string;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'భారతదేశ జాతీయ పక్షి ఏది?',
    options: ['నెమలి', 'కోకిల', 'పావురం', 'రామచిలక'],
    correctAnswer: 0,
    explanation: 'నెమలి (Peacock) భారతదేశ జాతీయ పక్షి. దాని అందమైన పించం నాట్యానికి ప్రతీక.',
    category: 'జాతీయ గుర్తులు'
  },
  {
    id: 2,
    question: 'ఆంధ్రప్రదేశ్ అధికారిక రాష్ట్ర వృక్షం ఏది?',
    options: ['మర్రి చెట్టు', 'వేప చెట్టు', 'మామిడి చెట్టు', 'రావి చెట్టు'],
    correctAnswer: 1,
    explanation: 'వేప చెట్టు (Neem tree) ఆంధ్రప్రదేశ్ రాష్ట్ర వృక్షం. ఇది విశేష ఔషధ గుణాలు కలిగి ఉంటుంది.',
    category: 'ఆంధ్రప్రదేశ్'
  },
  {
    id: 3,
    question: 'సూర్యరశ్మి ద్వారా మన శరీరానికి లభించే విటమిన్ ఏది?',
    options: ['విటమిన్ A', 'విటమిన్ B', 'విటమిన్ C', 'విటమిన్ D'],
    correctAnswer: 3,
    explanation: 'ఉదయపు సూర్యకాంతి మన చర్మంపై పడినప్పుడు విటమిన్ D సహజంగా ఉత్పత్తవుతుంది.',
    category: 'సైన్స్ & ఆరోగ్యం'
  },
  {
    id: 4,
    question: 'తెలుగు భాషలో మొత్తం ఎన్ని అచ్చులు ఉన్నాయి?',
    options: ['12', '16', '14', '18'],
    correctAnswer: 1,
    explanation: 'సాంప్రదాయ తెలుగు వర్ణమాలలో "అ" నుండి "అః" వరకు 16 అచ్చులు ఉన్నాయి.',
    category: 'తెలుగు భాష'
  },
  {
    id: 5,
    question: 'సౌర కుటుంబంలో అత్యంత పెద్ద గ్రహం ఏది?',
    options: ['శని (Saturn)', 'బృహస్పతి (Jupiter)', 'భూమి (Earth)', 'కుజుడు (Mars)'],
    correctAnswer: 1,
    explanation: 'బృహస్పతి (Jupiter) మన సౌర కుటుంబంలో అన్నింటికన్నా పెద్ద గ్రహం.',
    category: 'అంతరిక్షం'
  },
];

export const KnowledgeQuizGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQ = DEFAULT_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < DEFAULT_QUESTIONS.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(score * 20);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#16122C] rounded-3xl border border-purple-500/20 text-white shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-purple-100">
            బాలల జ్ఞాన క్విజ్
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-purple-300">
            ప్రశ్న: <strong className="text-white">{currentIndex + 1}</strong> / {DEFAULT_QUESTIONS.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-500/30 text-amber-300 font-bold">
            స్కోర్: {score * 20}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-4">
          {/* Category Tag & Question */}
          <div className="p-4 rounded-2xl bg-[#201A3D] border border-purple-500/30 space-y-2">
            {currentQ.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold font-serif-telugu">
                {currentQ.category}
              </span>
            )}
            <h4 className="text-base sm:text-lg font-bold font-serif-telugu text-white leading-relaxed">
              {currentQ.question}
            </h4>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctAnswer;
              let btnStyle = 'bg-[#251D4A] hover:bg-[#2F265D] border-purple-500/30 text-purple-100';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-200';
                } else {
                  btnStyle = 'bg-[#1D173A] opacity-50 border-purple-900/30 text-purple-300/50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-2xl border text-left font-serif-telugu text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-purple-950/60 text-xs flex items-center justify-center font-bold text-purple-300 border border-purple-500/30">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-400/40 text-xs sm:text-sm font-serif-telugu text-purple-200 space-y-1 animate-fadeIn">
              <strong className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                వివరణ:
              </strong>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIndex < DEFAULT_QUESTIONS.length - 1 ? 'తరువాతి ప్రశ్న' : 'ఫలితాలు చూడండి'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            క్విజ్ పూర్తయింది! 🎉
          </h4>
          <p className="text-sm font-serif-telugu text-purple-200">
            మీరు <strong className="text-amber-300 text-base">{DEFAULT_QUESTIONS.length}</strong> ప్రశ్నలలో <strong className="text-emerald-400 text-base">{score}</strong> సరైన సమాధానాలు చెప్పారు.
          </p>
          <div className="inline-block px-4 py-2 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-lg font-bold font-serif-telugu text-amber-300">
            మొత్తం స్కోర్: {score * 20} / {DEFAULT_QUESTIONS.length * 20}
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
