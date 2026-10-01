import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Star, Eye, Heart, Bookmark, Share2, Clock, Calendar, ArrowLeft, Play, UserPlus, UserCheck,
  Edit3, Trash2, AlertTriangle, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Story, Author, User } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { StoryCard } from '../components/cards/StoryCard';
import { StarRating } from '../components/common/StarRating';
import { storyService } from '../services/storyService';

interface StoryDetailViewProps {
  story: Story;
  relatedStories: Story[];
  currentUser?: User | null;
  onStartReading: (story: Story) => void;
  onSelectAuthor: (author: Author) => void;
  onSelectStory: (story: Story) => void;
  onBack: () => void;
  onBookmarkToggle: (storyId: string) => void;
  onLikeToggle: (storyId: string) => void;
  onFollowAuthorToggle: (authorId: string) => void;
  onEditStory?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => Promise<void> | void;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  story,
  relatedStories,
  currentUser,
  onStartReading,
  onSelectAuthor,
  onSelectStory,
  onBack,
  onBookmarkToggle,
  onLikeToggle,
  onFollowAuthorToggle,
  onEditStory,
  onDeleteStory,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if viewer can manage/edit this story (Admin or Story Author/Writer)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'thekathavahini@gmail.com';
  const isOwnerOrAuthor = Boolean(currentUser && (
    currentUser.id === story.authorId || 
    currentUser.id === story.writerId || 
    currentUser.id === story.ownerId || 
    currentUser.id === story.author?.id
  ));
  const canManageStory = Boolean(isAdmin || isOwnerOrAuthor);

  useEffect(() => {
    if (story?.id) {
      storyService.recordStoryView(story.id);
    }
  }, [story?.id]);

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

  return (
    <div className="space-y-10 pb-16">
      {/* Back button & Owner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>వెనక్కి వెళ్లండి</span>
        </button>

        {canManageStory && (
          <div className="flex items-center gap-2">
            {onEditStory && (
              <button
                type="button"
                onClick={() => onEditStory(story)}
                className="px-4 py-2 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>కథను సవరించండి (Edit Story)</span>
              </button>
            )}

            {onDeleteStory && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-full bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>తొలగించండి (Delete)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Cover & Metadata Header */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Cover Artwork */}
        <div className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#FAF7F2] dark:bg-[#222229] group">
          <img
            src={story.coverImage}
            alt={story.teluguTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-[#7A284B] shadow-md">
            {story.category}
          </span>

          {canManageStory && onEditStory && (
            <div className="absolute bottom-4 right-4 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEditStory(story)}
                className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white backdrop-blur-md text-[11px] font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>ముఖచిత్రాన్ని మార్చండి (Edit Thumbnail)</span>
              </button>
            </div>
          )}
        </div>

        {/* Story Metadata & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-3 leading-tight">
              {story.teluguTitle}
            </h1>
            <p className="text-base font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
              {story.teluguExcerpt}
            </p>
          </div>

          {/* Author info pill */}
          <div
            onClick={() => onSelectAuthor(story.author)}
            className="inline-flex items-center gap-3 p-2 pr-4 rounded-full bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] cursor-pointer hover:border-[#7A284B] transition-colors"
          >
            <img
              src={story.author.avatar}
              alt={story.author.teluguName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                {story.author.teluguName}
              </p>
              <p className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">
                {story.author.followersCount} అనుచరులు
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center gap-1.5 font-bold text-[#17151A] dark:text-[#F7F3EE]">
              <Star className="w-4 h-4 text-[#D99A3D] fill-[#D99A3D]" />
              <span>{story.rating.toFixed(1)} రేటింగ్</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{story.readingTimeMinutes} నిమిషాల చదువు</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{story.viewCount.toLocaleString()} వీక్షణలు</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-red-500">
              <Heart className="w-4 h-4 fill-red-500" />
              <span>{story.likeCount.toLocaleString()} లైక్‌లు</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{story.publishedAt}</span>
            </div>
          </div>

          {/* Real Star Rating Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36]">
            <h4 className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] mb-2 font-serif-telugu">
              ఈ కథకు మీ రేటింగ్ ఇవ్వండి:
            </h4>
            <StarRating
              storyId={story.id}
              initialRating={story.rating}
              size="md"
              showSummary={true}
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onStartReading(story)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-base font-bold shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>కథ చదవడం ప్రారంభించండి</span>
            </button>

            <button
              onClick={() => onBookmarkToggle(story.id)}
              className={`p-3.5 rounded-full border transition-colors cursor-pointer ${
                story.isBookmarked
                  ? 'bg-[#D99A3D]/20 border-[#D99A3D] text-[#D99A3D]'
                  : 'border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2]'
              }`}
              title="దాచుకోండి"
            >
              <Bookmark className={`w-5 h-5 ${story.isBookmarked ? 'fill-[#D99A3D]' : ''}`} />
            </button>

            <button
              onClick={() => onLikeToggle(story.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border transition-colors cursor-pointer ${
                story.isLiked
                  ? 'bg-red-500/20 border-red-500 text-red-500'
                  : 'border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2]'
              }`}
              title="లైక్ చేయండి"
            >
              <Heart className={`w-5 h-5 ${story.isLiked ? 'fill-red-500' : ''}`} />
              <span className="text-xs font-bold">{story.likeCount.toLocaleString()}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              title="షేర్ చేయండి"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Author Mini Profile Section */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={story.author.avatar}
            alt={story.author.teluguName}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#7A284B]"
          />
          <div>
            <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              {story.author.teluguName}
            </h3>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] max-w-md font-sans-telugu mt-0.5">
              {story.author.teluguBio}
            </p>
          </div>
        </div>

        <button
          onClick={() => onFollowAuthorToggle(story.author.id)}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            story.author.isFollowing
              ? 'bg-[#E8E1DA] dark:bg-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE]'
              : 'bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white shadow-md'
          }`}
        >
          {story.author.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{story.author.isFollowing ? 'అనుసరిస్తున్నారు' : 'అనుసరించండి'}</span>
        </button>
      </div>

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section>
          <SectionHeader
            title="Related Stories"
            teluguTitle="ఇలాంటి ఇతర కథలు"
            subtitle="ఈ విభాగంలోని మరిన్ని ఆసక్తికరమైన రచనలు"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStories.map(rel => (
              <StoryCard
                key={rel.id}
                story={rel}
                onSelect={onSelectStory}
              />
            ))}
          </div>
        </section>
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
