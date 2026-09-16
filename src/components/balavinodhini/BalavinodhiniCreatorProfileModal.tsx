import React, { useEffect } from 'react';
import { X, Award, Sparkles, BookOpen, Palette, Heart, CheckCircle2 } from 'lucide-react';
import { BalavinodhiniItem } from '../../types';

interface BalavinodhiniCreatorProfileModalProps {
  creatorName: string;
  creatorBio?: string;
  creatorAvatar?: string;
  creatorWorks: BalavinodhiniItem[];
  onClose: () => void;
  onSelectWork: (item: BalavinodhiniItem) => void;
}

export const BalavinodhiniCreatorProfileModal: React.FC<BalavinodhiniCreatorProfileModalProps> = ({
  creatorName,
  creatorBio,
  creatorAvatar,
  creatorWorks,
  onClose,
  onSelectWork,
}) => {
  const totalLikes = creatorWorks.reduce((acc, w) => acc + (w.likeCount || 0), 0);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#FFFDF9] dark:bg-[#151419] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden">
        
        {/* STICKY TOP HEADER WITH PROMINENT CLOSE BUTTON */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-[#18181D]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🌟</span>
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
              చిరు సృజనకారుడి ప్రొఫైల్
            </h3>
          </div>

          {/* PROMINENT CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm font-serif-telugu shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-rose-300 dark:ring-rose-900"
            title="మూసివేయి (Close)"
            aria-label="మూసివేయి"
          >
            <X className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">మూసివేయి</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-6">
          {/* Profile Card Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7A284B] to-[#D99A3D] p-1 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#18181D] overflow-hidden flex items-center justify-center font-bold text-2xl text-[#7A284B] dark:text-[#D87591]">
                {creatorAvatar ? (
                  <img src={creatorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  creatorName.charAt(0) || 'బ'
                )}
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {creatorName}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold font-serif-telugu flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ధృవీకరించబడిన చిరు సృజనకారుడు</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                {creatorBio || 'బాలవినోదిని వేదికలో ఉత్సాహవంతమైన యువ సృజనకారుడు.'}
              </p>

              {/* Badges / Stats Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold font-serif-telugu flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{creatorWorks.length} ప్రచురణలు</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs font-bold font-serif-telugu flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{totalLikes} మొత్తం లైక్స్</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] text-xs font-bold font-serif-telugu flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>స్టార్ క్రియేటర్</span>
                </span>
              </div>
            </div>
          </div>

          {/* Creator Works Showcase */}
          <div className="pt-4 border-t border-[#E8E1DA] dark:border-[#2E2D36] space-y-3">
            <h4 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              {creatorName} ప్రచురించిన రచనలు & చిత్రాలు ({creatorWorks.length})
            </h4>

            {creatorWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {creatorWorks.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => {
                      onSelectWork(work);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] dark:hover:border-[#D87591] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7A284B]/10 to-amber-500/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                      {work.coverImage ? (
                        <img src={work.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        work.contentType === 'drawing' ? '🎨' : work.contentType === 'book' ? '📚' : '📖'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                        {work.teluguTitle || work.title}
                      </h5>
                      <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                        {work.subcategoryId || 'సృజన'} • {work.likeCount || 0} లైక్స్
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6F6970] font-serif-telugu py-2">
                ఇంకా ఎటువంటి రచనలు ప్రచురించబడలేదు.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
