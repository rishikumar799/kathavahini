import React, { useState } from 'react';
import { Tags, Plus, Search, CheckCircle2, Archive, Check, Trash2 } from 'lucide-react';
import { CategoryItem } from '../../types';

interface AdminCategoriesViewProps {
  categories: CategoryItem[];
  onAddCategory: (cat: { name: string; teluguName: string; description?: string }) => void;
  onToggleStatus: (catId: string, status: 'active' | 'archived') => void;
  onDeleteCategory?: (catId: string) => void;
  actionLoading: boolean;
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  categories,
  onAddCategory,
  onToggleStatus,
  onDeleteCategory,
  actionLoading,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [teluguName, setTeluguName] = useState('');
  const [description, setDescription] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teluguName.trim()) return;
    onAddCategory({
      name: name.trim(),
      teluguName: teluguName.trim(),
      description: description.trim(),
    });
    setName('');
    setTeluguName('');
    setDescription('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
            కథా వర్గాల నిర్వహణ (Category Management)
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            ప్లాట్‌ఫారమ్‌లోని అన్ని రకాల కథా శైలులు మరియు వర్గాల వివరాలు
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త వర్గాన్ని చేర్చండి</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {cat.teluguName || cat.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  cat.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-black/5 text-[#6F6970]'
                }`}>
                  {cat.status === 'active' ? 'యాక్టివ్' : 'ఆర్కైవ్'}
                </span>
              </div>

              <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#A29CA6] line-clamp-2">
                {cat.description || 'తెలుగు కథా శైలి'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA] dark:border-[#26242E] text-xs">
              <span className="text-[#6F6970] dark:text-[#A29CA6]">
                కథల సంఖ్య: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{cat.storyCount || 0}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onToggleStatus(cat.id, cat.status === 'active' ? 'archived' : 'active')}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] cursor-pointer"
                >
                  {cat.status === 'active' ? 'ఆర్కైవ్ చేయి' : 'యాక్టివేట్ చేయి'}
                </button>

                {onDeleteCategory && (
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    disabled={actionLoading}
                    className="p-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                    title="వర్గాన్ని పూర్తిగా తొలగించు (Delete Category)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#18181F] rounded-3xl p-6 border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl space-y-4">
            <h4 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              వర్గాన్ని తొలగించాలా?
            </h4>
            <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
              ఈ వర్గాన్ని పూర్తిగా తొలగించాలనుకుంటున్నారా? ఇది మొత్తం వెబ్‌సైట్‌లో రియల్-టైమ్‌లో అప్‌డేట్ అవుతుంది.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#6F6970] hover:text-[#17151A] cursor-pointer"
              >
                రద్దు చేయి
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (onDeleteCategory && deleteConfirmId) {
                    onDeleteCategory(deleteConfirmId);
                  }
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                అవును, తొలగించు
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl p-6 border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              కొత్త కథా వర్గాన్ని సృష్టించండి
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                  వర్గం పేరు (తెలుగు) *
                </label>
                <input
                  type="text"
                  required
                  value={teluguName}
                  onChange={e => setTeluguName(e.target.value)}
                  placeholder="ఉదా: ప్రేమ, ప్రేరణ, సైన్స్ ఫిక్షన్..."
                  className="w-full px-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                  Category Name (English Key) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Romance, Inspiration, Sci-Fi..."
                  className="w-full px-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                  వివరణ (Description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ఈ వర్గంలో ఎలాంటి కథలు ఉంటాయి..."
                  className="w-full px-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] cursor-pointer"
                >
                  రద్దు చేయి
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !name.trim() || !teluguName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-40"
                >
                  వర్గాన్ని సృష్టించు
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
