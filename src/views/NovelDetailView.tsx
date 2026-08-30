import React from 'react';
import { ArrowLeft, BookOpen, Star, Bookmark, Play, Clock, Calendar } from 'lucide-react';
import { Novel, Chapter } from '../types';

interface NovelDetailViewProps {
  novel: Novel;
  onBack: () => void;
  onSelectChapter: (novel: Novel, chapter: Chapter) => void;
  onBookmarkToggle: (novelId: string) => void;
}

export const NovelDetailView: React.FC<NovelDetailViewProps> = ({
  novel,
  onBack,
  onSelectChapter,
  onBookmarkToggle,
}) => {
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
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start">
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

          <div className="flex items-center justify-center md:justify-start gap-3">
            <img src={novel.author.avatar} alt={novel.author.teluguName} className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">{novel.author.teluguName}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
            <span className="flex items-center gap-1 font-bold text-[#17151A] dark:text-[#F7F3EE]">
              <Star className="w-4 h-4 text-[#D99A3D] fill-[#D99A3D]" />
              {novel.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 font-bold text-[#7A284B] dark:text-[#D87591]">
              <BookOpen className="w-4 h-4" />
              {novel.chapters.length} అధ్యాయాలు
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              తాజా నవీకరణ: {novel.updatedAt}
            </span>
          </div>

          {novel.chapters.length > 0 && (
            <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => onSelectChapter(novel, novel.chapters[0])}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>నవల ప్రారంభించండి (1వ అధ్యాయం)</span>
              </button>

              <button
                onClick={() => onBookmarkToggle(novel.id)}
                className={`p-3 rounded-full border transition-colors cursor-pointer ${
                  novel.isBookmarked ? 'bg-[#D99A3D]/20 border-[#D99A3D] text-[#D99A3D]' : 'border-[#E8E1DA] text-[#17151A]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${novel.isBookmarked ? 'fill-[#D99A3D]' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapters List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          అధ్యాయాల వివరాలు ({novel.chapters.length})
        </h2>

        <div className="space-y-3">
          {novel.chapters.map(chap => (
            <div
              key={chap.id}
              onClick={() => onSelectChapter(novel, chap)}
              className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between hover:border-[#7A284B] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 rounded-full bg-[#FAF7F2] dark:bg-[#222229] flex items-center justify-center text-xs font-bold text-[#7A284B] dark:text-[#D87591]">
                  {chap.chapterNumber}
                </span>
                <div>
                  <h3 className="font-bold font-serif-telugu text-base text-[#17151A] dark:text-[#F7F3EE]">
                    {chap.teluguTitle}
                  </h3>
                  <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                    {chap.readingTimeMinutes} నిమిషాల చదువు • ప్రచురణ: {chap.publishedAt}
                  </p>
                </div>
              </div>

              <span className="px-4 py-1.5 rounded-full text-xs font-bold text-[#7A284B] dark:text-[#D87591] bg-[#FAF7F2] dark:bg-[#222229]">
                చదవండి →
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
