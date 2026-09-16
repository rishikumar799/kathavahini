import React, { useState, useEffect } from 'react';
import { Sparkles, Gamepad2, Trophy, Star, Play, Search, Filter, HelpCircle, Flame } from 'lucide-react';
import { BalavinodhiniGame } from '../../types';
import { balavinodhiniService, DEFAULT_BALAVINODHINI_GAMES } from '../../services/balavinodhiniService';
import { ALL_12_GAMES_METADATA, GameMetadata } from './games/BalavinodhiniGameRegistry';
import { BalavinodhiniGamePlayerModal } from './games/BalavinodhiniGamePlayerModal';

export const BalavinodhiniGameSection: React.FC = () => {
  const [games, setGames] = useState<BalavinodhiniGame[]>(DEFAULT_BALAVINODHINI_GAMES);
  const [selectedGame, setSelectedGame] = useState<BalavinodhiniGame | GameMetadata | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsub = balavinodhiniService.subscribeGames((updatedGames) => {
      if (updatedGames && updatedGames.length > 0) {
        setGames(updatedGames);
      }
    });
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: 'అన్ని ఆటలు (All 12)' },
    { id: 'language', label: 'తెలుగు భాష & పదాలు' },
    { id: 'math', label: 'గణితం & సంఖ్యలు' },
    { id: 'puzzle', label: 'లాజిక్ & పజిల్స్' },
    { id: 'quiz', label: 'క్విజ్ & విజ్ఞానం' },
  ];

  const ageFilters = [
    { id: 'all', label: 'అన్ని వయస్సులు' },
    { id: '4-6', label: '4-6 సం. (కిడ్స్)' },
    { id: '7-9', label: '7-9 సం.' },
    { id: '10-12', label: '10-12 సం.' },
    { id: '13-15', label: '13-15 సం. (టీన్స్)' },
  ];

  // Filter games
  const filteredGames = games.filter(game => {
    // Only show enabled games in children view
    if (game.isEnabled === false) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = game.name.toLowerCase().includes(q);
      const matchTelugu = game.teluguName.toLowerCase().includes(q);
      const matchDesc = game.description?.toLowerCase().includes(q);
      if (!matchName && !matchTelugu && !matchDesc) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'language' && !['letters', 'word', 'crossword'].includes(game.type)) return false;
      if (selectedCategory === 'math' && !['number', 'math'].includes(game.type)) return false;
      if (selectedCategory === 'puzzle' && !['memory', 'logic', 'difference', 'picture', 'puzzle'].includes(game.type)) return false;
      if (selectedCategory === 'quiz' && !['quiz', 'quick_quiz', 'knowledge_quiz', 'riddle'].includes(game.type)) return false;
    }

    // Age filter
    if (selectedAge !== 'all') {
      if (game.ageGroup !== 'all' && game.ageGroup !== selectedAge) return false;
    }

    return true;
  });

  const featuredGames = games.filter(g => g.isFeatured && g.isEnabled !== false);

  const handleOpenGame = (game: BalavinodhiniGame) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Interactive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-rose-900 p-6 sm:p-8 text-white shadow-xl border border-purple-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold font-serif-telugu">
              <Sparkles className="w-4 h-4" />
              <span>12 ప్రత్యేక తెలుగు ఆటలు & పజిల్స్</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-telugu tracking-tight text-white">
              బాలల వినోద క్రీడారంగం 🎮
            </h2>
            <p className="text-sm sm:text-base text-purple-200/90 font-serif-telugu max-w-xl">
              జ్ఞాపకశక్తి, తెలుగు భాషా పరిజ్ఞానం, గణితం, మేధో పజిల్స్ మరియు విజ్ఞాన క్విజ్‌లతో సరదాగా ఆడుతూ నేర్చుకోండి!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">12</span>
              <span className="text-[11px] font-bold font-serif-telugu text-purple-200">లైవ్ గేమ్‌లు</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-300">100%</span>
              <span className="text-[11px] font-bold font-serif-telugu text-purple-200">ఉచితం & సురక్షితం</span>
            </div>
          </div>
        </div>

        {/* Decorative background spheres */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Fast Launcher Carousel */}
      {featuredGames.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-current" />
              <span>ఈనాటి విశేష ఆటలు (Featured Games)</span>
            </h3>
            <span className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
              చిన్నారులు ఎక్కువగా ఆడుతున్నవి
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGames.slice(0, 4).map((game) => (
              <div
                key={game.id}
                onClick={() => handleOpenGame(game)}
                className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#18122B] to-[#251A40] text-white border border-purple-500/30 hover:border-purple-400/70 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-serif-telugu bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      {game.difficulty || 'సులభం'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold font-serif-telugu text-white group-hover:text-amber-300 transition-colors">
                      {game.teluguName}
                    </h4>
                    <p className="text-xs text-purple-200/75 line-clamp-2 mt-1 font-serif-telugu">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-serif-telugu">
                  <span className="text-purple-300/80">వయస్సు: {game.ageGroup === 'all' ? 'అందరికీ' : `${game.ageGroup} సం.`}</span>
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold flex items-center gap-1 shadow group-hover:scale-105 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    ఆడండి
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6970] dark:text-[#AAA4AC]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ఆటల పేరుతో వెతకండి..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-hidden focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>

          {/* Age Group Filter */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {ageFilters.map((age) => (
              <button
                key={age.id}
                onClick={() => setSelectedAge(age.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif-telugu font-bold transition-all cursor-pointer ${
                  selectedAge === age.id
                    ? 'bg-[#7A284B] text-white dark:bg-[#D87591] shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#23222A] text-[#6F6970] dark:text-[#AAA4AC] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36]'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-serif-telugu font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#FAF7F2] dark:bg-[#23222A] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Interactive Games Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            మొత్తం అందుబాటులో ఉన్న ఆటలు ({filteredGames.length})
          </h3>
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => handleOpenGame(game)}
                className="group relative p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-purple-500/50 dark:hover:border-purple-400/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/60 dark:to-indigo-950/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-serif-telugu bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {game.difficulty || 'సులభం'}
                      </span>
                      {game.isFeatured && (
                        <span className="text-[10px] font-bold font-serif-telugu text-amber-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          ఫీచర్డ్
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {game.teluguName}
                    </h4>
                    <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] line-clamp-2 mt-1 font-serif-telugu leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between">
                  <span className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                    🎯 {game.playCount ? `${game.playCount.toLocaleString()} సార్లు ఆడారు` : 'చిన్నారుల ఇష్టమైన ఆట'}
                  </span>
                  <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-serif-telugu text-xs shadow-md group-hover:from-purple-700 group-hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Play className="w-3 h-3 fill-current" />
                    ఆడండి
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-3">
            <Gamepad2 className="w-12 h-12 mx-auto text-[#6F6970] opacity-40" />
            <h4 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎంచుకున్న ఫిల్టర్‌లకు ఆటలు లేవు
            </h4>
            <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
              దయచేసి వెతుకులాట లేదా ఫిల్టర్‌లను రీసెట్ చేయండి.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedAge('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold font-serif-telugu cursor-pointer"
            >
              అన్ని ఆటలను చూపించు
            </button>
          </div>
        )}
      </div>

      {/* Active Game Modal Player */}
      {selectedGame && (
        <BalavinodhiniGamePlayerModal
          game={selectedGame}
          onClose={handleCloseModal}
          onScoreSave={(score) => {
            console.log(`Child scored: ${score} in game: ${selectedGame.name}`);
          }}
        />
      )}
    </div>
  );
};
