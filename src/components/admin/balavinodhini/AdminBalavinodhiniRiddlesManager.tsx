import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  Save,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { BalavinodhiniItem, BalavinodhiniAgeGroup } from '../../../types';

interface AdminBalavinodhiniRiddlesManagerProps {
  items: BalavinodhiniItem[];
  onCreateRiddle: (riddle: Partial<BalavinodhiniItem>) => Promise<void>;
  onUpdateRiddle: (id: string, updates: Partial<BalavinodhiniItem>) => Promise<void>;
  onDeleteRiddle: (id: string) => Promise<void>;
  onTogglePublish: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export const AdminBalavinodhiniRiddlesManager: React.FC<AdminBalavinodhiniRiddlesManagerProps> = ({
  items,
  onCreateRiddle,
  onUpdateRiddle,
  onDeleteRiddle,
  onTogglePublish,
  onToggleFeatured,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BalavinodhiniItem | null>(null);

  // Modal Form state
  const [formTeluguQuestion, setFormTeluguQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formHint, setFormHint] = useState('');
  const [formAgeGroup, setFormAgeGroup] = useState<BalavinodhiniAgeGroup>('7-9');
  const [formDifficulty, setFormDifficulty] = useState<'సులభం' | 'మధ్యస్థం' | 'కఠినం'>('సులభం');
  const [formSubcategory, setFormSubcategory] = useState('సులభమైన పొడుపు కథలు');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter items specifically for category === 'riddles' or contentType === 'riddle'
  const riddles = items.filter(
    item => item.categoryId === 'riddles' || item.contentType === 'riddle'
  );

  const filteredRiddles = riddles.filter(r => {
    const matchesAge = selectedAge === 'all' || r.ageGroup === selectedAge || r.ageGroup === 'all';
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (r.teluguTitle && r.teluguTitle.toLowerCase().includes(query)) ||
      (r.content && r.content.toLowerCase().includes(query)) ||
      (r.riddleAnswer && r.riddleAnswer.toLowerCase().includes(query));
    return matchesAge && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTeluguQuestion('');
    setFormAnswer('');
    setFormHint('');
    setFormAgeGroup('7-9');
    setFormDifficulty('సులభం');
    setFormSubcategory('సులభమైన పొడుపు కథలు');
    setFormStatus('published');
    setFormFeatured(false);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (riddle: BalavinodhiniItem) => {
    setEditingItem(riddle);
    setFormTeluguQuestion(riddle.content || riddle.teluguTitle || '');
    setFormAnswer(riddle.riddleAnswer || '');
    setFormHint(riddle.teluguDescription || '');
    setFormAgeGroup(riddle.ageGroup || '7-9');
    setFormDifficulty(riddle.difficulty || 'సులభం');
    setFormSubcategory(riddle.subcategoryId || 'సులభమైన పొడుపు కథలు');
    setFormStatus(riddle.status === 'published' ? 'published' : 'draft');
    setFormFeatured(riddle.featured ?? false);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeluguQuestion.trim()) {
      setError('దయచేసి పొడుపు కథ ప్రశ్నను నమోదు చేయండి.');
      return;
    }
    if (!formAnswer.trim()) {
      setError('దయచేసి పొడుపు కథ జవాబును నమోదు చేయండి.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Partial<BalavinodhiniItem> = {
      teluguTitle: formTeluguQuestion.slice(0, 40) + '...',
      title: 'Telugu Riddle',
      content: formTeluguQuestion.trim(),
      riddleAnswer: formAnswer.trim(),
      teluguDescription: formHint.trim() || 'ఆలోచించి జవాబు చెప్పండి!',
      description: formHint.trim(),
      categoryId: 'riddles',
      subcategoryId: formSubcategory,
      contentType: 'riddle',
      ageGroup: formAgeGroup,
      difficulty: formDifficulty,
      status: formStatus,
      featured: formFeatured,
      authorName: 'పొడుపుల మామయ్య',
      coverImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=800',
    };

    try {
      if (editingItem) {
        await onUpdateRiddle(editingItem.id, payload);
      } else {
        await onCreateRiddle(payload);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'పొడుపు కథ భద్రపరచడంలో లోపం తలెత్తింది.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAnswerReveal = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            పొడుపు కథల నిర్వహణ (Riddles Manager)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            చిన్నారుల ఆలోచనా శక్తిని పెంచే తెలుగు పొడుపు కథల పూర్తి డేటాబేస్ & నిర్వహణ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-serif-telugu"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త పొడుపు కథ జోడించండి</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="ప్రశ్న లేదా జవాబు వెతకండి..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-[#6F6970] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu shrink-0">వయో వర్గం:</span>
          <select
            value={selectedAge}
            onChange={e => setSelectedAge(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">అన్ని వయస్సులు</option>
            <option value="4-6">4-6 సంవత్సరాలు</option>
            <option value="7-9">7-9 సంవత్సరాలు</option>
            <option value="10-12">10-12 సంవత్సరాలు</option>
            <option value="13-15">13-15 సంవత్సరాలు</option>
          </select>
        </div>
      </div>

      {/* Riddles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRiddles.map((riddle, idx) => {
          const isRevealed = revealedAnswers[riddle.id] || false;
          return (
            <div
              key={riddle.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px] font-serif-telugu">
                    పొడుపు కథ #{idx + 1} • {riddle.ageGroup} సం||
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleFeatured(riddle.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        riddle.featured ? 'text-amber-500 bg-amber-500/10' : 'text-[#6F6970]'
                      }`}
                      title={riddle.featured ? 'ఫీచర్డ్' : 'ఫీచర్ చేయండి'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => onTogglePublish(riddle.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        riddle.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {riddle.status === 'published' ? 'లైవ్' : 'డ్రాఫ్ట్'}
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="bg-[#FAF7F2] dark:bg-[#222229] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
                  <p className="text-xs sm:text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                    {riddle.content || riddle.teluguTitle}
                  </p>
                </div>

                {/* Hint if present */}
                {riddle.teluguDescription && (
                  <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                    💡 క్లూ: {riddle.teluguDescription}
                  </p>
                )}

                {/* Interactive Answer reveal */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 font-serif-telugu block">
                      జవాబు (Answer):
                    </span>
                    <p className="text-xs font-bold font-serif-telugu text-amber-900 dark:text-amber-200 truncate">
                      {isRevealed ? riddle.riddleAnswer || 'జవాబు నమోదు కాలేదు' : '••••••••••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAnswerReveal(riddle.id)}
                    className="p-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer shrink-0"
                    title={isRevealed ? 'దాచండి' : 'చూడండి'}
                  >
                    {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
                <button
                  onClick={() => handleOpenEdit(riddle)}
                  className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="సవరించండి"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteRiddle(riddle.id)}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="తొలగించండి"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Riddle Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {editingItem ? 'పొడుపు కథను సవరించండి' : 'కొత్త పొడుపు కథను సృష్టించండి'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:text-[#17151A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-serif-telugu">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  పొడుపు కథ ప్రశ్న (Riddle Question) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="ఉదా: పచ్చని కోటు వేసుకుంటాడు, ఎర్రని ముక్కుతో మాట్లాడుతాడు..."
                  value={formTeluguQuestion}
                  onChange={e => setFormTeluguQuestion(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  జవాబు (Answer with Emoji) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ఉదా: రామచిలక (Parrot) 🦜, కొబ్బరికాయ 🥥..."
                  value={formAnswer}
                  onChange={e => setFormAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  క్లూ / వివరణ (Hint / Clue)
                </label>
                <input
                  type="text"
                  placeholder="ఉదా: తియ్యని పండ్లను ఇష్టపడుతుంది..."
                  value={formHint}
                  onChange={e => setFormHint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    వయో వర్గం
                  </label>
                  <select
                    value={formAgeGroup}
                    onChange={e => setFormAgeGroup(e.target.value as BalavinodhiniAgeGroup)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="4-6">4 - 6 సంవత్సరాలు</option>
                    <option value="7-9">7 - 9 సంవత్సరాలు</option>
                    <option value="10-12">10 - 12 సంవత్సరాలు</option>
                    <option value="13-15">13 - 15 సంవత్సరాలు</option>
                    <option value="all">అందరికీ (All)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    క్లిష్టత (Difficulty)
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="సులభం">సులభం</option>
                    <option value="మధ్యస్థం">మధ్యస్థం</option>
                    <option value="కఠినం">కఠినం</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  <input
                    type="checkbox"
                    checked={formStatus === 'published'}
                    onChange={e => setFormStatus(e.target.checked ? 'published' : 'draft')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>వెంటనే లైవ్ చేయండి (Published)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={e => setFormFeatured(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>⭐ ఫీచర్డ్</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] text-xs font-bold cursor-pointer"
                >
                  రద్దు చేయండి
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'భద్రపరుస్తోంది...' : 'భద్రపరచండి'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
