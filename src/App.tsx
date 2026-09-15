import React, { useState, useEffect } from 'react';
import { Story, Novel, Author, Chapter, StoryCategory, User, NotificationItem, ReadingHistoryItem, CreatorStats, Joke } from './types';
import { categoryService, FormattedCategoryViewItem } from './services/categoryService';
import { authService } from './services/authService';
import { storyService } from './services/storyService';
import { novelService } from './services/novelService';
import { jokeService } from './services/jokeService';
import { authorService } from './services/authorService';
import { libraryService } from './services/libraryService';
import { userService } from './services/userService';

// Global Layout Components
import { Navbar } from './components/common/Navbar';
import { MobileHeader } from './components/common/MobileHeader';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Footer } from './components/common/Footer';

// Modals
import { WriteModal } from './components/editor/WriteModal';
import { AuthModal } from './components/modals/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { StoriesView } from './views/StoriesView';
import { StoryDetailView } from './views/StoryDetailView';
import { StoryReaderView } from './views/StoryReaderView';
import { NovelsView } from './views/NovelsView';
import { NovelDetailView } from './views/NovelDetailView';
import { JokesView } from './views/JokesView';
import { CategoriesView } from './views/CategoriesView';
import { AuthorsView } from './views/AuthorsView';
import { AuthorDetailView } from './views/AuthorDetailView';
import { LibraryView } from './views/LibraryView';
import { SearchView } from './views/SearchView';
import { CreatorDashboardView } from './views/CreatorDashboardView';
import { ProfileView } from './views/ProfileView';
import { KnowledgeView } from './views/KnowledgeView';
import { AboutView } from './views/AboutView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsView } from './views/TermsView';
import { CookiePolicyView } from './views/CookiePolicyView';
import { ContentPolicyView } from './views/ContentPolicyView';
import { ContactView } from './views/ContactView';
import { ReportIssueView } from './views/ReportIssueView';
import { FaqView } from './views/FaqView';
import { HelpView } from './views/HelpView';
import { WriterApplicationView } from './views/WriterApplicationView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { AdminTopBanner } from './components/admin/AdminTopBanner';
import { PublicAnnouncementBanner } from './components/common/PublicAnnouncementBanner';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Selected state for detailed routing
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<StoryCategory | null>(null);

  // Modals state
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authCustomPrompt, setAuthCustomPrompt] = useState<string | undefined>();
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Data state from service layer
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const hasAdminRedirectedRef = React.useRef(false);
  const [authLoading, setAuthLoading] = useState<boolean>(authService.isAuthLoading());
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [newReleases, setNewReleases] = useState<Story[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [savedNovels, setSavedNovels] = useState<Novel[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);

  // Dynamic real-time categories from CategoryService
  const [categories, setCategories] = useState<FormattedCategoryViewItem[]>(() =>
    categoryService.formatForViews()
  );

  // Real-time categories subscription across Home, Categories, Stories, and Writer submissions
  useEffect(() => {
    const unsubscribe = categoryService.subscribeCategories((rawCats) => {
      const formatted = categoryService.formatForViews(rawCats, true);
      setCategories(formatted);
    });
    return () => unsubscribe();
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Subscribe to Auth changes from Firebase
  useEffect(() => {
    const unsubscribe = authService.subscribe((u, loading) => {
      setUser(u);
      setAuthLoading(loading);

      const isUserAdmin = Boolean(
        u && (u.role === 'admin' || u.email?.toLowerCase() === 'thekathavahini@gmail.com')
      );

      // Rule: After successful admin authentication, ADMIN -> ADMIN DASHBOARD
      if (isUserAdmin && !hasAdminRedirectedRef.current) {
        hasAdminRedirectedRef.current = true;
        setCurrentTab('admin');
        return;
      }

      // If logged out or non-admin, reset the redirect tracker
      if (!isUserAdmin) {
        hasAdminRedirectedRef.current = false;
      }

      // Strict Admin Route Guard: If a non-admin is currently on 'admin' tab, redirect to 'home' immediately
      if (currentTab === 'admin' && !isUserAdmin) {
        setCurrentTab('home');
      }
      // Strict Writer Studio Route Guard: If user is not active writer or admin, route away
      if (currentTab === 'dashboard' && !(u && ((u.role === 'writer' && u.status === 'active') || isUserAdmin))) {
        if (u && u.role === 'writer' && u.status === 'pending') {
          setCurrentTab('apply-writer');
        } else {
          setCurrentTab('home');
        }
      }
    });
    return () => unsubscribe();
  }, [currentTab]);

  // Strict route guard when tab changes to admin or dashboard
  useEffect(() => {
    const isUserAdmin = Boolean(
      user && (user.role === 'admin' || user.email?.toLowerCase() === 'thekathavahini@gmail.com')
    );
    if (currentTab === 'admin') {
      if (!isUserAdmin) {
        setCurrentTab('home');
      }
    }
    if (currentTab === 'dashboard') {
      const isApprovedWriter = Boolean(user && user.role === 'writer' && user.status === 'active');
      if (!isApprovedWriter && !isUserAdmin) {
        if (user && user.role === 'writer' && user.status === 'pending') {
          setCurrentTab('apply-writer');
        } else {
          setCurrentTab('home');
        }
      }
    }
  }, [currentTab, user]);

  // Fetch initial data from services
  const loadData = async () => {
    const published = await storyService.getAllPublishedStories();
    const trending = await storyService.getTrendingStories();
    const popular = await storyService.getPopularStoriesThisWeek();
    const releases = await storyService.getNewReleases();
    const allNovels = await novelService.getFeaturedNovels();
    const allJokes = await jokeService.getJokes();
    const allAuthors = await authorService.getAuthors();
    const savedSt = await libraryService.getSavedStories();
    const savedNov = await libraryService.getSavedNovels();
    const history = await libraryService.getReadingHistory();
    const notifs = await userService.getNotifications();
    const stats = await userService.getCreatorStats();

    setAllStories(published);
    setTrendingStories(trending);
    setPopularStories(popular);
    setNewReleases(releases);
    setNovels(allNovels);
    setJokes(allJokes);
    setAuthors(allAuthors);
    setSavedStories(savedSt);
    setSavedNovels(savedNov);
    setReadingHistory(history);
    setNotifications(notifs);
    setCreatorStats(stats);
  };

  useEffect(() => {
    loadData();

    // Live Real-Time Subscriptions from Firestore collections
    const unsubStories = storyService.subscribePublishedStories((published) => {
      setAllStories(published);
      setTrendingStories([...published].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)));
      setPopularStories([...published].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)));
      setNewReleases([...published].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setSelectedStory(curr => {
        if (!curr) return null;
        const exists = published.find(s => s.id === curr.id);
        if (!exists) {
          return null;
        }
        return { ...curr, ...exists };
      });
    });

    const unsubNovels = novelService.subscribeNovels((liveNovels) => {
      setNovels(liveNovels);
      setSelectedNovel(curr => {
        if (!curr) return null;
        const exists = liveNovels.find(n => n.id === curr.id);
        if (!exists) return null;
        return { ...curr, ...exists };
      });
    });

    const unsubJokes = jokeService.subscribeJokes((liveJokes) => {
      setJokes(liveJokes);
    });

    // Event listeners for real-time reactivity across tabs & views
    const handleStoryDeleted = (e: any) => {
      const deletedId = e.detail?.storyId || e.detail?.id;
      if (deletedId) {
        setAllStories(prev => prev.filter(s => s.id !== deletedId));
        setTrendingStories(prev => prev.filter(s => s.id !== deletedId));
        setPopularStories(prev => prev.filter(s => s.id !== deletedId));
        setNewReleases(prev => prev.filter(s => s.id !== deletedId));
        setSavedStories(prev => prev.filter(s => s.id !== deletedId));
        setReadingHistory(prev => prev.filter(h => h.storyId !== deletedId));
        setSelectedStory(curr => {
          if (curr && curr.id === deletedId) {
            setCurrentTab('stories');
            return null;
          }
          return curr;
        });
      }
    };

    const handleItemDeleted = (e: any) => {
      const { id, type } = e.detail || {};
      if (!id) return;
      if (type === 'story') {
        handleStoryDeleted(e);
      } else if (type === 'novel') {
        setNovels(prev => prev.filter(n => n.id !== id));
        setSavedNovels(prev => prev.filter(n => n.id !== id));
        setSelectedNovel(curr => (curr && curr.id === id ? null : curr));
      } else if (type === 'joke') {
        setJokes(prev => prev.filter(j => j.id !== id));
      }
    };

    const handleRefresh = () => {
      loadData();
    };

    const handleStoryLiked = (e: any) => {
      const { storyId, isLiked, newCount } = e.detail || {};
      if (!storyId) return;
      const updateStoryList = (list: Story[]) =>
        list.map(s => s.id === storyId ? { ...s, isLiked, likeCount: newCount } : s);
      setAllStories(updateStoryList);
      setTrendingStories(updateStoryList);
      setPopularStories(updateStoryList);
      setNewReleases(updateStoryList);
      setSavedStories(updateStoryList);
      setSelectedStory(curr => (curr && curr.id === storyId ? { ...curr, isLiked, likeCount: newCount } : curr));
    };

    const handleStoryRated = (e: any) => {
      const { storyId, rating } = e.detail || {};
      if (!storyId) return;
      const updateStoryRating = (list: Story[]) =>
        list.map(s => s.id === storyId ? { ...s, rating } : s);
      setAllStories(updateStoryRating);
      setTrendingStories(updateStoryRating);
      setPopularStories(updateStoryRating);
      setNewReleases(updateStoryRating);
      setSavedStories(updateStoryRating);
      setSelectedStory(curr => (curr && curr.id === storyId ? { ...curr, rating } : curr));
    };

    const handleStoryViewed = (e: any) => {
      const { storyId } = e.detail || {};
      if (!storyId) return;
      const updateView = (list: Story[]) =>
        list.map(s => s.id === storyId ? { ...s, viewCount: (s.viewCount || 0) + 1 } : s);
      setAllStories(updateView);
      setTrendingStories(updateView);
      setPopularStories(updateView);
      setNewReleases(updateView);
      setSelectedStory(curr => (curr && curr.id === storyId ? { ...curr, viewCount: (curr.viewCount || 0) + 1 } : curr));
    };

    window.addEventListener('kathavahini:story-deleted', handleStoryDeleted);
    window.addEventListener('kathavahini:item-deleted', handleItemDeleted);
    window.addEventListener('kathavahini:refresh-content', handleRefresh);
    window.addEventListener('kathavahini:story-liked', handleStoryLiked);
    window.addEventListener('kathavahini:story-rated', handleStoryRated);
    window.addEventListener('kathavahini:story-viewed', handleStoryViewed);

    // Check if initial URL or hash contains password reset route or Firebase oobCode
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      const params = new URLSearchParams(search);
      const hashParams = hash.includes('?') ? new URLSearchParams(hash.substring(hash.indexOf('?'))) : null;
      
      const isResetPath = path === '/reset-password' || path.endsWith('/reset-password') || hash === '#/reset-password' || hash.startsWith('#/reset-password');
      const hasResetMode = params.get('mode') === 'resetPassword' || hashParams?.get('mode') === 'resetPassword';
      const hasOobCode = params.has('oobCode') || hashParams?.has('oobCode');

      if (isResetPath || hasResetMode || hasOobCode) {
        setCurrentTab('reset-password');
      }
    }

    return () => {
      unsubStories();
      unsubNovels();
      unsubJokes();
      window.removeEventListener('kathavahini:story-deleted', handleStoryDeleted);
      window.removeEventListener('kathavahini:item-deleted', handleItemDeleted);
      window.removeEventListener('kathavahini:refresh-content', handleRefresh);
      window.removeEventListener('kathavahini:story-liked', handleStoryLiked);
      window.removeEventListener('kathavahini:story-rated', handleStoryRated);
      window.removeEventListener('kathavahini:story-viewed', handleStoryViewed);
    };
  }, []);

  // Auth prompt helper
  const handleRequireAuth = (prompt?: string, mode: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthCustomPrompt(prompt);
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  // Navigation handlers
  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentTab('story-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReading = (story: Story) => {
    setSelectedStory(story);
    setCurrentTab('story-reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNovel = (novel: Novel) => {
    setSelectedNovel(novel);
    setCurrentTab('novel-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setCurrentTab('author-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catName: StoryCategory) => {
    setSelectedCategoryFilter(catName);
    setCurrentTab('stories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Interactions
  const handleBookmarkToggle = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      handleRequireAuth('కథలను దాచుకోవడానికి (Bookmark) ముందుగా లాగిన్ చేయండి.', 'login');
      return;
    }
    const isNowBookmarked = await storyService.toggleBookmark(storyId);
    const updateBm = (list: Story[]) =>
      list.map(s => s.id === storyId ? { ...s, isBookmarked: isNowBookmarked } : s);
    setAllStories(updateBm);
    setTrendingStories(updateBm);
    setPopularStories(updateBm);
    setNewReleases(updateBm);
    setSelectedStory(curr => (curr && curr.id === storyId ? { ...curr, isBookmarked: isNowBookmarked } : curr));
    const savedSt = await libraryService.getSavedStories();
    setSavedStories(savedSt);
  };

  const handleLikeToggle = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = await storyService.toggleLike(storyId);
    const updateLike = (list: Story[]) =>
      list.map(s => s.id === storyId ? { ...s, isLiked: result.isLiked, likeCount: result.newCount } : s);
    setAllStories(updateLike);
    setTrendingStories(updateLike);
    setPopularStories(updateLike);
    setNewReleases(updateLike);
    setSavedStories(updateLike);
    setSelectedStory(curr => (curr && curr.id === storyId ? { ...curr, isLiked: result.isLiked, likeCount: result.newCount } : curr));
  };

  const handleJokeLikeToggle = async (jokeId: string) => {
    await jokeService.toggleLike(jokeId);
    const updatedJokes = await jokeService.getJokes();
    setJokes(updatedJokes);
  };

  const handleFollowAuthorToggle = async (authorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      handleRequireAuth('రచయితలను అనుసరించడానికి (Follow) ముందుగా లాగిన్ చేయండి.', 'login');
      return;
    }
    await authorService.toggleFollow(authorId);
    const updatedAuthors = await authorService.getAuthors();
    setAuthors(updatedAuthors);
  };

  const handleUpdateProgress = async (storyId: string, percent: number) => {
    await libraryService.updateProgress(storyId, percent);
    const history = await libraryService.getReadingHistory();
    setReadingHistory(history);
  };

  const handleMarkNotificationRead = async (id: string) => {
    await userService.markNotificationAsRead(id);
    const notifs = await userService.getNotifications();
    setNotifications(notifs);
  };

  // Render view router
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeView
            trendingStories={trendingStories}
            popularStories={popularStories}
            newReleases={newReleases}
            featuredNovels={novels}
            featuredAuthors={authors}
            jokes={jokes}
            categories={categories}
            readingHistory={readingHistory}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onSelectAuthor={handleSelectAuthor}
            onSelectCategory={handleSelectCategory}
            onSelectTab={setCurrentTab}
            onOpenWrite={() => setIsWriteOpen(true)}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            onFollowToggle={handleFollowAuthorToggle}
          />
        );

      case 'stories':
        return (
          <StoriesView
            stories={allStories.length > 0 ? allStories : trendingStories}
            categories={categories}
            onSelectStory={handleSelectStory}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            selectedCategory={selectedCategoryFilter}
            onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
          />
        );

      case 'story-detail':
        return selectedStory ? (
          <StoryDetailView
            story={selectedStory}
            relatedStories={(allStories.length > 0 ? allStories : trendingStories).filter(s => s.id !== selectedStory.id && s.category === selectedStory.category)}
            onStartReading={handleStartReading}
            onSelectAuthor={handleSelectAuthor}
            onSelectStory={handleSelectStory}
            onBack={() => setCurrentTab('stories')}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            onFollowAuthorToggle={handleFollowAuthorToggle}
          />
        ) : (
          <HomeView
            trendingStories={trendingStories}
            popularStories={popularStories}
            newReleases={newReleases}
            featuredNovels={novels}
            featuredAuthors={authors}
            jokes={jokes}
            categories={categories}
            readingHistory={readingHistory}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onSelectAuthor={handleSelectAuthor}
            onSelectCategory={handleSelectCategory}
            onSelectTab={setCurrentTab}
            onOpenWrite={() => setIsWriteOpen(true)}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            onFollowToggle={handleFollowAuthorToggle}
          />
        );

      case 'story-reader':
        return selectedStory ? (
          <StoryReaderView
            story={selectedStory}
            currentUser={user}
            onBack={() => setCurrentTab('story-detail')}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            onUpdateProgress={handleUpdateProgress}
            onRequireAuth={handleRequireAuth}
          />
        ) : null;

      case 'novels':
        return (
          <NovelsView
            novels={novels}
            onSelectNovel={handleSelectNovel}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'novel-detail':
        return selectedNovel ? (
          <NovelDetailView
            novel={selectedNovel}
            onBack={() => setCurrentTab('novels')}
            onSelectChapter={(n, chap) => {
              // Convert novel chapter to story style for reader
              const chapterAsStory: Story = {
                id: chap.id,
                title: chap.title,
                teluguTitle: `${n.teluguTitle} - ${chap.teluguTitle}`,
                slug: n.slug,
                coverImage: n.coverImage,
                excerpt: n.teluguDescription,
                teluguExcerpt: n.teluguDescription,
                content: chap.content,
                authorId: n.authorId,
                author: n.author,
                category: n.category,
                tags: n.tags,
                rating: n.rating,
                viewCount: n.viewCount,
                likeCount: n.likeCount,
                bookmarkCount: n.bookmarkCount,
                readingTimeMinutes: chap.readingTimeMinutes,
                publishedAt: chap.publishedAt,
                status: 'published',
              };
              handleStartReading(chapterAsStory);
            }}
            onBookmarkToggle={handleBookmarkToggle}
          />
        ) : null;

      case 'jokes':
        return (
          <JokesView
            jokes={jokes}
            onOpenWrite={() => setIsWriteOpen(true)}
            onLikeToggle={handleJokeLikeToggle}
          />
        );

      case 'categories':
        return (
          <CategoriesView
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        );

      case 'authors':
        return (
          <AuthorsView
            authors={authors}
            onSelectAuthor={handleSelectAuthor}
            onFollowToggle={handleFollowAuthorToggle}
          />
        );

      case 'author-detail':
        return selectedAuthor ? (
          <AuthorDetailView
            author={selectedAuthor}
            authorStories={trendingStories.filter(s => s.authorId === selectedAuthor.id)}
            authorNovels={novels.filter(n => n.authorId === selectedAuthor.id)}
            onBack={() => setCurrentTab('authors')}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onFollowToggle={handleFollowAuthorToggle}
          />
        ) : null;

      case 'library':
        return (
          <LibraryView
            savedStories={savedStories}
            savedNovels={savedNovels}
            readingHistory={readingHistory}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onSelectTab={setCurrentTab}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'search':
        return (
          <SearchView
            stories={trendingStories}
            novels={novels}
            jokes={jokes}
            authors={authors}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onSelectAuthor={handleSelectAuthor}
          />
        );

      case 'dashboard': {
        const isApprovedWriter = Boolean(user && user.role === 'writer' && user.status === 'active');
        const isAdmin = Boolean(user && user.role === 'admin');
        if (!isApprovedWriter && !isAdmin) {
          if (user && user.role === 'writer' && user.status === 'pending') {
            return (
              <WriterApplicationView
                user={user}
                onOpenAuth={() => handleRequireAuth('రచయితగా దరఖాస్తు చేసుకోవడానికి ముందుగా లాగిన్ చేయండి.')}
                onBack={() => setCurrentTab('profile')}
                onNavigateToDashboard={() => setCurrentTab('dashboard')}
              />
            );
          }
          return (
            <HomeView
              trendingStories={trendingStories}
              popularStories={popularStories}
              newReleases={newReleases}
              featuredNovels={novels}
              featuredAuthors={authors}
              jokes={jokes}
              categories={categories}
              readingHistory={readingHistory}
              onSelectStory={handleSelectStory}
              onSelectNovel={handleSelectNovel}
              onSelectAuthor={handleSelectAuthor}
              onSelectCategory={handleSelectCategory}
              onSelectTab={setCurrentTab}
              onOpenWrite={() => setIsWriteOpen(true)}
              onBookmarkToggle={handleBookmarkToggle}
              onLikeToggle={handleLikeToggle}
              onFollowToggle={handleFollowAuthorToggle}
            />
          );
        }
        return creatorStats ? (
          <CreatorDashboardView
            stats={creatorStats}
            currentUser={user}
            myStories={trendingStories.slice(0, 5)}
            onOpenWrite={() => setIsWriteOpen(true)}
            onSelectStory={handleSelectStory}
            onApplyWriter={() => setCurrentTab('apply-writer')}
          />
        ) : null;
      }

      case 'apply-writer':
        return (
          <WriterApplicationView
            user={user}
            onOpenAuth={() => handleRequireAuth('రచయితగా దరఖాస్తు చేసుకోవడానికి ముందుగా లాగిన్ చేయండి.')}
            onBack={() => setCurrentTab('profile')}
            onNavigateToDashboard={() => setCurrentTab('dashboard')}
          />
        );

      case 'admin':
        return (
          <AdminDashboardView
            currentUser={user}
            onSelectStory={handleSelectStory}
            onBack={() => setCurrentTab('home')}
          />
        );

      case 'profile':
        return (
          <ProfileView
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectTab={setCurrentTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        );

      case 'knowledge':
        return <KnowledgeView />;

      case 'about':
        return (
          <AboutView
            onOpenWrite={() => setIsWriteOpen(true)}
            onSelectTab={setCurrentTab}
          />
        );

      case 'privacy-policy':
        return <PrivacyPolicyView />;

      case 'terms':
        return <TermsView />;

      case 'cookie-policy':
        return <CookiePolicyView />;

      case 'content-policy':
        return <ContentPolicyView onSelectTab={setCurrentTab} />;

      case 'contact':
        return <ContactView user={user} />;

      case 'report-issue':
        return <ReportIssueView user={user} />;

      case 'faq':
        return (
          <FaqView
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWrite={() => setIsWriteOpen(true)}
            onSelectTab={setCurrentTab}
          />
        );

      case 'help':
        return (
          <HelpView
            onSelectTab={setCurrentTab}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWrite={() => setIsWriteOpen(true)}
          />
        );

      case 'reset-password':
        return (
          <ResetPasswordView
            onOpenLogin={() => {
              handleRequireAuth(undefined, 'login');
              setCurrentTab('home');
            }}
            onOpenForgotPassword={() => {
              handleRequireAuth(undefined, 'forgot-password');
              setCurrentTab('home');
            }}
            onBackToHome={() => setCurrentTab('home')}
          />
        );

      default:
        return (
          <HomeView
            trendingStories={trendingStories}
            popularStories={popularStories}
            newReleases={newReleases}
            featuredNovels={novels}
            featuredAuthors={authors}
            jokes={jokes}
            categories={categories}
            readingHistory={readingHistory}
            onSelectStory={handleSelectStory}
            onSelectNovel={handleSelectNovel}
            onSelectAuthor={handleSelectAuthor}
            onSelectCategory={handleSelectCategory}
            onSelectTab={setCurrentTab}
            onOpenWrite={() => setIsWriteOpen(true)}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
            onFollowToggle={handleFollowAuthorToggle}
          />
        );
    }
  };

  const isReaderView = currentTab === 'story-reader';
  const isAuthorizedAdmin = Boolean(
    user && (user.role === 'admin' || user.email?.toLowerCase() === 'thekathavahini@gmail.com')
  );
  const isAdminView = currentTab === 'admin' && isAuthorizedAdmin;

  // If on Admin tab AND authorized as Admin, render the dedicated Full-Screen Admin Control Center
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0E0D13] text-[#17151A] dark:text-[#F7F3EE]">
        <AdminDashboardView
          currentUser={user}
          onSelectStory={handleSelectStory}
          onBack={() => setCurrentTab('home')}
          onViewWebsite={() => setCurrentTab('home')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#101014] text-[#17151A] dark:text-[#F7F3EE] transition-colors">
      {/* Top Banner when Admin is viewing public website */}
      {isAuthorizedAdmin && !isReaderView && (
        <AdminTopBanner
          currentUser={user}
          onReturnToAdmin={() => setCurrentTab('admin')}
        />
      )}

      {/* Hide header/footer in full reader view */}
      {!isReaderView && (
        <>
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            user={user}
            onOpenWrite={() => setIsWriteOpen(true)}
            onOpenAuth={() => handleRequireAuth()}
            onOpenSearch={() => setCurrentTab('search')}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <MobileHeader
            user={user}
            onOpenSearch={() => setCurrentTab('search')}
            onOpenAuth={() => handleRequireAuth()}
            onSelectTab={setCurrentTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </>
      )}

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${isReaderView ? 'py-0' : 'py-6 sm:py-8'}`}>
        {renderCurrentView()}
      </main>

      {!isReaderView && (
        <>
          <Footer
            onSelectTab={setCurrentTab}
            onOpenWrite={() => setIsWriteOpen(true)}
          />

          <BottomNavigation
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenWrite={() => setIsWriteOpen(true)}
          />
        </>
      )}

      {/* Public Announcement Card / Banner */}
      {!isReaderView && (
        <PublicAnnouncementBanner
          currentUser={user}
          onNavigateTab={(tab) => {
            if (tab === 'write') {
              setIsWriteOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
        />
      )}

      {/* Write/Publish Modal */}
      <WriteModal
        isOpen={isWriteOpen}
        currentUser={user}
        onClose={() => setIsWriteOpen(false)}
        onPublishSuccess={() => {
          loadData();
          setCurrentTab('dashboard');
        }}
        onApplyWriter={() => {
          setIsWriteOpen(false);
          setCurrentTab('apply-writer');
        }}
        onRequireAuth={(prompt) => handleRequireAuth(prompt)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthCustomPrompt(undefined);
        }}
        onSuccess={() => {
          loadData();
          const currentUserNow = authService.getCurrentUser();
          if (currentUserNow?.role === 'admin') {
            setCurrentTab('admin');
          } else if (currentUserNow?.role === 'writer' && currentUserNow?.status === 'pending') {
            // Show clear Waiting for Admin Approval state
            setCurrentTab('apply-writer');
          } else {
            // Readers and Approved Writers remain on the public website
            if (currentTab === 'admin') {
              setCurrentTab('home');
            }
          }
        }}
        onNavigateToWriterApp={() => {
          setIsAuthOpen(false);
          setCurrentTab('apply-writer');
        }}
        customPrompt={authCustomPrompt}
        initialMode={authInitialMode}
      />
    </div>
  );
}
