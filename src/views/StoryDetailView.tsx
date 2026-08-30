import React from 'react';
import { 
  BookOpen, Star, Eye, Heart, Bookmark, Share2, Clock, Calendar, ArrowLeft, Play, UserPlus, UserCheck 
} from 'lucide-react';
import { Story, Author } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { StoryCard } from '../components/cards/StoryCard';

interface StoryDetailViewProps {
  story: Story;
  relatedStories: Story[];
  onStartReading: (story: Story) => void;
  onSelectAuthor: (author: Author) => void;
  onSelectStory: (story: Story) => void;
  onBack: () => void;
  onBookmarkToggle: (storyId: string) => void;
  onLikeToggle: (storyId: string) => void;
  onFollowAuthorToggle: (authorId: string) => void;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  story,
  relatedStories,
  onStartReading,
  onSelectAuthor,
  onSelectStory,
  onBack,
  onBookmarkToggle,
  onLikeToggle,
  onFollowAuthorToggle,
}) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.teluguTitle,
        text: story.teluguExcerpt,
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>వెనక్కి వెళ్లండి</span>
      </button>

      {/* Main Cover & Metadata Header */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Cover Artwork */}
        <div className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#FAF7F2] dark:bg-[#222229]">
          <img
            src={story.coverImage}
            alt={story.teluguTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-[#7A284B] shadow-md">
            {story.category}
          </span>
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

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{story.publishedAt}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
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
              className={`p-3.5 rounded-full border transition-colors cursor-pointer ${
                story.isLiked
                  ? 'bg-red-500/20 border-red-500 text-red-500'
                  : 'border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2]'
              }`}
              title="లైక్ చేయండి"
            >
              <Heart className={`w-5 h-5 ${story.isLiked ? 'fill-red-500' : ''}`} />
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
    </div>
  );
};
