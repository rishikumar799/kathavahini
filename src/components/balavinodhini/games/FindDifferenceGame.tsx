import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, Sparkles, Search, Eye } from 'lucide-react';

interface DifferenceSpot {
  id: number;
  label: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  radiusPercent: number;
  hint: string;
}

const DIFFERENCES: DifferenceSpot[] = [
  { id: 1, label: 'సూర్యుని కళ్ళద్దాలు', xPercent: 25, yPercent: 20, radiusPercent: 12, hint: 'ఎడమ వైపు ఎగువన ఉన్న సూర్యుడిని గమనించండి ☀️' },
  { id: 2, label: 'ఎగురుతున్న పక్షి', xPercent: 78, yPercent: 18, radiusPercent: 12, hint: 'కుడి వైపు ఆకాశంలో ఎగిరే పక్షిని చూడండి 🕊️' },
  { id: 3, label: 'గులాబీ పువ్వు రంగు', xPercent: 30, yPercent: 75, radiusPercent: 12, hint: 'తోటలోని పువ్వుల రంగులను సరిపోల్చండి 🌸' },
  { id: 4, label: 'సీతాకోకచిలుక రెక్కలు', xPercent: 70, yPercent: 65, radiusPercent: 12, hint: 'మధ్యలో ఉన్న సీతాకోకచిలుకను చూడండి 🦋' },
  { id: 5, label: 'చిన్న పుట్టగొడుగు', xPercent: 50, yPercent: 82, radiusPercent: 12, hint: 'నేలపై ఉన్న చిన్న పుట్టగొడుగును కనిపెట్టండి 🍄' },
];

