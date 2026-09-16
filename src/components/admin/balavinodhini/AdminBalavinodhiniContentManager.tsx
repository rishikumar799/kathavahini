import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Star,
  Tag,
  Clock,
  Heart,
  MessageCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { BalavinodhiniItem, BalavinodhiniAgeGroup } from '../../../types';

interface AdminBalavinodhiniContentManagerProps {
  items: BalavinodhiniItem[];
  initialCategory?: string;
  onOpenCreateModal: (contentType?: string, categoryId?: string) => void;
  onEditItem: (item: BalavinodhiniItem) => void;
  onDeleteItem: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onOpenPreview?: (item: BalavinodhiniItem) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'అన్ని విభాగాలు (All)' },
  { id: 'stories', label: 'బాలల కథలు (Stories)' },
  { id: 'science', label: 'శాస్త్ర విజ్ఞానం (Science)' },
  { id: 'poems', label: 'బాలల గేయాలు (Poems)' },
  { id: 'facts', label: 'ఆసక్తికర నిజాలు (Facts)' },
  { id: 'nature', label: 'ప్రకృతి & జంతువులు (Nature)' },
  { id: 'history', label: 'చరిత్ర & మహనీయులు (History)' },
  { id: 'culture', label: 'మన సంస్కృతి (Culture)' },
  { id: 'jokes', label: 'బాలల జోక్స్ (Jokes)' },
  { id: 'riddles', label: 'పొడుపు కథలు (Riddles)' },
  { id: 'creations', label: 'పిల్లల సృజనలు (Creations)' },
  { id: 'tenali', label: 'తెనాలి రామకృష్ణ (Tenali Raman)' },
  { id: 'panchatantra', label: 'పంచతంత్రం (Panchatantra)' },
  { id: 'moral', label: 'నీతి కథలు (Moral Stories)' },
  { id: 'bedtime', label: 'చందమామ కథలు (Bedtime)' },
  { id: 'biographies', label: 'స్ఫూర్తిదాయక జీవితాలు (Biographies)' },
];

const AGE_GROUPS = [
  { id: 'all', label: 'అన్ని వయస్సులు' },
  { id: '4-6', label: '4 - 6 సంవత్సరాలు' },
  { id: '7-9', label: '7 - 9 సంవత్సరాలు' },
  { id: '10-12', label: '10 - 12 సంవత్సరాలు' },
  { id: '13-15', label: '13 - 15 సంవత్సరాలు' },
];

