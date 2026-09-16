import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, Timer, Award } from 'lucide-react';

interface Card {
  id: number;
  pairId: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARDS_DATA = [
  { pairId: 1, symbol: '🦁', name: 'సింహం' },
  { pairId: 2, symbol: '🦚', name: 'నెమలి' },
  { pairId: 3, symbol: '🐘', name: 'ఏనుగు' },
  { pairId: 4, symbol: '🥭', name: 'మామిడి' },
  { pairId: 5, symbol: '🪷', name: 'తామర' },
  { pairId: 6, symbol: '🦜', name: 'చిలక' },
  { pairId: 7, symbol: '🐒', name: 'కోతి' },
  { pairId: 8, symbol: '🦋', name: 'సీతాకోకచిలుక' },
];

export const MemoryMatchGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const deck: Card[] = [];
    let id = 0;
    // Use 6 pairs (12 cards) for balanced mobile-friendly layout
    const selectedPairs = CARDS_DATA.slice(0, 6);
    selectedPairs.forEach(item => {
      deck.push({ id: id++, pairId: item.pairId, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false });
      deck.push({ id: id++, pairId: item.pairId, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false });
    });
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setSeconds(0);
    setIsRunning(true);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isRunning && !isWon) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isWon]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;
            const newMatchedCount = updated.filter(c => c.isMatched).length / 2;
            setMatchedPairs(newMatchedCount);
            if (updated.every(c => c.isMatched)) {
              setIsWon(true);
              setIsRunning(false);
              const score = Math.max(10, 100 - moves * 5);
              onComplete?.(score);
            }
            return updated;
          });
          setFlippedCards([]);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto p-4 sm:p-6 bg-[#16122C] rounded-3xl border border-purple-500/20 text-white shadow-xl">
      {/* Top Controls & Metrics */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-serif-telugu">
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            కదలికలు: <strong className="text-white">{moves}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            జతలు: <strong className="text-white">{matchedPairs}/6</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            సమయం: <strong className="text-white">{seconds}s</strong>
          </span>
        </div>

        <button
          onClick={initGame}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 text-xs font-bold font-serif-telugu flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>తిరిగి ప్రారంభించండి</span>
        </button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg my-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.isFlipped || card.isMatched}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all transform duration-300 cursor-pointer shadow-md ${
              card.isMatched
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 scale-95 opacity-80'
                : card.isFlipped
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-pink-300 text-white scale-100 rotate-0'
                : 'bg-[#251D4A] hover:bg-[#2F265D] border border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:scale-105'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="flex flex-col items-center animate-fadeIn">
                <span className="text-3xl sm:text-4xl">{card.symbol}</span>
                <span className="text-[11px] sm:text-xs font-serif-telugu font-bold mt-1 text-purple-100">
                  {card.name}
                </span>
              </div>
            ) : (
              <span className="text-2xl sm:text-3xl text-purple-400/60 font-bold font-serif">
                ?
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="w-full mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-300" />
            <div>
              <h4 className="text-base font-bold font-serif-telugu text-white">
                అద్భుతం! అన్ని జతలను కనిపెట్టారు! 🎉
              </h4>
              <p className="text-xs text-emerald-200 font-serif-telugu">
                మొత్తం {moves} కదలికలలో {seconds} సెకన్లలో పూర్తి చేశారు!
              </p>
            </div>
          </div>
          <button
            onClick={initGame}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold font-serif-telugu shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            మళ్ళీ ఆడండి
          </button>
        </div>
      )}
    </div>
  );
};
