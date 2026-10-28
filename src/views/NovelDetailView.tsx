import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Star, Bookmark, Play, Clock, Calendar, Share2, Layers } from 'lucide-react';
import { Novel, Chapter, Episode, Author } from '../types';
import { novelService } from '../services/novelService';
import { shareContent } from '../utils/shareUtils';
import { resolveAvatarUrl } from '../utils/avatarUtils';
import { resolveContentAuthor, getAuthorDisplayName } from '../utils/authorResolver';

interface NovelDetailViewProps {
  novel: Novel;
  onBack: () => void;
  onSelectChapter: (
    novel: Novel, 
    chapter: Chapter | Episode, 
    episodeIndex: number, 
    allEpisodes: (Chapter | Episode)[]
  ) => void;
  onBookmarkToggle: (novelId: string) => void;
  onSelectAuthor?: (author: Author) => void;
}

export const NovelDetailView: React.FC<NovelDetailViewProps> = ({
  novel,
  onBack,
  onSelectChapter,
  onBookmarkToggle,
  onSelectAuthor,
}) => {
  const [episodes, setEpisodes] = useState<(Chapter | Episode)[]>(novel.chapters || []);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(true);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const resolvedAuthor = resolveContentAuthor(novel);
  const authorAvatar = resolveAvatarUrl(resolvedAuthor.avatar, resolvedAuthor.teluguName || resolvedAuthor.name);
  const authorName = getAuthorDisplayName(resolvedAuthor);

  useEffect(() => {
    let isMounted = true;
    setLoadingEpisodes(true);

    novelService.getEpisodesForNovel(novel.id)
      .then((fetchedEpisodes) => {
        if (!isMounted) return;
        if (fetchedEpisodes && fetchedEpisodes.length > 0) {
          // Strictly sorted ascending by episodeNumber
          const sorted = [...fetchedEpisodes].sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
          setEpisodes(sorted);
        } else if (novel.chapters && novel.chapters.length > 0) {
          const sortedChapters = [...novel.chapters].sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
          setEpisodes(sortedChapters);
        } else {
          setEpisodes([]);
        }
      })
      .catch((err) => {
        console.warn('Error fetching novel episodes:', err);
        if (novel.chapters) setEpisodes(novel.chapters);
      })
      .finally(() => {
        if (isMounted) setLoadingEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [novel.id, novel.chapters]);

  const handleShare = async () => {
    try {
      const result = await shareContent({
        contentType: 'novel',
        id: novel.id,
        title: novel.teluguTitle,
        text: novel.teluguDescription,
        coverImage: novel.coverImage,
      });

      if (result.success) {
        setShareFeedback(result.method === 'clipboard' ? 'నవల లింక్ కాపీ చేయబడింది!' : 'నవల షేర్ చేయబడింది!');
        setTimeout(() => setShareFeedback(null), 3000);
      }
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const getEpisodeNumber = (item: Chapter | Episode, index: number): number => {
    if ('episodeNumber' in item && typeof item.episodeNumber === 'number') {
      return item.episodeNumber;
    }
    if ('chapterNumber' in item && typeof item.chapterNumber === 'number') {
      return item.chapterNumber;
    }
    return index + 1;
  };

  return (
    <div className="space-y-10 pb-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>నవలల జాబితాకు</span>
      </button>

      {/* Novel Header Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-[#FAF7F2] dark:bg-[#222229]">
          <img src={novel.coverImage} alt={novel.teluguTitle} className="w-full h-full object-cover" />
          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
            novel.status === 'ongoing' ? 'bg-[#D99A3D]' : 'bg-[#3E8065]'
          }`}>
            {novel.status === 'ongoing' ? 'కొనసాగుతోంది' : 'పూర్తయింది'}
          </span>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591]">
              {novel.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mt-1">
              {novel.teluguTitle}
            </h1>
            <p className="text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] mt-2 leading-relaxed">
              {novel.teluguDescription}
            </p>
          </div>

          <div 
            onClick={() => onSelectAuthor && onSelectAuthor(resolvedAuthor)}
            className={`inline-flex items-center justify-center md:justify-start gap-3 p-1.5 pr-4 rounded-full bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] ${
              onSelectAuthor ? 'cursor-pointer hover:border-[#7A284B] transition-colors' : ''
            }`}
          >
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = resolveAvatarUrl(null, authorName);
              }}
            />
            <span className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">{authorName}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
            <span className="flex items-center gap-1 font-bold text-[#17151A] dark:text-[#F7F3EE]">
              <Star className="w-4 h-4 text-[#D99A3D] fill-[#D99A3D]" />
              {novel.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 font-bold text-[#7A284B] dark:text-[#D87591]">
              <Layers className="w-4 h-4" />
              {episodes.length} భాగాలు (Episodes)
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              తాజా నవీకరణ: {novel.updatedAt || novel.publishedAt}
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 relative">
            {episodes.length > 0 && (
              <button
                onClick={() => onSelectChapter(novel, episodes[0], 0, episodes)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white font-bold text-sm shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>నవల ప్రారంభించండి (1వ భాగం)</span>
              </button>
            )}

            <button
              onClick={() => onBookmarkToggle(novel.id)}
              className={`p-3 rounded-full border transition-colors cursor-pointer ${
                novel.isBookmarked ? 'bg-[#D99A3D]/20 border-[#D99A3D] text-[#D99A3D]' : 'border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE]'
              }`}
              title="దాచుకోండి"
            >
              <Bookmark className={`w-5 h-5 ${novel.isBookmarked ? 'fill-[#D99A3D]' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
              title="నవలను షేర్ చేయండి"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {shareFeedback && (
              <div className="absolute -top-10 left-1/2 md:left-48 -translate-x-1/2 md:translate-x-0 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-fade-in whitespace-nowrap">
                ✓ {shareFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapters / Episodes List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            క్రమానుగత ఎపిసోడ్లు / భాగాలు ({episodes.length})
          </h2>
          <span className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            1వ భాగం నుండి వరుస క్రమంలో
          </span>
        </div>

        {loadingEpisodes && episodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6F6970] dark:text-[#A29CA6]">
            ఎపిసోడ్లను లోడ్ చేస్తోంది...
          </div>
        ) : episodes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-center text-sm font-serif-telugu text-[#6F6970] dark:text-[#A29CA6]">
            ఈ నవలకు ఇంకా ఎపిసోడ్లు ప్రచురించబడలేదు.
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((ep, idx) => {
              const epNum = getEpisodeNumber(ep, idx);
              return (
                <div
                  key={ep.id || `ep-${idx}`}
                  onClick={() => onSelectChapter(novel, ep, idx, episodes)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between hover:border-[#7A284B] dark:hover:border-[#D87591] transition-all cursor-pointer group shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-center text-xs font-bold text-[#7A284B] dark:text-[#D87591] group-hover:bg-[#7A284B] group-hover:text-white transition-colors">
                      {epNum}
                    </span>
                    <div>
                      <h3 className="font-bold font-serif-telugu text-base text-[#17151A] dark:text-[#F7F3EE] group-hover:text-[#7A284B] dark:group-hover:text-[#D87591] transition-colors">
                        {ep.teluguTitle || `${epNum}వ భాగం`}
                      </h3>
                      <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                        {ep.readingTimeMinutes || 5} నిమిషాల చదువు • ప్రచురణ: {ep.publishedAt || novel.publishedAt}
                      </p>
                    </div>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-bold text-[#7A284B] dark:text-[#D87591] bg-[#FAF7F2] dark:bg-[#222229] group-hover:bg-[#7A284B] group-hover:text-white transition-colors">
                    చదవండి →
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
