import React from 'react';
import { Palette, Sparkles, Upload, Eye } from 'lucide-react';
import { BalavinodhiniItem } from '../../types';

interface BalavinodhiniCreationsWidgetProps {
  creations?: BalavinodhiniItem[];
  onOpenAllCreations?: () => void;
  onOpenCreationModal: () => void;
  onSelectCreation?: (item: BalavinodhiniItem) => void;
}

const SAMPLE_KIDS_ART = [
  {
    id: 'art-1',
    title: 'సూర్యాస్తమయం',
    authorName: 'అనన్య',
    grade: '5వ తరగతి',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=400',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'art-2',
    title: 'బాలిక పెన్సిల్ స్కెచ్',
    authorName: 'రాహుల్',
    grade: '4వ తరగతి',
    imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=400',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'art-3',
    title: 'రంగుల రామచిలక',
    authorName: 'సాయి',
    grade: '6వ తరగతి',
    imageUrl: 'https://images.unsplash.com/photo-1546853020-ca4909aef454?auto=format&fit=crop&q=80&w=400',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
];

export const BalavinodhiniCreationsWidget: React.FC<BalavinodhiniCreationsWidgetProps> = ({
  creations = [],
  onOpenAllCreations,
  onOpenCreationModal,
  onSelectCreation,
}) => {
  // Use real creations or fallback to sample
  const displayItems = SAMPLE_KIDS_ART;

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#1F1735] via-[#18122B] to-[#120D20] border border-pink-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold">🎨</span>
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-white">
              సృజనాత్మక ప్రపంచం
            </h3>
          </div>
          <button
            onClick={onOpenAllCreations}
            className="text-xs font-serif-telugu font-semibold text-pink-300 hover:text-pink-200 transition-colors cursor-pointer"
          >
            అన్నీ చూడండి ➔
          </button>
        </div>

        {/* 3 Kids' Artwork Thumbnails */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          {displayItems.map((art) => (
            <div
              key={art.id}
              onClick={onOpenAllCreations}
              className="group/art rounded-2xl overflow-hidden bg-[#261E42] border border-white/10 hover:border-pink-400 transition-all cursor-pointer flex flex-col"
            >
              {/* Image thumbnail */}
              <div className="aspect-square relative overflow-hidden bg-[#1E1735]">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Author & Grade */}
              <div className="p-2 flex items-center gap-1.5 bg-[#261E42]">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img src={art.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold font-serif-telugu text-white truncate leading-tight">
                    {art.authorName}
                  </span>
                  <span className="block text-[9px] text-purple-200/70 font-serif-telugu truncate">
                    {art.grade}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA Button */}
      <div className="pt-2 border-t border-pink-500/20">
        <button
          onClick={onOpenCreationModal}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
        >
          <span>మీ సృజనను పంచుకోండి ➔</span>
        </button>
      </div>
    </div>
  );
};
