import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';
import { Story, StoryCategory } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { StoryCard } from '../components/cards/StoryCard';
import { EmptyState } from '../components/common/EmptyState';

interface StoriesViewProps {
  stories: Story[];
  categories: { name: StoryCategory; count: number }[];
  onSelectStory: (story: Story) => void;
  onBookmarkToggle: (storyId: string, e: React.MouseEvent) => void;
  onLikeToggle: (storyId: string, e: React.MouseEvent) => void;
  selectedCategory?: StoryCategory | null;
  onSelectCategory?: (cat: StoryCategory | null) => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  stories,
  categories,
  onSelectStory,
  onBookmarkToggle,
  onLikeToggle,
  selectedCategory: initialCategory = null,
  onSelectCategory: externalSelectCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'rating'>('popular');

  const handleCatClick = (catName: StoryCategory | null) => {
    setSelectedCategory(catName);
    if (externalSelectCategory) externalSelectCategory(catName);
  };

  const filteredStories = stories.filter(story => {
    const matchesCat = !selectedCategory || story.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q || 
      story.teluguTitle.includes(q) || 
      story.title.toLowerCase().includes(q) ||
      story.author.teluguName.includes(q) ||
      story.teluguExcerpt.includes(q);
    return matchesCat && matchesQ;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.viewCount - a.viewCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          కథల అన్వేషణ
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          తెలుగు సాహిత్యంలో అత్యంత ప్రాచుర్యం పొందిన మరియు తాజా కథలు
        </p>
      </div>

      {/* Controls: Search & Category Pills & Sort */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="కథ లేదా రచయిత పేరుతో శోధించండి..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] shadow-sm"
            />
            <Search className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3.5" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#18181D] px-4 py-2.5 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] focus:outline-none cursor-pointer"
            >
              <option value="popular">అత్యంత జనాదరణ</option>
              <option value="latest">తాజాగా విడుదలైనవి</option>
              <option value="rating">అత్యుత్తమ రేటింగ్</option>
            </select>
          </div>
        </div>

        {/* Category horizontal pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => handleCatClick(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu shrink-0 transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#7A284B] text-white shadow-md'
                : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36] hover:bg-[#FAF7F2]'
            }`}
          >
            అన్ని విభాగాలు
          </button>

          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCatClick(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-[#7A284B] text-white shadow-md'
                  : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36] hover:bg-[#FAF7F2]'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="No Stories Found"
          teluguTitle="కథలు ఏవీ లభించలేదు"
          description="మీరు వెతికిన వర్గంలో లేదా పదంతో కథలు లభించలేదు. దయచేసి శోధన పదాన్ని మార్చి ప్రయత్నించండి."
          actionText="అన్ని కథలు చూడండి"
          onAction={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onSelect={onSelectStory}
              onBookmarkToggle={onBookmarkToggle}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
