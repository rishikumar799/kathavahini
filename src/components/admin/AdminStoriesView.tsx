import React, { useState } from 'react';
import {
  Library,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Search,
  Eye,
  Check,
  X,
  BookOpen,
  User as UserIcon,
  Tag,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Lock,
  EyeOff,
  Calendar,
  Globe
} from 'lucide-react';
import { Story, StoryCategory, ContentStatus, ContentVisibility } from '../../types';

interface AdminStoriesViewProps {
  stories: Story[];
  onApprove: (story: Story) => void;
  onReject: (story: Story, reason: string) => void;
  onArchive: (story: Story) => void;
  onDeleteStory: (story: Story) => void;
  onEditStory: (story: Story) => void;
  onPublishNow: (story: Story) => void;
  onSetVisibility: (story: Story, visibility: ContentVisibility) => void;
  onCreateNewStory: () => void;
  actionLoading: boolean;
  selectedStoryForPreview: Story | null;
  onOpenPreview: (story: Story) => void;
  onClosePreview: () => void;
}

export const AdminStoriesView: React.FC<AdminStoriesViewProps> = ({
  stories,
  onApprove,
  onReject,
  onArchive,
  onDeleteStory,
  onEditStory,
  onPublishNow,
  onSetVisibility,
  onCreateNewStory,
  actionLoading,
  selectedStoryForPreview,
  onOpenPreview,
  onClosePreview,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'draft' | 'scheduled' | 'rejected' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rejectModalStory, setRejectModalStory] = useState<Story | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteConfirmStory, setDeleteConfirmStory] = useState<Story | null>(null);

  const filtered = stories.filter(story => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && story.status === 'pending') ||
      (filter === 'published' && story.status === 'published') ||
      (filter === 'draft' && story.status === 'draft') ||
      (filter === 'scheduled' && story.status === 'scheduled') ||
      (filter === 'rejected' && story.status === 'rejected') ||
      (filter === 'archived' && story.status === 'archived');

    const matchesCategory = categoryFilter === 'all' || story.category === categoryFilter;
    const titleMatch = (story.teluguTitle || story.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = (story.authorName || story.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesCategory && (titleMatch || authorMatch);
  });

  const handleConfirmReject = () => {
    if (!rejectModalStory || !rejectionReason.trim()) return;
    onReject(rejectModalStory, rejectionReason.trim());
    setRejectModalStory(null);
    setRejectionReason('');
    if (selectedStoryForPreview?.id === rejectModalStory.id) {
      onClosePreview();
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmStory) return;
    onDeleteStory(deleteConfirmStory);
    setDeleteConfirmStory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            కథల నిర్వహణ (Stories Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            అపరిమిత కథల సృష్టి, సవరణ, షెడ్యూలింగ్, ప్రచురణ మరియు గోప్యతా నియంత్రణలు
          </p>
        </div>

        <button
          onClick={onCreateNewStory}
          className="px-4 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త కథను సృష్టించండి (Create Story)</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="కథ శీర్షిక లేదా రచయిత పేరుతో శోధించండి..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
            >
              <option value="all">అన్ని కేటగిరీలు</option>
              <option value="జీవితం">జీవితం</option>
              <option value="కుటుంబం">కుటుంబం</option>
              <option value="ప్రేమ">ప్రేమ</option>
              <option value="హాస్యం">హాస్యం</option>
              <option value="గ్రామీణ కథలు">గ్రామీణ కథలు</option>
              <option value="ఆధ్యాత్మికం">ఆధ్యాత్మికం</option>
              <option value="రహస్యం">రహస్యం</option>
              <option value="పిల్లల కథలు">పిల్లల కథలు</option>
              <option value="సాహిత్యం">సాహిత్యం</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#7A284B] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            అన్నీ ({stories.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'published'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            ప్రచురితమైనవి ({stories.filter(s => s.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            సమీక్షలో ఉన్నవి ({stories.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'draft'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            డ్రాఫ్ట్‌లు ({stories.filter(s => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'scheduled'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            షెడ్యూల్డ్ ({stories.filter(s => s.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            తిరస్కరించినవి ({stories.filter(s => s.status === 'rejected').length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'archived'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#121118] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            ఆర్కైవ్ ({stories.filter(s => s.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Stories Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <Library className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎలాంటి కథలు లేవు
            </p>
            <p>ఎంచుకున్న ఫిల్టర్‌కు సరిపోయే కథలు లేవు.</p>
          </div>
        ) : (
          filtered.map(story => {
            const isPending = story.status === 'pending';
            const isPublished = story.status === 'published';
            const isDraft = story.status === 'draft';
            const isScheduled = story.status === 'scheduled';
            const isRejected = story.status === 'rejected';
            const isArchived = story.status === 'archived';
            const isPrivate = story.visibility === 'private';
            const isHidden = story.visibility === 'hidden';

            return (
              <div
                key={story.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm hover:border-[#7A284B]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Story Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={story.coverImage}
                    alt={story.teluguTitle}
                    className="w-16 h-20 rounded-2xl object-cover shrink-0 shadow-sm border border-[#E8E1DA] dark:border-[#26242E]"
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] border border-[#E8E1DA] dark:border-[#26242E] font-serif-telugu">
                        {story.category}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 font-serif-telugu">
                          <Clock className="w-3 h-3" />
                          సమీక్షలో ఉంది
                        </span>
                      )}
                      {isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-serif-telugu">
                          <CheckCircle2 className="w-3 h-3" />
                          ప్రచురితం
                        </span>
                      )}
                      {isDraft && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20 font-serif-telugu">
                          డ్రాఫ్ట్
                        </span>
                      )}
                      {isScheduled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1 font-serif-telugu">
                          <Calendar className="w-3 h-3" />
                          షెడ్యూల్డ్ ({story.scheduledAt ? new Date(story.scheduledAt).toLocaleDateString() : ''})
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1 font-serif-telugu">
                          <XCircle className="w-3 h-3" />
                          తిరస్కృతం
                        </span>
                      )}
                      {isArchived && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-700/10 text-gray-700 dark:text-gray-400 border border-gray-700/20 font-serif-telugu">
                          ఆర్కైవ్
                        </span>
                      )}

                      {/* Visibility Badge */}
                      {isPrivate && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          ప్రైవేట్
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5" />
                          దాచబడింది
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                      {story.teluguTitle || story.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6F6970] dark:text-[#A29CA6]">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="font-serif-telugu font-semibold">
                          {story.authorName || story.author?.name || 'రచయిత'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{story.readingTimeMinutes || 3} నిమి. చదువు</span>
                      {story.publishedAt && (
                        <>
                          <span>•</span>
                          <span>ప్రచురణ: {story.publishedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E1DA] dark:border-[#26242E]">
                  {/* Preview Button */}
                  <button
                    onClick={() => onOpenPreview(story)}
                    className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] hover:bg-[#E8E1DA] dark:hover:bg-[#26242E] text-[#17151A] dark:text-[#F7F3EE] transition-all cursor-pointer"
                    title="పూర్తి కథను ప్రివ్యూ చేయండి"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEditStory(story)}
                    className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] hover:bg-[#E8E1DA] dark:hover:bg-[#26242E] text-[#7A284B] dark:text-[#D87591] transition-all cursor-pointer"
                    title="కథను సవరించండి (Edit)"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Publish Now Button (if not published) */}
                  {!isPublished && (
                    <button
                      onClick={() => onPublishNow(story)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ప్రచురించు</span>
                    </button>
                  )}

                  {/* Pending Approval Controls */}
                  {isPending && (
                    <>
                      <button
                        onClick={() => onApprove(story)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ఆమోదించు</span>
                      </button>
                      <button
                        onClick={() => setRejectModalStory(story)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>తిరస్కరించు</span>
                      </button>
                    </>
                  )}

                  {/* Visibility Toggles */}
                  {isHidden ? (
                    <button
                      onClick={() => onSetVisibility(story, 'public')}
                      className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] hover:bg-[#E8E1DA] dark:hover:bg-[#26242E] text-emerald-600 transition-all cursor-pointer"
                      title="పబ్లిక్ చేయండి (Unhide)"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSetVisibility(story, 'hidden')}
                      className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] hover:bg-[#E8E1DA] dark:hover:bg-[#26242E] text-[#6F6970] hover:text-red-500 transition-all cursor-pointer"
                      title="దాచండి (Hide from public)"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}

                  {/* Archive Button */}
                  {!isArchived && (
                    <button
                      onClick={() => onArchive(story)}
                      className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] hover:bg-[#E8E1DA] dark:hover:bg-[#26242E] text-[#6F6970] hover:text-[#17151A] dark:hover:text-white transition-all cursor-pointer"
                      title="ఆర్కైవ్ చేయండి"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmStory(story)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all cursor-pointer"
                    title="కథను శాశ్వతంగా తొలగించండి"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Story Preview Modal */}
      {selectedStoryForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1DA] dark:border-[#26242E] pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#7A284B] dark:text-[#D87591]" />
                <h3 className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  కథ సమీక్ష & ప్రివ్యూ
                </h3>
              </div>
              <button
                onClick={onClosePreview}
                className="p-2 rounded-xl text-[#6F6970] dark:text-[#A29CA6] hover:bg-[#FAF7F2] dark:hover:bg-[#121118] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={selectedStoryForPreview.coverImage}
                alt={selectedStoryForPreview.teluguTitle}
                className="w-full h-56 rounded-2xl object-cover shadow-sm"
              />

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F2] dark:bg-[#121118] text-[#7A284B] dark:text-[#D87591] font-serif-telugu">
                  {selectedStoryForPreview.category}
                </span>
                <h1 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {selectedStoryForPreview.teluguTitle || selectedStoryForPreview.title}
                </h1>
                <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                  రచయిత: {selectedStoryForPreview.authorName || selectedStoryForPreview.author?.name}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] text-xs font-serif-telugu text-[#6F6970] dark:text-[#A29CA6] italic leading-relaxed">
                {selectedStoryForPreview.teluguExcerpt || selectedStoryForPreview.excerpt}
              </div>

              <div className="space-y-4 text-sm font-serif-telugu leading-relaxed text-[#17151A] dark:text-[#F7F3EE]">
                {selectedStoryForPreview.content.map((p, idx) => (
                  <p key={idx} className="indent-6">{p}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E8E1DA] dark:border-[#26242E] pt-4">
              <button
                onClick={onClosePreview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] hover:bg-[#FAF7F2] dark:hover:bg-[#121118] cursor-pointer"
              >
                మూసివేయి
              </button>

              {selectedStoryForPreview.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalStory(selectedStoryForPreview);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    తిరస్కరించు
                  </button>
                  <button
                    onClick={() => {
                      onApprove(selectedStoryForPreview);
                      onClosePreview();
                    }}
                    className="px-5 py-2 rounded-xl bg-[#7A284B] text-white text-xs font-bold hover:bg-[#68223F] cursor-pointer"
                  >
                    ఆమోదించి ప్రచురించు
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">కథ తిరస్కరణ కారణం నమోదు చేయండి</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              రచయితకు తెలియజేయడానికి స్పష్టమైన కారణాన్ని వ్రాయండి (ఉదా: భాషా దోషాలు, నిబంధనల ఉల్లంఘన):
            </p>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="ఉదా: కథలో మరికొన్ని భాషా సవరణలు అవసరం..."
              className="w-full p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalStory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] hover:bg-[#FAF7F2] dark:hover:bg-[#121118] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                తిరస్కరణను నిర్ధారించండి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm font-serif-telugu">కథను శాశ్వతంగా తొలగించాలా?</h3>
            </div>

            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              "{deleteConfirmStory.teluguTitle || deleteConfirmStory.title}" కథ శాశ్వతంగా డేటాబేస్ నుండి తొలగించబడుతుంది.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmStory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                రద్దు
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                అవును, తొలగించండి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
