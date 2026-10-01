import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Feather, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  BookOpen, 
  Smile, 
  Flame,
  Star,
  Clock,
  Layers
} from 'lucide-react';
import { HeroBannerConfig, HeroBannerSlide, Story, Novel, Joke, KnowledgeArticle } from '../../types';
import { landingPageService } from '../../services/landingPageService';

interface EditorialHeroBannerProps {
  config: HeroBannerConfig;
  stories: Story[];
  novels: Novel[];
  jokes: Joke[];
  knowledge: KnowledgeArticle[];
  isAdmin?: boolean;
  onOpenAdminHeroEditor?: () => void;
  onSelectTab: (tab: string) => void;
  onOpenWrite: () => void;
  onSelectStory?: (story: Story) => void;
  onSelectNovel?: (novel: Novel) => void;
}

export const EditorialHeroBanner: React.FC<EditorialHeroBannerProps> = ({
  config,
  stories,
  novels,
  jokes,
  knowledge,
  isAdmin,
  onOpenAdminHeroEditor,
  onSelectTab,
  onOpenWrite,
  onSelectStory,
  onSelectNovel,
}) => {
  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Compute slides dynamically based on config and data
  useEffect(() => {
    const computedSlides = landingPageService.resolveHeroSlides(
      config,
      stories,
      novels,
      jokes,
      knowledge
    );
    setSlides(computedSlides);
    if (activeSlideIndex >= computedSlides.length) {
      setActiveSlideIndex(0);
    }
  }, [config, stories, novels, jokes, knowledge, activeSlideIndex]);

  // Auto-rotation timer (pauses when user hovers over the card if pauseOnHover is enabled)
  useEffect(() => {
    if (!config.autoRotate || (config.pauseOnHover !== false && isHovered) || slides.length <= 1) return;

    const intervalTime = Math.max(2, (config.autoRotateSeconds || 5)) * 1000;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [config.autoRotate, config.autoRotateSeconds, config.pauseOnHover, isHovered, slides.length]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (config.enableSwipe !== false) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (config.enableSwipe === false || touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
    setTouchStartX(null);
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleCardClick = () => {
    if (!currentSlide) return;
    if (currentSlide.contentType === 'story') {
      const targetStory = stories.find(s => s.id === currentSlide.targetId) || stories[0];
      if (targetStory && onSelectStory) {
        onSelectStory(targetStory);
      } else {
        onSelectTab('stories');
      }
    } else if (currentSlide.contentType === 'novel') {
      const targetNovel = novels.find(n => n.id === currentSlide.targetId) || novels[0];
      if (targetNovel && onSelectNovel) {
        onSelectNovel(targetNovel);
      } else {
        onSelectTab('novels');
      }
    } else if (currentSlide.contentType === 'joke') {
      onSelectTab('jokes');
    } else if (currentSlide.contentType === 'knowledge') {
      onSelectTab('knowledge');
    } else if (currentSlide.contentType === 'balavinodhini') {
      onSelectTab('balavinodhini');
    } else {
      onSelectTab(currentSlide.primaryButtonAction || config.primaryButtonAction || 'stories');
    }
  };

  // Resolved metrics (live vs custom)
  const resolvedMetrics = React.useMemo(() => {
    if (config.metricsSource === 'custom') {
      return config.customMetrics || config.stats || {
        storiesCount: '25K+',
        storiesLabel: 'తెలుగు కథలు',
        writersCount: '5K+',
        writersLabel: 'రచయితలు',
        readersCount: '1M+',
        readersLabel: 'పాఠకులు',
      };
    }
    return landingPageService.calculateLiveMetrics(
      stories,
      novels.length,
      5000,
      1000000
    );
  }, [config.metricsSource, config.customMetrics, config.stats, stories, novels.length]);

  // Render title with highlight word support
  const renderHeading = () => {
    const heading = currentSlide?.headline || config.mainHeading || 'ఈ రోజు ఒక కొత్త కథతో మొదలు పెట్టండి.';
    const highlight = currentSlide?.highlightWord || config.highlightWord || 'కథతో';

    if (!highlight || !heading.includes(highlight)) {
      return (
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif-telugu leading-tight text-white transition-all duration-300">
          {heading}
        </h1>
      );
    }

    const parts = heading.split(highlight);
    return (
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif-telugu leading-tight text-white transition-all duration-300">
        {parts[0]}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D87591] via-[#D99A3D] to-[#F7F3EE]">
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </h1>
    );
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#15131A] via-[#211B28] to-[#15131A] text-[#FAF7F2] p-6 sm:p-10 lg:p-14 border border-[#2E2D36] shadow-2xl">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#7A284B]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D99A3D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A284B]/80 text-[#FAF7F2] border border-[#D87591]/30 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D99A3D]" />
              <span>{currentSlide?.badge || config.badgeText || 'తెలుగు డిజిటల్ సాహిత్య వేదిక'}</span>
            </div>

            {isAdmin && onOpenAdminHeroEditor && (
              <button
                type="button"
                onClick={onOpenAdminHeroEditor}
                className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-400/40 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 font-serif-telugu shadow-sm"
                title="హెరో బ్యానర్ సవరించండి"
              >
                <span>⚙️ బ్యానర్ సవరణ (Edit Banner)</span>
              </button>
            )}
          </div>

          {renderHeading()}

          <p className="text-base sm:text-lg font-serif-telugu text-[#AAA4AC] max-w-xl leading-relaxed transition-all duration-300">
            {currentSlide?.subtitle || currentSlide?.description || config.subtitle || 'తెలుగు కథలు, నవలలు, జోక్స్ — మీకు నచ్చిన ప్రపంచంలోకి అడుగు పెట్టండి. వేలాది మంది పాఠకులతో మరియు ప్రతిభావంతులైన రచయితలతో మీ సాహితీ ప్రయాణం.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onSelectTab(currentSlide?.primaryButtonAction || config.primaryButtonAction || 'stories')}
              className="px-7 py-3.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 group hover:scale-105 active:scale-95 font-serif-telugu"
            >
              <span>{currentSlide?.primaryButtonText || config.primaryButtonText || 'కథలు చదవండి'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenWrite}
              className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 font-serif-telugu"
            >
              <Feather className="w-4 h-4 text-[#D99A3D]" />
              <span>{currentSlide?.secondaryButtonText || config.secondaryButtonText || 'మీ కథ రాయండి'}</span>
            </button>
          </div>

          {/* Metrics / Stats */}
          {config.showMetrics !== false && (
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">
                  {resolvedMetrics.storiesCount}
                </p>
                <p className="text-xs text-[#AAA4AC] font-serif-telugu">
                  {resolvedMetrics.storiesLabel}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">
                  {resolvedMetrics.writersCount}
                </p>
                <p className="text-xs text-[#AAA4AC] font-serif-telugu">
                  {resolvedMetrics.writersLabel}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-serif-telugu text-white">
                  {resolvedMetrics.readersCount}
                </p>
                <p className="text-xs text-[#AAA4AC] font-serif-telugu">
                  {resolvedMetrics.readersLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Featured Card Carousel with Next & Previous */}
        <div className="lg:col-span-5 relative flex flex-col items-center">
          {currentSlide && (
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-sm group/card select-none"
            >
              {/* Card Container */}
              <div 
                onClick={handleCardClick}
                className="relative mx-auto w-full sm:w-80 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/15 hover:ring-[#D87591]/50 cursor-pointer transform hover:scale-[1.02] transition-all duration-500 bg-[#1A1822]"
              >
                {/* Cover Image */}
                <img
                  src={currentSlide.coverImage}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />

                {/* Ambient gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

                {/* Top Badge: Content Type */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#7A284B]/90 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-md border border-[#D87591]/40 flex items-center gap-1.5 font-serif-telugu">
                    {currentSlide.contentType === 'story' && <BookOpen className="w-3 h-3 text-[#D99A3D]" />}
                    {currentSlide.contentType === 'novel' && <Layers className="w-3 h-3 text-[#D99A3D]" />}
                    {currentSlide.contentType === 'joke' && <Smile className="w-3 h-3 text-[#D99A3D]" />}
                    {currentSlide.contentType === 'knowledge' && <Star className="w-3 h-3 text-[#D99A3D]" />}
                    {currentSlide.contentType === 'balavinodhini' && <Sparkles className="w-3 h-3 text-[#D99A3D]" />}
                    <span>{currentSlide.badge}</span>
                  </span>

                  {/* Slide Counter */}
                  {slides.length > 1 && (
                    <span className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-full border border-white/20">
                      {activeSlideIndex + 1} / {slides.length}
                    </span>
                  )}
                </div>

                {/* Bottom Content Metadata */}
                <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-telugu leading-snug line-clamp-2 group-hover/card:text-[#F3CE7A] transition-colors drop-shadow-md">
                    {currentSlide.teluguTitle || currentSlide.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-white/80 font-serif-telugu pt-1 border-t border-white/15">
                    <span className="truncate">
                      రచన: <strong className="text-white">{currentSlide.authorName}</strong>
                    </span>
                    <span className="text-[#D99A3D] font-bold shrink-0 flex items-center gap-1">
                      <span>{currentSlide.primaryButtonText || 'చదవండి'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons (< >) */}
                {config.showNavigationButtons !== false && slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#7A284B] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                      title="మునుపటిది (Previous)"
                      aria-label="మునుపటిది"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#7A284B] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                      title="తరువాతిది (Next)"
                      aria-label="తరువాతిది"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {config.showIndicators !== false && slides.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeSlideIndex 
                          ? 'w-6 bg-[#D87591]' 
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      title={`స్లైడ్ ${idx + 1}`}
                      aria-label={`స్లైడ్ ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
