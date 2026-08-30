import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../../types';
import { StoryCard } from '../cards/StoryCard';

interface StoryCarouselProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onBookmarkToggle?: (storyId: string, e: React.MouseEvent) => void;
  onLikeToggle?: (storyId: string, e: React.MouseEvent) => void;
}

export const StoryCarousel: React.FC<StoryCarouselProps> = ({
  stories,
  onSelectStory,
  onBookmarkToggle,
  onLikeToggle,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 hidden sm:flex items-center justify-center cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 hidden sm:flex items-center justify-center cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal List */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stories.map(story => (
          <div key={story.id} className="snap-start shrink-0">
            <StoryCard
              story={story}
              onSelect={onSelectStory}
              onBookmarkToggle={onBookmarkToggle}
              onLikeToggle={onLikeToggle}
              compact={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
