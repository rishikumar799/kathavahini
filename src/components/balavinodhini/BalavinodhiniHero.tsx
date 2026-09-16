import React from 'react';
import { Search, Sparkles, BookOpen, Star, Rocket } from 'lucide-react';
import { BalavinodhiniAgeGroup, BalavinodhiniTab } from '../../types';

interface BalavinodhiniHeroProps {
  selectedAge: BalavinodhiniAgeGroup;
  onSelectAge: (age: BalavinodhiniAgeGroup) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTab: (tab: BalavinodhiniTab) => void;
  onOpenCreationModal: () => void;
}

export const BalavinodhiniHero: React.FC<BalavinodhiniHeroProps> = ({
  selectedAge,
  onSelectAge,
  searchQuery,
  onSearchChange,
  onSelectTab,
  onOpenCreationModal,
}) => {
  const ageGroups: { id: BalavinodhiniAgeGroup; label: string; icon: string }[] = [
    { id: 'all', label: 'అందరూ (All)', icon: '🌟' },
    { id: '4-6', label: '4–6 సంవత్సరాలు', icon: '👶' },
    { id: '7-9', label: '7–9 సంవత్సరాలు', icon: '👦' },
    { id: '10-12', label: '10–12 సంవత్సరాలు', icon: '🏛️' },
    { id: '13-15', label: '13–15 సంవత్సరాలు', icon: '🧑' },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B1538] via-[#14102C] to-[#0D0A1E] border border-purple-500/20 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all mb-8 text-white">
      {/* Background stardust and glows */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating stars */}
      <div className="absolute top-6 left-12 text-yellow-300 text-xs animate-pulse opacity-75">✦</div>
      <div className="absolute top-16 left-1/4 text-yellow-300 text-sm animate-pulse opacity-60">★</div>
      <div className="absolute bottom-8 left-16 text-pink-300 text-xs animate-ping opacity-50">✦</div>
      <div className="absolute top-12 right-1/3 text-amber-200 text-sm animate-pulse opacity-70">★</div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl drop-shadow-md select-none">🌈</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-telugu tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200">
              బాలవినోదిని
            </h1>
          </div>

          {/* Slogan */}
          <div className="space-y-1.5">
            <p className="text-base sm:text-lg lg:text-xl font-bold font-serif-telugu text-amber-300 flex items-center flex-wrap gap-2">
              <span>చదువు</span>
              <span className="text-pink-400">•</span>
              <span>వినోదం</span>
              <span className="text-emerald-400">•</span>
              <span>విజ్ఞానం</span>
              <span className="text-cyan-400">•</span>
              <span>సృజనాత్మకత</span>
            </p>
            <p className="text-xs sm:text-sm text-purple-200/80 font-serif-telugu max-w-xl leading-relaxed">
              పిల్లల కోసం కథలు, విజ్ఞానం, ఆటలు, క్విజ్లు, ఇంకా ఎన్నో... ఒకే చోట!
            </p>
          </div>

          {/* Glowing Search Bar */}
          <div className="pt-1 max-w-xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="కథలు, కవితలు, విజ్ఞానం, ఆటలు, ఏదైనా వెతకండి..."
                className="w-full pl-5 pr-14 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white placeholder-purple-200/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/70 shadow-inner font-serif-telugu transition-all"
              />
              <button
                type="button"
                className="absolute right-1.5 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                title="శోధించండి"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Age Filters */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-purple-200/90 font-serif-telugu mr-1">
              వయస్సు ప్రకారం:
            </span>
            {ageGroups.map((ag) => {
              const isActive = selectedAge === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => onSelectAge(ag.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-serif-telugu transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-white/30 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-purple-100 border border-white/15 backdrop-blur-xs'
                  }`}
                >
                  <span className="text-sm">{ag.icon}</span>
                  <span>{ag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-full max-w-sm rounded-3xl p-4 bg-gradient-to-b from-purple-500/10 to-transparent border border-white/10 backdrop-blur-xs">
            {/* Top Floating Badge */}
            <div className="absolute -top-3 right-2 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 px-3.5 py-1 rounded-full text-[11px] font-extrabold font-serif-telugu shadow-lg flex items-center gap-1 border border-white/40 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>చిన్న మనసుల్లో పెద్ద ప్రపంచం!</span>
            </div>

            {/* Main Visual Composition */}
            <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-t from-[#1b1035] via-[#24174d] to-[#3a2072] border border-white/10 flex items-center justify-center p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-4 text-4xl">
                  <span className="animate-pulse">🚀</span>
                  <span className="text-5xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">📖</span>
                  <span className="animate-bounce">🎈</span>
                </div>
                <div className="flex justify-center gap-3 text-3xl">
                  <span>👦</span>
                  <span>👧</span>
                  <span>✨</span>
                </div>
                <p className="text-xs font-serif-telugu font-bold text-pink-200">
                  తెలుగు చిన్నారుల వినోదభరిత విజ్ఞాన వేదిక
                </p>
                <button
                  onClick={onOpenCreationModal}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold font-serif-telugu shadow-md hover:shadow-pink-500/40 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>🎨 మీ సృజనను ప్రారంభించండి ➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

