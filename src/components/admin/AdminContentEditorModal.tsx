import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Send,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Archive,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Bookmark,
  Layers,
  Smile,
  Lightbulb,
  FileText,
  Edit3,
  RotateCcw,
  UploadCloud,
  FileUp,
  AlertCircle
} from 'lucide-react';
import { 
  Story, 
  Novel, 
  Episode, 
  Joke, 
  KnowledgeArticle, 
  StoryCategory, 
  ContentStatus, 
  ContentVisibility, 
  ImageMetadata,
  StoryContentType,
  ContentBlock,
  StoryImagePage,
  SourceDocumentInfo
} from '../../types';
import { CoverImageUploader } from '../common/CoverImageUploader';
import { RichTextEditor } from '../editor/RichTextEditor';
import { DocumentImportTab } from '../editor/DocumentImportTab';
import { ImagePagesTab } from '../editor/ImagePagesTab';
import { MixedContentTab } from '../editor/MixedContentTab';
import { StoryContentPreview } from '../editor/StoryContentPreview';

export type ContentEditorType = 'story' | 'novel' | 'episode' | 'joke' | 'knowledge';

interface AdminContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: ContentEditorType;
  initialType?: ContentEditorType;
  initialData?: any;
  novelContext?: Novel;
  novelsList?: Novel[];
  onSave?: (data: any) => Promise<void>;
  onSaveStory?: (data: any) => Promise<void>;
  onSaveNovel?: (data: any) => Promise<void>;
  onSaveEpisode?: (data: any) => Promise<void>;
  onSaveJoke?: (data: any) => Promise<void>;
  onSaveKnowledge?: (data: any) => Promise<void>;
}

const CATEGORIES: StoryCategory[] = [
  'జీవితం',
  'కుటుంబం',
  'ప్రేమ',
  'హాస్యం',
  'గ్రామీణ కథలు',
  'ఆధ్యాత్మికం',
  'రహస్యం',
  'పిల్లల కథలు',
  'సాహిత్యం',
  'ప్రేరణ'
];

