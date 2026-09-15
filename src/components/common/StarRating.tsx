import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';
import { ratingService, StoryRatingData } from '../../services/ratingService';

interface StarRatingProps {
  storyId: string;
  initialRating?: number;
  initialCount?: number;
  currentUserId?: string;
  currentUserName?: string;
  size?: 'sm' | 'md' | 'lg';
  showSummary?: boolean;
  onRatingSubmitted?: (newAverage: number, newCount: number) => void;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'సరిపోదు (1/5)',
  2: 'పర్వాలేదు (2/5)',
  3: 'బాగుంది (3/5)',
  4: 'చాలా బాగుంది (4/5)',
  5: 'అత్యద్భుతం! (5/5)',
};

export const StarRating: React.FC<StarRatingProps> = ({
  storyId,
  initialRating = 5.0,
  initialCount = 18,
  currentUserId,
  currentUserName,
  size = 'md',
  showSummary = true,
  onRatingSubmitted,
  className = '',
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [ratingData, setRatingData] = useState<StoryRatingData>({
    averageRating: initialRating,
    ratingsCount: initialCount,
    userRating: 0,
    hasRated: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    ratingService.getStoryRating(storyId, currentUserId).then(data => {
      if (isMounted) {
        setRatingData(data);
      }
    });

    const handleRatingEvent = (e: any) => {
      if (e.detail?.storyId === storyId) {
        setRatingData(prev => ({
          ...prev,
          averageRating: e.detail.rating,
          ratingsCount: e.detail.ratingsCount,
          userRating: e.detail.userRating || prev.userRating,
          hasRated: true,
        }));
      }
    };

    window.addEventListener('kathavahini:story-rated', handleRatingEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('kathavahini:story-rated', handleRatingEvent);
    };
  }, [storyId, currentUserId]);

  const handleRate = async (starValue: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await ratingService.rateStory(storyId, starValue, currentUserId, currentUserName);
      setRatingData(updated);
      setShowSuccessBadge(true);
      if (onRatingSubmitted) {
        onRatingSubmitted(updated.averageRating, updated.ratingsCount);
      }
      setTimeout(() => setShowSuccessBadge(false), 3500);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const starSizeClass = size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  const activeStarValue = hoveredStar || ratingData.userRating || 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Interactive Stars Section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeStarValue;
          return (
            <button
              key={star}
              type="button"
              id={`star-btn-${storyId}-${star}`}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={isSubmitting}
              className={`p-1 rounded-lg transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ${
                isSubmitting ? 'opacity-50 cursor-wait' : ''
              }`}
              title={`${star} నక్షత్రాల రేటింగ్ ఇవ్వండి`}
            >
              <Star
                className={`${starSizeClass} transition-colors ${
                  isFilled
                    ? 'text-[#D99A3D] fill-[#D99A3D] filter drop-shadow-sm'
                    : 'text-[#C9C2BA] dark:text-[#52505C] hover:text-[#D99A3D]'
                }`}
              />
            </button>
          );
        })}

        {/* Dynamic Label for Hover or Current Choice */}
        <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] ml-2 min-w-[110px]">
          {hoveredStar ? RATING_LABELS[hoveredStar] : ratingData.userRating > 0 ? `మీ రేటింగ్: ${ratingData.userRating} ★` : 'రేటింగ్ ఇవ్వండి'}
        </span>
      </div>

      {/* Instant Success Feedback Message */}
      {showSuccessBadge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3E8065]/10 text-[#3E8065] dark:bg-[#3E8065]/20 dark:text-[#52B28B] animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>మీ రేటింగ్ సేవ్ చేయబడింది! ధన్యవాదాలు.</span>
        </div>
      )}

      {/* Aggregate Rating Summary */}
      {showSummary && (
        <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <div className="flex items-center gap-1 font-bold text-[#17151A] dark:text-[#F7F3EE]">
            <Sparkles className="w-3.5 h-3.5 text-[#D99A3D]" />
            <span>సగటు: {ratingData.averageRating.toFixed(1)} / 5.0</span>
          </div>
          <span>•</span>
          <span>{ratingData.ratingsCount.toLocaleString()} మంది పాఠకుల సమీక్షలు</span>
        </div>
      )}
    </div>
  );
};
