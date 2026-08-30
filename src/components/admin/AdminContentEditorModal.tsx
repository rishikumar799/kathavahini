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
  Lightbulb
} from 'lucide-react';
import { Story, Novel, Episode, Joke, KnowledgeArticle, StoryCategory, ContentStatus, ContentVisibility } from '../../types';

export type ContentEditorType = 'story' | 'novel' | 'episode' | 'joke' | 'knowledge';

interface AdminContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ContentEditorType;
  initialData?: any;
  novelsList?: Novel[];
  onSaveStory: (data: any) => Promise<void>;
  onSaveNovel: (data: any) => Promise<void>;
  onSaveEpisode: (data: any) => Promise<void>;
  onSaveJoke: (data: any) => Promise<void>;
  onSaveKnowledge: (data: any) => Promise<void>;
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
  initialType = 'story',
  initialData = null,
  novelsList = [],
  onSaveStory,
  onSaveNovel,
  onSaveEpisode,
  onSaveJoke,
  onSaveKnowledge,
}) => {
  const [contentType, setContentType] = useState<ContentEditorType>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Fields
  const [title, setTitle] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('జీవితం');
  const [coverImage, setCoverImage] = useState('');
  const [authorName, setAuthorName] = useState('కథావాహిని సంపాదకులు');
  const [status, setStatus] = useState<ContentStatus>('published');
  const [visibility, setVisibility] = useState<ContentVisibility>('public');
  const [scheduledAt, setScheduledAt] = useState('');
  const [tagsInput, setTagsInput] = useState('తెలుగు, కథ');

  // Story Fields
  const [excerpt, setExcerpt] = useState('');
  const [teluguExcerpt, setTeluguExcerpt] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>(['']);

  // Novel Fields
  const [novelDescription, setNovelDescription] = useState('');
  const [novelTeluguDescription, setNovelTeluguDescription] = useState('');

  // Episode Fields
  const [selectedNovelId, setSelectedNovelId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeContent, setEpisodeContent] = useState<string[]>(['']);

  // Joke Fields
  const [jokeContent, setJokeContent] = useState('');
  const [jokeTeluguContent, setJokeTeluguContent] = useState('');

  // Knowledge Fields
  const [knowledgeSummary, setKnowledgeSummary] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState<string[]>(['']);

  useEffect(() => {
    if (initialType) setContentType(initialType);
    if (initialData) {
      setTitle(initialData.title || '');
      setTeluguTitle(initialData.teluguTitle || initialData.title || '');
      setCategory(initialData.category || 'జీవితం');
      setCoverImage(initialData.coverImage || '');
      setAuthorName(initialData.authorName || initialData.author?.name || 'కథావాహిని సంపాదకులు');
      setStatus(initialData.status || 'published');
      setVisibility(initialData.visibility || 'public');
      setScheduledAt(initialData.scheduledAt || '');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : 'తెలుగు, కథ');

      if (initialType === 'story') {
        setExcerpt(initialData.excerpt || '');
        setTeluguExcerpt(initialData.teluguExcerpt || initialData.excerpt || '');
        setParagraphs(Array.isArray(initialData.content) && initialData.content.length > 0 ? initialData.content : ['']);
      } else if (initialType === 'novel') {
        setNovelDescription(initialData.description || '');
        setNovelTeluguDescription(initialData.teluguDescription || initialData.description || '');
      } else if (initialType === 'episode') {
        setSelectedNovelId(initialData.novelId || '');
        setEpisodeNumber(initialData.episodeNumber || 1);
        setEpisodeContent(Array.isArray(initialData.content) && initialData.content.length > 0 ? initialData.content : ['']);
      } else if (initialType === 'joke') {
        setJokeContent(initialData.content || '');
        setJokeTeluguContent(initialData.teluguContent || initialData.content || '');
      } else if (initialType === 'knowledge') {
        setKnowledgeSummary(initialData.summary || '');
        setKnowledgeContent(Array.isArray(initialData.content) && initialData.content.length > 0 ? initialData.content : ['']);
      }
    } else {
      // Reset defaults
      setTitle('');
      setTeluguTitle('');
      setCategory('జీవితం');
      setCoverImage('');
      setAuthorName('కథావాహిని సంపాదకులు');
      setStatus('published');
      setVisibility('public');
      setScheduledAt('');
      setTagsInput('తెలుగు, కథ');
      setExcerpt('');
      setTeluguExcerpt('');
      setParagraphs(['']);
      setNovelDescription('');
      setNovelTeluguDescription('');
      setSelectedNovelId(novelsList[0]?.id || '');
      setEpisodeNumber(1);
      setEpisodeContent(['']);
      setJokeContent('');
      setJokeTeluguContent('');
      setKnowledgeSummary('');
      setKnowledgeContent(['']);
    }
  }, [isOpen, initialType, initialData, novelsList]);

  if (!isOpen) return null;

  const handleAddParagraph = () => {
    setParagraphs(prev => [...prev, '']);
  };

  const handleUpdateParagraph = (index: number, val: string) => {
    setParagraphs(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveParagraph = (index: number) => {
    if (paragraphs.length <= 1) return;
    setParagraphs(prev => prev.filter((_, i) => i !== index));
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
        const filteredParas = paragraphs.filter(p => p.trim().length > 0);
        if (filteredParas.length === 0) {
          throw new Error('దయచేసి కథ కంటెంట్ రాయండి');
        }

        await onSaveStory({
          id: initialData?.id,
          title: title || teluguTitle,
          teluguTitle: teluguTitle || title,
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: excerpt || teluguExcerpt || filteredParas[0]?.slice(0, 120),
          teluguExcerpt: teluguExcerpt || excerpt || filteredParas[0]?.slice(0, 120),
          content: filteredParas,
          tags,
          authorName,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        });
      } else if (contentType === 'novel') {
        if (!teluguTitle.trim() && !title.trim()) {
          throw new Error('దయచేసి నవల శీర్షికను నమోదు చేయండి');
        }
        await onSaveNovel({
          id: initialData?.id,
          title: title || teluguTitle,
          teluguTitle: teluguTitle || title,
          description: novelDescription || novelTeluguDescription,
          teluguDescription: novelTeluguDescription || novelDescription,
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          tags,
          authorName,
          status: finalStatus === 'published' ? 'ongoing' : finalStatus,
          visibility: finalVisibility,
        });
      } else if (contentType === 'episode') {
        if (!selectedNovelId) {
          throw new Error('దయచేసి నవలను ఎంచుకోండి');
        }
        const filteredParas = episodeContent.filter(p => p.trim().length > 0);
        if (filteredParas.length === 0) {
          throw new Error('దయచేసి ఎపిసోడ్ కంటెంట్ రాయండి');
        }
        const selectedNovel = novelsList.find(n => n.id === selectedNovelId);
        await onSaveEpisode({
          id: initialData?.id,
          novelId: selectedNovelId,
          novelTitle: selectedNovel?.teluguTitle || selectedNovel?.title || 'నవల',
          episodeNumber,
          title: title || `ఎపిసోడ్ ${episodeNumber}`,
          teluguTitle: teluguTitle || `భాగం ${episodeNumber}`,
          content: filteredParas,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        });
      } else if (contentType === 'joke') {
        const text = jokeTeluguContent || jokeContent;
        if (!text.trim()) {
          throw new Error('దయచేసి జోక్ కంటెంట్ రాయండి');
        }
        await onSaveJoke({
          id: initialData?.id,
          content: jokeContent || jokeTeluguContent,
          teluguContent: jokeTeluguContent || jokeContent,
          category: category || 'హాస్యం',
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        });
      } else if (contentType === 'knowledge') {
        if (!teluguTitle.trim() && !title.trim()) {
          throw new Error('దయచేసి శీర్షికను నమోదు చేయండి');
        }
        const filteredParas = knowledgeContent.filter(p => p.trim().length > 0);
        await onSaveKnowledge({
          id: initialData?.id,
          title: title || teluguTitle,
          teluguTitle: teluguTitle || title,
          category: category || 'సాహిత్యం',
          summary: knowledgeSummary || filteredParas[0]?.slice(0, 100),
          content: filteredParas.length > 0 ? filteredParas : [knowledgeSummary],
          tags,
          coverImage,
          authorName,
          status: finalStatus,
          visibility: finalVisibility,
          scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'సేవ్ చేయడంలో విఫలమైంది');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#121118]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center font-bold">
              {contentType === 'story' && <BookOpen className="w-5 h-5" />}
              {contentType === 'novel' && <Bookmark className="w-5 h-5" />}
              {contentType === 'episode' && <Layers className="w-5 h-5" />}
              {contentType === 'joke' && <Smile className="w-5 h-5" />}
              {contentType === 'knowledge' && <Lightbulb className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-telugu">
                {initialData ? 'కంటెంట్‌ను సవరించండి (Edit Content)' : 'కొత్త కంటెంట్ సృష్టించండి (Admin CMS)'}
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                పరిమితులు లేని అడ్మిన్ పబ్లిషింగ్ & లైఫ్‌సైకిల్ కంట్రోల్స్
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6F6970] dark:text-[#A29CA6] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector (Only on New) */}
        {!initialData && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-[#E8E1DA] dark:border-[#26242E] bg-white dark:bg-[#18181F] overflow-x-auto">
            <span className="text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] uppercase shrink-0">రకం:</span>
            <button
              onClick={() => setContentType('story')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                contentType === 'story' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              కథ (Story)
            </button>
            <button
              onClick={() => setContentType('novel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                contentType === 'novel' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              నవల (Novel)
            </button>
            <button
              onClick={() => setContentType('episode')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                contentType === 'episode' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              ఎపిసోడ్ (Episode)
            </button>
            <button
              onClick={() => setContentType('joke')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                contentType === 'joke' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              జోక్ (Joke)
            </button>
            <button
              onClick={() => setContentType('knowledge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                contentType === 'knowledge' ? 'bg-[#7A284B] text-white shadow-sm' : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6]'
              }`}
            >
              సాహిత్య విజ్ఞానం (Knowledge)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Type: Story or Knowledge or Novel Title */}
          {contentType !== 'joke' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">
                  తెలుగు శీర్షిక (Telugu Title) *
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
                  నవలను ఎంచుకోండి (Select Novel) *
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

          {/* Metadata Row: Category, Author Name, Cover Image */}
          {contentType !== 'joke' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-xs font-bold mb-1">కవర్ ఫోటో URL (Cover Image)</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Lifecycle & Scheduling Control Bar */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#6F6970] dark:text-[#A29CA6]">
                లైఫ్‌సైకిల్ & గోప్యతా సెట్టింగ్స్ (Lifecycle Controls)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
                Admin Override Active
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

          {/* Story Specific: Excerpt & Multi-Paragraph Content */}
          {contentType === 'story' && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">
                  కథ పరిచయం / సంక్షిప్తం (Excerpt / Summary)
                </label>
                <textarea
                  rows={2}
                  value={teluguExcerpt}
                  onChange={e => setTeluguExcerpt(e.target.value)}
                  placeholder="కథ యొక్క ముఖ్యమైన సారాంశం (హోమ్‌పేజీ కార్డులపై కనిపిస్తుంది)..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-serif-telugu">
                    కథ పేరాలు (Story Paragraphs) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="flex items-center gap-1 text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>మరో పేరా జోడించండి</span>
                  </button>
                </div>

                {paragraphs.map((p, idx) => (
                  <div key={idx} className="relative">
                    <textarea
                      rows={4}
                      value={p}
                      onChange={e => handleUpdateParagraph(idx, e.target.value)}
                      placeholder={`పేరా ${idx + 1}...`}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs leading-relaxed font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                    {paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        className="absolute right-3 top-3 p-1 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Novel Specific: Description */}
          {contentType === 'novel' && (
            <div>
              <label className="block text-xs font-bold mb-1 font-serif-telugu">
                నవల పరిచయం & కథా నేపథ్యం (Novel Description) *
              </label>
              <textarea
                rows={5}
                value={novelTeluguDescription}
                onChange={e => setNovelTeluguDescription(e.target.value)}
                placeholder="నవల యొక్క పూర్తి పరిచయం..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>
          )}

          {/* Episode Specific: Content */}
          {contentType === 'episode' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold font-serif-telugu">
                ఎపిసోడ్ కంటెంట్ (Episode Content) *
              </label>
              {episodeContent.map((p, idx) => (
                <div key={idx} className="relative">
                  <textarea
                    rows={4}
                    value={p}
                    onChange={e => {
                      const next = [...episodeContent];
                      next[idx] = e.target.value;
                      setEpisodeContent(next);
                    }}
                    placeholder={`పేరా ${idx + 1}...`}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEpisodeContent(prev => [...prev, ''])}
                className="flex items-center gap-1 text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>మరో పేరా జోడించండి</span>
              </button>
            </div>
          )}

          {/* Joke Specific: Content */}
          {contentType === 'joke' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 font-serif-telugu">
                  తెలుగు జోక్ కంటెంట్ (Telugu Joke Content) *
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
                  పూర్తి వ్యాస వివరణ (Detailed Content) *
                </label>
                <textarea
                  rows={6}
                  value={knowledgeContent[0] || ''}
                  onChange={e => setKnowledgeContent([e.target.value])}
                  placeholder="వ్యాస సమాచారం..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
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
