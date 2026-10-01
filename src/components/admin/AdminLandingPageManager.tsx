import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Layout,
  Sliders,
  Save,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  BookOpen,
  Layers,
  Smile,
  RotateCcw,
  Check,
  ChevronRight,
  HelpCircle,
  Image as ImageIcon,
  Flame,
  Plus,
  Trash2,
  Copy,
  Upload,
  Search,
  CheckSquare,
  Square,
  Star,
  ExternalLink,
  ChevronLeft,
  Settings2,
  BarChart3,
  ListOrdered,
  CalendarRange
} from 'lucide-react';
import { 
  HeroBannerConfig, 
  HeroSlideConfig,
  LandingPageLayoutConfig, 
  LandingPageSectionConfig,
  PromotedContentType,
  Story, 
  Novel, 
  Joke, 
  KnowledgeArticle, 
  BalavinodhiniItem,
  User 
} from '../../types';
import { landingPageService, DEFAULT_HERO_CONFIG, DEFAULT_HERO_STATS, DEFAULT_LANDING_SECTIONS } from '../../services/landingPageService';
import { balavinodhiniService } from '../../services/balavinodhiniService';
import { storageService } from '../../services/storageService';
import { EditorialHeroBanner } from '../home/EditorialHeroBanner';
import { HeroContentPickerModal, ContentPickerItem } from './HeroContentPickerModal';

interface AdminLandingPageManagerProps {
  currentUser: User | null;
  stories: Story[];
  novels: Novel[];
  jokes: Joke[];
  knowledge: KnowledgeArticle[];
  onNavigateTab?: (tab: string) => void;
}

