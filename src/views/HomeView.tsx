import React, { useState, useEffect } from 'react';
import { 
  Feather, BookOpen, Sparkles, TrendingUp, Users, ArrowRight, Star, Heart, Flame, Compass, Smile, Gamepad2 
} from 'lucide-react';
import { 
  Story, 
  Novel, 
  Author, 
  StoryCategory, 
  Joke, 
  ReadingHistoryItem, 
  KnowledgeArticle, 
  HeroBannerConfig, 
  LandingPageLayoutConfig, 
  LandingPageSectionConfig,
  LandingPageSectionId
} from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { StoryCard } from '../components/cards/StoryCard';
import { StoryCarousel } from '../components/story/StoryCarousel';
import { NovelCard } from '../components/cards/NovelCard';
import { AuthorCard } from '../components/cards/AuthorCard';
import { CategoryCard } from '../components/cards/CategoryCard';
import { JokeCard } from '../components/cards/JokeCard';
import { ContinueReadingCard } from '../components/story/ContinueReadingCard';
import { EditorialHeroBanner } from '../components/home/EditorialHeroBanner';
import { landingPageService, DEFAULT_HERO_CONFIG, DEFAULT_LANDING_SECTIONS } from '../services/landingPageService';

interface HomeViewProps {
  trendingStories: Story[];
  popularStories: Story[];
  newReleases: Story[];
  featuredNovels: Novel[];
  featuredAuthors: Author[];
  jokes: Joke[];
  knowledge?: KnowledgeArticle[];
  categories: { name: StoryCategory; description: string; icon: string; count: number }[];
  readingHistory: ReadingHistoryItem[];
  isAdmin?: boolean;
  onOpenAdminHeroEditor?: () => void;
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
  knowledge = [],
  categories,
  readingHistory,
  isAdmin,
  onOpenAdminHeroEditor,
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
  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(DEFAULT_HERO_CONFIG);
  const [sections, setSections] = useState<LandingPageSectionConfig[]>(DEFAULT_LANDING_SECTIONS);

  // Subscribe to real-time hero banner config and landing layout
  useEffect(() => {
    const unsubHero = landingPageService.subscribeHeroConfig((cfg) => {
      setHeroConfig(cfg);
    });

    const unsubLayout = landingPageService.subscribeLandingLayout((layout) => {
      setSections(layout.sections);
    });

    return () => {
      unsubHero();
      unsubLayout();
    };
  }, []);

  const latestRead = readingHistory[0];

  // Render specific section by ID
  const renderSection = (sectionId: LandingPageSectionId) => {
    switch (sectionId) {
      case 'hero':
        return (
          <EditorialHeroBanner
            key="section-hero"
            config={heroConfig}
            stories={trendingStories.length > 0 ? trendingStories : popularStories}
            novels={featuredNovels}
            jokes={jokes}
            knowledge={knowledge}
            isAdmin={isAdmin}
            onOpenAdminHeroEditor={onOpenAdminHeroEditor}
            onSelectTab={onSelectTab}
            onOpenWrite={onOpenWrite}
            onSelectStory={onSelectStory}
            onSelectNovel={onSelectNovel}
          />
        );

      case 'continue_reading':
        if (!latestRead) return null;
        return (
          <section key="section-continue_reading">
            <ContinueReadingCard
              story={latestRead.story}
              progressPercent={latestRead.progressPercent}
              onContinue={onSelectStory}
            />
          </section>
        );

      case 'trending_stories':
        return (
          <section key="section-trending_stories">
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
        );

      case 'novels':
        return (
          <section key="section-novels">
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
        );

      case 'categories':
        return (
          <section key="section-categories">
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
        );

      case 'authors':
        return (
          <section key="section-authors">
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
        );

      case 'new_releases':
        return (
          <section key="section-new_releases">
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
        );

      case 'jokes':
        return (
          <section key="section-jokes">
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
        );

      case 'balavinodhini':
        return (
          <section key="section-balavinodhini" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-950/50 border border-purple-500/30 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold font-serif-telugu uppercase tracking-wider border border-pink-500/30 flex items-center gap-1.5 w-fit">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>పిల్లల ప్రపంచం • బాలవినోదిని</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">
                  బాలల కథలు, విజ్ఞానం, గేయాలు మరియు ఇంటరాక్టివ్ ఆటలు!
                </h3>
                <p className="text-xs sm:text-sm font-serif-telugu text-purple-200/80 leading-relaxed">
                  తెలుగు పిల్లల కోసం ప్రత్యేకంగా రూపొందించిన విజ్ఞాన వినోద వేదికను అన్వేషించండి.
                </p>
              </div>
              <button
                onClick={() => onSelectTab('balavinodhini')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs sm:text-sm font-serif-telugu shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2 shrink-0"
              >
                <span>బాలవినోదినిలోకి ప్రవేశించండి</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        );

      case 'creator_cta':
        return (
          <section key="section-creator_cta" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7A284B] to-[#4A152D] text-white p-8 sm:p-12 shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider font-serif-telugu">
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
                className="px-6 py-3 rounded-full bg-white text-[#7A284B] hover:bg-[#FAF7F2] font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2 font-serif-telugu"
              >
                <Feather className="w-4 h-4 text-[#7A284B]" />
                <span>ఉచితంగా రచన ప్రారంభించండి</span>
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Sort and filter active sections
  const activeSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {activeSections.map(sec => renderSection(sec.id))}
    </div>
  );
};
