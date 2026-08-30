import React, { useState } from 'react';
import { BookOpen, Sparkles, Filter } from 'lucide-react';
import { Novel } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { NovelCard } from '../components/cards/NovelCard';

interface NovelsViewProps {
  novels: Novel[];
  onSelectNovel: (novel: Novel) => void;
  onBookmarkToggle?: (novelId: string, e: React.MouseEvent) => void;
}

export const NovelsView: React.FC<NovelsViewProps> = ({
  novels,
  onSelectNovel,
  onBookmarkToggle,
}) => {
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  const filteredNovels = novels.filter(n => {
    if (filter === 'ongoing') return n.status === 'ongoing';
    if (filter === 'completed') return n.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D99A3D]/20 text-[#D99A3D] text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ధారావాహికలు</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          తెలుగు నవలల ప్రపంచం
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          అధ్యాయాల వారీగా సాగే సమగ్ర నవలా సాహిత్యం. ఉత్కంఠభరిత కథనాలు.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          అన్ని నవలలు ({novels.length})
        </button>

        <button
          onClick={() => setFilter('ongoing')}
          className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            filter === 'ongoing'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          కొనసాగుతున్నవి (Ongoing)
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          పూర్తయినవి (Completed)
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNovels.map(novel => (
          <NovelCard
            key={novel.id}
            novel={novel}
            onSelect={onSelectNovel}
            onBookmarkToggle={onBookmarkToggle}
          />
        ))}
      </div>
    </div>
  );
};
