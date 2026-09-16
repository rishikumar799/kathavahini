import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Search, 
  Plus, 
  Heart, 
  Share2, 
  Eye, 
  Brain, 
  Palette, 
  Smile, 
  Clock, 
  Bookmark,
  Volume2
} from 'lucide-react';
import { 
  BalavinodhiniItem, 
  BalavinodhiniTab, 
  BalavinodhiniAgeGroup, 
  BalavinodhiniTodayConfig,
  User 
} from '../types';
import { balavinodhiniService } from '../services/balavinodhiniService';
import { BalavinodhiniHero } from '../components/balavinodhini/BalavinodhiniHero';
import { BalavinodhiniCategoryGrid } from '../components/balavinodhini/BalavinodhiniCategoryGrid';
import { BalavinodhiniDailyRow } from '../components/balavinodhini/BalavinodhiniDailyRow';
import { BalavinodhiniTodayGameCard } from '../components/balavinodhini/BalavinodhiniTodayGameCard';
import { BalavinodhiniInteractiveQuiz } from '../components/balavinodhini/BalavinodhiniInteractiveQuiz';
import { BalavinodhiniRiddleWidget } from '../components/balavinodhini/BalavinodhiniRiddleWidget';
import { BalavinodhiniCreationsWidget } from '../components/balavinodhini/BalavinodhiniCreationsWidget';
import { BalavinodhiniMoreGamesGrid } from '../components/balavinodhini/BalavinodhiniMoreGamesGrid';
import { BalavinodhiniBottomBanners } from '../components/balavinodhini/BalavinodhiniBottomBanners';
import { BalavinodhiniTabs, BALAVINODHINI_ALL_TABS } from '../components/balavinodhini/BalavinodhiniTabs';
import { BalavinodhiniStoryCard } from '../components/balavinodhini/BalavinodhiniStoryCard';
import { BalavinodhiniRiddleCard } from '../components/balavinodhini/BalavinodhiniRiddleCard';
import { BalavinodhiniGameSection } from '../components/balavinodhini/BalavinodhiniGameSection';
import { BalavinodhiniItemDetailModal } from '../components/balavinodhini/BalavinodhiniItemDetailModal';
import { BalavinodhiniBookReaderModal } from '../components/balavinodhini/BalavinodhiniBookReaderModal';
import { BalavinodhiniCreationModal } from '../components/balavinodhini/BalavinodhiniCreationModal';
import { BalavinodhiniCreatorProfileModal } from '../components/balavinodhini/BalavinodhiniCreatorProfileModal';

interface BalavinodhiniViewProps {
  currentUser: User | null;
  onOpenAuth?: () => void;
  onNavigate?: (tab: string) => void;
}