export const AdminBalavinodhiniContentManager: React.FC<AdminBalavinodhiniContentManagerProps> = ({
  items,
  initialCategory = 'all',
  onOpenCreateModal,
  onEditItem,
  onDeleteItem,
  onTogglePublish,
  onToggleFeatured,
  onOpenPreview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<BalavinodhiniItem | null>(null);

  // Sync initialCategory when it changes from sidebar
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredItems = items.filter(item => {
    // Category match
    const matchesCategory =
      selectedCategory === 'all' ||
      item.categoryId === selectedCategory ||
      (selectedCategory === 'stories' && (item.contentType === 'story' || item.categoryId === 'stories')) ||
      (selectedCategory === 'science' && (item.contentType === 'science_article' || item.categoryId === 'science')) ||
      (selectedCategory === 'poems' && (item.contentType === 'poem' || item.categoryId === 'poems')) ||
      (selectedCategory === 'jokes' && (item.contentType === 'joke' || item.categoryId === 'jokes')) ||
      (selectedCategory === 'riddles' && (item.contentType === 'riddle' || item.categoryId === 'riddles')) ||
      (selectedCategory === 'facts' && (item.categoryId === 'facts' || item.categoryId === 'nature')) ||
      (selectedCategory === 'creations' && (item.categoryId === 'creations' || item.contentType === 'drawing' || item.contentType === 'book'));

    // Age match
    const matchesAge = selectedAge === 'all' || item.ageGroup === selectedAge || item.ageGroup === 'all';

    // Status match
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && item.status === 'published') ||
      (selectedStatus === 'draft' && item.status === 'draft') ||
      (selectedStatus === 'featured' && item.featured);

    // Search query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (item.teluguTitle && item.teluguTitle.toLowerCase().includes(query)) ||
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.authorName && item.authorName.toLowerCase().includes(query)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));

    return matchesCategory && matchesAge && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            బాలవినోదిని కంటెంట్ నిర్వహణ (Content Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            కథలు, విజ్ఞానం, గేయాలు మరియు విశేషాల ప్రత్యక్ష సవరణ మరియు ప్రచురణ నియంత్రణలు
          </p>
        </div>

        <button
          onClick={() => onOpenCreateModal('story', selectedCategory !== 'all' ? selectedCategory : 'stories')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-serif-telugu"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త కంటెంట్ జోడించండి</span>
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="శీర్షిక, రచయిత లేదా ట్యాగ్ వెతకండి..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-[#6F6970] absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Age Group Dropdown */}
          <div>
            <select
              value={selectedAge}
              onChange={e => setSelectedAge(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {AGE_GROUPS.map(age => (
                <option key={age.id} value={age.id}>
                  {age.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#222229] p-1 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            {(['all', 'published', 'draft', 'featured'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all font-serif-telugu cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                }`}
              >
                {st === 'all' && 'అన్నీ'}
                {st === 'published' && 'లైవ్'}
                {st === 'draft' && 'డ్రాఫ్ట్'}
                {st === 'featured' && 'ఫీచర్డ్'}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary Count */}
        <div className="flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu pt-1">
          <span>మొత్తం ఫలితాలు: <strong className="text-amber-600 font-bold">{filteredItems.length}</strong> అంశాలు</span>
          {(searchQuery || selectedCategory !== 'all' || selectedAge !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAge('all');
                setSelectedStatus('all');
              }}
              className="text-rose-600 hover:underline cursor-pointer"
            >
              ఫిల్టర్లను క్లియర్ చేయండి
            </button>
          )}
        </div>
      </div>

      {/* Content Grid / Table */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18181D] border border-dashed border-[#E8E1DA] dark:border-[#2E2D36] space-y-3">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto opacity-40" />
          <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            ఎలాంటి రచనలు కనిపించలేదు
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-sm mx-auto">
            మీరు ఎంచుకున్న ఫిల్టర్లకు సరిపోయే కంటెంట్ అందుబాటులో లేదు. కొత్త అంశాన్ని చేర్చడానికి క్రింది బటన్ నొక్కండి.
          </p>
          <button
            onClick={() => onOpenCreateModal('story', selectedCategory !== 'all' ? selectedCategory : 'stories')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer font-serif-telugu"
          >
            <Plus className="w-4 h-4" />
            <span>కంటెంట్ జోడించండి</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-3">
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px] font-serif-telugu">
                    {item.subcategoryId || item.categoryId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleFeatured(item.id)}
                      title={item.featured ? 'ఫీచర్డ్ నుండి తొలగించండి' : 'హోమ్‌పేజీలో ఫీచర్ చేయండి'}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        item.featured
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-[#6F6970] hover:text-amber-500'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => onTogglePublish(item.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        item.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {item.status === 'published' ? 'లైవ్' : 'డ్రాఫ్ట్'}
                    </button>
                  </div>
                </div>

                {/* Cover Image & Title */}
                <div className="flex items-start gap-3">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-black/5 shadow-inner"
                    />
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] line-clamp-2 leading-snug">
                      {item.teluguTitle || item.title}
                    </h3>
                    <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu truncate">
                      ✍️ {item.authorName || 'కథావాహిని'}
                    </p>
                  </div>
                </div>

                {/* Excerpt */}
                {item.teluguDescription && (
                  <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu line-clamp-2 leading-relaxed">
                    {item.teluguDescription}
                  </p>
                )}

                {/* Age & Metadata */}
                <div className="flex items-center gap-3 text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu pt-1 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
                  <span>👶 {item.ageGroup} సం||</span>
                  {item.readingTimeMinutes && <span>⏱️ {item.readingTimeMinutes} నిమి</span>}
                  <span>❤️ {item.likeCount || 0}</span>
                  <span>💬 {item.commentCount || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-serif-telugu"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ప్రివ్యూ</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                    title="సవరించండి"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="తొలగించండి"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Quick Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs font-serif-telugu">
                {previewItem.subcategoryId || previewItem.categoryId}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:text-[#17151A] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {previewItem.coverImage && (
              <img
                src={previewItem.coverImage}
                alt=""
                className="w-full h-52 object-cover rounded-2xl border border-black/5"
              />
            )}

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {previewItem.teluguTitle || previewItem.title}
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                రచన: {previewItem.authorName || 'కథావాహిని'} | వయో వర్గం: {previewItem.ageGroup} సం||
              </p>
            </div>

            <div className="text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed whitespace-pre-line bg-[#FAF7F2] dark:bg-[#222229] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
              {previewItem.content}
            </div>

            {previewItem.riddleAnswer && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-900 dark:text-amber-200 font-serif-telugu">
                🎯 జవాబు: {previewItem.riddleAnswer}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const toEdit = previewItem;
                  setPreviewItem(null);
                  onEditItem(toEdit);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer font-serif-telugu inline-flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>సవరించండి</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
