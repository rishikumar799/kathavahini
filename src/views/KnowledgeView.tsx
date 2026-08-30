import React, { useState } from 'react';
import { BookOpen, Clock, Tag, Search, Sparkles, ChevronRight } from 'lucide-react';
import { MOCK_KNOWLEDGE_ARTICLES } from '../services/mockData';
import { KnowledgeArticle } from '../types';

interface KnowledgeViewProps {
  onSelectArticle?: (article: KnowledgeArticle) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = () => {
  const [articles] = useState<KnowledgeArticle[]>(MOCK_KNOWLEDGE_ARTICLES as KnowledgeArticle[]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const categories = Array.from(new Set(articles.map(a => a.category)));

  const filteredArticles = articles.filter(art => {
    const matchesCat = !selectedCat || art.category === selectedCat;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      art.teluguTitle.includes(q) || 
      art.summary.includes(q) || 
      art.authorName.includes(q) ||
      art.tags.some(t => t.includes(q));
    return matchesCat && matchesQuery;
  });

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <button
          onClick={() => setSelectedArticle(null)}
          className="inline-flex items-center gap-2 text-sm font-serif-telugu font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
        >
          ← తిరిగి విజ్ఞానాల జాబితాకు
        </button>

        <article className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:bg-[#D87591]/10 dark:text-[#D87591] text-xs font-bold font-serif-telugu">
              {selectedArticle.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-snug">
              {selectedArticle.teluguTitle}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
              <span>రచన: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{selectedArticle.authorName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedArticle.readTimeMinutes} నిమిషాల చదువు
              </span>
              <span>•</span>
              <span>{selectedArticle.publishedAt}</span>
            </div>
          </div>

          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden">
            <img
              src={selectedArticle.coverImage}
              alt={selectedArticle.teluguTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose dark:prose-invert max-w-none text-base sm:text-lg font-serif-telugu leading-relaxed space-y-4 text-[#2E2D36] dark:text-[#E8E1DA]">
            {selectedArticle.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-[#E8E1DA] dark:border-[#2E2D36] flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-[#6F6970]" />
            {selectedArticle.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#23222A] text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]"
              >
                #{t}
              </span>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          విజ్ఞానాలు & వ్యాసాలు
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          తెలుగు సాహిత్య చరిత్ర, రచనా మెళకువలు మరియు భాషా వైభవాన్ని తెలిపే ప్రామాణిక కథనాలు
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="వ్యాసాలు లేదా రచయితల పేరుతో శోధించండి..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] shadow-sm"
          />
          <Search className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3.5" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu shrink-0 transition-all cursor-pointer ${
              selectedCat === null
                ? 'bg-[#7A284B] text-white shadow-md'
                : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36]'
            }`}
          >
            అన్నీ
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu shrink-0 transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#7A284B] text-white shadow-md'
                  : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Knowledge Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
          >
            <div className="h-44 w-full overflow-hidden relative">
              <img
                src={article.coverImage}
                alt={article.teluguTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#101014]/80 backdrop-blur-sm text-white text-[11px] font-bold font-serif-telugu">
                {article.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] line-clamp-2 group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors">
                  {article.teluguTitle}
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu line-clamp-2 mt-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                <span>{article.authorName}</span>
                <span className="flex items-center gap-1 text-[#7A284B] dark:text-[#D87591] font-bold">
                  చదవండి <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
