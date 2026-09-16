import React, { useState } from 'react';
import { Volume2, RotateCcw, Trophy, CheckCircle2, Sparkles } from 'lucide-react';

interface LetterPair {
  id: number;
  letter: string;
  word: string;
  meaning: string;
  emoji: string;
}

const LETTER_PAIRS: LetterPair[] = [
  { id: 1, letter: 'అ', word: 'అమ్మ', meaning: 'Mother', emoji: '👩‍👧' },
  { id: 2, letter: 'ఆ', word: 'ఆవు', meaning: 'Cow', emoji: '🐄' },
  { id: 3, letter: 'ఇ', word: 'ఇల్లు', meaning: 'House', emoji: '🏠' },
  { id: 4, letter: 'ఈ', word: 'ఈగ', meaning: 'Fly', emoji: '🪰' },
  { id: 5, letter: 'ఉ', word: 'ఉడుత', meaning: 'Squirrel', emoji: '🐿️' },
  { id: 6, letter: 'ఊ', word: 'ఊయల', meaning: 'Cradle', emoji: '🪤' },
];

export const TeluguLetterMatchGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [selectedLetter, setSelectedLetter] = useState<LetterPair | null>(null);
  const [selectedWord, setSelectedWord] = useState<LetterPair | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Play audio using native browser SpeechSynthesis (free browser API)
  const speakTelugu = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'te-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectLetter = (pair: LetterPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedLetter(pair);
    speakTelugu(pair.letter);

    if (selectedWord) {
      checkMatch(pair, selectedWord);
    }
  };

  const handleSelectWord = (pair: LetterPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedWord(pair);
    speakTelugu(pair.word);

    if (selectedLetter) {
      checkMatch(selectedLetter, pair);
    }
  };

  const checkMatch = (letterPair: LetterPair, wordPair: LetterPair) => {
    if (letterPair.id === wordPair.id) {
      const nextMatched = [...matchedIds, letterPair.id];
      setMatchedIds(nextMatched);
      setScore(s => s + 20);
      setSelectedLetter(null);
      setSelectedWord(null);

      if (nextMatched.length === LETTER_PAIRS.length) {
        setIsWon(true);
        onComplete?.(120);
      }
    } else {
      setTimeout(() => {
        setSelectedLetter(null);
        setSelectedWord(null);
      }, 700);
    }
  };

  const handleReset = () => {
    setSelectedLetter(null);
    setSelectedWord(null);
    setMatchedIds([]);
    setScore(0);
    setIsWon(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#0E1E1E] rounded-3xl border border-teal-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-teal-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔤</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-teal-100">
            తెలుగు అక్షరాలు - బొమ్మల జత
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-teal-300">
            పూర్తయినవి: <strong className="text-white">{matchedIds.length}</strong> / {LETTER_PAIRS.length}
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 cursor-pointer"
            title="రీసెట్"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-serif-telugu text-teal-200/80 mb-4">
        ఎడమ వైపు తెలుగు అక్షరాన్ని నొక్కి, కుడి వైపు దానికి సరిపోయే పదాన్ని ఎంచుకోండి!
      </p>

      {/* Columns Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 my-2">
        {/* Left: Letters */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-serif-telugu text-teal-400 uppercase tracking-wider text-center">
            అక్షరాలు (Letters)
          </h4>
          <div className="space-y-2.5">
            {LETTER_PAIRS.map(pair => {
              const isMatched = matchedIds.includes(pair.id);
              const isSelected = selectedLetter?.id === pair.id;

              return (
                <button
                  key={pair.id}
                  onClick={() => handleSelectLetter(pair)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-2xl border font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 opacity-60'
                      : isSelected
                      ? 'bg-teal-500/40 border-teal-300 text-white scale-102 ring-2 ring-teal-400'
                      : 'bg-[#152B2B] hover:bg-[#1E3A3A] border-teal-500/30 text-teal-100'
                  }`}
                >
                  <span className="pl-2">{pair.letter}</span>
                  <Volume2 className="w-4 h-4 text-teal-400/70" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Words with Emojis (shuffled display) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-serif-telugu text-teal-400 uppercase tracking-wider text-center">
            పదాలు & బొమ్మలు (Words)
          </h4>
          <div className="space-y-2.5">
            {[...LETTER_PAIRS].reverse().map(pair => {
              const isMatched = matchedIds.includes(pair.id);
              const isSelected = selectedWord?.id === pair.id;

              return (
                <button
                  key={pair.id}
                  onClick={() => handleSelectWord(pair)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-2xl border font-bold text-sm sm:text-base font-serif-telugu flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 opacity-60'
                      : isSelected
                      ? 'bg-teal-500/40 border-teal-300 text-white scale-102 ring-2 ring-teal-400'
                      : 'bg-[#152B2B] hover:bg-[#1E3A3A] border-teal-500/30 text-teal-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pair.emoji}</span>
                    <span>{pair.word}</span>
                  </div>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Win View */}
      {isWon && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-600/30 to-emerald-600/30 border border-emerald-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-300" />
            <div>
              <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-white">
                అద్భుతం! అన్ని అక్షరాలను జతపరిచారు! 🎉
              </h4>
              <p className="text-xs text-teal-200 font-serif-telugu">తెలుగు అక్షరమాల నైపుణ్యం పెరిగింది.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold font-serif-telugu cursor-pointer"
          >
            మళ్ళీ ఆడండి
          </button>
        </div>
      )}
    </div>
  );
};
