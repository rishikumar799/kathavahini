import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { 
  HeroBannerConfig, 
  HeroBannerSlide, 
  HeroSlideConfig,
  HeroBannerStats,
  LandingPageLayoutConfig, 
  LandingPageSectionConfig,
  Story, 
  Novel, 
  Joke, 
  KnowledgeArticle,
  BalavinodhiniItem
} from '../types';

export const DEFAULT_HERO_STATS: HeroBannerStats = {
  storiesCount: '25K+',
  storiesLabel: 'తెలుగు కథలు',
  writersCount: '5K+',
  writersLabel: 'రచయితలు',
  readersCount: '1M+',
  readersLabel: 'పాఠకులు',
};

export const DEFAULT_HERO_CONFIG: HeroBannerConfig = {
  id: 'hero_main',
  enabled: true,
  maxSlidesCount: 3,
  slides: [
    {
      id: 'slide-default-1',
      order: 1,
      enabled: true,
      contentType: 'story',
      useContentDefaults: true,
      badge: 'ఈ వారపు ప్రత్యేక కథ',
      headline: 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.',
      highlightWord: 'కథతో',
      subtitle: 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి. వేలాది మంది పాఠకులతో మరియు ప్రతిభావంతులైన రచయితలతో మీ సాహితీ ప్రయాణం.',
      primaryButtonText: 'కథలు చదవండి',
      primaryButtonAction: 'stories',
      secondaryButtonText: 'మీ కథ రాయండి',
      isScheduled: false,
    },
    {
      id: 'slide-default-2',
      order: 2,
      enabled: true,
      contentType: 'novel',
      useContentDefaults: true,
      badge: 'ప్రముఖ ధారావాహిక నవల',
      headline: 'అధ్యాయాల వారీగా సాగే ఉత్కంఠభరిత నవలలు',
      highlightWord: 'నవలలు',
      subtitle: 'ప్రతి వారం కొత్త అధ్యాయాలతో ఆకట్టుకునే విశేష తెలుగు నవలా ప్రపంచం.',
      primaryButtonText: 'నవలలు చదవండి',
      primaryButtonAction: 'novels',
      secondaryButtonText: 'రచన ప్రారంభించండి',
      isScheduled: false,
    },
    {
      id: 'slide-default-3',
      order: 3,
      enabled: true,
      contentType: 'joke',
      useContentDefaults: true,
      badge: 'హాస్యం & సరదా కబుర్లు',
      headline: 'క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు',
      highlightWord: 'నవ్వులు',
      subtitle: 'రోజువారీ జీవితంలో ఒత్తిడిని దూరం చేసే హాస్య రచనలు & జోకులు.',
      primaryButtonText: 'జోక్స్ చదవండి',
      primaryButtonAction: 'jokes',
      secondaryButtonText: 'మీ జోక్ రాయండి',
      isScheduled: false,
    }
  ],
  badgeText: 'తెలుగు డిజిటల్ సాహిత్య వేదిక',
  mainHeading: 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.',
  highlightWord: 'కథతో',
  subtitle: 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి. వేలాది మంది పాఠకులతో మరియు ప్రతిభావంతులైన రచయితలతో మీ సాహితీ ప్రయాణం.',
  primaryButtonText: 'కథలు చదవండి',
  primaryButtonAction: 'stories',
  secondaryButtonText: 'మీ కథ రాయండి',
  metricsSource: 'live',
  customMetrics: DEFAULT_HERO_STATS,
  stats: DEFAULT_HERO_STATS,
  autoRotate: true,
  autoRotateSeconds: 7,
  showNavigationButtons: true,
  showIndicators: true,
  pauseOnHover: true,
};

