import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

interface LogicQuestion {
  id: number;
  prompt: string;
  patternDisplay: string[];
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
}

const LOGIC_QUESTIONS: LogicQuestion[] = [
  {
    id: 1,
    prompt: 'సరైన ఆకృతి నమూనాను పూర్తి చేయండి:',
    patternDisplay: ['🔴', '🟦', '🔴', '🟦', '🔴', '?'],
    options: [
      { label: '🟦 (నీలం చతురస్రం)', isCorrect: true },
      { label: '🔴 (ఎరుపు వృత్తం)', isCorrect: false },
      { label: '⭐ (నక్షత్రం)', isCorrect: false },
      { label: '🟢 (ఆకుపచ్చ వృత్తం)', isCorrect: false },
    ],
    explanation: 'ఎరుపు మరియు నీలం ఆకారాలు వరుసగా మారుతూ వస్తున్నాయి (AB AB AB నమూనా).'
  },
  {
    id: 2,
    prompt: 'జంతువు - నివాసం సరిపోల్చే లాజిక్: పక్షి : గూడు :: సింహం : ?',
    patternDisplay: ['🐦 ➔ 🪹', '🦁 ➔ ?'],
    options: [
      { label: 'గుహ (Den)', isCorrect: true },
      { label: 'చెట్టు కొమ్మ (Branch)', isCorrect: false },
      { label: 'నీరు (Water)', isCorrect: false },
      { label: 'గూడు (Nest)', isCorrect: false },
    ],
    explanation: 'పక్షి గూటిలో నివసిస్తుంది, సింహం గుహలో నివసిస్తుంది.'
  },
  {
    id: 3,
    prompt: 'పరిమాణ క్రమం (చిన్నది నుండి పెద్దది): చీమ, కుందేలు, జింక, ?',
    patternDisplay: ['🐜 ➔ 🐇 ➔ 🦌 ➔ ?'],
    options: [
      { label: '🐘 ఏనుగు (Elephant)', isCorrect: true },
      { label: '🦟 దోమ (Mosquito)', isCorrect: false },
      { label: '🐸 కప్ప (Frog)', isCorrect: false },
      { label: '🐿️ ఉడుత (Squirrel)', isCorrect: false },
    ],
    explanation: 'జంతువుల పరిమాణం క్రమంగా పెరుగుతోంది. జింక కంటే పెద్ద జంతువు ఏనుగు.'
  },
  {
    id: 4,
    prompt: 'త్రాసు పజిల్: 1 మామిడి పండు = 2 ఆపిల్స్. 2 మామిడి పండ్లు = ఎన్ని ఆపిల్స్?',
    patternDisplay: ['🥭 = 🍎🍎', '🥭🥭 = ?'],
    options: [
      { label: '4 ఆపిల్స్ (🍎🍎🍎🍎)', isCorrect: true },
      { label: '3 ఆపిల్స్ (🍎🍎🍎)', isCorrect: false },
      { label: '2 ఆపిల్స్ (🍎🍎)', isCorrect: false },
      { label: '5 ఆపిల్స్ (🍎🍎🍎🍎🍎)', isCorrect: false },
    ],
    explanation: 'ఒక్కో మామిడికి 2 ఆపిల్స్ సమానం కాబట్టి, 2 × 2 = 4 ఆపిల్స్.'
  },
];

export const LogicPuzzleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = LOGIC_QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (q.options[idx].isCorrect) {
      setScore(s => s + 25);
    }
  };

  const handleNext = () => {
    if (currentIdx < LOGIC_QUESTIONS.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(score);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#210D1D] rounded-3xl border border-rose-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-rose-100">
            మేధస్సుకు పదును (Logic Puzzle)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-rose-300">
            సవాలు: <strong className="text-white">{currentIdx + 1}</strong> / {LOGIC_QUESTIONS.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/30 text-amber-300 font-bold">
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          <h4 className="text-base sm:text-lg font-bold font-serif-telugu text-white leading-relaxed">
            {q.prompt}
          </h4>

          {/* Pattern Visualization */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-4 bg-[#34142F] rounded-2xl border border-rose-500/30 text-2xl sm:text-3xl">
            {q.patternDisplay.map((item, idx) => (
              <span key={idx} className="p-2 bg-[#1A0A17] rounded-xl border border-rose-500/20 shadow-sm">
                {item}
              </span>
            ))}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              let style = 'bg-[#3A1734] hover:bg-[#4D1E45] border-rose-500/30 text-rose-100';

              if (isAnswered) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                } else if (isSelected) {
                  style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                } else {
                  style = 'bg-[#1C0B19] opacity-50 border-rose-900/30 text-rose-300/50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-2xl border font-serif-telugu text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <span>{opt.label}</span>
                  {isAnswered && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400/40 text-xs sm:text-sm font-serif-telugu text-rose-200 space-y-1 animate-fadeIn">
              <strong className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                లాజిక్ వివరణ:
              </strong>
              <p>{q.explanation}</p>
            </div>
          )}

          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIdx < LOGIC_QUESTIONS.length - 1 ? 'తరువాతి సవాలు' : 'ఫలితాలు'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            లాజిక్ పజిల్స్ పూర్తి చేశారు! 🌟
          </h4>
          <p className="text-sm font-serif-telugu text-rose-200">
            మీ తార్కిక ఆలోచన స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong> / 100
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