export const BalavinodhiniView: React.FC<BalavinodhiniViewProps> = ({
  currentUser,
  onOpenAuth,
  onNavigate,
}) => {
  const [items, setItems] = useState<BalavinodhiniItem[]>([]);
  const [todayConfig, setTodayConfig] = useState<BalavinodhiniTodayConfig | null>(null);
  const [activeTab, setActiveTab] = useState<BalavinodhiniTab>('home');
  const [selectedAge, setSelectedAge] = useState<BalavinodhiniAgeGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedItem, setSelectedItem] = useState<BalavinodhiniItem | null>(null);
  const [selectedBook, setSelectedBook] = useState<BalavinodhiniItem | null>(null);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [creatorModalData, setCreatorModalData] = useState<{
    name: string;
    bio?: string;
    avatar?: string;
  } | null>(null);

  // Subscribe to real-time Balavinodhini items & today's highlights
  useEffect(() => {
    const unsubItems = balavinodhiniService.subscribeItems((newItems) => {
      setItems(newItems);
      // Load bookmarks for current items
      const bSet = new Set<string>();
      newItems.forEach(i => {
        if (balavinodhiniService.isBookmarked(i.id, currentUser?.id)) {
          bSet.add(i.id);
        }
      });
      setBookmarkedIds(bSet);
    });

    const unsubToday = balavinodhiniService.subscribeTodayConfig((cfg) => {
      setTodayConfig(cfg);
    });

    return () => {
      unsubItems();
      unsubToday();
    };
  }, [currentUser?.id]);

  // Likes handler
  const handleLikeToggle = async (itemId: string) => {
    await balavinodhiniService.toggleLike(itemId, currentUser?.id);
  };

  // Bookmark handler
  const handleBookmarkToggle = async (itemId: string) => {
    const isNowBookmarked = await balavinodhiniService.toggleBookmark(itemId, currentUser?.id);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isNowBookmarked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  // Share handler
  const handleShare = (item: BalavinodhiniItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.teluguTitle || item.title,
        text: `కథావాహిని బాలవినోదినిలో చదవండి: ${item.teluguTitle || item.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('లింక్ కాపీ చేయబడింది!');
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    let list = items.filter(i => i.status === 'published' && i.moderationStatus !== 'rejected');

    if (activeTab === 'my-creations') {
      if (currentUser?.id) {
        list = items.filter(i => i.authorId === currentUser.id);
      } else {
        list = items.filter(i => i.authorId === 'guest-creator');
      }
    } else if (activeTab !== 'home' && activeTab !== 'today') {
      list = list.filter(i => i.categoryId === activeTab);
    }

    if (selectedAge !== 'all') {
      list = list.filter(i => i.ageGroup === selectedAge || i.ageGroup === 'all');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i =>
        i.teluguTitle.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.content && i.content.toLowerCase().includes(q)) ||
        (i.authorName && i.authorName.toLowerCase().includes(q)) ||
        (i.subcategoryId && i.subcategoryId.toLowerCase().includes(q)) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [items, activeTab, selectedAge, searchQuery, currentUser]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Partial<Record<BalavinodhiniTab, number>> = {};
    BALAVINODHINI_ALL_TABS.forEach(t => {
      if (t.id === 'home' || t.id === 'today') return;
      if (t.id === 'my-creations') {
        counts[t.id] = currentUser ? items.filter(i => i.authorId === currentUser.id).length : 0;
      } else {
        counts[t.id] = items.filter(i => i.categoryId === t.id && i.status === 'published').length;
      }
    });
    return counts;
  }, [items, currentUser]);

  // Open item reader
  const handleSelectItem = (item: BalavinodhiniItem) => {
    if (item.contentType === 'book') {
      setSelectedBook(item);
    } else {
      setSelectedItem(item);
    }
  };

  // Open safe creator profile
  const handleOpenCreatorProfile = (name: string, bio?: string, avatar?: string) => {
    setCreatorModalData({ name, bio, avatar });
  };

  // Fallback today config if not yet loaded from firestore
  const currentTodayConfig: BalavinodhiniTodayConfig = todayConfig || {
    date: new Date().toLocaleDateString('te-IN'),
    storyTitle: 'తెలివైన కుందేలు మరియు సింహం',
    storyExcerpt: 'ఒక చిన్న కుందేలు తన తెలివితో క్రూరమైన సింహాన్ని ఎలా ఓడించి అడవిని కాపాడిందో తెలుసుకోండి...',
    storyLink: 'bv-1',
    scienceTitle: 'రంగుల ఇంద్రధనుస్సు ఎలా ఏర్పడుతుంది?',
    scienceFact: 'సూర్యకాంతి వర్షపు బిందువులపై పడినప్పుడు కాంతి విక్షేపణం చెంది 7 రంగులుగా కనిపిస్తుంది!',
    riddleQuestion: 'నీట్లో పుట్టి, గాల్లో ఎగురుతా, రంగులతో అందరినీ అలరిస్తా. నేనెవరు?',
    riddleAnswer: 'సబ్బు బుడగ (Soap Bubble) 🫧',
    riddleExplanation: 'గాల్లో ఎగురుతూ క్షణంలో మాయమవుతుంది.',
    dailyFact: 'తేనెటీగలు ఎప్పటికీ నిద్రపోవు!',
    dailyFactExplanation: 'తేనెటీగలు గూడు రక్షణ మరియు తేనె సేకరణలో నిరంతరం శ్రమిస్తాయి.',
    jokeText: 'గురువు: భూమి గుండ్రంగా ఉందని ఎలా నిరూపిస్తావు?\nశిష్యుడు: నా దగ్గర గ్లోబ్ ఉంది మాస్టారు!',
    creativeTaskTitle: 'మీకు ఇష్టమైన పక్షి చిత్రాన్ని గీయండి',
    creativeTaskDescription: 'రంగులు వేసి కథావాహినిలో మీ పేరుతో అప్‌లోడ్ చేయండి!',
  };

  return (
    <div className="min-h-screen bg-[#0C091A] text-white py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. MASTER HERO BANNER WITH SEARCH & AGE FILTERS */}
        {/* ========================================================================= */}
        <BalavinodhiniHero
          selectedAge={selectedAge}
          onSelectAge={setSelectedAge}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTab={setActiveTab}
          onOpenCreationModal={() => setIsCreationModalOpen(true)}
        />

        {/* ========================================================================= */}
        {/* 2. 12+ CATEGORY ICON GRID */}
        {/* ========================================================================= */}
        <BalavinodhiniCategoryGrid
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          categoryCounts={tabCounts}
        />

        {/* If user is filtering by search or specific category tab, show category content */}
        {activeTab !== 'home' && activeTab !== 'today' && activeTab !== 'games' && (
          <div className="space-y-6 my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-telugu text-white flex items-center gap-2">
                  <span>{BALAVINODHINI_ALL_TABS.find(t => t.id === activeTab)?.icon || '📚'}</span>
                  <span>{BALAVINODHINI_ALL_TABS.find(t => t.id === activeTab)?.label || 'విభాగం'}</span>
                </h2>
                <p className="text-xs text-purple-200/70 font-serif-telugu">
                  మొత్తం {filteredItems.length} రచనలు అందుబాటులో ఉన్నాయి
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold font-serif-telugu transition-colors cursor-pointer"
                >
                  ← హోమ్‌కి తిరిగి వెళ్లండి
                </button>
                <button
                  onClick={() => setIsCreationModalOpen(true)}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold font-serif-telugu shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  + కొత్త సృజన
                </button>
              </div>
            </div>

            {/* Grid of cards */}
            {activeTab === 'riddles' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map(riddle => (
                  <BalavinodhiniRiddleCard
                    key={riddle.id}
                    item={riddle}
                    onLikeToggle={handleLikeToggle}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map(item => (
                  <BalavinodhiniStoryCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectItem}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onShare={handleShare}
                    onOpenCreatorProfile={handleOpenCreatorProfile}
                  />
                ))}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 rounded-3xl bg-[#1D183B] border border-purple-500/20 space-y-3">
                <span className="text-4xl">📚</span>
                <h4 className="text-base font-bold font-serif-telugu text-white">
                  ఎటువంటి రచనలు కనుగొనబడలేదు
                </h4>
                <p className="text-xs text-purple-200/70 font-serif-telugu">
                  వేరే వయస్సు విభాగాన్ని లేదా శోధన పదాన్ని ప్రయత్నించండి.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Games tab full view */}
        {activeTab === 'games' && (
          <div className="space-y-6 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h2 className="text-xl sm:text-2xl font-bold font-serif-telugu text-white flex items-center gap-2">
                <span>🎮</span>
                <span>బాలవినోదిని ఆటలు & క్విజ్ హబ్</span>
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold font-serif-telugu cursor-pointer"
              >
                ← హోమ్
              </button>
            </div>
            <BalavinodhiniGameSection />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. HOME VIEW (MAIN LANDING PAGE AS DESIGNED IN IMAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 3.1 DAILY HIGHLIGHTS ROW (6 items) */}
            <BalavinodhiniDailyRow
              todayConfig={currentTodayConfig}
              onOpenStory={() => {
                const target = items.find(i => i.id === currentTodayConfig.storyLink) || items[0];
                if (target) handleSelectItem(target);
              }}
              onOpenScience={() => setActiveTab('science')}
              onOpenGame={() => setActiveTab('games')}
              onOpenQuiz={() => {
                const el = document.getElementById('quiz-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenRiddle={() => setActiveTab('riddles')}
              onOpenCreative={() => setIsCreationModalOpen(true)}
            />

            {/* 3.2 FEATURED STORIES 3-CARD ROW */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif-telugu text-white">
                    బాలల కథామాలిక
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('stories')}
                  className="text-xs sm:text-sm font-serif-telugu font-semibold text-pink-300 hover:text-pink-200 transition-colors cursor-pointer"
                >
                  అన్నీ చూడండి ➔
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items
                  .filter(i => (i.categoryId === 'stories' || i.categoryId === 'bedtime' || i.categoryId === 'moral') && i.status === 'published')
                  .slice(0, 3)
                  .map(story => (
                    <BalavinodhiniStoryCard
                      key={story.id}
                      item={story}
                      onSelect={handleSelectItem}
                      onLikeToggle={handleLikeToggle}
                      onBookmarkToggle={handleBookmarkToggle}
                      isBookmarked={bookmarkedIds.has(story.id)}
                      onShare={handleShare}
                      onOpenCreatorProfile={handleOpenCreatorProfile}
                    />
                  ))}
              </div>
            </div>

            {/* 3.3 INTERACTIVE BENTO GRID: (Games & Riddle) + (Quiz & Kids Creations) */}
            <div id="quiz-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left Column: Today's Mini Memory Game & Daily Riddle */}
              <div className="space-y-6 flex flex-col">
                <div className="flex-1">
                  <BalavinodhiniTodayGameCard
                    onOpenFullGame={() => setActiveTab('games')}
                  />
                </div>
                <div className="flex-1">
                  <BalavinodhiniRiddleWidget
                    onOpenAllRiddles={() => setActiveTab('riddles')}
                  />
                </div>
              </div>

              {/* Right Column: Interactive Quiz & Creations Showcase */}
              <div className="space-y-6 flex flex-col">
                <div className="flex-1">
                  <BalavinodhiniInteractiveQuiz
                    onOpenAllQuizzes={() => setActiveTab('games')}
                  />
                </div>
                <div className="flex-1">
                  <BalavinodhiniCreationsWidget
                    creations={items.filter(i => i.categoryId === 'creations')}
                    onOpenAllCreations={() => setActiveTab('creations')}
                    onOpenCreationModal={() => setIsCreationModalOpen(true)}
                    onSelectCreation={handleSelectItem}
                  />
                </div>
              </div>
            </div>

            {/* 3.4 MORE GAMES & PUZZLES (8-CARD GRID) */}
            <BalavinodhiniMoreGamesGrid
              onSelectGame={(gameId) => setActiveTab('games')}
              onOpenAllGames={() => setActiveTab('games')}
            />

            {/* 3.5 BOTTOM GUIDANCE & SUBMISSION BANNERS */}
            <BalavinodhiniBottomBanners
              onOpenSubmission={() => setIsCreationModalOpen(true)}
              onOpenParentsGuide={() => setActiveTab('science')}
            />

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS: DETAIL, MULTI-PAGE READER, CREATION HUB & CREATOR PROFILE */}
        {/* ========================================================================= */}
        {/* Standard Story / Article / Poem Detail Modal */}
        {selectedItem && (
          <BalavinodhiniItemDetailModal
            item={selectedItem}
            currentUser={currentUser}
            onClose={() => setSelectedItem(null)}
            onLikeToggle={handleLikeToggle}
            onShare={handleShare}
            onRequireAuth={onOpenAuth}
            onOpenCreatorProfile={handleOpenCreatorProfile}
          />
        )}

        {/* Multi-page Digital Book Reader Modal */}
        {selectedBook && (
          <BalavinodhiniBookReaderModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onLikeToggle={handleLikeToggle}
            onShare={handleShare}
          />
        )}

        {/* Create / Submit Modal with drawing canvas, poem writing & book creation */}
        {isCreationModalOpen && (
          <BalavinodhiniCreationModal
            currentUserId={currentUser?.id}
            currentUserName={currentUser?.name}
            onClose={() => setIsCreationModalOpen(false)}
            onSuccessSubmit={() => {
              setActiveTab('creations');
            }}
          />
        )}

        {/* Creator Safe Profile Modal */}
        {creatorModalData && (
          <BalavinodhiniCreatorProfileModal
            creatorName={creatorModalData.name}
            creatorBio={creatorModalData.bio}
            creatorAvatar={creatorModalData.avatar}
            creatorWorks={items.filter(i => i.authorName === creatorModalData.name)}
            onClose={() => setCreatorModalData(null)}
            onSelectWork={handleSelectItem}
          />
        )}

      </div>
    </div>
  );
};
