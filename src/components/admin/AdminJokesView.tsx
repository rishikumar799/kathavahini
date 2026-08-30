import React, { useState } from 'react';
import { Smile, Search, Trash2, Heart, Share2, Plus, Edit } from 'lucide-react';
import { Joke } from '../../types';

interface AdminJokesViewProps {
  jokes: Joke[];
  onDeleteJoke: (joke: Joke) => void;
  onEditJoke: (joke: Joke) => void;
  onCreateJoke: () => void;
  actionLoading: boolean;
}

export const AdminJokesView: React.FC<AdminJokesViewProps> = ({
  jokes,
  onDeleteJoke,
  onEditJoke,
  onCreateJoke,
  actionLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmJoke, setDeleteConfirmJoke] = useState<Joke | null>(null);

  const filtered = jokes.filter(j =>
    (j.content || j.teluguContent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            హాస్య జోక్స్ నిర్వహణ (Jokes Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            తెలుగు హాస్యం, కార్టూన్లు మరియు చిలిపి జోక్స్ నిర్వహణ
          </p>
        </div>

        <button
          onClick={onCreateJoke}
          className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త జోక్ జోడించండి</span>
        </button>
      </div>

      {/* Header Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="హాస్య జోక్ విషయంతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
          మొత్తం జోకులు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{jokes.length}</strong>
        </div>
      </div>

      {/* Jokes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(joke => (
          <div
            key={joke.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between gap-4 hover:border-[#7A284B]/30 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  {joke.category || 'సరదా జోక్'}
                </span>
                <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                  రచయిత: {joke.author?.name || 'కథావాహిని హాస్య విభాగం'}
                </span>
              </div>

              <p className="text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed whitespace-pre-line">
                {joke.teluguContent || joke.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#6F6970] dark:text-[#A29CA6]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> {joke.likesCount || joke.likeCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-blue-500" /> {joke.sharesCount || joke.shareCount || 0}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditJoke(joke)}
                  className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] hover:bg-black/5 cursor-pointer"
                  title="జోక్‌ను సవరించండి"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmJoke(joke)}
                  disabled={actionLoading}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer"
                  title="జోక్‌ను తొలగించండి"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Joke Confirmation */}
      {deleteConfirmJoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">జోక్‌ను తొలగించాలా?</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              ఈ హాస్య జోక్ శాశ్వతంగా తొలగించబడుతుంది.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmJoke(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={() => {
                  onDeleteJoke(deleteConfirmJoke);
                  setDeleteConfirmJoke(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                అవును, తొలగించండి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
