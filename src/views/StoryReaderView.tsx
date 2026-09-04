import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Bookmark, 
  Share2, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  LogIn, 
  UserPlus, 
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Quote,
  Maximize2,
  Minimize2,
  ImageIcon
} from 'lucide-react';
import { Story, ReadingTheme, User } from '../types';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { ReadingProgress } from '../components/reader/ReadingProgress';

interface StoryReaderViewProps {
  story: Story;
  currentUser: User | null;
  onBack: () => void;
  onBookmarkToggle: (storyId: string) => void;
  onLikeToggle: (storyId: string) => void;
  onUpdateProgress: (storyId: string, percent: number) => void;
  onRequireAuth: (prompt?: string, mode?: 'login' | 'register') => void;
}

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({
  story,
  currentUser,
  onBack,
  onBookmarkToggle,
  onLikeToggle,
  onUpdateProgress,
  onRequireAuth,
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [theme, setTheme] = useState<ReadingTheme>('light');
  const [progressPercent, setProgressPercent] = useState<number>(story.progressPercent || 0);

  // Image Pages reader state
  const [activeImagePageIndex, setActiveImagePageIndex] = useState<number>(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState<boolean>(false);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; name: string; avatar?: string; text: string; time: string; userId?: string }>>([
    {
      id: 'c1',
      name: 'లక్ష్మీ ప్రసన్న',
      text: 'చాలా అద్భుతమైన కథ! ప్రతి పేరా చదువుతుంటే కళ్లముందు దృశ్యం మెదులుతోంది.',
      time: 'నిన్న',
    },
    {
      id: 'c2',
      name: 'సురేష్ వర్మ',
      text: 'ముగింపు ఎంతో ఆర్ద్రంగా ఉంది. రచయితకు నా హృదయపూర్వక అభినందనలు.',
      time: '3 రోజుల క్రితం',
    }
  ]);

  const hasImagePages = story.contentType === 'image_pages' && story.imagePages && story.imagePages.length > 0;
  const hasMixedBlocks = story.contentType === 'mixed' && story.contentBlocks && story.contentBlocks.length > 0;

  // Track scroll progress for text/mixed stories, or page progress for image stories
  useEffect(() => {
    if (hasImagePages) {
      const pageProg = Math.round(((activeImagePageIndex + 1) / (story.imagePages?.length || 1)) * 100);
      setProgressPercent(pageProg);
      onUpdateProgress(story.id, pageProg);
      return;
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setProgressPercent(currentProgress);
        onUpdateProgress(story.id, currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story.id, hasImagePages, activeImagePageIndex, story.imagePages?.length]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('కామెంట్ చేయడానికి ముందుగా లాగిన్ చేయండి.');
      return;
    }

    if (!commentText.trim()) return;

    setComments([
      {
        id: `c-${Date.now()}`,
        name: currentUser.teluguName || currentUser.name || 'తెలుగు పాఠకుడు',
        avatar: currentUser.avatar,
        userId: currentUser.id,
        text: commentText.trim(),
        time: 'ఇప్పుడే',
      },
      ...comments,
    ]);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.teluguTitle,
        text: story.teluguExcerpt,
      }).catch(() => {});
    }
  };

  // Dynamic theme wrapper styles
  const getThemeBgClass = () => {
    if (theme === 'dark') return 'bg-[#101014] text-[#F7F3EE]';
    if (theme === 'sepia') return 'bg-[#F5EFEB] text-[#2B231D]';
    return 'bg-[#FAF7F2] text-[#17151A]';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 -mx-4 -mt-4 px-4 pt-4 pb-20 ${getThemeBgClass()}`}>
      <ReadingProgress progressPercent={progressPercent} />

      {/* Reader Header Bar */}
      <header className="max-w-3xl mx-auto py-4 flex items-center justify-between border-b border-black/10 dark:border-white/10 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>వెనక్కి</span>
        </button>

        <div className="text-center min-w-0 px-4">
          <h2 className="text-sm font-bold font-serif-telugu truncate">
            {story.teluguTitle}
          </h2>
          <p className="text-[10px] opacity-70 font-sans truncate">
            {story.author?.teluguName || story.authorName}
          </p>
        </div>

        <div className="text-xs font-bold opacity-70">
          {progressPercent}%
        </div>
      </header>

      {/* Floating Reader Toolbar (Text mode) */}
      {!hasImagePages && (
        <ReaderToolbar
          fontSize={fontSize}
          setFontSize={setFontSize}
          theme={theme}
          setTheme={setTheme}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          isBookmarked={!!story.isBookmarked}
          onToggleBookmark={() => onBookmarkToggle(story.id)}
          onShare={handleShare}
        />
      )}

      {/* Story Column Area */}
      <main className="max-w-3xl mx-auto my-8 px-2 sm:px-6">
        {/* Title & Category Banner */}
        <div className="text-center mb-10 pb-8 border-b border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#7A284B] text-white shadow-sm">
              {story.category}
            </span>
            {hasImagePages && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/10 dark:bg-white/10">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>చిత్ర కథ ({story.imagePages?.length} పేజీలు)</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif-telugu leading-tight">
            {story.teluguTitle}
          </h1>

          {story.subtitle && (
            <p className="text-base sm:text-lg opacity-80 italic font-serif-telugu max-w-xl mx-auto">
              {story.subtitle}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 text-xs opacity-80 pt-2">
            {story.author?.avatar && (
              <img src={story.author.avatar} alt={story.author.teluguName} className="w-7 h-7 rounded-full object-cover" />
            )}
            <span className="font-bold">{story.author?.teluguName || story.authorName}</span>
            <span>•</span>
            <span>{story.readingTimeMinutes || 2} నిమిషాల చదువు</span>
          </div>

          {/* Cover image if available and not purely image pages */}
          {story.coverImage && !hasImagePages && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-md max-h-96 w-full">
              <img src={story.coverImage} alt={story.teluguTitle} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content Type 1 & 2: Text / Document Import / Legacy */}
        {!hasImagePages && !hasMixedBlocks && (
          <article
            className={`reader-content transition-all ${
              fontFamily === 'serif' ? 'font-serif-telugu' : 'font-sans-telugu'
            }`}
            style={{ '--reader-font-size': `${fontSize}px` } as React.CSSProperties}
          >
            {story.content && story.content.map((paragraph, idx) => (
              <p key={idx} className="mb-6 leading-relaxed text-justify">
                {paragraph}
              </p>
            ))}

            {/* Attached original document link if available */}
            {story.sourceDocument && story.sourceDocument.storageUrl && (
              <div className="my-8 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                  <span>జతచేయబడిన మూల పత్రం: <strong>{story.sourceDocument.name}</strong></span>
                </div>
                <a
                  href={story.sourceDocument.storageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#7A284B] text-white font-bold hover:bg-[#631F3C] transition-colors"
                >
                  పత్రాన్ని డౌన్‌లోడ్ చేయండి
                </a>
              </div>
            )}
          </article>
        )}

        {/* Content Type 3: Image-Based Story Pages / Scans / Comics */}
        {hasImagePages && story.imagePages && (
          <div className="space-y-6">
            <div className="relative bg-black/5 dark:bg-white/5 rounded-3xl p-4 sm:p-6 border border-black/10 dark:border-white/10 flex flex-col items-center">
              {/* Header inside viewer */}
              <div className="w-full flex items-center justify-between text-xs opacity-80 mb-3 px-2">
                <span className="font-bold">
                  పేజీ {activeImagePageIndex + 1} / {story.imagePages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsImageFullscreen(!isImageFullscreen)}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                  title="పూర్తి స్క్రీన్"
                >
                  {isImageFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Main Image */}
              <div className="flex justify-center max-w-full">
                <img
                  src={story.imagePages[activeImagePageIndex]?.imageUrl}
                  alt={`పేజీ ${activeImagePageIndex + 1}`}
                  className={`w-auto object-contain rounded-2xl shadow-md transition-all ${
                    isImageFullscreen ? 'max-h-[85vh]' : 'max-h-[70vh]'
                  }`}
                />
              </div>

              {/* Caption if provided */}
              {story.imagePages[activeImagePageIndex]?.caption && (
                <p className="mt-4 text-center text-sm font-serif-telugu opacity-90 max-w-lg">
                  {story.imagePages[activeImagePageIndex]?.caption}
                </p>
              )}
            </div>

            {/* Navigation Strip */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveImagePageIndex(prev => Math.max(0, prev - 1))}
                disabled={activeImagePageIndex === 0}
                className="px-5 py-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold disabled:opacity-30 inline-flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>మునుపటి పేజీ</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm py-1">
                {story.imagePages.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActiveImagePageIndex(pIdx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pIdx === activeImagePageIndex
                        ? 'bg-[#7A284B] text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-inherit opacity-70'
                    }`}
                  >
                    {pIdx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveImagePageIndex(prev => Math.min((story.imagePages?.length || 1) - 1, prev + 1))}
                disabled={activeImagePageIndex === (story.imagePages?.length || 1) - 1}
                className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold disabled:opacity-30 inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>తదుపరి పేజీ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Type 4: Mixed Content Blocks */}
        {hasMixedBlocks && story.contentBlocks && (
          <article
            className={`reader-content space-y-6 transition-all ${
              fontFamily === 'serif' ? 'font-serif-telugu' : 'font-sans-telugu'
            }`}
            style={{ '--reader-font-size': `${fontSize}px` } as React.CSSProperties}
          >
            {story.contentBlocks.map((block) => (
              <div key={block.id}>
                {block.type === 'paragraph' && (
                  <p className="mb-6 leading-relaxed text-justify">{block.content}</p>
                )}

                {block.type === 'heading' && (
                  <h2 className={`font-bold text-[#7A284B] dark:text-[#D87591] my-6 ${block.level === 3 ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                    {block.content}
                  </h2>
                )}

                {block.type === 'quote' && (
                  <blockquote className="p-6 my-6 rounded-2xl bg-[#7A284B]/5 border-l-4 border-[#7A284B] italic">
                    <p className="text-lg sm:text-xl font-serif-telugu">"{block.content}"</p>
                    {block.caption && (
                      <footer className="text-xs opacity-75 mt-3 not-italic">
                        — {block.caption}
                      </footer>
                    )}
                  </blockquote>
                )}

                {block.type === 'image' && block.imageUrl && (
                  <figure className="my-8 space-y-2">
                    <img
                      src={block.imageUrl}
                      alt={block.caption || 'కథ చిత్రం'}
                      className="rounded-2xl max-h-[600px] w-auto mx-auto object-contain shadow-md"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-xs opacity-75 italic pt-1">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {block.type === 'list' && (
                  <ul className={`my-6 pl-6 space-y-2 ${block.listStyle === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                    {(block.listItems || []).map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {block.type === 'divider' && (
                  <div className="py-8 flex items-center justify-center">
                    <div className="w-24 h-[1px] bg-[#7A284B]/30" />
                    <span className="px-3 text-[#7A284B] text-xs">✦ ✦ ✦</span>
                    <div className="w-24 h-[1px] bg-[#7A284B]/30" />
                  </div>
                )}
              </div>
            ))}
          </article>
        )}

        {/* End of Story Badge */}
        <div className="text-center py-12 my-8 border-t border-b border-black/10 dark:border-white/10 space-y-4">
          <CheckCircle className="w-10 h-10 mx-auto text-[#3E8065]" />
          <h3 className="text-xl font-bold font-serif-telugu">
            కథ ముగిసింది.
          </h3>
          <p className="text-xs opacity-70">
            ఈ కథ మీకు నచ్చినట్లయితే లైక్ చేయండి లేదా రచయితకు అభిప్రాయం పంపండి.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onLikeToggle(story.id)}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all cursor-pointer ${
                story.isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-black/10 dark:bg-white/10 hover:bg-black/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${story.isLiked ? 'fill-white' : ''}`} />
              <span>{story.isLiked ? 'లైక్ చేసారు' : 'లైక్ చేయండి'} ({story.likeCount})</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-sm font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>షేర్</span>
            </button>
          </div>
        </div>

        {/* Reader Comments Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-lg font-bold font-serif-telugu">
            <MessageSquare className="w-5 h-5 text-[#7A284B]" />
            <h3>పాఠకుల అభిప్రాయాలు ({comments.length})</h3>
          </div>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="flex gap-2 items-center">
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.id)}`}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-[#7A284B]"
              />
              <input
                type="text"
                placeholder={`${currentUser.teluguName || currentUser.displayName || currentUser.name} గా మీ అభిప్రాయాన్ని రాయండి...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#7A284B] text-white hover:bg-[#631F3C] transition-colors cursor-pointer"
                title="కామెంట్ పంపండి"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-center text-xs space-y-2">
              <p className="opacity-80">ఈ కథపై మీ అమూల్యమైన అభిప్రాయాన్ని తెలపడానికి దయచేసి లాగిన్ చేయండి.</p>
              <button
                type="button"
                onClick={() => onRequireAuth('కామెంట్ చేయడానికి లాగిన్ అవ్వండి.')}
                className="px-4 py-1.5 rounded-full bg-[#7A284B] text-white font-bold"
              >
                లాగిన్ చేయండి
              </button>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>{c.name}</span>
                  <span className="opacity-60 text-[10px] font-normal">{c.time}</span>
                </div>
                <p className="opacity-90 font-serif-telugu leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

