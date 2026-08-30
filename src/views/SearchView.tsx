import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, User, Laugh, ArrowRight } from 'lucide-react';
import { Story, Novel, Joke, Author } from '../types';
import { StoryCard } from '../components/cards/StoryCard';
import { NovelCard } from '../components/cards/NovelCard';
import { AuthorCard } from '../components/cards/AuthorCard';
import { JokeCard } from '../components/cards/JokeCard';

interface SearchViewProps {
  stories: Story[];
  novels: Novel[];
  jokes: Joke[];
  authors: Author[];
  onSelectStory: (story: Story) => void;
  onSelectNovel: (novel: Novel) => void;
  onSelectAuthor: (author: Author) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  stories,
  novels,
  jokes,
  authors,
  onSelectStory,
  onSelectNovel,
  onSelectAuthor,
}) => {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'stories' | 'novels' | 'authors' | 'jokes'>('all');

  const trendingTerms = ['నిన్నటి వాన', 'గోదావరి', 'వెంకట సుబ్బారావు', 'ప్రేమ కథలు', 'కుటుంబం', 'సస్పెన్స్'];

  const q = query.toLowerCase().trim();

  const filteredStories = stories.filter(s => 
    !q || s.teluguTitle.includes(q) || s.title.toLowerCase().includes(q) || s.author.teluguName.includes(q)
  );

  const filteredNovels = novels.filter(n =>
    !q || n.teluguTitle.includes(q) || n.title.toLowerCase().includes(q) || n.author.teluguName.includes(q)
  );

  const filteredAuthors = authors.filter(a =>
    !q || a.teluguName.includes(q) || a.name.toLowerCase().includes(q)
  );

  const filteredJokes = jokes.filter(j =>
    !q || j.content.includes(q)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          విశ్వ శోధన
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          కథలు, నవలలు, జోక్స్ మరియు రచయితలను ఒకే చోట వెతకండి
        </p>

        {/* Input */}
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            autoFocus
            placeholder="మీరు ఏమి వెతకాలనుకుంటున్నారు? (ఉదా: నిన్నటి వాన, గోదావరి...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white dark:bg-[#18181D] border-2 border-[#7A284B]/30 dark:border-[#D87591]/30 text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] shadow-lg"
          />
          <Search className="w-5 h-5 text-[#7A284B] dark:text-[#D87591] absolute left-4 top-4.5" />
        </div>

        {/* Trending Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-[#6F6970] font-bold">ప్రముఖ శోధనలు:</span>
          {trendingTerms.map(term => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#7A284B] dark:text-[#D87591] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      {query && (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
          <button
            onClick={() => setActiveType('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              activeType === 'all' ? 'bg-[#7A284B] text-white' : 'bg-white text-[#6F6970]'
            }`}
          >
            అన్నీ
          </button>
          <button
            onClick={() => setActiveType('stories')}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              activeType === 'stories' ? 'bg-[#7A284B] text-white' : 'bg-white text-[#6F6970]'
            }`}
          >
            కథలు ({filteredStories.length})
          </button>
          <button
            onClick={() => setActiveType('novels')}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              activeType === 'novels' ? 'bg-[#7A284B] text-white' : 'bg-white text-[#6F6970]'
            }`}
          >
            నవలలు ({filteredNovels.length})
          </button>
          <button
            onClick={() => setActiveType('authors')}
            className={`px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              activeType === 'authors' ? 'bg-[#7A284B] text-white' : 'bg-white text-[#6F6970]'
            }`}
          >
            రచయితలు ({filteredAuthors.length})
          </button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-10">
        {(activeType === 'all' || activeType === 'stories') && filteredStories.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              కథలు ({filteredStories.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map(story => (
                <StoryCard key={story.id} story={story} onSelect={onSelectStory} />
              ))}
            </div>
          </section>
        )}

        {(activeType === 'all' || activeType === 'novels') && filteredNovels.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              నవలలు ({filteredNovels.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNovels.map(novel => (
                <NovelCard key={novel.id} novel={novel} onSelect={onSelectNovel} />
              ))}
            </div>
          </section>
        )}

        {(activeType === 'all' || activeType === 'authors') && filteredAuthors.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              రచయితలు ({filteredAuthors.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuthors.map(author => (
                <AuthorCard key={author.id} author={author} onSelect={onSelectAuthor} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
