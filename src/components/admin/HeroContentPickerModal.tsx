import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Layers, 
  Smile, 
  Lightbulb, 
  Sparkles, 
  Check, 
  Filter, 
  Eye, 
  Heart,
  UserCheck
} from 'lucide-react';
import { 
  PromotedContentType, 
  Story, 
  Novel, 
  Joke, 
  KnowledgeArticle, 
  BalavinodhiniItem 
} from '../../types';

export interface ContentPickerItem {
  id: string;
  contentType: PromotedContentType;
  title: string;
  teluguTitle: string;
  authorName: string;
  category: string;
  coverImage: string;
  publishedAt?: string;
  viewsCount?: number;
  likesCount?: number;
  status?: string;
}

interface HeroContentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContentType?: PromotedContentType;
  selectedContentId?: string;
  onSelect: (item: ContentPickerItem) => void;
  stories: Story[];
  novels: Novel[];
  jokes: Joke[];
  knowledge: KnowledgeArticle[];
  balavinodhiniItems?: BalavinodhiniItem[];
}

export const HeroContentPickerModal: React.FC<HeroContentPickerModalProps> = ({
  isOpen,
  onClose,
  selectedContentType = 'story',
  selectedContentId,
  onSelect,
  stories,
  novels,
  jokes,
  knowledge,
  balavinodhiniItems = [],
}) => {
  const [activeFilterType, setActiveFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Convert all domain content into normalized list
  const allContentItems = useMemo<ContentPickerItem[]>(() => {
    const list: ContentPickerItem[] = [];

    // 1. Stories
    stories.forEach(s => {
      list.push({
        id: s.id,
        contentType: 'story',
        title: s.title,
        teluguTitle: s.teluguTitle || s.title,
        authorName: s.author?.teluguName || s.author?.name || 'రచయిత',
        category: s.category || 'సాహిత్యం',
        coverImage: s.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
        publishedAt: s.publishedAt,
        viewsCount: s.viewCount || 0,
        likesCount: s.likeCount || 0,
        status: s.status,
      });
    });

    // 2. Novels
    novels.forEach(n => {
      list.push({
        id: n.id,
        contentType: 'novel',
        title: n.title,
        teluguTitle: n.teluguTitle || n.title,
        authorName: n.author?.teluguName || n.author?.name || 'నవలా రచయిత',
        category: n.category || 'నవల',
        coverImage: n.coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
        publishedAt: n.publishedAt,
        viewsCount: n.viewCount || 0,
        likesCount: n.likeCount || 0,
        status: n.status,
      });
    });

    // 3. Jokes
    jokes.forEach(j => {
      list.push({
        id: j.id,
        contentType: 'joke',
        title: j.content.slice(0, 40) + '...',
        teluguTitle: j.content.slice(0, 40) + '...',
        authorName: j.author?.teluguName || j.author?.name || 'హాస్య ప్రియుడు',
        category: j.category || 'హాస్యం',
        coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
        publishedAt: j.publishedAt,
        likesCount: j.likeCount || 0,
      });
    });

    // 4. Knowledge
    knowledge.forEach(k => {
      list.push({
        id: k.id,
        contentType: 'knowledge',
        title: k.title,
        teluguTitle: k.teluguTitle || k.title,
        authorName: k.authorName || 'కథావాహిని సంపాదకవర్గం',
        category: k.category || 'విజ్ఞానం',
        coverImage: k.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        publishedAt: k.publishedAt,
      });
    });

    // 5. Balavinodhini
    balavinodhiniItems.forEach(b => {
      list.push({
        id: b.id,
        contentType: 'balavinodhini',
        title: b.title,
        teluguTitle: b.teluguTitle || b.title,
        authorName: b.authorName || 'బాల రచయిత',
        category: b.subcategoryId || 'బాల సాహిత్యం',
        coverImage: b.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        viewsCount: b.viewsCount || 0,
        likesCount: b.likesCount || 0,
      });
    });

    return list;
  }, [stories, novels, jokes, knowledge, balavinodhiniItems]);

  // Extract categories for filter
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allContentItems.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [allContentItems]);

  // Filter items based on query, content type, and category
  const filteredItems = useMemo(() => {
    return allContentItems.filter(item => {
      // Type filter
      if (activeFilterType !== 'all' && item.contentType !== activeFilterType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchTelugu = (item.teluguTitle || '').toLowerCase().includes(q);
        const matchAuthor = (item.authorName || '').toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        return matchTitle || matchTelugu || matchAuthor || matchCategory;
      }

      return true;
    });
  }, [allContentItems, activeFilterType, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#16151D] rounded-3xl border border-[#E8E1DA] dark:border-[#2A2834] shadow-2xl overflow-hidden font-serif-telugu">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between gap-3 bg-[#FAF7F2]/80 dark:bg-[#121118]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                హెరో బ్యానర్ కోసం కంటెంట్ ఎంపిక (Select Hero Content)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                కథలు, నవలలు, జోక్స్ లేదా విజ్ఞాన రచనలను సులభంగా శోధించి ఎంచుకోండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-5 border-b border-[#E8E1DA] dark:border-[#26242E] space-y-3 bg-white dark:bg-[#16151D]">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6F6970] dark:text-[#AAA4AC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="శీర్షిక, రచయిత పేరు లేదా వర్గం ద్వారా వెతకండి (Search stories, novels, jokes)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6F6970] hover:text-black dark:hover:text-white cursor-pointer"
              >
                తొలగించు
              </button>
            )}
          </div>

          {/* Type Filter Pills & Category Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'అన్నీ (All)', count: allContentItems.length },
                { id: 'story', label: 'కథలు', count: stories.length },
                { id: 'novel', label: 'నవలలు', count: novels.length },
                { id: 'joke', label: 'జోక్స్', count: jokes.length },
                { id: 'knowledge', label: 'విజ్ఞానం', count: knowledge.length },
                { id: 'balavinodhini', label: 'బాలవినోదిని', count: balavinodhiniItems.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilterType === tab.id
                      ? 'bg-[#7A284B] text-white shadow-xs'
                      : 'bg-[#FAF7F2] dark:bg-[#1E1D26] text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white border border-[#E8E1DA] dark:border-[#26242E]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilterType === tab.id ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">వర్గం:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1D26] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B]"
                >
                  <option value="all">అన్ని వర్గాలు</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="text-xs text-[#6F6970] dark:text-[#AAA4AC] pb-1">
            మొత్తం <strong>{filteredItems.length}</strong> రచనలు కనుగొనబడ్డాయి:
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Search className="w-10 h-10 text-[#6F6970]/40 mx-auto" />
              <p className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
                ఎలాంటి ఫలితాలు లభించలేదు
              </p>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                దయచేసి మరొక శోధన పదం లేదా ఫిల్టర్‌ను ప్రయత్నించండి.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => {
                const isCurrentSelected = selectedContentId === item.id;

                return (
                  <div
                    key={`${item.contentType}-${item.id}`}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group hover:scale-[1.01] ${
                      isCurrentSelected
                        ? 'bg-[#7A284B]/10 border-[#7A284B] ring-2 ring-[#7A284B]/30'
                        : 'bg-white dark:bg-[#1B1A24] border-[#E8E1DA] dark:border-[#26242E] hover:border-[#7A284B]/50 shadow-xs'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 relative shadow-sm">
                      <img
                        src={item.coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isCurrentSelected && (
                        <div className="absolute inset-0 bg-[#7A284B]/60 flex items-center justify-center text-white">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.contentType === 'story' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                          item.contentType === 'novel' ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' :
                          item.contentType === 'joke' ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300' :
                          item.contentType === 'knowledge' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' :
                          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {item.contentType === 'story' ? 'కథ' :
                           item.contentType === 'novel' ? 'నవల' :
                           item.contentType === 'joke' ? 'హాస్యం' :
                           item.contentType === 'knowledge' ? 'విజ్ఞానం' : 'బాలవినోదిని'}
                        </span>

                        <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] truncate">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] truncate group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors">
                        {item.teluguTitle || item.title}
                      </h4>

                      <div className="text-xs text-[#6F6970] dark:text-[#AAA4AC] truncate flex items-center gap-1">
                        <span>రచన:</span>
                        <strong className="text-[#17151A] dark:text-[#F7F3EE]">{item.authorName}</strong>
                      </div>

                      {/* Stats */}
                      {(item.viewsCount !== undefined || item.likesCount !== undefined) && (
                        <div className="flex items-center gap-3 text-[10px] text-[#6F6970] dark:text-[#AAA4AC] pt-0.5">
                          {item.viewsCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.viewsCount}
                            </span>
                          )}
                          {item.likesCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" />
                              {item.likesCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Select Indicator Button */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrentSelected
                            ? 'bg-[#7A284B] text-white'
                            : 'bg-[#FAF7F2] dark:bg-[#252430] hover:bg-[#7A284B] hover:text-white text-[#17151A] dark:text-white'
                        }`}
                      >
                        {isCurrentSelected ? '✓ ఎంపికైంది' : 'ఎంచుకోండి'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2]/80 dark:bg-[#121118]/80 flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <span>ఏదైనా కార్డుపై క్లిక్ చేసి నేరుగా హెరో స్లైడ్‌కు జోడించవచ్చు.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-[#17151A] dark:text-white font-bold cursor-pointer transition-colors"
          >
            రద్దు చేయండి (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
