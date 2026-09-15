import React, { useState, useEffect } from 'react';
import { 
  X, 
  Feather, 
  BookOpen, 
  Laugh, 
  Image as ImageIcon, 
  Send, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  UserCheck,
  FileText,
  Layers,
  Eye,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Save,
  Loader2
} from 'lucide-react';
import { 
  StoryCategory, 
  User, 
  ImageMetadata, 
  StoryContentType, 
  ContentBlock, 
  StoryImagePage, 
  SourceDocumentInfo,
  CategoryItem 
} from '../../types';
import { writerService } from '../../services/writerService';
import { jokeService } from '../../services/jokeService';
import { novelService } from '../../services/novelService';
import { categoryService } from '../../services/categoryService';
import { CoverImageUploader } from '../common/CoverImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { DocumentImportTab } from './DocumentImportTab';
import { ImagePagesTab } from './ImagePagesTab';
import { MixedContentTab } from './MixedContentTab';
import { StoryContentPreview } from './StoryContentPreview';

interface WriteModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onPublishSuccess: () => void;
  onApplyWriter: () => void;
  onRequireAuth: (prompt?: string) => void;
}

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onPublishSuccess,
  onApplyWriter,
  onRequireAuth,
}) => {
  // Main Format Type: story vs novel vs joke
  const [mainType, setMainType] = useState<'story' | 'novel' | 'joke'>('story');

  // Story Creation Mode (4 Unified Methods)
  const [storyMode, setStoryMode] = useState<StoryContentType>('rich_text');

  // Preview Mode Switcher (Edit vs Live Preview)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Common Metadata State
  const [title, setTitle] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('జీవితం');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePath, setCoverImagePath] = useState<string | undefined>(undefined);
  const [coverImageMetadata, setCoverImageMetadata] = useState<ImageMetadata | undefined>(undefined);
  const [tags, setTags] = useState('తెలుగు,కథ');

  // Mode 1: Rich Text & Mode 2 Extracted Text
  const [textContent, setTextContent] = useState('');

  // Mode 2: Source Document Info
  const [sourceDocument, setSourceDocument] = useState<SourceDocumentInfo | undefined>(undefined);

  // Mode 3: Image Pages
  const [imagePages, setImagePages] = useState<StoryImagePage[]>([]);

  // Mode 4: Mixed Content Blocks
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: `block-${Date.now()}`,
      type: 'paragraph',
      content: ''
    }
  ]);

  // Joke State
  const [jokeText, setJokeText] = useState('');
  const [jokeCategory, setJokeCategory] = useState('హాస్యం');

  // Daily limit check
  const [canSubmitToday, setCanSubmitToday] = useState(true);
  const [limitReason, setLimitReason] = useState('');
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Status & Progress
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Unique session Story ID for storage uploads
  const [sessionStoryId] = useState(() => `story-draft-${Date.now()}`);

  // Dynamic Categories from real-time CategoryService
  const [dynamicCategories, setDynamicCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = categoryService.subscribeCategories((cats) => {
      const activeCats = cats.filter(c => c.status === 'active' && c.isActive !== false);
      setDynamicCategories(activeCats);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const isWriterOrAdmin = currentUser && (
    (currentUser.role === 'writer' && currentUser.status === 'active') || 
    currentUser.role === 'admin'
  );

  const isPendingWriter = currentUser && (
    currentUser.role === 'writer' && currentUser.status === 'pending'
  );

  const isAdmin = currentUser && currentUser.role === 'admin';

  // Load and check draft & daily limit
  useEffect(() => {
    async function checkDaily() {
      if (isOpen && currentUser && isWriterOrAdmin) {
        setCheckingLimit(true);
        const check = await writerService.checkCanSubmitToday(currentUser.id);
        setCanSubmitToday(check.canSubmit || isAdmin);
        if (!check.canSubmit && !isAdmin) {
          setLimitReason(check.reason || 'రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు (1 Story/Day).');
        }
        setCheckingLimit(false);
      }
    }
    checkDaily();
  }, [isOpen, currentUser, isWriterOrAdmin, isAdmin]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const draftKey = `kathavahini_draft_${currentUser.id}`;
    const draftPayload = {
      mainType,
      storyMode,
      title,
      teluguTitle,
      subtitle,
      category,
      coverImage,
      coverImagePath,
      tags,
      textContent,
      contentBlocks,
      imagePages,
      timestamp: Date.now()
    };

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(draftPayload));
      } catch {
        // LocalStorage quota safety
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isOpen, currentUser, mainType, storyMode, title, teluguTitle, subtitle, category, coverImage, coverImagePath, tags, textContent, contentBlocks, imagePages]);

  // Restore draft if exists on first open
  useEffect(() => {
    if (isOpen && currentUser && !hasRestoredDraft) {
      try {
        const draftKey = `kathavahini_draft_${currentUser.id}`;
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.textContent || parsed.teluguTitle || parsed.imagePages?.length > 0)) {
            // Restore draft data
            setTitle(parsed.title || '');
            setTeluguTitle(parsed.teluguTitle || '');
            setSubtitle(parsed.subtitle || '');
            if (parsed.category) setCategory(parsed.category);
            if (parsed.coverImage) setCoverImage(parsed.coverImage);
            if (parsed.coverImagePath) setCoverImagePath(parsed.coverImagePath);
            if (parsed.tags) setTags(parsed.tags);
            if (parsed.textContent) setTextContent(parsed.textContent);
            if (parsed.storyMode) setStoryMode(parsed.storyMode);
            if (parsed.contentBlocks && parsed.contentBlocks.length > 0) setContentBlocks(parsed.contentBlocks);
            if (parsed.imagePages && parsed.imagePages.length > 0) setImagePages(parsed.imagePages);
          }
        }
      } catch (err) {
        console.warn('Draft restoration notice:', err);
      }
      setHasRestoredDraft(true);
    }
  }, [isOpen, currentUser, hasRestoredDraft]);

  if (!isOpen) return null;

  // Clear draft
  const handleClearDraft = () => {
    if (confirm('మీరు రాస్తున్న ప్రస్తుత డ్రాఫ్ట్‌ను పూర్తిగా తొలగించాలనుకుంటున్నారా?')) {
      setTitle('');
      setTeluguTitle('');
      setSubtitle('');
      setTextContent('');
      setCoverImage('');
      setCoverImagePath('');
      setCoverImageMetadata(undefined);
      setSourceDocument(undefined);
      setImagePages([]);
      setContentBlocks([{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }]);
      if (currentUser) {
        localStorage.removeItem(`kathavahini_draft_${currentUser.id}`);
      }
    }
  };

  // Document extraction callback
  const handleDocumentImported = (extractedText: string, suggestedTitle?: string, sourceDoc?: SourceDocumentInfo) => {
    setTextContent(extractedText);
    if (suggestedTitle && !teluguTitle && !title) {
      setTeluguTitle(suggestedTitle);
      setTitle(suggestedTitle);
    }
    if (sourceDoc) {
      setSourceDocument(sourceDoc);
    }
    // Keep user in document_import mode so their full PDF story is preserved and displayed
    setStoryMode('document_import');
    setViewMode('edit');
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('కథలను సమర్పించడానికి దయచేసి ప్రవేశించండి.');
      return;
    }

    if (!isWriterOrAdmin) {
      setErrorMsg('కథలను సమర్పించడానికి ముందుగా రచయితగా ఆమోదం పొందాలి.');
      return;
    }

    if (!canSubmitToday && !isAdmin) {
      setErrorMsg(limitReason || 'ఈరోజుకు కథల సమర్పణ పరిమితి పూర్తయింది (1 Story/Day limit).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mainType === 'story') {
        let paragraphs: string[] = [];

        if (storyMode === 'rich_text') {
          paragraphs = textContent.split('\n\n').map(p => p.trim()).filter(Boolean);
          if (paragraphs.length === 0 && textContent.trim()) {
            paragraphs = [textContent.trim()];
          }
          if (paragraphs.length === 0) {
            throw new Error('దయచేసి కథ కంటెంట్‌ను నమోదు చేయండి.');
          }
        } else if (storyMode === 'document_import') {
          if (!sourceDocument) {
            throw new Error('దయచేసి కథ కోసం ఒక PDF పత్రాన్ని ఎంచుకుని అప్‌లోడ్ చేయండి.');
          }
          paragraphs = textContent.split('\n\n').map(p => p.trim()).filter(Boolean);
          if (paragraphs.length === 0 && textContent.trim()) {
            paragraphs = [textContent.trim()];
          }
          if (paragraphs.length === 0) {
            paragraphs = [`పూర్తి PDF పత్ర కథ: ${sourceDocument.name}`];
          }
        } else if (storyMode === 'image_pages') {
          if (imagePages.length === 0) {
            throw new Error('దయచేసి కనీసం ఒక చిత్ర పేజీనైనా అప్‌లోడ్ చేయండి.');
          }
          paragraphs = [`చిత్ర కథ: మొత్తం ${imagePages.length} పేజీలు.`];
        } else if (storyMode === 'mixed') {
          if (contentBlocks.length === 0) {
            throw new Error('దయచేసి కనీసం ఒక కంటెంట్ బ్లాక్‌నైనా చేర్చండి.');
          }
          paragraphs = contentBlocks
            .filter(b => b.type === 'paragraph' || b.type === 'quote' || b.type === 'heading')
            .map(b => b.content || '')
            .filter(Boolean);
          if (paragraphs.length === 0) {
            paragraphs = ['మిశ్రమ కంటెంట్ కథ.'];
          }
        }

        const effectiveTitle = teluguTitle.trim() || title.trim() || 'శీర్షిక లేని కథ';
        const effectiveCover = coverImage || 
          (storyMode === 'image_pages' && imagePages.length > 0 ? imagePages[0].imageUrl : undefined) || 
          (storyMode === 'document_import' ? 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800' : 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800');

        await writerService.submitStory({
          title: title.trim() || effectiveTitle,
          teluguTitle: effectiveTitle,
          subtitle: subtitle.trim(),
          teluguSubtitle: subtitle.trim(),
          category,
          coverImage: effectiveCover,
          coverImageUrl: effectiveCover,
          coverImagePath,
          coverImageMetadata,
          excerpt: subtitle || paragraphs[0]?.slice(0, 120) || 'కథ వివరణ',
          teluguExcerpt: subtitle || paragraphs[0]?.slice(0, 120) || 'కథ వివరణ',
          content: paragraphs,
          contentType: storyMode,
          contentBlocks: storyMode === 'mixed' ? contentBlocks : undefined,
          imagePages: storyMode === 'image_pages' ? imagePages : undefined,
          sourceDocument: sourceDocument,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }, currentUser);

        // Clear local draft upon successful submission
        if (currentUser) {
          localStorage.removeItem(`kathavahini_draft_${currentUser.id}`);
        }

        setSuccessMsg(isAdmin 
          ? 'కథ విజయవంతంగా సమర్పించబడింది!' 
          : 'మీ కథ అడ్మిన్ సమీక్ష కోసం సమర్పించబడింది! ఆమోదం తర్వాత ఇది ప్రచురించబడుతుంది.'
        );
      } else if (mainType === 'novel') {
        const paragraphs = textContent.split('\n\n').filter(p => p.trim());
        await novelService.createNovel({
          title: title || 'My Novel',
          teluguTitle: teluguTitle || title || 'నా కొత్త నవల',
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          description: subtitle || paragraphs[0]?.slice(0, 150) || 'నవల వివరణ',
          teluguDescription: subtitle || paragraphs[0]?.slice(0, 150) || 'నవల వివరణ',
        });
        setSuccessMsg('మీ నవల సమీక్ష కోసం సమర్పించబడింది!');
      } else if (mainType === 'joke') {
        await jokeService.publishJoke(jokeText, jokeCategory);
        setSuccessMsg('జోక్ విజయవంతంగా జోడించబడింది!');
      }

      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('');
        onPublishSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'కథను సమర్పించడంలో సమస్య ఎదురైంది.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#202027]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A284B] text-white shadow-sm">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                కథావాహిని రచనల వేదిక (Kathavahini Creator Studio)
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                తెలుగు సాహిత్య రచనలను రూపొందించి ప్రచురణ కోసం సమర్పించండి
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Edit vs Preview) */}
            {mainType === 'story' && (
              <div className="flex items-center bg-white dark:bg-[#18181D] rounded-xl p-1 border border-[#E8E1DA] dark:border-[#2E2D36]">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-[#7A284B] text-white'
                      : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ఎడిటర్</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-[#7A284B] text-white'
                      : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ప్రివ్యూ</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6F6970] dark:text-[#AAA4AC] transition-colors cursor-pointer"
              title="మూసివేయి"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth / Role Verification Gate */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <ShieldAlert className="w-12 h-12 text-[#7A284B] mx-auto" />
            <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              కథను సమర్పించడానికి ముందుగా ప్రవేశించండి
            </h3>
            <p className="text-xs text-[#6F6970] max-w-md mx-auto">
              కథలు రాయడానికి మరియు ప్రచురణ కోసం సమర్పించడానికి మీ కథావాహిని ఖాతాలోకి లాగిన్ చేయండి.
            </p>
            <button
              onClick={() => {
                onClose();
                onRequireAuth('కథలను సమర్పించడానికి లాగిన్ చేయండి.');
              }}
              className="px-6 py-2.5 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              లాగిన్ చేయండి
            </button>
          </div>
        ) : isPendingWriter ? (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                మీ రచయిత దరఖాస్తు పరిశీలనలో ఉంది (Application Under Review)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] max-w-md mx-auto font-serif-telugu leading-relaxed">
                కథావాహిని అడ్మిన్ మీ రచయిత దరఖాస్తును సమీక్షిస్తున్నారు. ఆమోదం లభించిన వెంటనే మీకు రచనా ఎడిటర్ మరియు కథల సమర్పణ సదుపాయం ప్రారంభమవుతుంది. దయచేసి వేచి ఉండండి.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#1E1E24] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                సరే, మూసివేయి
              </button>
            </div>
          </div>
        ) : !isWriterOrAdmin ? (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                రచయిత గుర్తింపు అవసరం (Writer Role Required)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] max-w-md mx-auto font-serif-telugu leading-relaxed">
                మీరు ప్రస్తుతం <strong>పాఠకుడు (Reader)</strong> గా ఉన్నారు. కథావాహిని వేదికపై కథలను సమర్పించడానికి దయచేసి రచయితగా దరఖాస్తు చేసుకోండి. సూపర్ అడ్మిన్ ఆమోదం పొందిన తర్వాత మీరు రచనలను సమర్పించవచ్చు.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onApplyWriter();
                }}
                className="px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                రచయితగా దరఖాస్తు చేసుకోండి
              </button>
            </div>
          </div>
        ) : (
          /* Main Creation Studio Form */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Top Format Selector (Story / Novel / Joke) */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMainType('story')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                    mainType === 'story'
                      ? 'bg-[#7A284B] text-white shadow-sm'
                      : 'bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] hover:text-[#17151A]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>కథ (Story)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMainType('novel')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                    mainType === 'novel'
                      ? 'bg-[#7A284B] text-white shadow-sm'
                      : 'bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] hover:text-[#17151A]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>ధారావాహిక నవల (Novel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMainType('joke')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                    mainType === 'joke'
                      ? 'bg-[#7A284B] text-white shadow-sm'
                      : 'bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] hover:text-[#17151A]'
                  }`}
                >
                  <Laugh className="w-4 h-4" />
                  <span>హాస్యం / జోక్ (Joke)</span>
                </button>
              </div>

              {/* Clear Draft Action */}
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-xs text-[#6F6970] dark:text-[#AAA4AC] hover:text-red-500 inline-flex items-center gap-1.5 cursor-pointer"
                title="డ్రాఫ్ట్ తొలగించు"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>డ్రాఫ్ట్ రీసెట్</span>
              </button>
            </div>

            {/* Daily Submission Limit Alert for Writers */}
            {!checkingLimit && !canSubmitToday && !isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold">రోజువారీ కథా సమర్పణ పరిమితి (Daily Limit Reached):</span>
                  <p className="leading-relaxed opacity-90">
                    {limitReason || 'ఈరోజుకు మీరు ఇప్పటికే ఒక కథను సమర్పించారు. మీరు మీ డ్రాఫ్ట్‌ను సిద్ధం చేసుకోవచ్చు, కానీ రేపు మాత్రమే సమర్పించగలరు.'}
                  </p>
                </div>
              </div>
            )}

            {/* Story Creation View: Edit Mode or Preview Mode */}
            {mainType === 'story' && viewMode === 'preview' ? (
              /* Live Preview Component */
              <StoryContentPreview
                title={title}
                teluguTitle={teluguTitle}
                subtitle={subtitle}
                category={category}
                tags={tags.split(',').map(t => t.trim()).filter(Boolean)}
                coverImageUrl={coverImage}
                authorName={currentUser.teluguName || currentUser.displayName || currentUser.name}
                contentType={storyMode}
                textContent={textContent}
                contentBlocks={contentBlocks}
                imagePages={imagePages}
                sourceDocument={sourceDocument}
              />
            ) : mainType === 'story' ? (
              /* Unified 4-Mode Creation Studio */
              <form onSubmit={handlePublish} className="space-y-6">
                
                {/* 4 Unified Creation Modes Segmented Control */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                    కథా రూపకల్పన విధానం (Content Creation Method):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setStoryMode('rich_text')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'rich_text'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Feather className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>1. నేరుగా రాయండి</span>
                      </div>
                      <span className="text-[11px] opacity-80">రిచ్ టెక్స్ట్ ఎడిటర్</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('document_import')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'document_import'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <FileText className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>2. పి.డి.ఎఫ్ కథ</span>
                      </div>
                      <span className="text-[11px] opacity-80">పూర్తి PDF పత్రం</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('image_pages')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'image_pages'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <ImageIcon className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>3. చిత్ర కథ పేజీలు</span>
                      </div>
                      <span className="text-[11px] opacity-80">ప్రతి పేజీ ఒక చిత్రం</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('mixed')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'mixed'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#202027] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>4. మిశ్రమ కంటెంట్</span>
                      </div>
                      <span className="text-[11px] opacity-80">బ్లాక్ బిల్డర్</span>
                    </button>
                  </div>
                </div>

                {/* Primary Story Metadata: Titles & Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      తెలుగు శీర్షిక (Telugu Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teluguTitle}
                      onChange={(e) => setTeluguTitle(e.target.value)}
                      placeholder="ఉదా: అమరావతి కథలు / గోదావరి తీరాన..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B] text-[#17151A] dark:text-[#F7F3EE]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      ఇంగ్లీష్ శీర్షిక (English Title)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stories of Amaravathi"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B] text-[#17151A] dark:text-[#F7F3EE]"
                    />
                  </div>
                </div>

                {/* Subtitle / Tagline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                    ఉప శీర్షిక / పరిచయ వాక్యం (Subtitle / Short Tagline)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="కథ యొక్క ముఖ్య ఉద్దేశ్యం లేదా ఒక ఆకర్షణీయమైన పరిచయ వాక్యం..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B] text-[#17151A] dark:text-[#F7F3EE]"
                  />
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      సాహిత్య విభాగం (Category) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as StoryCategory)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B] text-[#17151A] dark:text-[#F7F3EE]"
                    >
                      {dynamicCategories.length > 0 ? (
                        dynamicCategories.map((c) => (
                          <option key={c.id} value={c.teluguName || c.name}>
                            {c.teluguName || c.name} {c.name && c.name !== c.teluguName ? `(${c.name})` : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="జీవితం">జీవితం (Life)</option>
                          <option value="ప్రేమ">ప్రేమ (Love / Romance)</option>
                          <option value="కుటుంబం">కుటుంబం (Family)</option>
                          <option value="స్నేహం">స్నేహం (Friendship)</option>
                          <option value="ప్రేరణ">ప్రేరణ (Inspirational)</option>
                          <option value="హాస్యం">హాస్యం (Humor)</option>
                          <option value="రహస్యం">రహస్యం (Mystery)</option>
                          <option value="థ్రిల్లర్">థ్రిల్లర్ (Thriller)</option>
                          <option value="ఫాంటసీ">ఫాంటసీ (Fantasy)</option>
                          <option value="చారిత్రక">చారిత్రక (Historical)</option>
                          <option value="భయం">భయం (Horror)</option>
                          <option value="పిల్లల కథలు">పిల్లల కథలు (Children's Stories)</option>
                          <option value="ఆధ్యాత్మికం">ఆధ్యాత్మికం (Spiritual)</option>
                          <option value="సామాజికం">సామాజికం (Social)</option>
                          <option value="గ్రామీణ కథలు">గ్రామీణ కథలు (Rural Stories)</option>
                          <option value="సాహిత్యం">సాహిత్యం (Literature)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      ట్యాగ్‌లు (Tags, కామాలతో వేరు చేయండి)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="తెలుగు, కథ, కుటుంబం, అనుబంధాలు"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B] text-[#17151A] dark:text-[#F7F3EE]"
                    />
                  </div>
                </div>

                {/* Cover Image Section: Only shown for Direct Writing (rich_text) and Mixed Content modes */}
                {(storyMode === 'rich_text' || storyMode === 'mixed') && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      కథ ముఖచిత్రం (Story Cover Image)
                    </label>
                    <CoverImageUploader
                      value={coverImage}
                      storagePath={coverImagePath}
                      metadata={coverImageMetadata}
                      targetType="story"
                      targetId={sessionStoryId}
                      onChange={(url, path, metadata) => {
                        setCoverImage(url);
                        setCoverImagePath(path);
                        setCoverImageMetadata(metadata);
                      }}
                      entityId={sessionStoryId}
                      folder="stories"
                      initialImageUrl={coverImage}
                      initialImagePath={coverImagePath}
                      onImageUploaded={(url, path, metadata) => {
                        setCoverImage(url);
                        setCoverImagePath(path);
                        setCoverImageMetadata(metadata);
                      }}
                      onImageRemoved={() => {
                        setCoverImage('');
                        setCoverImagePath(undefined);
                        setCoverImageMetadata(undefined);
                      }}
                      label="కథ కోసం ఆకర్షణీయమైన ముఖచిత్రాన్ని ఎంచుకోండి (JPG, PNG, WEBP max 5MB)"
                    />
                  </div>
                )}

                {/* Active Mode Content Workspace */}
                <div className="pt-2">
                  {storyMode === 'rich_text' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        కథా సాహిత్యం (Story Literature):
                      </label>
                      <RichTextEditor
                        value={textContent}
                        onChange={setTextContent}
                        placeholder="ఇక్కడ మీ కథను రాయడం ప్రారంభించండి... (మీరు పేరాలను Enter ద్వారా వేరు చేయవచ్చు)"
                      />
                    </div>
                  )}

                  {storyMode === 'document_import' && (
                    <DocumentImportTab
                      storyId={sessionStoryId}
                      onImportComplete={handleDocumentImported}
                      initialSourceDoc={sourceDocument}
                    />
                  )}

                  {storyMode === 'image_pages' && (
                    <ImagePagesTab
                      storyId={sessionStoryId}
                      imagePages={imagePages}
                      onChange={setImagePages}
                    />
                  )}

                  {storyMode === 'mixed' && (
                    <MixedContentTab
                      storyId={sessionStoryId}
                      blocks={contentBlocks}
                      onChange={setContentBlocks}
                    />
                  )}
                </div>

                {/* Submission Feedback Messages */}
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-4 rounded-2xl bg-[#3E8065]/10 border border-[#3E8065]/20 text-[#3E8065] text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit / Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
                  <div className="flex items-center gap-2 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                    <Save className="w-4 h-4" />
                    <span>డ్రాఫ్ట్ ఆటోమేటిక్‌గా సేవ్ అవుతోంది</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className="px-5 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:border-[#7A284B] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                      <span>ప్రివ్యూ చూడండి</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading || (!canSubmitToday && !isAdmin)}
                      className="px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>సమర్పిస్తోంది...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isAdmin ? 'కథను ప్రచురించండి' : 'సమీక్ష కోసం సమర్పించండి'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : mainType === 'novel' ? (
              /* Novel Submission Sub-Form */
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#7A284B]/5 border border-[#7A284B]/20 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  ధారావాహిక నవల శీర్షిక మరియు వివరణ నమోదు చేయండి. ఆమోదం పొందిన తర్వాత మీరు కొత్త ఎపిసోడ్‌లను జోడించవచ్చు.
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">నవల శీర్షిక (Telugu Title) *</label>
                  <input
                    type="text"
                    required
                    value={teluguTitle}
                    onChange={(e) => setTeluguTitle(e.target.value)}
                    placeholder="ఉదా: వేయి పడగలు"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">నవల పరిచయం (Description) *</label>
                  <textarea
                    rows={4}
                    required
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="నవల యొక్క సంక్షిప్త పరిచయం..."
                    className="w-full p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] text-sm"
                  />
                </div>
                <CoverImageUploader
                  value={coverImage}
                  storagePath={coverImagePath}
                  metadata={coverImageMetadata}
                  targetType="novel"
                  targetId={sessionStoryId}
                  onChange={(url, path, metadata) => {
                    setCoverImage(url);
                    setCoverImagePath(path);
                    setCoverImageMetadata(metadata);
                  }}
                  entityId={sessionStoryId}
                  folder="novels"
                  initialImageUrl={coverImage}
                  onImageUploaded={(url) => setCoverImage(url)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {loading ? 'సమర్పిస్తోంది...' : 'నవలను సమర్పించండి'}
                </button>
              </form>
            ) : (
              /* Joke Submission Sub-Form */
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">జోక్ విభాగం</label>
                  <select
                    value={jokeCategory}
                    onChange={(e) => setJokeCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] text-sm"
                  >
                    <option value="హాస్యం">హాస్యం (General)</option>
                    <option value="సంభాషణ">సంభాషణ (Dialogue)</option>
                    <option value="వ్యంగ్యం">వ్యంగ్యం (Satire)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">జోక్ టెక్స్ట్ *</label>
                  <textarea
                    rows={4}
                    required
                    value={jokeText}
                    onChange={(e) => setJokeText(e.target.value)}
                    placeholder="ఇక్కడ జోక్ రాయండి..."
                    className="w-full p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] text-sm font-serif-telugu"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {loading ? 'సమర్పిస్తోంది...' : 'జోక్‌ను ప్రచురించండి'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
