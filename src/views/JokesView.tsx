import React, { useState } from 'react';
import { Laugh, Plus } from 'lucide-react';
import { Joke } from '../types';
import { JokeCard } from '../components/cards/JokeCard';

interface JokesViewProps {
  jokes: Joke[];
  onOpenWrite: () => void;
  onLikeToggle: (jokeId: string) => void;
}

export const JokesView: React.FC<JokesViewProps> = ({ jokes, onOpenWrite, onLikeToggle }) => {
  const [selectedCat, setSelectedCat] = useState<string>('అన్నీ');

  const categories = ['అన్నీ', 'హాస్యం', 'ఆఫీస్', 'కుటుంబం', 'స్నేహం'];

  const filteredJokes = jokes.filter(j => {
    if (selectedCat === 'అన్నీ') return true;
    return j.category === selectedCat;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D99A3D]/20 text-[#D99A3D] text-xs font-bold mb-2">
            <Laugh className="w-3.5 h-3.5" />
            <span>సరదా కబుర్లు</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1">
            తెలుగు హాస్యం & జోక్స్
          </h1>
          <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            ఆహ్లాదకరమైన నవ్వులు పంచుకోండి
          </p>
        </div>

        <button
          onClick={onOpenWrite}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>జోక్ ప్రచురించండి</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu shrink-0 transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-[#7A284B] text-white shadow-sm'
                : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Jokes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJokes.map(joke => (
          <JokeCard
            key={joke.id}
            joke={joke}
            onLikeToggle={onLikeToggle}
          />
        ))}
      </div>
    </div>
  );
};