export const DEFAULT_LANDING_SECTIONS: LandingPageSectionConfig[] = [
  {
    id: 'hero',
    title: 'Hero Banner Showcase',
    teluguTitle: 'ప్రధాన బ్యానర్ విభాగం',
    description: 'ప్రధాన హెరో బ్యానర్, ప్రత్యేక కథల ప్రదర్శన మరియు ముఖ్య ప్రకటనలు',
    enabled: true,
    order: 1,
  },
  {
    id: 'continue_reading',
    title: 'Continue Reading',
    teluguTitle: 'పఠనం కొనసాగించండి',
    description: 'పాఠకులు మునుపు చదువుతున్న కథ లేదా నవల చివరి స్థానం',
    enabled: true,
    order: 2,
  },
  {
    id: 'trending_stories',
    title: 'Trending Stories Carousel',
    teluguTitle: 'ట్రెండింగ్ కథలు',
    description: 'పాఠకులు ఎక్కువగా ఆస్వాదిస్తున్న ప్రముఖ తెలుగు కథల కరౌసెల్',
    enabled: true,
    order: 3,
  },
  {
    id: 'novels',
    title: 'Popular Novels',
    teluguTitle: 'ప్రజాదరణ పొందిన నవలలు',
    description: 'అధ్యాయాల వారీగా సాగే ఉత్కంఠభరితమైన ధారావాహికలు',
    enabled: true,
    order: 4,
  },
  {
    id: 'categories',
    title: 'Explore Categories',
    teluguTitle: 'కథా విభాగాలు (12+ Categories)',
    description: 'వివిధ శైలుల్లో కథల వర్గీకరణ గ్రిడ్',
    enabled: true,
    order: 5,
  },
  {
    id: 'authors',
    title: 'Featured Authors',
    teluguTitle: 'ముఖ్య రచయితలు',
    description: 'అద్భుతమైన కథలతో గుండెలను గెలుచుకున్న ప్రముఖ రచయితల ప్రొఫైల్స్',
    enabled: true,
    order: 6,
  },
  {
    id: 'new_releases',
    title: 'New Releases',
    teluguTitle: 'కొత్తగా విడుదలైనవి',
    description: 'ఇటీవలే ప్రచురించబడిన తాజా తెలుగు రచనలు',
    enabled: true,
    order: 7,
  },
  {
    id: 'jokes',
    title: 'Short Content & Jokes',
    teluguTitle: 'హాస్యం & సరదా కబుర్లు',
    description: 'క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు & జోకులు',
    enabled: true,
    order: 8,
  },
  {
    id: 'balavinodhini',
    title: 'Balavinodhini Kids Portal Preview',
    teluguTitle: 'బాలవినోదిని పిల్లల వేదిక',
    description: 'పిల్లల కథలు, విజ్ఞానం, గేయాలు మరియు ఆటల ప్రివ్యూ',
    enabled: true,
    order: 9,
  },
  {
    id: 'creator_cta',
    title: 'Creator Community CTA Banner',
    teluguTitle: 'రచయితల ఆహ్వాన బ్యానర్',
    description: 'కొత్త రచయితలను రచనలు ప్రారంభించమని ఆహ్వానించే బ్యానర్',
    enabled: true,
    order: 10,
  },
];

class LandingPageService {
  private cachedHeroConfig: HeroBannerConfig = DEFAULT_HERO_CONFIG;
  private cachedLayout: LandingPageLayoutConfig = { sections: DEFAULT_LANDING_SECTIONS };

