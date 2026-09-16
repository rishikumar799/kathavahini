import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, HelpCircle, Sparkles, Eye } from 'lucide-react';

interface RiddleItem {
  id: number;
  question: string;
  hint: string;
  options: string[];
  answer: string;
  explanation: string;
}

const RIDDLES_DATA: RiddleItem[] = [
  {
    id: 1,
    question: 'నీట్లో పుట్టి, గాల్లో ఎగురుతా, రంగులతో అందరినీ అలరిస్తా. నేనెవరు?',
    hint: 'స్నానం చేసేటప్పుడు లేదా ఆడుకునేటప్పుడు వస్తుంది.',
    options: ['సబ్బు బుడగ (Soap Bubble)', 'చేప', 'పక్షి', 'వర్షం'],
    answer: 'సబ్బు బుడగ (Soap Bubble)',
    explanation: 'సబ్బు బుడగ నీటిలో తయారై గాలిలోకి ఎగురుతూ రంగులీనుతుంది.'
  },
  {
    id: 2,
    question: 'తోక లేని పిట్ట తొంభై ఆమడలు పోతుంది. ఏమిటది?',
    hint: 'పాతకాలంలో సమాచారం చేరవేసేది.',
    options: ['ఉత్తరం (Letter)', 'బాణం', 'విమానం', 'గాలిపటం'],
    answer: 'ఉత్తరం (Letter)',
    explanation: 'ఉత్తరం (జాబు) ఎక్కడికైనా పోస్ట్ ద్వారా సుదూర ప్రాంతాలకు వెళ్తుంది.'
  },
  {
    id: 3,
    question: 'ఆకాశంలో పుట్టింది, నేలమీద పడింది, చేతిలోకి తీసుకుంటే కరిగిపోయింది. ఏమిటది?',
    hint: 'చలికాలంలో కొండప్రాంతాలలో లేదా వడగళ్ళ వానలో వస్తుంది.',
    options: ['మంచు / వడగళ్ళు (Hail / Snow)', 'నక్షత్రం', 'నీటిచుక్క', 'ఆకు'],
    answer: 'మంచు / వడగళ్ళు (Hail / Snow)',
    explanation: 'మంచు గడ్డలు ఆకాశం నుంచి పడతాయి, మన శరీర వేడికి చేతిలో కరిగిపోతాయి.'
  },
  {
    id: 4,
    question: 'చిన్న రాణిగారికి ఒళ్ళంతా ముళ్ళు. ఏమిటా పండు?',
    hint: 'పండ్లలో అతిపెద్దది, తియ్యగా ఉంటుంది.',
    options: ['పనస పండు (Jackfruit)', 'సీతాఫలం', 'దానిమ్మ', 'అనాస పండు'],
    answer: 'పనస పండు (Jackfruit)',
    explanation: 'పనస కాయ పైభాగం ముళ్ళతో నిండి ఉంటుంది, లోపల తియ్యని తొనలు ఉంటాయి.'
  },
];

export const RiddleChallengeGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const riddle = RIDDLES_DATA[currentIdx];

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);
    if (opt === riddle.answer) {
      setScore(s => s + 25);
    }
  };

  const handleNext = () => {
    if (currentIdx < RIDDLES_DATA.length - 1) {
      setCurrentIdx(c => c + 1);
      setShowHint(false);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(score);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setShowHint(false);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#211B0B] rounded-3xl border border-yellow-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-yellow-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">❓</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-yellow-100">
            పొడుపు కథల ఛాలెంజ్ (Riddle Challenge)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-yellow-300">
            పొడుపు కథ: <strong className="text-white">{currentIdx + 1}</strong> / {RIDDLES_DATA.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-yellow-950/80 border border-yellow-500/30 text-amber-300 font-bold">
            స్కోర్: {score}
          </span>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          {/* Riddle Card */}
          <div className="p-5 rounded-2xl bg-[#362C12] border border-yellow-500/40 space-y-3 shadow-inner">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold font-serif-telugu">
              తెలుగు పొడుపు కథ
            </span>
            <h4 className="text-base sm:text-lg font-bold font-serif-telugu text-white leading-relaxed">
              "{riddle.question}"
            </h4>
          </div>

          {/* Hint Trigger */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHint(true)}
              className="text-xs font-serif-telugu text-amber-300 hover:text-amber-200 underline flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>హింట్ కావాలా? (Click for Hint)</span>
            </button>
            {showHint && (
              <span className="text-xs font-serif-telugu text-amber-200 animate-fadeIn">
                💡 {riddle.hint}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riddle.options.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === riddle.answer;
              let style = 'bg-[#3A3013] hover:bg-[#4D4019] border-yellow-500/30 text-yellow-100';

              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                } else if (isSelected) {
                  style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                } else {
                  style = 'bg-[#1D1708] opacity-50 border-yellow-900/30 text-yellow-300/50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-2xl border font-serif-telugu text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="p-3.5 rounded-2xl bg-yellow-950/80 border border-yellow-400/40 text-xs sm:text-sm font-serif-telugu text-yellow-200 space-y-1 animate-fadeIn">
              <strong className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                వివరణ:
              </strong>
              <p>{riddle.explanation}</p>
            </div>
          )}

          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold font-serif-telugu text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIdx < RIDDLES_DATA.length - 1 ? 'తరువాతి పొడుపు కథ' : 'ఫలితాలు'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-serif-telugu text-white">
            పొడుపు కథల ఛాలెంజ్ పూర్తి చేశారు! 🎉
          </h4>
          <p className="text-sm font-serif-telugu text-yellow-200">
            మీరు సాధించిన స్కోరు: <strong className="text-amber-300 text-lg">{score}</strong> / 100
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold font-serif-telugu text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