export const AdminContentEditorModal: React.FC<AdminContentEditorModalProps> = ({
  isOpen,
  onClose,
  contentType: passedContentType,
  initialType = 'story',
  initialData = null,
  novelContext,
  novelsList = [],
  onSave,
  onSaveStory,
  onSaveNovel,
  onSaveEpisode,
  onSaveJoke,
  onSaveKnowledge,
}) => {
  const effectiveInitialType = passedContentType || initialType;
  const [contentType, setContentType] = useState<ContentEditorType>(effectiveInitialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Story Content Mode (4 Unified Options: Rich Text, Document Import, Image Pages, Mixed Blocks)
  const [storyMode, setStoryMode] = useState<StoryContentType>('rich_text');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Common Metadata
  const [title, setTitle] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('జీవితం');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePath, setCoverImagePath] = useState<string | undefined>(undefined);
  const [coverImageMetadata, setCoverImageMetadata] = useState<ImageMetadata | undefined>(undefined);
  const [authorName, setAuthorName] = useState('కథావాహిని సంపాదకులు');
  const [status, setStatus] = useState<ContentStatus>('published');
  const [visibility, setVisibility] = useState<ContentVisibility>('public');
  const [scheduledAt, setScheduledAt] = useState('');
  const [tagsInput, setTagsInput] = useState('తెలుగు, కథ');

  // Story Fields
  const [excerpt, setExcerpt] = useState('');
  const [teluguExcerpt, setTeluguExcerpt] = useState('');
  const [textContent, setTextContent] = useState('');
  const [sourceDocument, setSourceDocument] = useState<SourceDocumentInfo | undefined>(undefined);
  const [imagePages, setImagePages] = useState<StoryImagePage[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: `block-${Date.now()}`, type: 'paragraph', content: '' }
  ]);

  // Unique session ID for uploads
  const [sessionEntityId, setSessionEntityId] = useState(() => `admin-${Date.now()}`);

  // Novel Fields
  const [novelDescription, setNovelDescription] = useState('');
  const [novelTeluguDescription, setNovelTeluguDescription] = useState('');

  // Episode Fields
  const [selectedNovelId, setSelectedNovelId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeText, setEpisodeText] = useState('');

  // Joke Fields
  const [jokeContent, setJokeContent] = useState('');
  const [jokeTeluguContent, setJokeTeluguContent] = useState('');

  // Knowledge Fields
  const [knowledgeSummary, setKnowledgeSummary] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');

  useEffect(() => {
    if (effectiveInitialType) setContentType(effectiveInitialType);
    setViewMode('edit');
    setSessionEntityId(initialData?.id || `admin-${Date.now()}`);

    if (initialData) {
      setTitle(initialData.title || '');
      setTeluguTitle(initialData.teluguTitle || initialData.title || '');
      setCategory(initialData.category || 'జీవితం');
      setCoverImage(initialData.coverImage || initialData.coverImageUrl || '');
      setCoverImagePath(initialData.coverImagePath || undefined);
      setCoverImageMetadata(initialData.coverImageMetadata || undefined);
      setAuthorName(initialData.authorName || initialData.author?.name || 'కథావాహిని సంపాదకులు');
      setStatus(initialData.status || 'published');
      setVisibility(initialData.visibility || 'public');
      setScheduledAt(initialData.scheduledAt || '');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : 'తెలుగు, కథ');

      if (effectiveInitialType === 'story') {
        setExcerpt(initialData.excerpt || '');
        setTeluguExcerpt(initialData.teluguExcerpt || initialData.excerpt || '');
        setStoryMode(initialData.contentType || (initialData.imagePages?.length > 0 ? 'image_pages' : initialData.contentBlocks?.length > 0 ? 'mixed' : 'rich_text'));
        
        if (Array.isArray(initialData.content)) {
          setTextContent(initialData.content.join('\n\n'));
        } else if (typeof initialData.content === 'string') {
          setTextContent(initialData.content);
        } else {
          setTextContent('');
        }

        if (initialData.imagePages && initialData.imagePages.length > 0) {
          setImagePages(initialData.imagePages);
        } else {
          setImagePages([]);
        }

        if (initialData.contentBlocks && initialData.contentBlocks.length > 0) {
          setContentBlocks(initialData.contentBlocks);
        } else {
          setContentBlocks([{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }]);
        }

        setSourceDocument(initialData.sourceDocument || undefined);
      } else if (effectiveInitialType === 'novel') {
        setNovelDescription(initialData.description || '');
        setNovelTeluguDescription(initialData.teluguDescription || initialData.description || '');
      } else if (effectiveInitialType === 'episode') {
        setSelectedNovelId(initialData.novelId || novelContext?.id || '');
        setEpisodeNumber(initialData.episodeNumber || 1);
        setEpisodeText(Array.isArray(initialData.content) ? initialData.content.join('\n\n') : (initialData.content || ''));
      } else if (effectiveInitialType === 'joke') {
        setJokeContent(initialData.content || '');
        setJokeTeluguContent(initialData.teluguContent || initialData.content || '');
      } else if (effectiveInitialType === 'knowledge') {
        setKnowledgeSummary(initialData.summary || '');
        setKnowledgeText(Array.isArray(initialData.content) ? initialData.content.join('\n\n') : (initialData.content || ''));
      }
    } else {
      // Reset defaults for new creation
      setTitle('');
      setTeluguTitle('');
      setCategory('జీవితం');
      setCoverImage('');
      setCoverImagePath(undefined);
      setCoverImageMetadata(undefined);
      setAuthorName('కథావాహిని సంపాదకులు');
      setStatus('published');
      setVisibility('public');
      setScheduledAt('');
      setTagsInput('తెలుగు, కథ');
      setExcerpt('');
      setTeluguExcerpt('');
      setTextContent('');
      setSourceDocument(undefined);
      setImagePages([]);
      setContentBlocks([{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }]);
      setStoryMode('rich_text');
      setNovelDescription('');
      setNovelTeluguDescription('');
      setSelectedNovelId(novelContext?.id || novelsList[0]?.id || '');
      setEpisodeNumber(1);
      setEpisodeText('');
      setJokeContent('');
      setJokeTeluguContent('');
      setKnowledgeSummary('');
      setKnowledgeText('');
    }
  }, [isOpen, effectiveInitialType, initialData, novelContext, novelsList]);

  if (!isOpen) return null;

  // Handle Document Import Callback (PDF, Word, TXT)
  const handleDocumentImported = (extractedText: string, suggestedTitle?: string, sourceDoc?: SourceDocumentInfo) => {
    setTextContent(extractedText);
    if (suggestedTitle && !teluguTitle && !title) {
      setTeluguTitle(suggestedTitle);
      setTitle(suggestedTitle);
    }
    if (sourceDoc) {
      setSourceDocument(sourceDoc);
    }
    // Keep user in document_import mode for complete PDF story preservation
    setStoryMode('document_import');
    setViewMode('edit');
  };

  const handleSave = async (overrideStatus?: ContentStatus, overrideVisibility?: ContentVisibility) => {
    setError(null);
    setLoading(true);

    const finalStatus = overrideStatus || status;
    const finalVisibility = overrideVisibility || visibility;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (contentType === 'story') {
        if (!teluguTitle.trim() && !title.trim()) {
          throw new Error('దయచేసి కథ శీర్షికను నమోదు చేయండి');
        }

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
            throw new Error('దయచేసి కథ కోసం ఒక PDF లేదా డాక్యుమెంట్ ఫైల్‌ను అప్‌లోడ్ చేయండి.');
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
            throw new Error('దయచేసి కనీసం ఒక కంటెంట్ బ్లాక్‌నైనా జోడించండి.');
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
        const effectiveCover = coverImage || (imagePages.length > 0 ? imagePages[0].imageUrl : 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800');

        const storyPayload = {
          id: initialData?.id,
          title: title || effectiveTitle,
          teluguTitle: effectiveTitle,
          category,
          coverImage: effectiveCover,
          coverImageUrl: effectiveCover,
          coverImagePath,
          coverImageMetadata,
          excerpt: teluguExcerpt || excerpt || paragraphs[0]?.slice(0, 120),
          teluguExcerpt: teluguExcerpt || excerpt || paragraphs[0]?.slice(0, 120),
          content: paragraphs,
          contentType: storyMode,
          contentBlocks: storyMode === 'mixed' ? contentBlocks : undefined,
          imagePages: storyMode === 'image_pages' ? imagePages : undefined,
          sourceDocument: sourceDocument,
          tags,
          authorName,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        };

        if (onSave) {
          await onSave(storyPayload);
        } else if (onSaveStory) {
          await onSaveStory(storyPayload);
        }
      } else if (contentType === 'novel') {
        if (!teluguTitle.trim() && !title.trim()) {
          throw new Error('దయచేసి నవల శీర్షికను నమోదు చేయండి');
        }
        const novelPayload = {
          id: initialData?.id,
          title: title || teluguTitle,
          teluguTitle: teluguTitle || title,
          description: novelTeluguDescription || novelDescription,
          teluguDescription: novelTeluguDescription || novelDescription,
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          coverImageUrl: coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          coverImagePath,
          coverImageMetadata,
          tags,
          authorName,
          status: finalStatus === 'published' ? 'ongoing' : finalStatus,
          visibility: finalVisibility,
        };

        if (onSave) {
          await onSave(novelPayload);
        } else if (onSaveNovel) {
          await onSaveNovel(novelPayload);
        }
      } else if (contentType === 'episode') {
        if (!selectedNovelId) {
          throw new Error('దయచేసి నవలను ఎంచుకోండి');
        }
        const paras = episodeText.split('\n\n').map(p => p.trim()).filter(Boolean);
        if (paras.length === 0 && episodeText.trim()) {
          paras.push(episodeText.trim());
        }
        if (paras.length === 0) {
          throw new Error('దయచేసి ఎపిసోడ్ కంటెంట్ రాయండి');
        }
        const selectedNovel = novelsList.find(n => n.id === selectedNovelId);
        const episodePayload = {
          id: initialData?.id,
          novelId: selectedNovelId,
          novelTitle: selectedNovel?.teluguTitle || selectedNovel?.title || 'నవల',
          episodeNumber,
          title: title || `ఎపిసోడ్ ${episodeNumber}`,
          teluguTitle: teluguTitle || `భాగం ${episodeNumber}`,
          content: paras,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        };

        if (onSave) {
          await onSave(episodePayload);
        } else if (onSaveEpisode) {
          await onSaveEpisode(episodePayload);
        }
      } else if (contentType === 'joke') {
        const text = jokeTeluguContent || jokeContent;
        if (!text.trim()) {
          throw new Error('దయచేసి జోక్ కంటెంట్ రాయండి');
        }
        const jokePayload = {
          id: initialData?.id,
          content: jokeContent || jokeTeluguContent,
          teluguContent: jokeTeluguContent || jokeContent,
          category: category || 'హాస్యం',
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        };

        if (onSave) {
          await onSave(jokePayload);
        } else if (onSaveJoke) {
          await onSaveJoke(jokePayload);
        }
      } else if (contentType === 'knowledge') {
        if (!teluguTitle.trim() && !title.trim()) {
          throw new Error('దయచేసి శీర్షికను నమోదు చేయండి');
        }
        const paras = knowledgeText.split('\n\n').map(p => p.trim()).filter(Boolean);
        if (paras.length === 0 && knowledgeText.trim()) {
          paras.push(knowledgeText.trim());
        }
        const knowledgePayload = {
          id: initialData?.id,
          title: title || teluguTitle,
          teluguTitle: teluguTitle || title,
          category: category || 'సాహిత్యం',
          summary: knowledgeSummary || paras[0]?.slice(0, 100),
          content: paras.length > 0 ? paras : [knowledgeSummary],
          tags,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
          coverImageUrl: coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
          coverImagePath,
          coverImageMetadata,
          authorName,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        };

        if (onSave) {
          await onSave(knowledgePayload);
        } else if (onSaveKnowledge) {
          await onSaveKnowledge(knowledgePayload);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'సేవ్ చేయడంలో విఫలమైంది');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#121118]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center font-bold shadow-sm">
              {contentType === 'story' && <BookOpen className="w-5 h-5" />}
              {contentType === 'novel' && <Bookmark className="w-5 h-5" />}
              {contentType === 'episode' && <Layers className="w-5 h-5" />}
              {contentType === 'joke' && <Smile className="w-5 h-5" />}
              {contentType === 'knowledge' && <Lightbulb className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-telugu">
                {initialData ? 'కంటెంట్‌ను సవరించండి (Edit Content)' : 'కొత్త కంటెంట్ సృష్టించండి (Admin CMS Studio)'}
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                డాక్యుమెంట్ ఇంపోర్ట్ (PDF/Word), ఇమేజ్ పేజీలు & రిచ్ ఎడిటింగ్ సదుపాయాలు
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Preview Toggle for Story */}
            {contentType === 'story' && (
              <div className="flex items-center bg-white dark:bg-[#18181F] rounded-xl p-1 border border-[#E8E1DA] dark:border-[#26242E]">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-[#7A284B] text-white'
                      : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ఎడిటర్</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-[#7A284B] text-white'
                      : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>లైవ్ ప్రివ్యూ</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#A29CA6] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="మూసివేయి"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Type Selector (When Creating New) */}
        {!initialData && (
          <div className="px-6 py-2.5 flex items-center gap-2 border-b border-[#E8E1DA] dark:border-[#26242E] bg-white dark:bg-[#18181F] overflow-x-auto">
            <span className="text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] uppercase shrink-0">రకం:</span>
            <button
              onClick={() => setContentType('story')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                contentType === 'story' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>కథ (Story)</span>
            </button>
            <button
              onClick={() => setContentType('novel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                contentType === 'novel' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>నవల (Novel)</span>
            </button>
            <button
              onClick={() => setContentType('episode')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                contentType === 'episode' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ఎపిసోడ్ (Episode)</span>
            </button>
            <button
              onClick={() => setContentType('joke')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                contentType === 'joke' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>జోక్ (Joke)</span>
            </button>
            <button
              onClick={() => setContentType('knowledge')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                contentType === 'knowledge' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>సాహిత్య విజ్ఞానం (Knowledge)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* If Story & Preview Mode is active */}
          {contentType === 'story' && viewMode === 'preview' ? (
            <StoryContentPreview
              title={title}
              teluguTitle={teluguTitle}
              subtitle={teluguExcerpt || excerpt}
              category={category}
              tags={tagsInput.split(',').map(t => t.trim()).filter(Boolean)}
              coverImageUrl={coverImage}
              authorName={authorName}
              contentType={storyMode}
              textContent={textContent}
              contentBlocks={contentBlocks}
              imagePages={imagePages}
              sourceDocument={sourceDocument}
            />
          ) : (
            <>
              {/* Type: Story or Knowledge or Novel Title */}
              {contentType !== 'joke' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      తెలుగు శీర్షిక (Telugu Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={teluguTitle}
                      onChange={e => setTeluguTitle(e.target.value)}
                      placeholder="ఉదా: వెన్నెల రాత్రి, సంక్రాంతి జ్ఞాపకాలు..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      ఆంగ్ల శీర్షిక / Slug (English Title)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Moonlight Memories"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Episode Specific Novel Selector */}
              {contentType === 'episode' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      నవలను ఎంచుకోండి (Select Novel) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedNovelId}
                      onChange={e => setSelectedNovelId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    >
                      {novelsList.length === 0 ? (
                        <option value="">నవలలు ఏవీ అందుబాటులో లేవు</option>
                      ) : (
                        novelsList.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.teluguTitle || n.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      ఎపిసోడ్ నంబర్ (Episode Number)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={episodeNumber}
                      onChange={e => setEpisodeNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Metadata Row: Category and Author Name */}
              {contentType !== 'joke' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">కేటగిరీ (Category)</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as StoryCategory)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">రచయిత పేరు (Author Attribution)</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder="కథావాహిని సంపాదకులు"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Cover Image Upload Row: Only shown for rich_text and mixed stories, or novels/knowledge */}
              {(((contentType === 'story' && (storyMode === 'rich_text' || storyMode === 'mixed')) || contentType === 'novel' || contentType === 'knowledge')) && (
                <CoverImageUploader
                  value={coverImage}
                  storagePath={coverImagePath}
                  metadata={coverImageMetadata}
                  targetType={contentType === 'novel' ? 'novel' : contentType === 'knowledge' ? 'knowledge' : 'story'}
                  targetId={sessionEntityId}
                  label={
                    contentType === 'novel'
                      ? 'నవల కవర్ చిత్రం (Novel Cover Image)'
                      : contentType === 'knowledge'
                      ? 'ఆర్టికల్ కవర్ చిత్రం (Knowledge Article Cover Image)'
                      : 'కథ కవర్ చిత్రం (Story Cover Image)'
                  }
                  onChange={(newUrl, newPath, newMeta) => {
                    setCoverImage(newUrl);
                    setCoverImagePath(newPath);
                    setCoverImageMetadata(newMeta);
                  }}
                />
              )}

              {/* Story Creation Method Selector: 4 Unified Creation Modes */}
              {contentType === 'story' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                      కథా రూపకల్పన విధానం (Content Creation Method):
                    </label>
                    <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                      డాక్యుమెంట్ ఇంపోర్ట్ లేదా ఇమేజ్ పేజీల ద్వారా సులభంగా సృష్టించండి
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStoryMode('rich_text')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'rich_text'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Edit3 className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>1. నేరుగా రాయండి</span>
                      </div>
                      <span className="text-[10px] opacity-80">రిచ్ టెక్స్ట్ ఎడిటర్</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('document_import')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'document_import'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <FileText className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>2. పి.డి.ఎఫ్ కథ</span>
                      </div>
                      <span className="text-[10px] opacity-80">పూర్తి PDF పత్రం</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('image_pages')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'image_pages'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <ImageIcon className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>3. చిత్ర కథ పేజీలు</span>
                      </div>
                      <span className="text-[10px] opacity-80">ప్రతి పేజీ ఒక చిత్రం</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryMode('mixed')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        storyMode === 'mixed'
                          ? 'border-[#7A284B] bg-[#7A284B]/10 dark:bg-[#7A284B]/20 text-[#7A284B] dark:text-[#D87591] ring-1 ring-[#7A284B]'
                          : 'border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:border-[#7A284B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                        <span>4. మిశ్రమ కంటెంట్</span>
                      </div>
                      <span className="text-[10px] opacity-80">బ్లాక్ బిల్డర్</span>
                    </button>
                  </div>

                  {/* Excerpt / Summary */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      కథ పరిచయం / సంక్షిప్తం (Excerpt / Summary)
                    </label>
                    <input
                      type="text"
                      value={teluguExcerpt}
                      onChange={e => setTeluguExcerpt(e.target.value)}
                      placeholder="కథ యొక్క ముఖ్యమైన సారాంశం (హోమ్‌పేజీ కార్డులపై కనిపిస్తుంది)..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>

                  {/* Active Story Workspace depending on Mode */}
                  <div className="pt-2">
                    {storyMode === 'rich_text' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                            కథా సాహిత్యం (Story Content & Rich Editor):
                          </label>
                          <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                            మొత్తం కథను ఒకేసారి పేస్ట్ చేయవచ్చు (Enter నొక్కి పేరాలు వేరుచేయండి)
                          </span>
                        </div>
                        <RichTextEditor
                          value={textContent}
                          onChange={setTextContent}
                          placeholder="ఇక్కడ మీ కథను రాయండి లేదా మొత్తం కథను ఒకేసారి పేస్ట్ చేయండి..."
                        />
                      </div>
                    )}

                    {storyMode === 'document_import' && (
                      <DocumentImportTab
                        storyId={sessionEntityId}
                        onImportComplete={handleDocumentImported}
                        initialSourceDoc={sourceDocument}
                      />
                    )}

                    {storyMode === 'image_pages' && (
                      <ImagePagesTab
                        storyId={sessionEntityId}
                        imagePages={imagePages}
                        onChange={setImagePages}
                      />
                    )}

                    {storyMode === 'mixed' && (
                      <MixedContentTab
                        storyId={sessionEntityId}
                        blocks={contentBlocks}
                        onChange={setContentBlocks}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Novel Specific: Description */}
              {contentType === 'novel' && (
                <div>
                  <label className="block text-xs font-bold mb-1 font-serif-telugu">
                    నవల పరిచయం & కథా నేపథ్యం (Novel Description) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={novelTeluguDescription}
                    onChange={e => setNovelTeluguDescription(e.target.value)}
                    placeholder="నవల యొక్క పూర్తి పరిచయం..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Episode Specific: Content (with easy bulk multi-paragraph paste) */}
              {contentType === 'episode' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold font-serif-telugu">
                      ఎపిసోడ్ కంటెంట్ (Episode Content) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                      పేరాలను వేరుచేయడానికి ఖాళీ లైన్ (Enter) ఉపయోగించండి
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={episodeText}
                    onChange={e => setEpisodeText(e.target.value)}
                    placeholder="ఎపిసోడ్ కథను ఇక్కడ రాయండి లేదా పేస్ట్ చేయండి..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Joke Specific: Content */}
              {contentType === 'joke' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      తెలుగు జోక్ కంటెంట్ (Telugu Joke Content) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={jokeTeluguContent}
                      onChange={e => setJokeTeluguContent(e.target.value)}
                      placeholder="జోక్ లేదా హాస్య సంభాషణ ఇక్కడ నమోదు చేయండి..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">కేటగిరీ</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value as StoryCategory)}
                      placeholder="హాస్యం, వ్యంగ్యం..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Knowledge Specific: Summary & Content */}
              {contentType === 'knowledge' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      వ్యాస సారాంశం (Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={knowledgeSummary}
                      onChange={e => setKnowledgeSummary(e.target.value)}
                      placeholder="సాహిత్య వ్యాస పరిచయం..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 font-serif-telugu">
                      పూర్తి వ్యాస వివరణ (Detailed Content) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={8}
                      value={knowledgeText}
                      onChange={e => setKnowledgeText(e.target.value)}
                      placeholder="వ్యాస సమాచారాన్ని ఇక్కడ రాయండి లేదా పేస్ట్ చేయండి..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tags Field */}
              {contentType !== 'joke' && (
                <div>
                  <label className="block text-xs font-bold mb-1">ట్యాగ్‌లు (Tags - కామాలతో వేరుచేయండి)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="తెలుగు, కథ, కుటుంబం, ప్రసిద్ధ"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                  />
                </div>
              )}

              {/* Lifecycle & Scheduling Control Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#6F6970] dark:text-[#A29CA6]">
                    లైఫ్‌సైకిల్ & గోప్యతా సెట్టింగ్స్ (Lifecycle Controls)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
                    Admin Controls Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Status */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-[#6F6970] dark:text-[#A29CA6]">
                      స్టేటస్ (Content Status)
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ContentStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold focus:outline-none"
                    >
                      <option value="published">ప్రచురితం (Published)</option>
                      <option value="draft">డ్రాఫ్ట్ (Draft)</option>
                      <option value="scheduled">షెడ్యూల్డ్ (Scheduled)</option>
                      <option value="pending">సమీక్షలో (Pending Review)</option>
                      <option value="rejected">తిరస్కృతం (Rejected)</option>
                      <option value="archived">ఆర్కైవ్ (Archived)</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-[#6F6970] dark:text-[#A29CA6]">
                      విజిబిలిటీ (Visibility)
                    </label>
                    <select
                      value={visibility}
                      onChange={e => setVisibility(e.target.value as ContentVisibility)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold focus:outline-none"
                    >
                      <option value="public">పబ్లిక్ (Public - అందరికీ కనిపిస్తుంది)</option>
                      <option value="private">ప్రైవేట్ (Private - కేవలం మీకు మాత్రమే)</option>
                      <option value="hidden">దాచబడింది (Hidden - డీలిస్ట్ చేయబడింది)</option>
                    </select>
                  </div>

                  {/* Scheduled Date/Time */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-[#6F6970] dark:text-[#A29CA6]">
                      షెడ్యూల్ సమయం (Schedule At)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer: Action Bar */}
        <div className="p-4 border-t border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] flex flex-wrap items-center justify-between gap-2">
          {/* Quick Life-Cycle Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('draft')}
              className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-[#26242E] hover:bg-gray-300 dark:hover:bg-[#343040] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>డ్రాఫ్ట్‌గా సేవ్ చేయండి</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('scheduled', 'public')}
              className="px-3 py-2 rounded-xl bg-purple-600/20 text-purple-700 dark:text-purple-300 hover:bg-purple-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>షెడ్యూల్ చేయండి</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(undefined, 'private')}
              className="px-3 py-2 rounded-xl bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ప్రైవేట్</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(undefined, 'hidden')}
              className="px-3 py-2 rounded-xl bg-red-600/20 text-red-700 dark:text-red-300 hover:bg-red-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>దాచండి (Hide)</span>
            </button>
          </div>

          {/* Primary Action: Publish / Save */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              రద్దు
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('published', 'public')}
              className="px-5 py-2 rounded-xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>సేవ్ అవుతోంది...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ఇప్పుడే ప్రచురించండి (Publish Now)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
