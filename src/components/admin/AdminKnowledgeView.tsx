import React, { useState } from 'react';
import { Lightbulb, Plus, Search, Trash2, Edit, BookOpen, Clock, Tag, Globe, EyeOff } from 'lucide-react';
import { KnowledgeArticle } from '../../types';

interface AdminKnowledgeViewProps {
  articles: KnowledgeArticle[];
  onCreateArticle: () => void;
  onEditArticle: (article: KnowledgeArticle) => void;
  onDeleteArticle: (article: KnowledgeArticle) => void;
  actionLoading: boolean;
}

export const AdminKnowledgeView: React.FC<AdminKnowledgeViewProps> = ({
  articles,
  onCreateArticle,
  onEditArticle,
  onDeleteArticle,
  actionLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState<KnowledgeArticle | null>(null);

  const filtered = articles.filter(a =>
    (a.teluguTitle || a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            సాహిత్య విజ్ఞానం & వ్యాసాలు (Knowledge Base)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            తెలుగు సాహిత్య చరిత్ర, ప్రసిద్ధ కవులు, వ్యాకరణం మరియు విజ్ఞాన వ్యాసాల నిర్వహణ
          </p>
        </div>

        <button
          onClick={onCreateArticle}
          className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త వ్యాసం జోడించండి</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="వ్యాస శీర్షిక లేదా కేటగిరీతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
          మొత్తం వ్యాసాలు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{articles.length}</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(art => (
          <div
            key={art.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between gap-4 hover:border-[#7A284B]/30 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-serif-telugu">
                  {art.category}
                </span>
                <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                  {art.readTimeMinutes || 4} నిమి. చదువు
                </span>
              </div>

              <h4 className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {art.teluguTitle || art.title}
              </h4>

              <p className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu line-clamp-3 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA] dark:border-[#26242E] text-xs">
              <span className="text-[#6F6970] dark:text-[#A29CA6]">
                రచయిత: {art.authorName || 'కథావాహిని సంపాదకులు'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditArticle(art)}
                  className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] hover:bg-black/5 cursor-pointer"
                  title="వ్యాసాన్ని సవరించండి"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmArticle(art)}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer"
                  title="వ్యాసాన్ని తొలగించండి"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">వ్యాసాన్ని తొలగించాలా?</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              "{deleteConfirmArticle.teluguTitle || deleteConfirmArticle.title}" వ్యాసం శాశ్వతంగా తొలగించబడుతుంది.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={() => {
                  onDeleteArticle(deleteConfirmArticle);
                  setDeleteConfirmArticle(null);
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
