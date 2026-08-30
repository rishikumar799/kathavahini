import React, { useState } from 'react';
import { ArrowLeft, Users, BookOpen, Feather, UserCheck, UserPlus, MapPin, Calendar } from 'lucide-react';
import { Author, Story, Novel } from '../types';
import { StoryCard } from '../components/cards/StoryCard';
import { NovelCard } from '../components/cards/NovelCard';

interface AuthorDetailViewProps {
  author: Author;
  authorStories: Story[];
  authorNovels: Novel[];
  onBack: () => void;
  onSelectStory: (story: Story) => void;
  onSelectNovel: (novel: Novel) => void;
  onFollowToggle: (authorId: string) => void;
}

export const AuthorDetailView: React.FC<AuthorDetailViewProps> = ({
  author,
  authorStories,
  authorNovels,
  onBack,
  onSelectStory,
  onSelectNovel,
  onFollowToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'stories' | 'novels'>('stories');

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>రచయితల జాబితాకు</span>
      </button>

      {/* Author Banner & Header */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden shadow-xl">
        {/* Cover Image Banner */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-[#15131A] to-[#211B28] relative">
          {author.coverImage && (
            <img src={author.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* Profile Details Container */}
        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <img
              src={author.avatar}
              alt={author.teluguName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white dark:ring-[#18181D] shadow-2xl shrink-0"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {author.teluguName}
                </h1>
                {author.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-[#7A284B] text-white text-[10px] font-bold">
                    ✓ ధృవీకరించబడింది
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                {author.name} • {author.location || 'ఆంధ్రప్రదేశ్'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onFollowToggle(author.id)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
              author.isFollowing
                ? 'bg-[#E8E1DA] dark:bg-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE]'
                : 'bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white shadow-md'
            }`}
          >
            {author.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{author.isFollowing ? 'అనుసరిస్తున్నారు' : 'అనుసరించండి'}</span>
          </button>
        </div>

        {/* Bio & Stats */}
        <div className="p-6 sm:p-8 pt-0 border-t border-[#E8E1DA] dark:border-[#2E2D36] mt-4">
          <p className="text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] max-w-3xl leading-relaxed mb-6">
            {author.teluguBio}
          </p>

          <div className="flex flex-wrap items-center gap-8 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
            <div className="flex items-center gap-1.5 font-bold text-[#17151A] dark:text-[#F7F3EE]">
              <Users className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
              <span>{author.followersCount.toLocaleString()} అనుచరులు</span>
            </div>

            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{author.storiesCount} కథలు</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-[#D99A3D]" />
              <span>{author.novelsCount} నవలలు</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>చేరిన సంవత్సరం: {author.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Author Works Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-3">
          <button
            onClick={() => setActiveTab('stories')}
            className={`text-base font-bold font-serif-telugu transition-colors cursor-pointer pb-1 border-b-2 ${
              activeTab === 'stories'
                ? 'border-[#7A284B] text-[#7A284B] dark:border-[#D87591] dark:text-[#D87591]'
                : 'border-transparent text-[#6F6970] hover:text-[#17151A]'
            }`}
          >
            ప్రచురించిన కథలు ({authorStories.length})
          </button>

          <button
            onClick={() => setActiveTab('novels')}
            className={`text-base font-bold font-serif-telugu transition-colors cursor-pointer pb-1 border-b-2 ${
              activeTab === 'novels'
                ? 'border-[#7A284B] text-[#7A284B] dark:border-[#D87591] dark:text-[#D87591]'
                : 'border-transparent text-[#6F6970] hover:text-[#17151A]'
            }`}
          >
            నవలలు ({authorNovels.length})
          </button>
        </div>

        {activeTab === 'stories' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onSelect={onSelectStory}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorNovels.map(novel => (
              <NovelCard
                key={novel.id}
                novel={novel}
                onSelect={onSelectNovel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
