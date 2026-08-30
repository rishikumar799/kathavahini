import React, { useState } from 'react';
import { Layers, Plus, Search, Trash2, Edit, Eye, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Episode, Novel, ContentStatus, ContentVisibility } from '../../types';

interface AdminEpisodesViewProps {
  episodes: Episode[];
  novels: Novel[];
  onCreateEpisode: (novel?: Novel) => void;
  onEditEpisode: (episode: Episode) => void;
  onDeleteEpisode: (episode: Episode) => void;
  actionLoading: boolean;
}

export const AdminEpisodesView: React.FC<AdminEpisodesViewProps> = ({
  episodes,
  novels,
  onCreateEpisode,
  onEditEpisode,
  onDeleteEpisode,
  actionLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNovelFilter, setSelectedNovelFilter] = useState<string>('all');
  const [deleteConfirmEpisode, setDeleteConfirmEpisode] = useState<Episode | null>(null);

  const filtered = episodes.filter(ep => {
    const matchesNovel = selectedNovelFilter === 'all' || ep.novelId === selectedNovelFilter;
    const matchesSearch = 
      (ep.teluguTitle || ep.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ep.novelTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNovel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            ఎపిసోడ్లు / భాగాలు (Novel Episodes)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            నవలల భాగాల నిర్వహణ, ప్రచురణ, మరియు ఆర్డర్ అమరిక
          </p>
        </div>

        <button
          onClick={() => onCreateEpisode()}
          className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త ఎపిసోడ్ జోడించండి</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ఎపిసోడ్ లేదా నవల పేరుతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedNovelFilter}
            onChange={e => setSelectedNovelFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          >
            <option value="all">అన్ని నవలలు ({episodes.length} భాగాలు)</option>
            {novels.map(n => (
              <option key={n.id} value={n.id}>
                {n.teluguTitle || n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <Layers className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎలాంటి ఎపిసోడ్లు లేవు
            </p>
            <p>నవలలకు కొత్త భాగాలను సులభంగా జోడించవచ్చు.</p>
          </div>
        ) : (
          filtered.map(ep => (
            <div
              key={ep.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#7A284B]/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm shrink-0">
                  {ep.episodeNumber || 1}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
                      {ep.novelTitle || 'నవల'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-serif-telugu">
                      ప్రచురితం
                    </span>
                  </div>
                  <h4 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                    {ep.teluguTitle || ep.title}
                  </h4>
                  <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                    {ep.readingTimeMinutes || 3} నిమిషాల చదువు • ప్రచురణ: {ep.publishedAt || '2026'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onEditEpisode(ep)}
                  className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] hover:bg-black/5 cursor-pointer"
                  title="ఎపిసోడ్‌ను సవరించండి"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmEpisode(ep)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer"
                  title="ఎపిసోడ్‌ను తొలగించండి"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">ఎపిసోడ్‌ను తొలగించాలా?</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              "{deleteConfirmEpisode.teluguTitle || deleteConfirmEpisode.title}" భాగం శాశ్వతంగా తొలగించబడుతుంది.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmEpisode(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={() => {
                  onDeleteEpisode(deleteConfirmEpisode);
                  setDeleteConfirmEpisode(null);
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
