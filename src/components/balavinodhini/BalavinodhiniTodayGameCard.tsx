import React, { useState } from 'react';
import { Gamepad2, Sparkles, RotateCcw } from 'lucide-react';

interface BalavinodhiniTodayGameCardProps {
  onOpenFullGame: () => void;
}

interface Tile {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const INITIAL_TILES: Tile[] = [
  { id: 1, icon: '🍎', isFlipped: false, isMatched: false },
  { id: 2, icon: '🍌', isFlipped: false, isMatched: false },
  { id: 3, icon: '🍎', isFlipped: false, isMatched: false },
  { id: 4, icon: '🍌', isFlipped: false, isMatched: false },
  { id: 5, icon: '🍇', isFlipped: false, isMatched: false },
  { id: 6, icon: '🍇', isFlipped: false, isMatched: false },
];

export const BalavinodhiniTodayGameCard: React.FC<BalavinodhiniTodayGameCardProps> = ({
  onOpenFullGame,
}) => {
  const [tiles, setTiles] = useState<Tile[]>(INITIAL_TILES);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [matchesFound, setMatchesFound] = useState<number>(0);

  const handleTileClick = (index: number) => {
    if (tiles[index].isFlipped || tiles[index].isMatched || selectedTiles.length === 2) {
      return;
    }

    const newTiles = [...tiles];
    newTiles[index].isFlipped = true;
    setTiles(newTiles);

    const newSelected = [...selectedTiles, index];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      const [firstIdx, secondIdx] = newSelected;
      if (tiles[firstIdx].icon === tiles[secondIdx].icon) {
        // Matched!
        setTimeout(() => {
          setTiles(prev => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;
            return updated;
          });
          setSelectedTiles([]);
          setMatchesFound(m => m + 1);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setTiles(prev => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setSelectedTiles([]);
        }, 800);
      }
    }
  };

  const handleReset = () => {
    setTiles(INITIAL_TILES.map(t => ({ ...t, isFlipped: false, isMatched: false })));
    setSelectedTiles([]);
    setMatchesFound(0);
  };

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#162740] via-[#121E36] to-[#0E1528] border border-cyan-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold">🎮</span>
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-white">
              ఈరోజు గేమ్
            </h3>
          </div>
          <button
            onClick={onOpenFullGame}
            className="text-xs font-serif-telugu font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
          >
            అన్నీ చూడండి ➔
          </button>
        </div>

        <h4 className="text-sm font-bold font-serif-telugu text-cyan-100">
          జంటలను కనిపెట్టండి
        </h4>
        <p className="text-xs text-cyan-200/70 font-serif-telugu mb-4">
          ఒకే చిత్రాలను జత చేయండి!
        </p>

        {/* 3x2 Interactive Mini Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-2">
          {tiles.map((tile, idx) => {
            const showContent = tile.isFlipped || tile.isMatched;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(idx)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 cursor-pointer shadow-md ${
                  tile.isMatched
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 text-white scale-95'
                    : showContent
                    ? 'bg-white text-slate-900 border-2 border-cyan-400 rotate-0'
                    : 'bg-[#1E2E4A] hover:bg-[#25395D] border border-white/10 hover:border-cyan-400/40 text-cyan-400'
                }`}
              >
                {showContent ? tile.icon : <Sparkles className="w-5 h-5 text-cyan-400/60" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 space-y-2">
        {matchesFound === 3 && (
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 font-serif-telugu animate-bounce">
            🎉 అభినందనలు! అన్ని జంటలను సరిపోల్చారు!
          </div>
        )}

        <div className="flex gap-2">
          {matchesFound === 3 && (
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="మళ్ళీ ఆడండి"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenFullGame}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold font-serif-telugu shadow-lg hover:shadow-pink-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>ఆట ఆడండి ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
