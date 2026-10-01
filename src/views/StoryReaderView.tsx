import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen, 
  Quote, 
  Maximize2, 
  Minimize2, 
  ImageIcon,
  Plus,
  Loader2,
  Sparkles,
  UploadCloud,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Story, ReadingTheme, User, StoryImagePage } from '../types';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { ReadingProgress } from '../components/reader/ReadingProgress';
import { StarRating } from '../components/common/StarRating';
import { storyService } from '../services/storyService';
import { storageService } from '../services/storageService';
import { storySubcollectionService } from '../services/storySubcollectionService';

interface StoryReaderViewProps {
  story: Story;
  currentUser: User | null;
  onBack: () => void;
  onBookmarkToggle: (storyId: string) => void;
  onLikeToggle: (storyId: string) => void;
  onUpdateProgress: (storyId: string, percent: number) => void;
  onRequireAuth: (prompt?: string, mode?: 'login' | 'register') => void;
  onEditStory?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => Promise<void> | void;
}

export const StoryReaderView: React.FC<StoryReaderViewProps> = ({
  story,
  currentUser,
  onBack,
  onBookmarkToggle,
  onLikeToggle,
  onUpdateProgress,
  onRequireAuth,
  onEditStory,
  onDeleteStory,
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [theme, setTheme] = useState<ReadingTheme>('light');
  const [progressPercent, setProgressPercent] = useState<number>(story.progressPercent || 0);
  const [resolvedContent, setResolvedContent] = useState<string[]>(
    Array.isArray(story.content) && story.content.length > 0 ? story.content : []
  );
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  // Dynamic Image Pages reader state
  const [resolvedImagePages, setResolvedImagePages] = useState<StoryImagePage[]>(
    story.imagePages && story.imagePages.length > 0 ? story.imagePages : []
  );
  const [activeImagePageIndex, setActiveImagePageIndex] = useState<number>(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState<boolean>(false);
  const [showDocViewer, setShowDocViewer] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploadingNextPage, setIsUploadingNextPage] = useState<boolean>(false);
  const [uploadPageStatus, setUploadPageStatus] = useState<string | null>(null);
  const nextPageFileInputRef = useRef<HTMLInputElement>(null);
  const lastReportedProgressRef = useRef<number>(-1);

  const docUrl = story.sourceDocument?.storageUrl || (story as any).documentURL || (story as any).documentUrl;

  // Determine if viewer can manage/add images (Admin or Story Author/Writer)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'thekathavahini@gmail.com';
  const isOwnerOrAuthor = Boolean(currentUser && (
    currentUser.id === story.authorId || 
    currentUser.id === story.writerId || 
    currentUser.id === story.ownerId || 
    currentUser.id === story.author?.id
  ));
  const canManageStoryImages = Boolean(isAdmin || isOwnerOrAuthor);

  // Sync image pages from story or subcollection
  useEffect(() => {
    if (story.imagePages && story.imagePages.length > 0) {
      setResolvedImagePages(story.imagePages);
    } else {
      storySubcollectionService.loadStoryPages(story.id).then(pages => {
        if (pages && pages.length > 0) {
          setResolvedImagePages(pages);
        }
      }).catch(() => {});
    }
  }, [story.id, story.imagePages?.length]);

  // Handle uploading next image pages right from the reader
  const handleUploadNextPageImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingNextPage(true);
    setUploadPageStatus('చిత్రాన్ని అప్‌లోడ్ చేస్తోంది...');

    try {
      const fileList: File[] = Array.from(files);
      const updatedPages = [...resolvedImagePages];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadPageStatus(`పేజీ చిత్రం అప్‌లోడ్ అవుతోంది (${i + 1}/${fileList.length})...`);
        const pageNumber = updatedPages.length + 1;
        const pageId = `page_${pageNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        const uploadRes = await storageService.uploadStoryPageImage(story.id, pageId, file);

        const newPage: StoryImagePage = {
          id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          pageNumber,
          imageUrl: uploadRes.downloadUrl,
          imagePath: uploadRes.storagePath,
          imageMetadata: uploadRes.metadata,
          altText: `పేజీ ${pageNumber}`,
          caption: ''
        };

        updatedPages.push(newPage);
      }

      // Persist to subcollection
      await storySubcollectionService.saveStoryPages(story.id, updatedPages, currentUser?.id);

      // Update local state and jump to newly added page
      setResolvedImagePages(updatedPages);
      setActiveImagePageIndex(updatedPages.length - 1);
      setUploadPageStatus(null);
    } catch (err: any) {
      console.error('Failed to upload next story page:', err);
      setUploadPageStatus(err.message || 'అప్‌లోడ్ విఫలమైంది');
      setTimeout(() => setUploadPageStatus(null), 4000);
    } finally {
      setIsUploadingNextPage(false);
      if (nextPageFileInputRef.current) {
        nextPageFileInputRef.current.value = '';
      }
    }
  };

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

  // Record real view on mount and fetch full reassembled story content
  useEffect(() => {
    let isMounted = true;
    if (story?.id) {
      storyService.recordStoryView(story.id);

      // Seamlessly fetch full reassembled content chunks
      if (!resolvedContent || resolvedContent.length === 0 || (resolvedContent.length === 1 && !resolvedContent[0])) {
        setIsLoadingContent(true);
      }
      storyService.getStoryById(story.id).then((fullStory) => {
        if (isMounted && fullStory?.content && fullStory.content.length > 0) {
          setResolvedContent(fullStory.content);
        }
        if (isMounted) setIsLoadingContent(false);
      }).catch((e) => {
        console.warn('Error resolving story content chunks:', e);
        if (isMounted) setIsLoadingContent(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [story?.id]);

  // Track scroll progress for text/mixed stories, or page progress for image stories
  useEffect(() => {
    if (hasImagePages) {
      const totalPages = story.imagePages?.length || resolvedImagePages.length || 1;
      const pageProg = Math.min(100, Math.max(0, Math.round(((activeImagePageIndex + 1) / totalPages) * 100)));
      setProgressPercent(pageProg);
      if (lastReportedProgressRef.current !== pageProg) {
        lastReportedProgressRef.current = pageProg;
        onUpdateProgress(story.id, pageProg);
      }
      return;
    }

    let timeoutId: any = null;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        timeoutId = null;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const currentProgress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
          setProgressPercent(currentProgress);
          if (Math.abs((lastReportedProgressRef.current || 0) - currentProgress) >= 10 || currentProgress === 100) {
            lastReportedProgressRef.current = currentProgress;
            onUpdateProgress(story.id, currentProgress);
          }
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [story.id, hasImagePages, activeImagePageIndex, story.imagePages?.length, resolvedImagePages.length]);

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

  const handleConfirmDelete = async () => {
    if (!onDeleteStory) return;
    setIsDeleting(true);
    try {
      await onDeleteStory(story.id);
      setShowDeleteModal(false);
      onBack();
    } catch (err) {
      console.error('Error deleting story:', err);
      setIsDeleting(false);
    }
  };

  // Dynamic theme wrapper styles
  const getThemeBgClass = () => {
    if (theme === 'dark') return 'bg-[#101014] text-[#F7F3EE]';
    if (theme === 'sepia') return 'bg-[#F5EFEB] text-[#2B231D]';
    return 'bg-[#FAF7F2] text-[#17151A]';
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className={`min-h-screen transition-colors duration-300 -mx-4 -mt-4 px-4 pt-4 pb-20 select-text ${getThemeBgClass()}`}
    >
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
        {/* Owner / Admin Management Ribbon */}
        {canManageStoryImages && (
          <div className="mb-8 p-4 rounded-3xl bg-gradient-to-r from-[#7A284B]/10 via-[#FAF7F2] to-[#7A284B]/10 dark:from-[#7A284B]/20 dark:via-[#18181F] dark:to-[#7A284B]/20 border border-[#7A284B]/30 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#7A284B] text-white shrink-0 shadow-sm">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                  <span>{isAdmin ? 'అడ్మిన్ నియంత్రణలు (Admin Controls)' : 'రచయిత నిర్వహణ (Author Studio)'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7A284B] text-white">
                    కథ యాజమాన్యం
                  </span>
                </div>
                <div className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                  మీరు ఈ కథ శీర్షిక, ముఖచిత్రం, పేరాలు, పేజీ చిత్రాలు లేదా పత్రాలను ఇక్కడి నుంచే సవరించవచ్చు లేదా తొలగించవచ్చు.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onEditStory && (
                <button
                  type="button"
                  onClick={() => onEditStory(story)}
                  className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>కథను సవరించండి</span>
                </button>
              )}

              {onDeleteStory && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="కథను తొలగించండి"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>తొలగించండి</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Title & Category Banner */}
        <div className="text-center mb-10 pb-8 border-b border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#7A284B] text-white shadow-sm">
              {story.category}
            </span>
            {hasImagePages && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/10 dark:bg-white/10">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>చిత్ర కథ ({resolvedImagePages.length || story.imagePages?.length} పేజీలు)</span>
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
            <div className="relative group mt-6 rounded-2xl overflow-hidden shadow-md max-h-96 w-full">
              <img src={story.coverImage} alt={story.teluguTitle} className="w-full h-full object-cover" />
              {canManageStoryImages && onEditStory && (
                <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEditStory(story)}
                    className="px-3.5 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-md text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ముఖచిత్రాన్ని మార్చండి (Change Thumbnail)</span>
                  </button>
                </div>
              )}
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
            {isLoadingContent && resolvedContent.length === 0 ? (
              <div className="py-12 text-center space-y-3 opacity-60">
                <div className="w-8 h-8 border-3 border-[#7A284B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-serif-telugu">కథ లోడ్ అవుతోంది...</p>
              </div>
            ) : (
              resolvedContent.map((paragraph, idx) => (
                <p key={idx} className="mb-6 leading-relaxed text-justify">
                  {paragraph}
                </p>
              ))
            )}

            {/* Attached original document viewer trigger (No download button) */}
            {docUrl && (
              <div className="my-8 p-5 rounded-2xl bg-[#7A284B]/5 dark:bg-[#7A284B]/10 border border-[#7A284B]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#7A284B] text-white shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE]">
                      జతచేయబడిన మూల కథా పత్రం: <strong>{story.sourceDocument?.name || (story as any).documentFileName || 'కథా పత్రం'}</strong>
                    </div>
                    <div className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                      ఈ కథకు సంబంధించిన అసలు పత్రాన్ని నేరుగా ఇక్కడే చదవవచ్చు
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocViewer(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#7A284B] text-white font-bold hover:bg-[#631F3C] transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>పత్రాన్ని చదవండి</span>
                </button>
              </div>
            )}
          </article>
        )}

        {/* Content Type 3: Image-Based Story Pages / Scans / Comics */}
        {(hasImagePages || resolvedImagePages.length > 0) && (
          <div className="space-y-6">
            {/* Hidden file input for adding next image pages */}
            <input
              ref={nextPageFileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleUploadNextPageImages}
              className="hidden"
            />

            {/* Upload status banner */}
            {uploadPageStatus && (
              <div className="p-3.5 rounded-2xl bg-[#7A284B]/10 border border-[#7A284B]/20 text-xs text-[#7A284B] dark:text-[#D87591] flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  {isUploadingNextPage ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
                  <span className="font-bold">{uploadPageStatus}</span>
                </div>
              </div>
            )}

            <div className="relative bg-black/5 dark:bg-white/5 rounded-3xl p-4 sm:p-6 border border-black/10 dark:border-white/10 flex flex-col items-center">
              {/* Header inside viewer */}
              <div className="w-full flex items-center justify-between text-xs opacity-80 mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    పేజీ {activeImagePageIndex + 1} / {resolvedImagePages.length}
                  </span>
                  {canManageStoryImages && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7A284B] text-white">
                      {isAdmin ? 'అడ్మిన్ నిర్వహణ' : 'రచయిత నిర్వహణ'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {canManageStoryImages && (
                    <button
                      type="button"
                      onClick={() => nextPageFileInputRef.current?.click()}
                      disabled={isUploadingNextPage}
                      className="px-3 py-1 rounded-lg bg-[#7A284B]/10 hover:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="తదుపరి పేజీ చిత్రాన్ని అప్‌లోడ్ చేయండి"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ పేజీని జోడించండి</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsImageFullscreen(!isImageFullscreen)}
                    className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    title="పూర్తి స్క్రీన్"
                  >
                    {isImageFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Image */}
              <div className="flex justify-center max-w-full">
                <img
                  src={resolvedImagePages[activeImagePageIndex]?.imageUrl}
                  alt={`పేజీ ${activeImagePageIndex + 1}`}
                  className={`w-auto object-contain rounded-2xl shadow-md transition-all ${
                    isImageFullscreen ? 'max-h-[85vh]' : 'max-h-[70vh]'
                  }`}
                />
              </div>

              {/* Caption if provided */}
              {resolvedImagePages[activeImagePageIndex]?.caption && (
                <p className="mt-4 text-center text-sm font-serif-telugu opacity-90 max-w-lg">
                  {resolvedImagePages[activeImagePageIndex]?.caption}
                </p>
              )}
            </div>

            {/* Navigation Strip with Plus Icon */}
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
                {resolvedImagePages.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActiveImagePageIndex(pIdx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      pIdx === activeImagePageIndex
                        ? 'bg-[#7A284B] text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-inherit opacity-70'
                    }`}
                  >
                    {pIdx + 1}
                  </button>
                ))}

                {/* Direct Plus Icon in pagination for Admin / Story Writer */}
                {canManageStoryImages && (
                  <button
                    type="button"
                    onClick={() => nextPageFileInputRef.current?.click()}
                    disabled={isUploadingNextPage}
                    className="w-8 h-8 rounded-xl border-2 border-dashed border-[#7A284B] dark:border-[#D87591] text-[#7A284B] dark:text-[#D87591] hover:bg-[#7A284B]/15 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
                    title="తదుపరి పేజీ చిత్రాన్ని అప్‌లోడ్ చేయండి (+ Add Next Page Image)"
                  >
                    {isUploadingNextPage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Dynamic Next Button: If next page exists, navigate; If on last page & authorized, offer + Add Next Image */}
              {activeImagePageIndex < resolvedImagePages.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveImagePageIndex(prev => Math.min(resolvedImagePages.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>తదుపరి పేజీ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : canManageStoryImages ? (
                <button
                  type="button"
                  onClick={() => nextPageFileInputRef.current?.click()}
                  disabled={isUploadingNextPage}
                  className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  title="తదుపరి పేజీ చిత్రాన్ని అప్‌లోడ్ చేయండి"
                >
                  {isUploadingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>అప్‌లోడ్ అవుతోంది...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>+ తదుపరి చిత్రాన్ని జోడించండి</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="px-5 py-2.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold opacity-30 inline-flex items-center gap-2 cursor-not-allowed"
                >
                  <span>తదుపరి పేజీ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
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

          {/* Interactive Star Rating Section */}
          <div className="py-2 flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-[#7A284B] dark:text-[#D87591]">
              ఈ కథకు మీ రేటింగ్ ఇవ్వండి:
            </p>
            <StarRating
              storyId={story.id}
              initialRating={story.rating}
              currentUserId={currentUser?.id}
              currentUserName={currentUser?.teluguName || currentUser?.name}
              size="md"
              showSummary={true}
            />
          </div>

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

      {/* Embedded In-App Document Viewer Modal */}
      {showDocViewer && docUrl && (
        <div 
          onClick={() => setShowDocViewer(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl h-[88vh] bg-white dark:bg-[#1C1C22] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-black/10 dark:border-white/10"
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#FAF7F2] dark:bg-[#18181D]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-[#7A284B] text-white shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate text-[#17151A] dark:text-[#F7F3EE]">
                    {story.sourceDocument?.name || (story as any).documentFileName || 'కథా పత్రం'}
                  </h3>
                  <p className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] truncate">
                    కథావాహిని ఇన్-యాప్ డాక్యుమెంట్ రీడర్
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocViewer(false)}
                className="px-4 py-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold transition-colors cursor-pointer"
              >
                మూసివేయి (Close)
              </button>
            </div>

            {/* Embedded Viewer Surface */}
            <div className="flex-1 w-full h-full bg-[#525659] relative">
              <iframe
                src={`${docUrl}#toolbar=0&navpanes=0`}
                title={story.sourceDocument?.name || 'Document Reader'}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Author and Admin */}
      {showDeleteModal && (
        <div 
          onClick={() => !isDeleting && setShowDeleteModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#1E1E24] rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-500/20 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-red-600/10 text-red-600 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  కథను తొలగించాలా? (Delete Story)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu leading-relaxed">
                  "<strong>{story.teluguTitle}</strong>" కథను మరియు దానితో ముడిపడిన అన్ని పేజీలు, చిత్రాలు మరియు పత్రాలను శాశ్వతంగా తొలగించాలనుకుంటున్నారా? ఈ చర్యను రద్దు చేయలేరు.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                రద్దు చేయండి (Cancel)
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>తొలగిస్తోంది...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ఖచ్చితంగా తొలగించండి</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

