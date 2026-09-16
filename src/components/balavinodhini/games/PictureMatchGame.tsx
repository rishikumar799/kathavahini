import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle2, Sparkles } from 'lucide-react';

interface PictureItem {
  id: number;
  emoji: string;
  teluguName: string;
  category: string;
}

const PICTURE_ITEMS: PictureItem[] = [
  { id: 1, emoji: '🌺', teluguName: 'మందార పువ్వు', category: 'పువ్వులు' },
  { id: 2, emoji: '🐘', teluguName: 'గజరాజు (ఏనుగు)', category: 'జంతువులు' },
  { id: 3, emoji: '🥭', teluguName: 'మామిడి పండు', category: 'పండ్లు' },
  { id: 4, emoji: '🌙', teluguName: 'చందమామ', category: 'ప్రకృతి' },
  { id: 5, emoji: '🌈', teluguName: 'ఇంద్రధనుస్సు', category: 'ప్రకృతి' },
  { id: 6, emoji: '🚀', teluguName: 'రాకెట్ (వ్యోమనౌక)', category: 'సైన్స్' },
];

export const PictureMatchGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [selectedPicture, setSelectedPicture] = useState<PictureItem | null>(null);
  const [selectedName, setSelectedName] = useState<PictureItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [isWon, setIsWon] = useState(false);

  const handlePickPic = (item: PictureItem) => {
    if (matchedIds.includes(item.id)) return;
    setSelectedPicture(item);
    if (selectedName) {
      checkPair(item, selectedName);
    }
  };

  const handlePickName = (item: PictureItem) => {
    if (matchedIds.includes(item.id)) return;
    setSelectedName(item);
    if (selectedPicture) {
      checkPair(selectedPicture, item);
    }
  };

  const checkPair = (pItem: PictureItem, nItem: PictureItem) => {
    if (pItem.id === nItem.id) {
      const next = [...matchedIds, pItem.id];
      setMatchedIds(next);
      setSelectedPicture(null);
      setSelectedName(null);
      if (next.length === PICTURE_ITEMS.length) {
        setIsWon(true);
        onComplete?.(100);
      }
    } else {
      setTimeout(() => {
        setSelectedPicture(null);
        setSelectedName(null);
      }, 600);
    }
  };

  const handleReset = () => {
    setSelectedPicture(null);
    setSelectedName(null);
    setMatchedIds([]);
    setIsWon(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 sm:p-6 bg-[#0E1F1A] rounded-3xl border border-emerald-500/20 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-emerald-100">
            బొమ్మల జంట (Picture Match)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-serif-telugu">
          <span className="text-emerald-300">
            పూర్తయినవి: <strong className="text-white">{matchedIds.length}</strong> / {PICTURE_ITEMS.length}
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-serif-telugu text-emerald-200/80 mb-4">
        బొమ్మపై నొక్కి, కుడి వైపు దానికి సరిపోయే తెలుగు పేరును ఎంచుకోండి!
      </p>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 my-2">
        {/* Pictures */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-serif-telugu text-emerald-400 uppercase text-center">
            బొమ్మలు (Pictures)
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {PICTURE_ITEMS.map(item => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedPicture?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePickPic(item)}
                  disabled={isMatched}
                  className={`p-4 rounded-2xl border flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-emerald-500/20 border-emerald-400 opacity-50 scale-95'
                      : isSelected
                      ? 'bg-emerald-500/40 border-emerald-300 ring-2 ring-emerald-400 scale-105'
                      : 'bg-[#15332B] hover:bg-[#1D4439] border-emerald-500/30'
                  }`}
                >
                  {item.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Telugu Names (shuffled display) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-serif-telugu text-emerald-400 uppercase text-center">
            తెలుగు పేర్లు (Names)
          </h4>
          <div className="space-y-2">
            {[PICTURE_ITEMS[2], PICTURE_ITEMS[0], PICTURE_ITEMS[4], PICTURE_ITEMS[1], PICTURE_ITEMS[5], PICTURE_ITEMS[3]].map(item => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedName?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePickName(item)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-2xl border font-bold text-xs sm:text-sm font-serif-telugu flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 opacity-50'
                      : isSelected
                      ? 'bg-emerald-500/40 border-emerald-300 text-white ring-2 ring-emerald-400 scale-102'
                      : 'bg-[#15332B] hover:bg-[#1D4439] border-emerald-500/30 text-emerald-100'
                  }`}
                >
                  <span>{item.teluguName}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isWon && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-300" />
            <div>
              <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-white">
                అద్భుతం! అన్ని బొమ్మలను సరిగ్గా జతపరిచారు! 🎉
              </h4>
              <p className="text-xs text-emerald-200 font-serif-telugu">మీ పరిశీలనా శక్తి ప్రశంసనీయం.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold font-serif-telugu cursor-pointer"
          >
            మళ్ళీ ఆడండి
          </button>
        </div>
      )}
    </div>
  );
};
