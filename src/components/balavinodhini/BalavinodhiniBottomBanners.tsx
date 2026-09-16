import React from 'react';
import { Feather, HeartHandshake, Sparkles, BookHeart } from 'lucide-react';

interface BalavinodhiniBottomBannersProps {
  onOpenSubmission: () => void;
  onOpenParentsGuide: () => void;
}

export const BalavinodhiniBottomBanners: React.FC<BalavinodhiniBottomBannersProps> = ({
  onOpenSubmission,
  onOpenParentsGuide,
}) => {
  return (
    <div className="w-full my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Banner 1: Kids Submission */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#3B152A] via-[#2A0F1E] to-[#1A0812] border border-pink-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg sm:text-xl font-bold font-serif-telugu text-white">
              పిల్లలూ! మీరూ రాయగలరా?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-pink-200/80 font-serif-telugu leading-relaxed">
            మీరు రాసిన కథలు, కవితలు లేదా గీసిన చిత్రాలను మాకు పంపండి. కథావాహినిలో మీ పేరుతో ఘనంగా ప్రచురిస్తాము!
          </p>
        </div>

        <div className="mt-6 z-10 relative">
          <button
            onClick={onOpenSubmission}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer shadow-lg flex items-center gap-2"
          >
            <Feather className="w-4 h-4" />
            <span>మీ సృజనను పంపండి ➔</span>
          </button>
        </div>
      </div>

      {/* Banner 2: Parents Guide */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#122E3B] via-[#0D202A] to-[#08131A] border border-cyan-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧</span>
            <h3 className="text-lg sm:text-xl font-bold font-serif-telugu text-white">
              తల్లిదండ్రుల మార్గదర్శి
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-cyan-200/80 font-serif-telugu leading-relaxed">
            పిల్లల వయస్సుకు తగిన ఉత్తమ తెలుగు సాహిత్యం, పఠనాభిరుచి పెంపొందించే ఉపాయాలు మరియు విద్యా మార్గదర్శకాలను తెలుసుకోండి.
          </p>
        </div>

        <div className="mt-6 z-10 relative">
          <button
            onClick={onOpenParentsGuide}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm font-serif-telugu transition-all cursor-pointer shadow-lg flex items-center gap-2"
          >
            <BookHeart className="w-4 h-4" />
            <span>మార్గదర్శి చదవండి ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
