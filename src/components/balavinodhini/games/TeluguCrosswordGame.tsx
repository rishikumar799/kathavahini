import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface CrosswordCell {
  row: number;
  col: number;
  char: string;
  number?: number;
  isBlock?: boolean;
}

export const TeluguCrosswordGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  // 3x3 Mini Telugu Crossword Grid
  // Across 1: క మ లం (కమలం = Lotus)
  // Down 1: క ల ము (కలము = Pen)
  // Across 3: ము త్యం (ముత్యం = Pearl)
  const initialGrid: { [key: string]: string } = {
    '0,0': '',
    '0,1': '',
    '0,2': '',
    '1,0': '',
    '2,0': '',
    '2,1': '',
  };

  const solution: { [key: string]: string } = {
    '0,0': 'క',
    '0,1': 'మ',
    '0,2': 'లం',
    '1,0': 'ల',
    '2,0': 'ము',
    '2,1': 'త్యం',
  };

  const [gridValues, setGridValues] = useState<{ [key: string]: string }>(initialGrid);
  const [selectedCell, setSelectedCell] = useState<string>('0,0');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const availableLetters = ['క', 'మ', 'లం', 'ల', 'ము', 'త్యం', 'ఆ', 'వు', 'గ'];

  const handleInputLetter = (letter: string) => {
    if (!selectedCell || isWon) return;
    setGridValues(prev => ({ ...prev, [selectedCell]: letter }));
  };

  const handleCheckAnswers = () => {
    let allCorrect = true;
    for (const key of Object.keys(solution)) {
      if (gridValues[key] !== solution[key]) {
        allCorrect = false;
        break;
      }
    }
    setIsSubmitted(true);
    if (allCorrect) {
      setIsWon(true);
      onComplete?.(100);
    }
  };

  const handleReset = () => {
    setGridValues(initialGrid);
    setSelectedCell('0,0');
    setIsSubmitted(false);
    setIsWon(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#0E1B26] rounded-3xl border border-cyan-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">▦</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-cyan-100">
            తెలుగు పదబంధం (Crossword)
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-200 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs sm:text-sm font-serif-telugu text-cyan-200/80 mb-4">
        అడ్డం & నిలువు క్లూలను చదివి, సరైన తెలుగు అక్షరాలతో గడులను నింపండి!
      </p>

      {/* Grid & Clues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-2">
        {/* Crossword 3x3 visual board */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#142635] rounded-2xl border border-cyan-500/30">
          <div className="grid grid-cols-3 gap-2 w-48 h-48 sm:w-56 sm:h-56">
            {/* (0,0) */}
            <button
              onClick={() => setSelectedCell('0,0')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '0,0' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span className="absolute top-1 left-1 text-[10px] text-cyan-400 font-sans">1</span>
              <span>{gridValues['0,0']}</span>
            </button>
            {/* (0,1) */}
            <button
              onClick={() => setSelectedCell('0,1')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '0,1' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span>{gridValues['0,1']}</span>
            </button>
            {/* (0,2) */}
            <button
              onClick={() => setSelectedCell('0,2')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '0,2' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span>{gridValues['0,2']}</span>
            </button>

            {/* (1,0) */}
            <button
              onClick={() => setSelectedCell('1,0')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '1,0' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span>{gridValues['1,0']}</span>
            </button>
            {/* (1,1) Block */}
            <div className="bg-[#0A131A] rounded-xl border border-cyan-950 flex items-center justify-center opacity-40">
              ✖
            </div>
            {/* (1,2) Block */}
            <div className="bg-[#0A131A] rounded-xl border border-cyan-950 flex items-center justify-center opacity-40">
              ✖
            </div>

            {/* (2,0) */}
            <button
              onClick={() => setSelectedCell('2,0')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '2,0' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span className="absolute top-1 left-1 text-[10px] text-cyan-400 font-sans">2</span>
              <span>{gridValues['2,0']}</span>
            </button>
            {/* (2,1) */}
            <button
              onClick={() => setSelectedCell('2,1')}
              className={`relative rounded-xl font-bold text-xl sm:text-2xl font-serif-telugu flex items-center justify-center border transition-all cursor-pointer ${
                selectedCell === '2,1' ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400' : 'bg-[#1C364A] border-cyan-500/30'
              }`}
            >
              <span>{gridValues['2,1']}</span>
            </button>
            {/* (2,2) Block */}
            <div className="bg-[#0A131A] rounded-xl border border-cyan-950 flex items-center justify-center opacity-40">
              ✖
            </div>
          </div>
        </div>

        {/* Clues Box */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#142635] border border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-bold font-serif-telugu text-cyan-300 uppercase tracking-wider">
              అడ్డం క్లూలు (Across):
            </h4>
            <div className="text-xs sm:text-sm font-serif-telugu text-cyan-100 space-y-1">
              <p><strong>1.</strong> జాతీయ పుష్పం, తామర పువ్వు (3 అక్షరాలు) ➔ <strong>క _ _</strong></p>
              <p><strong>2.</strong> సముద్రపు ఆణిముత్యం, రత్నం (2 అక్షరాలు) ➔ <strong>ము _</strong></p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#142635] border border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-bold font-serif-telugu text-cyan-300 uppercase tracking-wider">
              నిలువు క్లూలు (Down):
            </h4>
            <div className="text-xs sm:text-sm font-serif-telugu text-cyan-100 space-y-1">
              <p><strong>1.</strong> రాత రాయడానికి వాడే సాధనం, పెన్ (3 అక్షరాలు) ➔ <strong>క ల _</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Keyboard */}
      <div className="mt-4 p-3.5 rounded-2xl bg-[#142635] border border-cyan-500/30 space-y-2">
        <p className="text-xs font-serif-telugu text-cyan-300">గడిని ఎంచుకుని అక్షరాన్ని నొక్కండి:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {availableLetters.map((l, idx) => (
            <button
              key={idx}
              onClick={() => handleInputLetter(l)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1E394E] hover:bg-[#284D6A] border border-cyan-400/40 text-cyan-100 font-bold text-lg font-serif-telugu cursor-pointer transition-all hover:scale-105 active:scale-95 shadow"
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-bold font-serif-telugu cursor-pointer"
        >
          క్లియర్ చేయండి
        </button>

        <button
          onClick={handleCheckAnswers}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold font-serif-telugu shadow hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
        >
          <span>సరిచూసుకోండి (Submit)</span>
        </button>
      </div>

      {isWon && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-300" />
            <div>
              <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-white">
                అద్భుతం! పదబంధం సరిగ్గా పూర్తి చేశారు! 🎉
              </h4>
              <p className="text-xs text-cyan-200 font-serif-telugu">కమలం, కలము, ముత్యం పదాలు సరిగ్గా సరిపోయాయి.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold font-serif-telugu cursor-pointer"
          >
            మళ్ళీ ఆడండి
          </button>
        </div>
      )}
    </div>
  );
};