export const AdminLandingPageManager: React.FC<AdminLandingPageManagerProps> = ({
  currentUser,
  stories,
  novels,
  jokes,
  knowledge,
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'layout'>('hero');
  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(DEFAULT_HERO_CONFIG);
  const [sections, setSections] = useState<LandingPageSectionConfig[]>(DEFAULT_LANDING_SECTIONS);
  const [balavinodhiniItems, setBalavinodhiniItems] = useState<BalavinodhiniItem[]>([]);
  
  // Modal & Upload States
  const [activePickerSlideId, setActivePickerSlideId] = useState<string | null>(null);
  const [activePickerContentType, setActivePickerContentType] = useState<PromotedContentType>('story');
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Feedback states
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [savingLayout, setSavingLayout] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [customSlideCountInput, setCustomSlideCountInput] = useState<string>('');

  // Subscribe to real-time configuration & Balavinodhini items
  useEffect(() => {
    const unsubHero = landingPageService.subscribeHeroConfig((cfg) => {
      setHeroConfig(cfg);
      setCustomSlideCountInput(String(cfg.maxSlidesCount || 3));
    });

    const unsubLayout = landingPageService.subscribeLandingLayout((layout) => {
      setSections(layout.sections);
    });

    const unsubBala = balavinodhiniService.subscribeItems((items) => {
      setBalavinodhiniItems(items);
    });

    return () => {
      unsubHero();
      unsubLayout();
      unsubBala();
    };
  }, []);

  // Compute active slides and warning on slide count mismatch
  const currentSlideCount = heroConfig.maxSlidesCount || 3;
  const configuredSlidesList = heroConfig.slides || [];
  const excessCardsCount = Math.max(0, configuredSlidesList.length - currentSlideCount);

  // Helper to find content title/author for preview
  const getContentDetails = (type: PromotedContentType, id?: string) => {
    if (!id) return null;
    if (type === 'story') {
      const s = stories.find(item => item.id === id);
      if (s) return { title: s.teluguTitle || s.title, author: s.author?.teluguName || s.author?.name || 'రచయిత', cover: s.coverImage, category: s.category };
    } else if (type === 'novel') {
      const n = novels.find(item => item.id === id);
      if (n) return { title: n.teluguTitle || n.title, author: n.author?.teluguName || n.author?.name || 'నవలా రచయిత', cover: n.coverImage, category: n.category };
    } else if (type === 'joke') {
      const j = jokes.find(item => item.id === id);
      if (j) return { title: j.content.slice(0, 35) + '...', author: j.author?.teluguName || j.author?.name || 'హాస్య ప్రియుడు', cover: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', category: 'హాస్యం' };
    } else if (type === 'knowledge') {
      const k = knowledge.find(item => item.id === id);
      if (k) return { title: k.teluguTitle || k.title, author: k.authorName || 'సంపాదకవర్గం', cover: k.coverImage, category: k.category || 'విజ్ఞానం' };
    } else if (type === 'balavinodhini') {
      const b = balavinodhiniItems.find(item => item.id === id);
      if (b) return { title: b.teluguTitle || b.title, author: b.authorName || 'బాల రచయిత', cover: b.coverImage, category: b.subcategoryId || 'బాల సాహిత్యం' };
    }
    return null;
  };

  // 1. Change number of slides
  const handleSetSlideCount = (count: number) => {
    const validCount = Math.max(1, Math.min(12, count));
    let newSlides = [...(heroConfig.slides || [])];

    // If we need more slides than currently exist, create default placeholders
    while (newSlides.length < validCount) {
      const newOrder = newSlides.length + 1;
      newSlides.push({
        id: `slide-${Date.now()}-${newOrder}`,
        order: newOrder,
        enabled: true,
        contentType: newOrder === 1 ? 'story' : newOrder === 2 ? 'novel' : 'joke',
        useContentDefaults: true,
        badge: newOrder === 1 ? 'ఈ వారపు ప్రత్యేక కథ' : newOrder === 2 ? 'ప్రముఖ ధారావాహిక' : 'నేటి హాస్య తునక',
        headline: newOrder === 1 ? 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.' : newOrder === 2 ? 'అధ్యాయాల వారీగా సాగే ఉత్కంఠభరిత నవలలు' : 'క్షణాల్లో నవ్వులు పూయించే హాస్య తునకలు',
        highlightWord: newOrder === 1 ? 'కథతో' : newOrder === 2 ? 'నవలలు' : 'నవ్వులు',
        subtitle: 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి.',
        primaryButtonText: newOrder === 1 ? 'కథలు చదవండి' : newOrder === 2 ? 'నవలలు చదవండి' : 'జోక్స్ చదవండి',
        primaryButtonAction: newOrder === 1 ? 'stories' : newOrder === 2 ? 'novels' : 'jokes',
        secondaryButtonText: 'మీ రచన ప్రారంభించండి',
        isScheduled: false,
      });
    }

    setHeroConfig({
      ...heroConfig,
      maxSlidesCount: validCount,
      slides: newSlides,
    });
    setCustomSlideCountInput(String(validCount));
  };

  // Add a brand new slide
  const handleAddSlide = () => {
    const newSlides = [...(heroConfig.slides || [])];
    const newOrder = newSlides.length + 1;
    newSlides.push({
      id: `slide-${Date.now()}-${newOrder}`,
      order: newOrder,
      enabled: true,
      contentType: 'story',
      useContentDefaults: true,
      badge: 'ఈ వారపు ప్రత్యేక కథ',
      headline: 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.',
      highlightWord: 'కథతో',
      subtitle: 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి.',
      primaryButtonText: 'కథలు చదవండి',
      primaryButtonAction: 'stories',
      secondaryButtonText: 'మీ కథ రాయండి',
      isScheduled: false,
    });

    setHeroConfig({
      ...heroConfig,
      maxSlidesCount: Math.max(heroConfig.maxSlidesCount || 3, newSlides.length),
      slides: newSlides,
    });
  };

  // Update a single slide
  const handleUpdateSlide = (id: string, updates: Partial<HeroSlideConfig>) => {
    const updated = (heroConfig.slides || []).map((slide) => {
      if (slide.id === id) {
        return { ...slide, ...updates };
      }
      return slide;
    });

    setHeroConfig({
      ...heroConfig,
      slides: updated,
    });
  };

  // Move slide up or down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const list = [...(heroConfig.slides || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Renumber orders
    const reordered = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    setHeroConfig({
      ...heroConfig,
      slides: reordered,
    });
  };

  // Duplicate slide
  const handleDuplicateSlide = (index: number) => {
    const list = [...(heroConfig.slides || [])];
    const original = list[index];
    if (!original) return;

    const duplicated: HeroSlideConfig = {
      ...original,
      id: `slide-${Date.now()}-copy`,
      badge: `${original.badge || 'ప్రత్యేక'} (Copy)`,
      order: index + 2,
    };

    list.splice(index + 1, 0, duplicated);
    const reordered = list.map((s, idx) => ({ ...s, order: idx + 1 }));

    setHeroConfig({
      ...heroConfig,
      maxSlidesCount: Math.max(heroConfig.maxSlidesCount || 3, reordered.length),
      slides: reordered,
    });
  };

  // Remove slide
  const handleRemoveSlide = (id: string) => {
    const filtered = (heroConfig.slides || []).filter(s => s.id !== id);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));

    setHeroConfig({
      ...heroConfig,
      slides: reordered,
      maxSlidesCount: Math.min(heroConfig.maxSlidesCount || 3, Math.max(1, reordered.length)),
    });
  };

  // Content Selection Callback from Search Picker
  const handleContentSelected = (item: ContentPickerItem) => {
    if (!activePickerSlideId) return;

    const slide = (heroConfig.slides || []).find(s => s.id === activePickerSlideId);
    if (!slide) return;

    handleUpdateSlide(activePickerSlideId, {
      contentType: item.contentType,
      contentId: item.id,
      // If user hasn't typed custom overrides, keep it clean
      customImage: item.coverImage,
      headline: slide.useContentDefaults ? (item.teluguTitle || item.title) : slide.headline,
      primaryButtonAction: item.contentType,
    });

    setActivePickerSlideId(null);
  };

  // Image Upload handler for custom cover
  const handleFileUpload = async (slideId: string, file: File) => {
    try {
      setUploadingSlideId(slideId);
      setUploadProgress(10);

      const result = await storageService.uploadHeroBannerImage(slideId, file, (progress) => {
        setUploadProgress(progress);
      });

      if (result && result.downloadUrl) {
        handleUpdateSlide(slideId, {
          customImage: result.downloadUrl,
          customImageStoragePath: result.storagePath,
          customImageFileName: result.metadata?.fileName || file.name,
          imageSource: 'custom_upload'
        });
      }
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      setSaveErrorMsg('హీరో బ్యానర్ చిత్రాన్ని అప్‌లోడ్ చేయడంలో లోపం ఏర్పడింది.');
      setTimeout(() => setSaveErrorMsg(null), 4000);
    } finally {
      setUploadingSlideId(null);
      setUploadProgress(0);
    }
  };

  // Save Hero Banner config to Firestore
  const handleSaveHero = async () => {
    try {
      setSavingHero(true);
      setSaveSuccessMsg(null);
      setSaveErrorMsg(null);

      await landingPageService.saveHeroConfig(heroConfig, currentUser?.id);
      setSaveSuccessMsg('హెరో బ్యానర్ వివరాలు విజయవంతంగా క్లౌడ్‌లో భద్రపరచబడ్డాయి! (Hero Banner successfully saved!)');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error('Error saving hero banner:', e);
      setSaveErrorMsg('హెరో బ్యానర్ భద్రపరచడంలో లోపం: ' + (e?.message || 'దయచేసి మళ్లీ ప్రయత్నించండి.'));
      setTimeout(() => setSaveErrorMsg(null), 5000);
    } finally {
      setSavingHero(false);
    }
  };

  // Save Sections Layout
  const handleSaveLayout = async () => {
    try {
      setSavingLayout(true);
      await landingPageService.saveLandingLayout(sections, currentUser?.id);
      setSaveSuccessMsg('ల్యాండింగ్ పేజీ విభాగాల క్రమం విజయవంతంగా నవీకరించబడింది!');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error('Error saving layout:', e);
      setSaveErrorMsg('విభాగాల క్రమాన్ని భద్రపరచడంలో లోపం ఏర్పడింది.');
    } finally {
      setSavingLayout(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20 font-serif-telugu">
      
      {/* ========================================================================= */}
      {/* TOP HEADER & TAB NAVIGATION */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7A284B]/15 via-purple-500/10 to-amber-500/10 border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>కథావాహిని CMS కంట్రోల్ సెంటర్</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17151A] dark:text-[#F7F3EE] mt-1">
            హెరో బ్యానర్ మేనేజర్ (Hero Banner CMS)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-1">
            హోమ్ పేజీ ప్రధాన బ్యానర్‌లో ఎన్ని స్లైడ్లు ఉండాలో, ఒక్కో స్లైడ్‌లో ఏ కంటెంట్ (కథ, నవల, జోక్, విజ్ఞానం) కనిపించాలో సులభంగా నిర్ణయించండి.
          </p>
        </div>

        {/* Hero Enable Switch & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Hero Enable Toggle */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-xs">
            <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">హెరో బ్యానర్:</span>
            <button
              type="button"
              onClick={() => setHeroConfig({ ...heroConfig, enabled: !heroConfig.enabled })}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                heroConfig.enabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {heroConfig.enabled ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{heroConfig.enabled ? 'యాక్టివ్ (Enabled)' : 'డిసేబుల్ (Disabled)'}</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-xs">
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>హెరో బ్యానర్ బిల్డర్</span>
            </button>

            <button
              onClick={() => setActiveTab('layout')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'layout'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>విభాగాల క్రమం (Sections Order)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: HERO BANNER BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-10">

          {/* ----------------------------------------------------------------------- */}
          {/* 1. HERO CAROUSEL SETTINGS (స్లైడ్ల సంఖ్య మరియు కరౌసెల్ సెట్టింగ్స్) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div className="w-8 h-8 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  హెరో కరౌసెల్ సెట్టింగ్స్ (Hero Carousel Settings)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  మొత్తం ఎన్ని కార్డులు రొటేట్ అవ్వాలో మరియు కరౌసెల్ ఎలా పనిచేయాలో ఇక్కడ నిర్ణయించండి.
                </p>
              </div>
            </div>

            {/* Slide Count Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center justify-between">
                <span>ఎన్ని Hero Cards చూపించాలి? (Number of Hero Cards):</span>
                <span className="text-xs text-[#7A284B] dark:text-[#D87591]">
                  ప్రస్తుతం: <strong>{currentSlideCount} కార్డ్స్</strong>
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetSlideCount(num)}
                    className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                      currentSlideCount === num
                        ? 'bg-[#7A284B] text-white shadow-md scale-105 ring-2 ring-[#7A284B]/30'
                        : 'bg-[#FAF7F2] dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] text-[#17151A] dark:text-white hover:border-[#7A284B]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Custom Number Input */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#E8E1DA] dark:border-[#26242E]">
                  <span className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">కస్టమ్:</span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={customSlideCountInput}
                    onChange={(e) => {
                      setCustomSlideCountInput(e.target.value);
                      const parsed = parseInt(e.target.value, 10);
                      if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
                        handleSetSlideCount(parsed);
                      }
                    }}
                    className="w-16 px-2.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-center text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                  />
                </div>
              </div>

              {/* Warning when cards are configured beyond current count */}
              {excessCardsCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>గమనిక:</strong> మీరు ప్రస్తుతం <strong>{configuredSlidesList.length}</strong> కార్డులను కాన్ఫిగర్ చేశారు. స్లైడ్ల సంఖ్యను <strong>{currentSlideCount}</strong> కి తగ్గించినందున, మొదటి {currentSlideCount} కార్డులు మాత్రమే యాక్టివ్‌గా కనిపిస్తాయి. మిగిలిన {excessCardsCount} కార్డుల సమాచారం తొలగించబడదు మరియు సురక్షితంగా ఉంటుంది.
                  </div>
                </div>
              )}
            </div>

            {/* General Carousel Behaviors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#E8E1DA] dark:border-[#26242E]">
              {/* Auto Play */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">ఆటో-ప్లే (Auto Play)</div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">స్లైడ్లు వాటంతట అవే తిరగడం</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroConfig({ ...heroConfig, autoRotate: !heroConfig.autoRotate })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    heroConfig.autoRotate ? 'bg-[#7A284B]' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    heroConfig.autoRotate ? 'left-6.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Auto Play Interval */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] space-y-1.5">
                <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">రొటేషన్ వ్యవధి (Interval)</div>
                <select
                  value={heroConfig.autoRotateSeconds || 5}
                  onChange={(e) => setHeroConfig({ ...heroConfig, autoRotateSeconds: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B]"
                >
                  <option value={3}>3 సెకన్లు (వేగంగా)</option>
                  <option value={5}>5 సెకన్లు (సిఫార్సు)</option>
                  <option value={7}>7 సెకన్లు</option>
                  <option value={10}>10 సెకన్లు (నెమ్మదిగా)</option>
                  <option value={15}>15 సెకన్లు</option>
                </select>
              </div>

              {/* Previous / Next Buttons */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">మునుపటి/తరువాతి బటన్లు</div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">Previous & Next బాణాలు</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroConfig({ ...heroConfig, showNavigationButtons: heroConfig.showNavigationButtons === false ? true : false })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    heroConfig.showNavigationButtons !== false ? 'bg-[#7A284B]' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    heroConfig.showNavigationButtons !== false ? 'left-6.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Indicators / Dots */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">డాట్స్ సూచికలు (Dots)</div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">స్లైడ్ స్థానం చూపించే చుక్కలు</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroConfig({ ...heroConfig, showIndicators: heroConfig.showIndicators === false ? true : false })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    heroConfig.showIndicators !== false ? 'bg-[#7A284B]' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    heroConfig.showIndicators !== false ? 'left-6.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Pause on Hover */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">మౌస్ ఉంచినప్పుడు ఆగడం</div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">Pause on Hover</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroConfig({ ...heroConfig, pauseOnHover: heroConfig.pauseOnHover === false ? true : false })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    heroConfig.pauseOnHover !== false ? 'bg-[#7A284B]' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    heroConfig.pauseOnHover !== false ? 'left-6.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Mobile Swipe */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1B24] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">మొబైల్ స్వైప్ (Swipe)</div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">వేలితో స్వైప్ చేసి మార్చడం</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroConfig({ ...heroConfig, enableSwipe: heroConfig.enableSwipe === false ? true : false })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    heroConfig.enableSwipe !== false ? 'bg-[#7A284B]' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    heroConfig.enableSwipe !== false ? 'left-6.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. INDEPENDENT HERO CARDS BUILDER (స్వతంత్ర హీరో కార్డుల కాన్ఫిగరేషన్) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                    హీరో కార్డ్స్ వివరాలు (Hero Cards Builder)
                  </h3>
                  <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                    ప్రతి కార్డ్‌ను స్వతంత్రంగా కాన్ఫిగర్ చేయండి (ఏ కంటెంట్ రకం, శీర్షిక, చిత్రం, బటన్, షెడ్యూల్).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                className="px-4 py-2 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start shadow-xs hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>+ కొత్త హీరో కార్డ్ జోడించండి</span>
              </button>
            </div>

            {/* List of Configured Cards */}
            <div className="space-y-6">
              {configuredSlidesList.slice(0, currentSlideCount).map((slide, index) => {
                const selectedContent = getContentDetails(slide.contentType, slide.contentId);
                const isSlideOverLimit = index >= currentSlideCount;

                return (
                  <div
                    key={slide.id}
                    className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                      slide.enabled
                        ? 'bg-white dark:bg-[#18181F] border-[#E8E1DA] dark:border-[#26242E] shadow-sm'
                        : 'bg-neutral-50 dark:bg-[#14131A] border-dashed border-neutral-300 dark:border-neutral-800 opacity-75'
                    }`}
                  >
                    {/* Card Header & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1DA] dark:border-[#26242E]">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#7A284B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                            <span>HERO CARD {index + 1}</span>
                            {!slide.enabled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                డిసేబుల్ చేయబడింది
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">
                            {selectedContent ? selectedContent.title : (slide.headline || 'డిఫాల్ట్ కంటెంట్')}
                          </span>
                        </div>
                      </div>

                      {/* Top Action Ribbon: Active, Move Up, Move Down, Duplicate, Remove */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => handleUpdateSlide(slide.id, { enabled: !slide.enabled })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            slide.enabled
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{slide.enabled ? 'యాక్టివ్' : 'డిసేబుల్'}</span>
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] text-[#17151A] dark:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                          title="పైకి జరపండి (Move Up)"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'down')}
                          disabled={index === configuredSlidesList.length - 1}
                          className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] text-[#17151A] dark:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                          title="క్రిందికి జరపండి (Move Down)"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateSlide(index)}
                          className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] text-[#17151A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="నకలు చేయండి (Duplicate Card)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Remove */}
                        {configuredSlidesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(slide.id)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 transition-all cursor-pointer"
                            title="తొలగించండి (Remove Card)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Body Settings */}
                    <div className="pt-5 space-y-6">
                      {/* 1. Content Type Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                          కంటెంట్ రకం (Content Type):
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { id: 'story', label: 'కథ (Story)', icon: BookOpen },
                            { id: 'novel', label: 'నవల (Novel)', icon: Layers },
                            { id: 'joke', label: 'హాస్యం (Joke)', icon: Smile },
                            { id: 'knowledge', label: 'విజ్ఞానం (Knowledge)', icon: Star },
                            { id: 'balavinodhini', label: 'బాలవినోదిని (Kids)', icon: Sparkles },
                            { id: 'custom', label: 'కస్టమ్ ప్రకటన (Custom)', icon: Flame },
                          ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isSelected = slide.contentType === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { 
                                  contentType: tab.id as any,
                                  contentId: '', // Reset target content on type switch so user chooses fresh
                                })}
                                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-[#7A284B] text-white shadow-xs scale-[1.02]'
                                    : 'bg-[#FAF7F2] dark:bg-[#1E1D27] border border-[#E8E1DA] dark:border-[#26242E] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Select Exact Content Item */}
                      {slide.contentType !== 'custom' && (
                        <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                              కంటెంట్ ఎంపిక (Select Content):
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setActivePickerContentType(slide.contentType);
                                setActivePickerSlideId(slide.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>🔍 కంటెంట్ శోధించండి (Search {slide.contentType})</span>
                            </button>
                          </div>

                          {/* Selected Item Preview Box */}
                          {selectedContent ? (
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1F1E2A] border border-[#7A284B]/40 ring-2 ring-[#7A284B]/15 flex items-center gap-4">
                              <img
                                src={selectedContent.cover}
                                alt=""
                                className="w-14 h-18 rounded-xl object-cover shadow-sm shrink-0"
                              />
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
                                    ✓ ఎంపికైంది (Selected)
                                  </span>
                                  <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">
                                    {selectedContent.category}
                                  </span>
                                </div>
                                <h5 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                                  {selectedContent.title}
                                </h5>
                                <div className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                                  రచన: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{selectedContent.author}</strong>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePickerContentType(slide.contentType);
                                    setActivePickerSlideId(slide.id);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A2938] hover:bg-[#7A284B] hover:text-white text-xs font-bold transition-colors cursor-pointer text-[#17151A] dark:text-white"
                                >
                                  మార్చండి
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSlide(slide.id, { contentId: '' })}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  తీసివేయండి
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => {
                                setActivePickerContentType(slide.contentType);
                                setActivePickerSlideId(slide.id);
                              }}
                              className="p-5 rounded-2xl border-2 border-dashed border-[#E8E1DA] dark:border-[#2E2D3B] hover:border-[#7A284B] text-center space-y-1.5 cursor-pointer bg-white/60 dark:bg-[#1B1A24]/60 transition-colors group"
                            >
                              <Search className="w-5 h-5 text-[#6F6970] group-hover:text-[#7A284B] mx-auto transition-colors" />
                              <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                                ఎటువంటి కంటెంట్ ఎంపిక చేయలేదు (No item selected yet)
                              </div>
                              <div className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">
                                క్లిక్ చేసి డేటాబేస్ నుండి కథ, నవల లేదా జోక్ శోధించి ఎంచుకోండి. (లేదా ఆటోమేటిక్ తాజా కంటెంట్ చూపబడుతుంది)
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Hero Image Options */}
                      <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E]">
                        <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                          <span>హీరో చిత్రం (Hero Image):</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Option A: Content Image */}
                          <label className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                            slide.imageSource !== 'custom_upload' && slide.imageSource !== 'custom_url'
                              ? 'bg-[#7A284B]/10 border-[#7A284B] ring-2 ring-[#7A284B]/20'
                              : 'bg-white dark:bg-[#1E1D27] border-[#E8E1DA] dark:border-[#26242E]'
                          }`}>
                            <input
                              type="radio"
                              name={`img-source-${slide.id}`}
                              checked={slide.imageSource !== 'custom_upload' && slide.imageSource !== 'custom_url'}
                              onChange={() => handleUpdateSlide(slide.id, { imageSource: 'content' })}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">రచన కవర్ చిత్రం వాడండి</div>
                              <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">ఎంచుకున్న కథ/నవల యొక్క అసలు కవర్ చిత్రాన్ని ఉపయోగిస్తుంది.</div>
                            </div>
                          </label>

                          {/* Option B: Custom Image Upload / URL */}
                          <label className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                            slide.imageSource === 'custom_upload' || slide.imageSource === 'custom_url'
                              ? 'bg-[#7A284B]/10 border-[#7A284B] ring-2 ring-[#7A284B]/20'
                              : 'bg-white dark:bg-[#1E1D27] border-[#E8E1DA] dark:border-[#26242E]'
                          }`}>
                            <input
                              type="radio"
                              name={`img-source-${slide.id}`}
                              checked={slide.imageSource === 'custom_upload' || slide.imageSource === 'custom_url'}
                              onChange={() => handleUpdateSlide(slide.id, { imageSource: 'custom_upload' })}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">ప్రత్యేక హీరో చిత్రం (Custom Upload / URL)</div>
                              <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">హీరో బ్యానర్ కోసం ప్రత్యేకంగా ఇమేజ్ అప్‌లోడ్ చేయండి.</div>
                            </div>
                          </label>
                        </div>

                        {/* Custom Image Upload & URL Inputs */}
                        {(slide.imageSource === 'custom_upload' || slide.imageSource === 'custom_url') && (
                          <div className="p-4 rounded-2xl bg-white dark:bg-[#1F1E2A] border border-[#E8E1DA] dark:border-[#26242E] space-y-3 pt-3 animate-fadeIn">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* File Upload Button */}
                              <input
                                type="file"
                                accept="image/*"
                                ref={(el) => { fileInputRefs.current[slide.id] = el; }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(slide.id, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />

                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[slide.id]?.click()}
                                disabled={uploadingSlideId === slide.id}
                                className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingSlideId === slide.id ? `అప్‌లోడ్ అవుతోంది (${uploadProgress}%)...` : 'డివైజ్ నుండి ఇమేజ్ అప్‌లోడ్ చేయండి'}</span>
                              </button>

                              <span className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">లేదా URL ఇవ్వండి:</span>
                            </div>

                            <input
                              type="text"
                              value={slide.customImage || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { customImage: e.target.value, imageSource: 'custom_url' })}
                              placeholder="https://images.unsplash.com/... (Image URL)"
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />

                            {slide.customImage && (
                              <div className="flex items-center gap-3 pt-2">
                                <img
                                  src={slide.customImage}
                                  alt="Custom preview"
                                  className="w-16 h-20 rounded-xl object-cover shadow-sm border border-white/20"
                                />
                                <div className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                                  కస్టమ్ చిత్రం ప్రివ్యూ సక్రమంగా లోడ్ అయింది.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 4. Text & Typography Settings (Automatic vs Custom) */}
                      <div className="space-y-4 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                            హీరో టెక్స్ట్ మూలం (Text Source):
                          </label>

                          {/* Toggle: Use defaults vs Custom */}
                          <div className="flex items-center gap-2 bg-white dark:bg-[#1E1D27] p-1 rounded-xl border border-[#E8E1DA] dark:border-[#26242E]">
                            <button
                              type="button"
                              onClick={() => handleUpdateSlide(slide.id, { useContentDefaults: true })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                slide.useContentDefaults
                                  ? 'bg-[#7A284B] text-white shadow-xs'
                                  : 'text-[#6F6970] dark:text-[#AAA4AC]'
                              }`}
                            >
                              ○ ఆటోమేటిక్ (కంటెంట్ వివరాలు)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSlide(slide.id, { useContentDefaults: false })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !slide.useContentDefaults
                                  ? 'bg-[#7A284B] text-white shadow-xs'
                                  : 'text-[#6F6970] dark:text-[#AAA4AC]'
                              }`}
                            >
                              ○ కస్టమ్ టెక్స్ట్ (Override)
                            </button>
                          </div>
                        </div>

                        {/* Text Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                          {/* Badge */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              బ్యాడ్జ్ టెక్స్ట్ (Badge):
                            </label>
                            <input
                              type="text"
                              value={slide.badge || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { badge: e.target.value })}
                              placeholder="ఉదా: ఈ వారపు ప్రత్యేక కథ"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>

                          {/* Highlight Word */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              హైలైట్ పదం/పదబంధం (Highlight Word):
                            </label>
                            <input
                              type="text"
                              value={slide.highlightWord || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { highlightWord: e.target.value })}
                              placeholder="ఉదా: కథతో"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>

                          {/* Main Heading */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              ప్రధాన హెడ్‌లైన్ (Main Heading):
                            </label>
                            <input
                              type="text"
                              value={slide.headline || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { headline: e.target.value })}
                              placeholder="ఉదా: ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs sm:text-sm text-[#17151A] dark:text-white font-bold focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>

                          {/* Description / Subtitle */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              వివరణ / సబ్‌టైటిల్ (Subtitle):
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtitle || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                              placeholder="ఉదా: తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి..."
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>

                          {/* Primary CTA */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              ప్రధాన బటన్ టెక్స్ట్ (Primary CTA):
                            </label>
                            <input
                              type="text"
                              value={slide.primaryButtonText || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { primaryButtonText: e.target.value })}
                              placeholder="ఉదా: కథ చదవండి"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>

                          {/* Secondary CTA */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">
                              రెండవ బటన్ టెక్స్ట్ (Secondary CTA):
                            </label>
                            <input
                              type="text"
                              value={slide.secondaryButtonText || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { secondaryButtonText: e.target.value })}
                              placeholder="ఉదా: మీ కథ రాయండి"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. Schedule & Expiration */}
                      <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E]">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                            <CalendarRange className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                            <span>షెడ్యూల్ & ప్రదర్శన వ్యవధి (Schedule & Duration):</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleUpdateSlide(slide.id, { isScheduled: !slide.isScheduled })}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              slide.isScheduled
                                ? 'bg-indigo-500 text-white'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {slide.isScheduled ? '✓ షెడ్యూల్ ఆన్ (Active)' : 'ఎల్లప్పుడూ ప్రదర్శించు (Always)'}
                          </button>
                        </div>

                        {slide.isScheduled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fadeIn">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">ప్రారంభ సమయం (Start Date/Time):</span>
                              <input
                                type="datetime-local"
                                value={slide.startAt || ''}
                                onChange={(e) => handleUpdateSlide(slide.id, { startAt: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-[#6F6970] dark:text-[#AAA4AC]">ముగింపు సమయం (End Date/Time):</span>
                              <input
                                type="datetime-local"
                                value={slide.endAt || ''}
                                onChange={(e) => handleUpdateSlide(slide.id, { endAt: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#17151A] dark:text-white focus:ring-2 focus:ring-[#7A284B]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. HERO ORDER OVERVIEW (కార్డుల వరుస క్రమం సారాంశం) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div className="w-8 h-8 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  హీరో కార్డ్స్ క్రమం (Hero Slides Order)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  పబ్లిక్ హోమ్ పేజీలో ఈ ఖచ్చితమైన క్రమంలోనే స్లైడ్లు తిరుగుతాయి.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {configuredSlidesList.slice(0, currentSlideCount).map((slide, idx) => {
                const details = getContentDetails(slide.contentType, slide.contentId);
                return (
                  <div
                    key={slide.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-[#7A284B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                          {details ? details.title : (slide.headline || 'హీరో స్లైడ్')}
                        </div>
                        <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] flex items-center gap-1.5">
                          <span className="capitalize">{slide.contentType}</span>
                          <span>•</span>
                          <span>{slide.badge || 'ప్రత్యేక'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-xl bg-white dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] disabled:opacity-30 cursor-pointer"
                        title="పైకి"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 'down')}
                        disabled={idx === currentSlideCount - 1}
                        className="p-1.5 rounded-xl bg-white dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] disabled:opacity-30 cursor-pointer"
                        title="క్రిందికి"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 4. HERO INSIGHTS / METRICS (గణాంకాల నిర్వహణ) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div className="w-8 h-8 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  హీరో గణాంకాలు (Hero Platform Insights / Metrics)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  హీరో బ్యానర్ దిగువన కనిపించే గణాంకాలను లైవ్ లెక్కల ద్వారా లేదా కస్టమ్ విలువల ద్వారా నియంత్రించండి.
                </p>
              </div>
            </div>

            {/* Metrics Source Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                గణాంకాల మూలం (Metrics Source):
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  heroConfig.metricsSource !== 'custom'
                    ? 'bg-[#7A284B]/10 border-[#7A284B] ring-2 ring-[#7A284B]/20'
                    : 'bg-[#FAF7F2] dark:bg-[#1C1B24] border-[#E8E1DA] dark:border-[#26242E]'
                }`}>
                  <input
                    type="radio"
                    name="metrics-source"
                    checked={heroConfig.metricsSource !== 'custom'}
                    onChange={() => setHeroConfig({ ...heroConfig, metricsSource: 'live' })}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">లైవ్ యాప్ లెక్కలు (Use Live Platform Data)</div>
                    <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">డేటాబేస్ నుండి నిజమైన కథలు, రచయితలు, పాఠకుల లెక్కలను ఆటోమేటిక్‌గా లెక్కిస్తుంది.</div>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  heroConfig.metricsSource === 'custom'
                    ? 'bg-[#7A284B]/10 border-[#7A284B] ring-2 ring-[#7A284B]/20'
                    : 'bg-[#FAF7F2] dark:bg-[#1C1B24] border-[#E8E1DA] dark:border-[#26242E]'
                }`}>
                  <input
                    type="radio"
                    name="metrics-source"
                    checked={heroConfig.metricsSource === 'custom'}
                    onChange={() => setHeroConfig({ ...heroConfig, metricsSource: 'custom' })}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">కస్టమ్ గణాంకాలు (Custom Admin Values)</div>
                    <div className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">అడ్మిన్ ద్వారా ప్రత్యేకంగా నమోదు చేసిన సంఖ్యలు ప్రదర్శించబడతాయి.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Metrics Inputs */}
            {heroConfig.metricsSource === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 animate-fadeIn">
                {/* Metric 1 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E] space-y-2">
                  <span className="text-[11px] font-bold text-[#7A284B] dark:text-[#D87591]">గణాంకం 1 (Stories)</span>
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.storiesCount || '25K+'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, storiesCount: e.target.value }
                    })}
                    placeholder="25K+"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.storiesLabel || 'తెలుగు కథలు'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, storiesLabel: e.target.value }
                    })}
                    placeholder="తెలుగు కథలు"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs"
                  />
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E] space-y-2">
                  <span className="text-[11px] font-bold text-[#7A284B] dark:text-[#D87591]">గణాంకం 2 (Writers)</span>
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.writersCount || '5K+'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, writersCount: e.target.value }
                    })}
                    placeholder="5K+"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.writersLabel || 'రచయితలు'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, writersLabel: e.target.value }
                    })}
                    placeholder="రచయితలు"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs"
                  />
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15141D] border border-[#E8E1DA] dark:border-[#26242E] space-y-2">
                  <span className="text-[11px] font-bold text-[#7A284B] dark:text-[#D87591]">గణాంకం 3 (Readers)</span>
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.readersCount || '1M+'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, readersCount: e.target.value }
                    })}
                    placeholder="1M+"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={heroConfig.customMetrics?.readersLabel || 'పాఠకులు'}
                    onChange={(e) => setHeroConfig({
                      ...heroConfig,
                      customMetrics: { ...heroConfig.customMetrics, readersLabel: e.target.value }
                    })}
                    placeholder="పాఠకులు"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#100F15] border border-[#E8E1DA] dark:border-[#26242E] text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 5. LIVE HERO PREVIEW (లైవ్ ప్రివ్యూ) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div className="w-8 h-8 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  లైవ్ హీరో ప్రివ్యూ (Live Hero Banner Preview)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  హోమ్ పేజీలో మీ కాన్ఫిగరేషన్ ఎలా కనిపిస్తుందో ఇక్కడే పరిశీలించండి.
                </p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <EditorialHeroBanner
                config={heroConfig}
                stories={stories}
                novels={novels}
                jokes={jokes}
                knowledge={knowledge}
                onSelectTab={() => {}}
                onOpenWrite={() => {}}
              />
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* STICKY SAVE BAR (భద్రపరచండి) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-3xl bg-[#17151A]/95 dark:bg-[#121118]/95 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#7A284B] text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">హెరో బ్యానర్ మార్పులను భద్రపరచండి</h4>
                <p className="text-xs text-white/70">
                  సేవ్ చేసిన వెంటనే పబ్లిక్ హోమ్ పేజీలో రియల్-టైమ్‌లో నవీకరించబడుతుంది.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHeroConfig(DEFAULT_HERO_CONFIG)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>రీసెట్ (Default)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveHero}
                disabled={savingHero}
                className="px-6 py-3 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingHero ? 'భద్రపరచబడుతోంది...' : 'హీరో కాన్ఫిగరేషన్ భద్రపరచండి'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LANDING PAGE SECTIONS ORDER */}
      {/* ========================================================================= */}
      {activeTab === 'layout' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1DA] dark:border-[#26242E]">
            <div>
              <h3 className="text-lg font-bold text-[#17151A] dark:text-[#F7F3EE]">
                ల్యాండింగ్ పేజీ విభాగాల క్రమం (Landing Page Sections Order)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                హోమ్ పేజీలో ఏ విభాగం పైన లేదా క్రింద ఉండాలో పైకి/క్రిందికి జరిపి నిర్ణయించండి.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveLayout}
              disabled={savingLayout}
              className="px-5 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs self-start"
            >
              <Save className="w-4 h-4" />
              <span>{savingLayout ? 'భద్రపరచబడుతోంది...' : 'క్రమాన్ని భద్రపరచండి'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  section.enabled
                    ? 'bg-[#FAF7F2] dark:bg-[#1A1924] border-[#E8E1DA] dark:border-[#26242E]'
                    : 'bg-neutral-100 dark:bg-[#121118] border-neutral-300 dark:border-neutral-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-[#7A284B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                      {section.teluguTitle} ({section.title})
                    </h5>
                    <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] truncate">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...sections];
                      updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                      setSections(updated);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      section.enabled
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {section.enabled ? 'యాక్టివ్' : 'డిసేబుల్'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (idx === 0) return;
                      const updated = [...sections];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      setSections(updated.map((s, i) => ({ ...s, order: i + 1 })));
                    }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-xl bg-white dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (idx === sections.length - 1) return;
                      const updated = [...sections];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      setSections(updated.map((s, i) => ({ ...s, order: i + 1 })));
                    }}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 rounded-xl bg-white dark:bg-[#201F29] border border-[#E8E1DA] dark:border-[#26242E] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCHABLE CONTENT PICKER MODAL */}
      {/* ========================================================================= */}
      <HeroContentPickerModal
        isOpen={Boolean(activePickerSlideId)}
        onClose={() => setActivePickerSlideId(null)}
        selectedContentType={activePickerContentType}
        onSelect={handleContentSelected}
        stories={stories}
        novels={novels}
        jokes={jokes}
        knowledge={knowledge}
        balavinodhiniItems={balavinodhiniItems}
      />

    </div>
  );
};
