import React, { useState } from 'react';
import { Heart, Share2, Copy, Check } from 'lucide-react';
import { Joke } from '../../types';

interface JokeCardProps {
  joke: Joke;
  onLikeToggle?: (jokeId: string) => void;
}

export const JokeCard: React.FC<JokeCardProps> = ({ joke, onLikeToggle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joke.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'తెలుగు హాస్యం - కథావాహిని',
        text: joke.content,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col bg-[#FFFFFF] dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Category Pill & Author */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2] dark:bg-[#222229] text-[#7A284B] dark:text-[#D87591] border border-[#E8E1DA] dark:border-[#2E2D36]">
          {joke.category}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <img src={joke.author.avatar} alt={joke.author.teluguName} className="w-5 h-5 rounded-full object-cover" />
          <span className="font-medium text-[#17151A] dark:text-[#F7F3EE]">{joke.author.teluguName}</span>
        </div>
      </div>

      {/* Joke Text */}
      <p className="text-base font-sans-telugu text-[#17151A] dark:text-[#F7F3EE] whitespace-pre-line leading-relaxed mb-4 flex-1">
        {joke.content}
      </p>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
        <button
          onClick={() => onLikeToggle && onLikeToggle(joke.id)}
          className="flex items-center gap-1.5 hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              joke.isLiked ? 'fill-[#7A284B] text-[#7A284B] dark:fill-[#D87591] dark:text-[#D87591]' : ''
            }`}
          />
          <span className="font-semibold">{joke.likeCount}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
            title="కాపీ చేయండి"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3E8065]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'కాపీ అయింది' : 'కాపీ'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
            title="షేర్ చేయండి"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>షేర్</span>
          </button>
        </div>
      </div>
    </div>
  );
};