export const FindDifferenceGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [foundIds, setFoundIds] = useState<number[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);

  const handleClickSpot = (spot: DifferenceSpot) => {
    if (foundIds.includes(spot.id)) return;
    const next = [...foundIds, spot.id];
    setFoundIds(next);
    setActiveHint(null);
    if (next.length === DIFFERENCES.length) {
      setIsWon(true);
      onComplete?.(100);
    }
  };

  const handleReset = () => {
    setFoundIds([]);
    setActiveHint(null);
    setIsWon(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#18112C] rounded-3xl border border-purple-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-purple-100">
            తేడాలు కనుక్కోండి (Spot the Difference)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-purple-300">
            కనుగొన్నవి: <strong className="text-white">{foundIds.length}</strong> / {DIFFERENCES.length}
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-serif-telugu text-purple-200/80 mb-4">
        కుడి వైపు ఉన్న చిత్రంలో దాగివున్న 5 తేడాలను గమనించి క్లిక్ చేయండి!
      </p>

      {/* Side-by-side Illustrated Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
        {/* Left: Original Scene */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold font-serif-telugu text-purple-300">
            <span>అసలు చిత్రం (Original)</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-400 p-4 border border-purple-400/40 shadow-inner overflow-hidden select-none">
            {/* Sun */}
            <div className="absolute top-4 left-6 text-4xl">☀️</div>
            {/* Cloud */}
            <div className="absolute top-3 right-12 text-3xl opacity-90">☁️</div>
            {/* Bird */}
            <div className="absolute top-7 right-8 text-xl">🕊️</div>
            {/* Hills */}
            <div className="absolute bottom-10 left-0 right-0 h-16 bg-emerald-600 rounded-t-[50%] opacity-80" />
            {/* Tree */}
            <div className="absolute bottom-6 left-8 text-4xl">🌳</div>
            {/* Butterfly */}
            <div className="absolute bottom-12 right-12 text-3xl">🦋</div>
            {/* Flowers */}
            <div className="absolute bottom-3 left-24 text-2xl">🌸</div>
            <div className="absolute bottom-3 right-6 text-2xl">🌻</div>
            {/* Mushroom */}
            <div className="absolute bottom-3 left-40 text-xl">🍄</div>
          </div>
        </div>

        {/* Right: Modified Scene with Clickable Interactive Targets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold font-serif-telugu text-pink-300">
            <span>తేడాల చిత్రం (Spot Here!)</span>
            <Search className="w-4 h-4 text-pink-400" />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-400 p-4 border border-pink-400/40 shadow-inner overflow-hidden select-none">
            {/* Sun with sunglasses (Difference 1) */}
            <div className="absolute top-4 left-6 text-4xl">😎</div>
            {/* Cloud (Same) */}
            <div className="absolute top-3 right-12 text-3xl opacity-90">☁️</div>
            {/* No Bird or Airplane (Difference 2) */}
            <div className="absolute top-7 right-8 text-xl">✈️</div>
            {/* Hills */}
            <div className="absolute bottom-10 left-0 right-0 h-16 bg-emerald-600 rounded-t-[50%] opacity-80" />
            {/* Tree */}
            <div className="absolute bottom-6 left-8 text-4xl">🌳</div>
            {/* Purple Butterfly (Difference 4) */}
            <div className="absolute bottom-12 right-12 text-3xl">🐝</div>
            {/* Yellow Flower (Difference 3) */}
            <div className="absolute bottom-3 left-24 text-2xl">🌼</div>
            <div className="absolute bottom-3 right-6 text-2xl">🌻</div>
            {/* Snail instead of mushroom (Difference 5) */}
            <div className="absolute bottom-3 left-40 text-xl">🐌</div>

            {/* Clickable Hotspots overlay */}
            {DIFFERENCES.map(spot => {
              const isFound = foundIds.includes(spot.id);
              return (
                <button
                  key={spot.id}
                  onClick={() => handleClickSpot(spot)}
                  style={{
                    left: `${spot.xPercent}%`,
                    top: `${spot.yPercent}%`,
                    width: `${spot.radiusPercent * 2}%`,
                    height: `${spot.radiusPercent * 2.2}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    isFound
                      ? 'border-4 border-amber-400 bg-amber-400/20 ring-4 ring-amber-300/50 scale-105 animate-pulse'
                      : 'hover:border-2 hover:border-pink-400/60 bg-transparent'
                  }`}
                >
                  {isFound && <span className="text-amber-300 font-bold text-lg">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hints List */}
      <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/70 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-serif-telugu text-purple-200">కనుగొన్న తేడాలు:</span>
          <button
            onClick={() => {
              const remaining = DIFFERENCES.find(d => !foundIds.includes(d.id));
              if (remaining) setActiveHint(remaining.hint);
            }}
            disabled={foundIds.length === DIFFERENCES.length}
            className="text-[11px] font-serif-telugu text-pink-300 hover:text-pink-200 underline cursor-pointer disabled:opacity-30"
          >
            💡 సహాయం కావాలా? (Hint)
          </button>
        </div>

        {activeHint && (
          <p className="text-xs font-serif-telugu text-amber-300 mt-2 animate-fadeIn">
            {activeHint}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-2.5">
          {DIFFERENCES.map(d => {
            const isFound = foundIds.includes(d.id);
            return (
              <span
                key={d.id}
                className={`px-2.5 py-1 rounded-xl text-xs font-serif-telugu flex items-center gap-1.5 transition-all ${
                  isFound
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                    : 'bg-purple-900/40 border border-purple-500/20 text-purple-400/60'
                }`}
              >
                {isFound ? '✓' : '•'} {d.label}
              </span>
            );
          })}
        </div>
      </div>

      {isWon && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-pink-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-300" />
            <div>
              <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-white">
                అద్భుతమైన పరిశీలన! అన్ని తేడాలను కనిపెట్టారు! 🎉
              </h4>
              <p className="text-xs text-pink-200 font-serif-telugu">మీ దృష్టి చాలా తీక్షణమైనది.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold font-serif-telugu cursor-pointer"
          >
            మళ్ళీ ఆడండి
          </button>
        </div>
      )}
    </div>
  );
};