  /**
   * Real-time subscription to Hero Banner configuration
   */
  public subscribeHeroConfig(callback: (config: HeroBannerConfig) => void): () => void {
    callback(this.cachedHeroConfig);

    try {
      const docRef = doc(db, 'settings', 'hero_banner');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<HeroBannerConfig>;
          this.cachedHeroConfig = {
            ...DEFAULT_HERO_CONFIG,
            ...data,
            id: 'hero_main',
            slides: Array.isArray(data.slides) && data.slides.length > 0 
              ? data.slides.map((s, idx) => ({ ...s, order: s.order || idx + 1 }))
              : DEFAULT_HERO_CONFIG.slides,
            customMetrics: {
              ...DEFAULT_HERO_STATS,
              ...(data.customMetrics || data.stats || {})
            }
          };
          callback(this.cachedHeroConfig);
        } else {
          callback(DEFAULT_HERO_CONFIG);
        }
      }, (err) => {
        console.warn('Hero banner config snapshot notice:', err);
      });

      return unsubscribe;
    } catch (e) {
      console.warn('Could not establish hero banner snapshot:', e);
      return () => {};
    }
  }

  /**
   * Real-time subscription to Landing Page Layout configuration
   */
  public subscribeLandingLayout(callback: (layout: LandingPageLayoutConfig) => void): () => void {
    callback(this.cachedLayout);

    try {
      const docRef = doc(db, 'settings', 'landing_page_layout');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<LandingPageLayoutConfig>;
          const sections = (data.sections && data.sections.length > 0)
            ? this.mergeSections(data.sections)
            : DEFAULT_LANDING_SECTIONS;
          this.cachedLayout = { sections };
          callback(this.cachedLayout);
        } else {
          callback({ sections: DEFAULT_LANDING_SECTIONS });
        }
      }, (err) => {
        console.warn('Landing layout snapshot notice:', err);
      });

      return unsubscribe;
    } catch (e) {
      console.warn('Could not establish landing layout snapshot:', e);
      return () => {};
    }
  }

  private mergeSections(savedSections: LandingPageSectionConfig[]): LandingPageSectionConfig[] {
    const savedMap = new Map(savedSections.map(s => [s.id, s]));
    const merged: LandingPageSectionConfig[] = [];

    savedSections.forEach(s => {
      const defaultItem = DEFAULT_LANDING_SECTIONS.find(d => d.id === s.id);
      merged.push({
        ...defaultItem,
        ...s,
      });
    });

    DEFAULT_LANDING_SECTIONS.forEach(d => {
      if (!savedMap.has(d.id)) {
        merged.push({
          ...d,
          order: merged.length + 1,
        });
      }
    });

    return merged.sort((a, b) => a.order - b.order);
  }

  /**
   * Save Hero Banner Configuration (Admin only)
   */
  public async saveHeroConfig(config: Partial<HeroBannerConfig>, adminUid?: string): Promise<void> {
    const merged: HeroBannerConfig = {
      ...this.cachedHeroConfig,
      ...config,
      id: 'hero_main',
      slides: (config.slides || this.cachedHeroConfig.slides).map((s, idx) => ({
        ...s,
        order: idx + 1,
      })),
      updatedAt: serverTimestamp(),
      updatedBy: adminUid || 'admin',
    };

    this.cachedHeroConfig = merged;

    try {
      await setDoc(doc(db, 'settings', 'hero_banner'), sanitizeFirestoreData(merged), { merge: true });
    } catch (err) {
      console.warn('Error saving hero banner config to Firestore:', err);
      throw err;
    }
  }

  /**
   * Save Landing Page Section Layout (Admin only)
   */
  public async saveLandingLayout(sections: LandingPageSectionConfig[], adminUid?: string): Promise<void> {
    const payload: LandingPageLayoutConfig = {
      sections: sections.map((s, idx) => ({ ...s, order: idx + 1 })),
      updatedAt: serverTimestamp(),
      updatedBy: adminUid || 'admin',
    };

    this.cachedLayout = payload;

    try {
      await setDoc(doc(db, 'settings', 'landing_page_layout'), sanitizeFirestoreData(payload), { merge: true });
    } catch (err) {
      console.warn('Error saving landing layout to Firestore:', err);
      throw err;
    }
  }

  /**
   * Calculate real live metrics from platform database counts
   */
  public calculateLiveMetrics(
    stories: Story[],
    publishedNovelsCount: number = 0,
    totalWritersCount: number = 0,
    totalReadersCount: number = 0
  ): HeroBannerStats {
    const liveStoriesCount = stories.filter(s => s.status === 'published' || s.status === 'approved').length;
    const resolvedStoriesText = liveStoriesCount > 50 ? `${liveStoriesCount}+` : '25K+';
    const resolvedWritersText = totalWritersCount > 0 ? `${totalWritersCount}+` : '5K+';
    const resolvedReadersText = totalReadersCount > 0 ? `${totalReadersCount}+` : '1M+';

    return {
      storiesCount: resolvedStoriesText,
      storiesLabel: 'తెలుగు రచనలు',
      writersCount: resolvedWritersText,
      writersLabel: 'రచయితలు',
      readersCount: resolvedReadersText,
      readersLabel: 'పాఠకులు',
    };
  }

  /**
   * Check if a slide is currently eligible by schedule timestamps
   */
  public isSlideScheduledActive(slide: HeroSlideConfig): boolean {
    if (!slide.enabled) return false;
    if (!slide.isScheduled) return true;

    const now = Date.now();
    if (slide.startAt) {
      const startTime = new Date(slide.startAt).getTime();
      if (!isNaN(startTime) && now < startTime) return false;
    }

    if (slide.endAt) {
      const endTime = new Date(slide.endAt).getTime();
      if (!isNaN(endTime) && now > endTime) return false;
    }

    return true;
  }

  /**
   * Check if a content item is published, active, not deleted/hidden
   */
  private isContentValidAndPublished(item: any): boolean {
    if (!item) return false;
    if (item.deleted === true || item.status === 'deleted' || item.status === 'archived') return false;
    if (item.status === 'draft' || item.status === 'pending' || item.status === 'rejected') return false;
    if (item.visibility === 'hidden' || item.visibility === 'private') return false;
    return true;
  }

  /**
   * Dynamically build Hero Carousel Slides with strict fallback and zero-break guarantee
   */
  public resolveHeroSlides(
    config: HeroBannerConfig,
    stories: Story[],
    novels: Novel[],
    jokes: Joke[],
    knowledge: KnowledgeArticle[],
    balavinodhiniItems: BalavinodhiniItem[] = []
  ): HeroBannerSlide[] {
    const slides: HeroBannerSlide[] = [];
    const maxCount = Math.max(1, Math.min(12, config.maxSlidesCount || 3));

    // 1. Resolve Admin-configured slides in their exact specified order
    const configuredSlides = (config.slides || [])
      .filter(s => this.isSlideScheduledActive(s))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const slideConfig of configuredSlides) {
      const slide = this.buildSlideFromConfig(slideConfig, stories, novels, jokes, knowledge, balavinodhiniItems);
      if (slide) {
        slides.push(slide);
        if (slides.length >= maxCount) break;
      }
    }

    // 2. Fallback Engine: If not enough valid slides resolved, supplement with real published items
    if (slides.length < maxCount) {
      const validStories = stories.filter(s => this.isContentValidAndPublished(s));
      const validNovels = novels.filter(n => this.isContentValidAndPublished(n));
      const validJokes = jokes.filter(j => this.isContentValidAndPublished(j));
      const validKnowledge = knowledge.filter(k => this.isContentValidAndPublished(k));
      const validBala = balavinodhiniItems.filter(b => this.isContentValidAndPublished(b));

      // A. Most viewed / Most liked story
      const topStory = [...validStories].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0];
      if (topStory && !slides.some(s => s.targetId === topStory.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-top-${topStory.id}`,
          badge: 'అత్యధిక ఆదరణ పొందిన కథ',
          title: topStory.teluguTitle || topStory.title,
          teluguTitle: topStory.teluguTitle || topStory.title,
          authorName: topStory.author?.teluguName || topStory.author?.name || 'కథావాహిని రచయిత',
          coverImage: topStory.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
          contentType: 'story',
          targetId: topStory.id,
          description: topStory.teluguExcerpt || topStory.excerpt,
          headline: topStory.teluguTitle || topStory.title,
          highlightWord: 'కథ',
          subtitle: topStory.teluguExcerpt || topStory.excerpt,
          primaryButtonText: 'కథ చదవండి',
          primaryButtonAction: 'stories',
          secondaryButtonText: 'మీ కథ రాయండి',
        });
      }

      // B. Latest published story
      const latestStory = validStories[0];
      if (latestStory && !slides.some(s => s.targetId === latestStory.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-latest-${latestStory.id}`,
          badge: 'తాజా ప్రచురణ కథ',
          title: latestStory.teluguTitle || latestStory.title,
          teluguTitle: latestStory.teluguTitle || latestStory.title,
          authorName: latestStory.author?.teluguName || latestStory.author?.name || 'కథావాహిని రచయిత',
          coverImage: latestStory.coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          contentType: 'story',
          targetId: latestStory.id,
          description: latestStory.teluguExcerpt || latestStory.excerpt,
          headline: latestStory.teluguTitle || latestStory.title,
          highlightWord: 'కథతో',
          subtitle: latestStory.teluguExcerpt || latestStory.excerpt,
          primaryButtonText: 'కథ చదవండి',
          primaryButtonAction: 'stories',
          secondaryButtonText: 'మీ రచన ప్రారంభించండి',
        });
      }

      // C. Top Featured Novel
      const topNovel = validNovels[0];
      if (topNovel && !slides.some(s => s.targetId === topNovel.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-novel-${topNovel.id}`,
          badge: 'ప్రత్యేక ధారావాహిక నవల',
          title: topNovel.teluguTitle || topNovel.title,
          teluguTitle: topNovel.teluguTitle || topNovel.title,
          authorName: topNovel.author?.teluguName || topNovel.author?.name || 'నవలా రచయిత',
          coverImage: topNovel.coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          contentType: 'novel',
          targetId: topNovel.id,
          description: topNovel.teluguDescription || topNovel.description,
          headline: topNovel.teluguTitle || topNovel.title,
          highlightWord: 'నవల',
          subtitle: topNovel.teluguDescription || topNovel.description,
          primaryButtonText: 'నవల చదవండి',
          primaryButtonAction: 'novels',
          secondaryButtonText: 'రచన ప్రారంభించండి',
        });
      }

      // D. Daily Joke
      const topJoke = validJokes[0];
      if (topJoke && !slides.some(s => s.targetId === topJoke.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-joke-${topJoke.id}`,
          badge: 'నేటి ప్రత్యేక హాస్యం',
          title: 'నవ్వుల పువ్వులు',
          teluguTitle: 'నవ్వుల పువ్వులు',
          authorName: topJoke.author?.teluguName || topJoke.author?.name || 'హాస్య ప్రియుడు',
          coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
          contentType: 'joke',
          targetId: topJoke.id,
          description: topJoke.content,
          headline: 'క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు',
          highlightWord: 'నవ్వులు',
          subtitle: topJoke.content?.slice(0, 120),
          primaryButtonText: 'జోక్స్ చూడండి',
          primaryButtonAction: 'jokes',
          secondaryButtonText: 'జోక్ రాయండి',
        });
      }

      // E. Literary Knowledge
      const topKnowledge = validKnowledge[0];
      if (topKnowledge && !slides.some(s => s.targetId === topKnowledge.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-know-${topKnowledge.id}`,
          badge: 'సాహిత్య విజ్ఞానం',
          title: topKnowledge.teluguTitle || topKnowledge.title,
          teluguTitle: topKnowledge.teluguTitle || topKnowledge.title,
          authorName: topKnowledge.authorName || 'కథావాహిని సంపాదకవర్గం',
          coverImage: topKnowledge.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
          contentType: 'knowledge',
          targetId: topKnowledge.id,
          description: topKnowledge.summary,
          headline: topKnowledge.teluguTitle || topKnowledge.title,
          highlightWord: 'విజ్ఞానం',
          subtitle: topKnowledge.summary,
          primaryButtonText: 'పూర్తి వివరాలు',
          primaryButtonAction: 'knowledge',
          secondaryButtonText: 'మరిన్ని చూడండి',
        });
      }

      // F. Balavinodhini Child Story
      const topBala = validBala[0];
      if (topBala && !slides.some(s => s.targetId === topBala.id) && slides.length < maxCount) {
        slides.push({
          id: `hero-bala-${topBala.id}`,
          badge: 'బాలవినోదిని ప్రత్యేకం',
          title: topBala.teluguTitle || topBala.title,
          teluguTitle: topBala.teluguTitle || topBala.title,
          authorName: topBala.authorName || 'బాల రచయిత',
          coverImage: topBala.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
          contentType: 'balavinodhini',
          targetId: topBala.id,
          description: topBala.content?.slice(0, 100),
          headline: topBala.teluguTitle || topBala.title,
          highlightWord: 'బాలలు',
          subtitle: topBala.description || topBala.content?.slice(0, 120),
          primaryButtonText: 'బాలవినోదిని చూడండి',
          primaryButtonAction: 'balavinodhini',
          secondaryButtonText: 'పిల్లల కథలు',
        });
      }
    }

    // Ultimate fallback if absolutely nothing in database
    if (slides.length === 0) {
      slides.push({
        id: 'hero-fallback-ultimate',
        badge: 'ఈ వారపు ప్రత్యేక కథ',
        title: 'గోదావరి తీరాన వెన్నెల రాత్రి',
        teluguTitle: 'గోదావరి తీరాన వెన్నెల రాత్రి',
        authorName: 'రాధిక పదిమి',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        contentType: 'story',
        headline: 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.',
        highlightWord: 'కథతో',
        subtitle: 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి.',
        primaryButtonText: 'కథలు చదవండి',
        primaryButtonAction: 'stories',
        secondaryButtonText: 'మీ కథ రాయండి',
      });
    }

    return slides.slice(0, maxCount);
  }

  /**
   * Build a single HeroBannerSlide from slide configuration & referenced document
   */
  private buildSlideFromConfig(
    slideConfig: HeroSlideConfig,
    stories: Story[],
    novels: Novel[],
    jokes: Joke[],
    knowledge: KnowledgeArticle[],
    balavinodhiniItems: BalavinodhiniItem[] = []
  ): HeroBannerSlide | null {
    const contentType = slideConfig.contentType;

    // Custom Slide
    if (contentType === 'custom') {
      return {
        id: slideConfig.id,
        badge: slideConfig.badge || 'ప్రత్యేక సిఫార్సు (Featured)',
        title: slideConfig.headline || 'కథావాహిని ప్రత్యేక ప్రచురణ',
        teluguTitle: slideConfig.headline || 'కథావాహిని ప్రత్యేక ప్రచురణ',
        authorName: 'కథావాహిని సంపాదకవర్గం',
        coverImage: slideConfig.customImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
        contentType: 'custom',
        description: slideConfig.subtitle,
        headline: slideConfig.headline,
        highlightWord: slideConfig.highlightWord,
        subtitle: slideConfig.subtitle,
        primaryButtonText: slideConfig.primaryButtonText,
        primaryButtonAction: slideConfig.primaryButtonAction || 'stories',
        secondaryButtonText: slideConfig.secondaryButtonText,
        secondaryButtonAction: slideConfig.secondaryButtonAction,
        isCustom: true,
      };
    }

    // Story reference
    if (contentType === 'story') {
      const item = slideConfig.contentId
        ? stories.find(s => s.id === slideConfig.contentId)
        : stories.find(s => this.isContentValidAndPublished(s));

      if (item && this.isContentValidAndPublished(item)) {
        return {
          id: slideConfig.id,
          badge: slideConfig.badge || 'ఈ వారపు ప్రత్యేక కథ',
          title: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          teluguTitle: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          authorName: item.author?.teluguName || item.author?.name || 'రచయిత',
          coverImage: slideConfig.customImage || item.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
          contentType: 'story',
          targetId: item.id,
          description: (!slideConfig.useContentDefaults && slideConfig.subtitle) ? slideConfig.subtitle : (item.teluguExcerpt || item.excerpt),
          headline: slideConfig.headline || item.teluguTitle || item.title,
          highlightWord: slideConfig.highlightWord,
          subtitle: slideConfig.subtitle || item.teluguExcerpt || item.excerpt,
          primaryButtonText: slideConfig.primaryButtonText || 'కథ చదవండి',
          primaryButtonAction: slideConfig.primaryButtonAction || 'stories',
          secondaryButtonText: slideConfig.secondaryButtonText || 'మీ కథ రాయండి',
          secondaryButtonAction: slideConfig.secondaryButtonAction,
        };
      }
    }

    // Novel reference
    if (contentType === 'novel') {
      const item = slideConfig.contentId
        ? novels.find(n => n.id === slideConfig.contentId)
        : novels.find(n => this.isContentValidAndPublished(n));

      if (item && this.isContentValidAndPublished(item)) {
        return {
          id: slideConfig.id,
          badge: slideConfig.badge || 'ప్రత్యేక నవల',
          title: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          teluguTitle: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          authorName: item.author?.teluguName || item.author?.name || 'నవలా రచయిత',
          coverImage: slideConfig.customImage || item.coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          contentType: 'novel',
          targetId: item.id,
          description: (!slideConfig.useContentDefaults && slideConfig.subtitle) ? slideConfig.subtitle : (item.teluguDescription || item.description),
          headline: slideConfig.headline || item.teluguTitle || item.title,
          highlightWord: slideConfig.highlightWord,
          subtitle: slideConfig.subtitle || item.teluguDescription || item.description,
          primaryButtonText: slideConfig.primaryButtonText || 'నవల చదవండి',
          primaryButtonAction: slideConfig.primaryButtonAction || 'novels',
          secondaryButtonText: slideConfig.secondaryButtonText || 'రచన ప్రారంభించండి',
          secondaryButtonAction: slideConfig.secondaryButtonAction,
        };
      }
    }

    // Joke reference
    if (contentType === 'joke') {
      const item = slideConfig.contentId
        ? jokes.find(j => j.id === slideConfig.contentId)
        : jokes.find(j => this.isContentValidAndPublished(j));

      if (item && this.isContentValidAndPublished(item)) {
        return {
          id: slideConfig.id,
          badge: slideConfig.badge || 'నేటి హాస్య తునక',
          title: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : 'నవ్వుల పువ్వులు',
          teluguTitle: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : 'నవ్వుల పువ్వులు',
          authorName: item.author?.teluguName || item.author?.name || 'హాస్య ప్రియుడు',
          coverImage: slideConfig.customImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
          contentType: 'joke',
          targetId: item.id,
          description: item.content,
          headline: slideConfig.headline || 'క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు',
          highlightWord: slideConfig.highlightWord,
          subtitle: slideConfig.subtitle || item.content?.slice(0, 120),
          primaryButtonText: slideConfig.primaryButtonText || 'జోక్స్ చూడండి',
          primaryButtonAction: slideConfig.primaryButtonAction || 'jokes',
          secondaryButtonText: slideConfig.secondaryButtonText || 'మీ జోక్ రాయండి',
          secondaryButtonAction: slideConfig.secondaryButtonAction,
        };
      }
    }

    // Knowledge reference
    if (contentType === 'knowledge') {
      const item = slideConfig.contentId
        ? knowledge.find(k => k.id === slideConfig.contentId)
        : knowledge.find(k => this.isContentValidAndPublished(k));

      if (item && this.isContentValidAndPublished(item)) {
        return {
          id: slideConfig.id,
          badge: slideConfig.badge || 'సాహిత్య విజ్ఞానం',
          title: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          teluguTitle: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          authorName: item.authorName || 'కథావాహిని సంపాదకవర్గం',
          coverImage: slideConfig.customImage || item.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
          contentType: 'knowledge',
          targetId: item.id,
          description: (!slideConfig.useContentDefaults && slideConfig.subtitle) ? slideConfig.subtitle : item.summary,
          headline: slideConfig.headline || item.teluguTitle || item.title,
          highlightWord: slideConfig.highlightWord,
          subtitle: slideConfig.subtitle || item.summary,
          primaryButtonText: slideConfig.primaryButtonText || 'పూర్తి వివరాలు',
          primaryButtonAction: slideConfig.primaryButtonAction || 'knowledge',
          secondaryButtonText: slideConfig.secondaryButtonText || 'మరిన్ని చూడండి',
          secondaryButtonAction: slideConfig.secondaryButtonAction,
        };
      }
    }

    // Balavinodhini reference
    if (contentType === 'balavinodhini') {
      const item = slideConfig.contentId
        ? balavinodhiniItems.find(b => b.id === slideConfig.contentId)
        : balavinodhiniItems.find(b => this.isContentValidAndPublished(b));

      if (item && this.isContentValidAndPublished(item)) {
        return {
          id: slideConfig.id,
          badge: slideConfig.badge || 'బాలవినోదిని ప్రత్యేకం',
          title: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          teluguTitle: (!slideConfig.useContentDefaults && slideConfig.headline) ? slideConfig.headline : (item.teluguTitle || item.title),
          authorName: item.authorName || 'బాల రచయిత',
          coverImage: slideConfig.customImage || item.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
          contentType: 'balavinodhini',
          targetId: item.id,
          description: (!slideConfig.useContentDefaults && slideConfig.subtitle) ? slideConfig.subtitle : item.content?.slice(0, 100),
          headline: slideConfig.headline || item.teluguTitle || item.title,
          highlightWord: slideConfig.highlightWord,
          subtitle: slideConfig.subtitle || item.description || item.content?.slice(0, 120),
          primaryButtonText: slideConfig.primaryButtonText || 'బాలవినోదిని చూడండి',
          primaryButtonAction: slideConfig.primaryButtonAction || 'balavinodhini',
          secondaryButtonText: slideConfig.secondaryButtonText || 'పిల్లల కథలు',
          secondaryButtonAction: slideConfig.secondaryButtonAction,
        };
      }
    }

    return null;
  }
}

export const landingPageService = new LandingPageService();
