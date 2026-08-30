import React, { useState } from 'react';
import { Bookmark, Clock, CheckCircle, Heart, BookOpen } from 'lucide-react';
import { Story, Novel, ReadingHistoryItem } from '../types';
import { StoryCard } from '../components/cards/StoryCard';
import { NovelCard } from '../components/cards/NovelCard';
import { EmptyState } from '../components/common/EmptyState';
import { ContinueReadingCard } from '../components/story/ContinueReadingCard';

interface LibraryViewProps {
  savedStories: Story[];
  savedNovels: Novel[];
  readingHistory: ReadingHistoryItem[];
  onSelectStory: (story: Story) => void;
  onSelectNovel: (novel: Novel) => void;
  onSelectTab: (tab: string) => void;
  onBookmarkToggle: (storyId: string, e: React.MouseEvent) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  savedStories,
  savedNovels,
  readingHistory,
  onSelectStory,
  onSelectNovel,
  onSelectTab,
  onBookmarkToggle,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'history' | 'liked'>('saved');

  const likedStories = savedStories.filter(s => s.isLiked);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] text-xs font-bold mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>వ్యక్తిగత లైబ్రరీ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          నా లైబ్రరీ
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          మీరు దాచుకున్న కథలు, చదువుతున్న పుస్తకాలు మరియు ఇష్టపడిన రచనలు
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-3">
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            activeSubTab === 'saved'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>దాచుకున్న కథలు ({savedStories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>చదువుతున్నవి ({readingHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('liked')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
            activeSubTab === 'liked'
              ? 'bg-[#7A284B] text-white shadow-sm'
              : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>లైక్ చేసినవి ({likedStories.length})</span>
        </button>
      </div>

      {/* Content based on active sub tab */}
      {activeSubTab === 'saved' && (
        <>
          {savedStories.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="w-7 h-7" />}
              title="No Saved Stories"
              teluguTitle="దాచుకున్న కథలు ఏవీ లేవు"
              description="మీకు నచ్చిన కథలను దాచుకోవడానికి కథ కార్డుపైన ఉన్న బుక్‌మార్క్ బటన్‌ను నొక్కండి."
              actionText="కథలను అన్వేషించండి"
              onAction={() => onSelectTab('stories')}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onSelect={onSelectStory}
                    onBookmarkToggle={onBookmarkToggle}
                  />
                ))}
              </div>

              {savedNovels.length > 0 && (
                <div className="pt-6 space-y-4">
                  <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                    దాచుకున్న నవలలు
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedNovels.map(novel => (
                      <NovelCard
                        key={novel.id}
                        novel={novel}
                        onSelect={onSelectNovel}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeSubTab === 'history' && (
        <>
          {readingHistory.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-7 h-7" />}
              title="No Reading History"
              teluguTitle="చదువుతున్న చరిత్ర లేదు"
              description="మీరు ఇంకా ఏ కథలను చదవడం ప్రారంభించలేదు. కొత్త కథతో మీ ప్రయాణాన్ని మొదలుపెట్టండి."
              actionText="కథలు చూడండి"
              onAction={() => onSelectTab('stories')}
            />
          ) : (
            <div className="space-y-4">
              {readingHistory.map(item => (
                <ContinueReadingCard
                  key={item.storyId}
                  story={item.story}
                  progressPercent={item.progressPercent}
                  onContinue={onSelectStory}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeSubTab === 'liked' && (
        <>
          {likedStories.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-7 h-7" />}
              title="No Liked Stories"
              teluguTitle="లైక్ చేసిన కథలు లేవు"
              description="మీ హృదయానికి నచ్చిన కథలను లైక్ చేసి మీ ఇష్టమైన జాబితాలో చేర్చుకోండి."
              actionText="కథల ప్రపంచంలోకి"
              onAction={() => onSelectTab('stories')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedStories.map(story => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onSelect={onSelectStory}
                  onBookmarkToggle={onBookmarkToggle}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
