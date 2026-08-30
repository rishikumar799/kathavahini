import React, { useState } from 'react';
import { Bookmark, Search, Trash2, Eye, Plus, BookOpen, Layers, Edit, Globe, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { Novel, Episode, ContentVisibility } from '../../types';

interface AdminNovelsViewProps {
  novels: Novel[];
  onArchiveNovel: (novel: Novel) => void;
  onDeleteNovel: (novel: Novel) => void;
  onEditNovel: (novel: Novel) => void;
  onCreateNovel: () => void;
  onCreateEpisode: (novel?: Novel) => void;
  onViewEpisodes: (novel: Novel) => void;
  actionLoading: boolean;
}

export const AdminNovelsView: React.FC<AdminNovelsViewProps> = ({
  novels,
  onArchiveNovel,
  onDeleteNovel,
  onEditNovel,
  onCreateNovel,
  onCreateEpisode,
  onViewEpisodes,
  actionLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNovelForChapters, setSelectedNovelForChapters] = useState<Novel | null>(null);
  const [deleteConfirmNovel, setDeleteConfirmNovel] = useState<Novel | null>(null);

  const filtered = novels.filter(n =>
    (n.teluguTitle || n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.author?.name || n.authorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Create Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            నవలల నిర్వహణ (Novels Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            ధారావాహిక నవలలు, భాగాలు (Episodes) మరియు అధ్యాయాల నిర్వహణ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onCreateEpisode()}
            className="px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#7A284B]" />
            <span>+ ఎపిసోడ్ జోడించండి</span>
          </button>
          <button
            onClick={onCreateNovel}
            className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>కొత్త నవల ప్రారంభించండి</span>
          </button>
        </div>
      </div>

      {/* Header Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="నవల శీర్షిక లేదా రచయితతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
          మొత్తం నవలలు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{novels.length}</strong>
        </div>
      </div>

      {/* Novel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(novel => (
          <div
            key={novel.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between gap-4 hover:border-[#7A284B]/40 transition-all"
          >
            <div className="flex gap-4">
              <img
                src={novel.coverImage}
                alt={novel.teluguTitle}
                className="w-24 h-32 rounded-2xl object-cover shrink-0 border border-[#E8E1DA] dark:border-[#26242E] shadow-sm"
              />

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {novel.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    novel.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {novel.status === 'completed' ? 'పూర్తయింది' : 'కొనసాగుతోంది'}
                  </span>
                </div>

                <h4 className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] line-clamp-1">
                  {novel.teluguTitle || novel.title}
                </h4>

                <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                  రచయిత: {novel.author?.name || novel.authorName || 'కథావాహిని రచయిత'}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#A29CA6] pt-1">
                  <span className="flex items-center gap-1 font-bold text-[#17151A] dark:text-[#F7F3EE]">
                    <Layers className="w-3.5 h-3.5 text-[#7A284B]" /> {novel.chaptersCount || novel.totalChapters || 0} భాగాలు
                  </span>
                  <span>• రేటింగ్: {novel.rating || 5.0} ★</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA] dark:border-[#26242E]">
              <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                చూపులు: {novel.viewCount?.toLocaleString() || 0}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onCreateEpisode(novel)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:bg-[#7A284B] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                  title="ఈ నవలకు కొత్త ఎపిసోడ్ జోడించండి"
                >
                  <Plus className="w-3 h-3" /> ఎపిసోడ్
                </button>

                <button
                  onClick={() => setSelectedNovelForChapters(novel)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA] transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> అధ్యాయాలు
                </button>

                <button
                  onClick={() => onEditNovel(novel)}
                  className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] hover:bg-black/5 cursor-pointer"
                  title="నవలను సవరించండి"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmNovel(novel)}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer"
                  title="నవలను తొలగించండి"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chapters Overview Modal */}
      {selectedNovelForChapters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1DA] dark:border-[#26242E] pb-3">
              <div>
                <h3 className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {selectedNovelForChapters.teluguTitle} — అధ్యాయాలు
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                  రచయిత: {selectedNovelForChapters.author?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedNovelForChapters(null)}
                className="p-2 rounded-xl text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#121118] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {(!selectedNovelForChapters.chapters || selectedNovelForChapters.chapters.length === 0) ? (
                <div className="p-8 text-center text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
                  <p>ఈ నవలకు ఇంకా ప్రత్యేక అధ్యాయాలు కేటాయించబడలేదు.</p>
                  <button
                    onClick={() => {
                      const n = selectedNovelForChapters;
                      setSelectedNovelForChapters(null);
                      onCreateEpisode(n);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7A284B] text-white text-xs font-bold"
                  >
                    + మొదటి ఎపిసోడ్ జోడించండి
                  </button>
                </div>
              ) : (
                selectedNovelForChapters.chapters.map(ch => (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
                        భాగం {ch.chapterNumber}
                      </span>
                      <h4 className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mt-1">
                        {ch.teluguTitle || ch.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                      {ch.publishedAt}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E1DA] dark:border-[#26242E]">
              <button
                onClick={() => setSelectedNovelForChapters(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                మూసివేయి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Novel Confirmation */}
      {deleteConfirmNovel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">నవలను శాశ్వతంగా తొలగించాలా?</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              "{deleteConfirmNovel.teluguTitle || deleteConfirmNovel.title}" నవల శాశ్వతంగా తొలగించబడుతుంది.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmNovel(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={() => {
                  onDeleteNovel(deleteConfirmNovel);
                  setDeleteConfirmNovel(null);
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
