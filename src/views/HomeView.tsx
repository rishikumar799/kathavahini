import React from 'react';
import { 
  Feather, BookOpen, Sparkles, TrendingUp, Users, ArrowRight, Star, Heart, Flame, Compass 
} from 'lucide-react';
import { Story, Novel, Author, StoryCategory, Joke, ReadingHistoryItem } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { StoryCard } from '../components/cards/StoryCard';
import { StoryCarousel } from '../components/story/StoryCarousel';
import { NovelCard } from '../components/cards/NovelCard';
import { AuthorCard } from '../components/cards/AuthorCard';
import { CategoryCard } from '../components/cards/CategoryCard';
import { JokeCard } from '../components/cards/JokeCard';
import { ContinueReadingCard } from '../components/story/ContinueReadingCard';

interface HomeViewProps {
  trendingStories: Story[];
  popularStories: Story[];
  newReleases: Story[];
  featuredNovels: Novel[];
  featuredAuthors: Author[];
  jokes: Joke[];
  categories: { name: StoryCategory; description: string; icon: string; count: number }[];
  readingHistory: ReadingHistoryItem[];
  onSelectStory: (story: Story) => void;
  onSelectNovel: (novel: Novel) => void;
  onSelectAuthor: (author: Author) => void;
  onSelectCategory: (category: StoryCategory) => void;
  onSelectTab: (tab: string) => void;
  onOpenWrite: () => void;
  onBookmarkToggle: (storyId: string, e: React.MouseEvent) => void;
  onLikeToggle: (storyId: string, e: React.MouseEvent) => void;
  onFollowToggle: (authorId: string, e: React.MouseEvent) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  trendingStories,
  popularStories,
  newReleases,
  featuredNovels,
  featuredAuthors,
  jokes,
  categories,
  readingHistory,
  onSelectStory,
  onSelectNovel,
  onSelectAuthor,
  onSelectCategory,
  onSelectTab,
  onOpenWrite,
  onBookmarkToggle,
  onLikeToggle,
  onFollowToggle,
}) => {
  const latestRead = readingHistory[0];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. Cinematic Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#15131A] via-[#211B28] to-[#15131A] text-[#FAF7F2] p-6 sm:p-10 lg:p-14 border border-[#2E2D36] shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A284B]/80 text-[#FAF7F2] border border-[#D87591]/30 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#D99A3D]" />
              <span>తెలుగు డిజిటల్ సాహిత్య వేదిక</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif-telugu leading-tight text-white">
              ఈ రోజు ఒక కొత్త <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D87591] via-[#D99A3D] to-[#F7F3EE]">కథతో</span> మొదలు పెట్టండి.
            </h1>

            <p className="text-base sm:text-lg font-serif-telugu text-[#AAA4AC] max-w-xl leading-relaxed">
              తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి. వేలాది మంది పాఠకులతో మరియు ప్రతిభావంతులైన రచయితలతో మీ సాహితీ ప్రయాణం.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onSelectTab('stories')}
                className="px-7 py-3.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>కథలు చదవండి</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenWrite}
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Feather className="w-4 h-4 text-[#D99A3D]" />
                <span>మీ కథ రాయండి</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">25K+</p>
                <p className="text-xs text-[#AAA4AC]">తెలుగు కథలు</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">5K+</p>
                <p className="text-xs text-[#AAA4AC]">రచయితలు</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">1M+</p>
                <p className="text-xs text-[#AAA4AC]">పాఠకులు</p>
              </div>
            </div>
          </div>

          {/* Hero Featured Book Art */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src={trendingStories[0]?.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800'}
                alt="Featured Story"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7A284B] px-2 py-0.5 rounded">
                  ఈ వారపు ప్రత్యేక కథ
                </span>
                <h3 className="text-lg font-bold font-serif-telugu mt-1 truncate">
                  {trendingStories[0]?.teluguTitle}
                </h3>
                <p className="text-xs text-white/80">
                  రచయిత: {trendingStories[0]?.author.teluguName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Continue Reading */}
      {latestRead && (
        <section>
          <ContinueReadingCard
            story={latestRead.story}
            progressPercent={latestRead.progressPercent}
            onContinue={onSelectStory}
          />
        </section>
      )}

      {/* 3. Trending Stories Carousel */}
      <section>
        <SectionHeader
          title="Trending Stories"
          teluguTitle="ట్రెండింగ్ కథలు"
          subtitle="పాఠకులు ఎక్కువగా ఆస్వాదిస్తున్న ప్రముఖ తెలుగు కథలు"
          onAction={() => onSelectTab('stories')}
        />
        <StoryCarousel
          stories={trendingStories}
          onSelectStory={onSelectStory}
          onBookmarkToggle={onBookmarkToggle}
          onLikeToggle={onLikeToggle}
        />
      </section>

      {/* 4. Popular Novels */}
      <section>
        <SectionHeader
          title="Popular Novels"
          teluguTitle="ప్రజాదరణ పొందిన నవలలు"
          subtitle="అధ్యాయాల వారీగా సాగే ఉత్కంఠభరితమైన ధారావాహికలు"
          onAction={() => onSelectTab('novels')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredNovels.slice(0, 4).map(novel => (
            <NovelCard
              key={novel.id}
              novel={novel}
              onSelect={onSelectNovel}
            />
          ))}
        </div>
      </section>

      {/* 5. Explore Categories */}
      <section>
        <SectionHeader
          title="Explore Categories"
          teluguTitle="కథా విభాగాలు"
          subtitle="మీకు నచ్చిన శైలిలో కథలను అన్వేషించండి"
          onAction={() => onSelectTab('categories')}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categories.slice(0, 12).map(cat => (
            <CategoryCard
              key={cat.name}
              category={cat}
              onSelect={onSelectCategory}
            />
          ))}
        </div>
      </section>

      {/* 6. Featured Authors */}
      <section>
        <SectionHeader
          title="Featured Authors"
          teluguTitle="ముఖ్య రచయితలు"
          subtitle="అద్భుతమైన కథలతో గుండెలను గెలుచుకున్న ప్రముఖ రచయితలు"
          onAction={() => onSelectTab('authors')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredAuthors.slice(0, 4).map(author => (
            <AuthorCard
              key={author.id}
              author={author}
              onSelect={onSelectAuthor}
              onFollowToggle={onFollowToggle}
            />
          ))}
        </div>
      </section>

      {/* 7. New Releases */}
      <section>
        <SectionHeader
          title="New Releases"
          teluguTitle="కొత్తగా విడుదలైనవి"
          subtitle="ఇటీవలే ప్రచురించబడిన తాజా తెలుగు రచనలు"
          onAction={() => onSelectTab('stories')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newReleases.slice(0, 6).map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onSelect={onSelectStory}
              onBookmarkToggle={onBookmarkToggle}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      </section>

      {/* 8. Short Content / Jokes */}
      <section>
        <SectionHeader
          title="Short Content & Jokes"
          teluguTitle="హాస్యం & సరదా కబుర్లు"
          subtitle="క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు"
          onAction={() => onSelectTab('jokes')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {jokes.slice(0, 3).map(joke => (
            <JokeCard
              key={joke.id}
              joke={joke}
            />
          ))}
        </div>
      </section>

      {/* 9. Creator CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7A284B] to-[#4A152D] text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            రచయితల సంఘం
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif-telugu">
            మీలో దాగున్న రచయితని ప్రపంచానికి పరిచయం చేయండి.
          </h2>
          <p className="text-sm sm:text-base font-serif-telugu text-white/80 leading-relaxed">
            మీరు కూడా కథలు లేదా నవలలు రాస్తారా? కథావాహిని వేదికపై మీ రచనలను ప్రచురించి లక్షలాది మంది తెలుగు పాఠకుల అభిమానాన్ని పొందండి.
          </p>
          <button
            onClick={onOpenWrite}
            className="px-6 py-3 rounded-full bg-white text-[#7A284B] hover:bg-[#FAF7F2] font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Feather className="w-4 h-4 text-[#7A284B]" />
            <span>ఉచితంగా రచన ప్రారంభించండి</span>
          </button>
        </div>
      </section>
    </div>
  );
};
