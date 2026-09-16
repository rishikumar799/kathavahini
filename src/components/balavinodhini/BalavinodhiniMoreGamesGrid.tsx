import React from 'react';
import { 
  Brain, 
  Search, 
  SpellCheck, 
  Calculator, 
  Grid3X3, 
  HelpCircle, 
  Target, 
  Sparkles 
} from 'lucide-react';

interface BalavinodhiniMoreGamesGridProps {
  onSelectGame: (gameId: string) => void;
  onOpenAllGames: () => void;
}

interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
}

export const BalavinodhiniMoreGamesGrid: React.FC<BalavinodhiniMoreGamesGridProps> = ({
  onSelectGame,
  onOpenAllGames,
}) => {
  const games: GameItem[] = [
    {
      id: 'memory',
      title: 'మెమరీ గేమ్',
      subtitle: 'కార్డులు గుర్తుంచుకోండి',
      icon: <Brain className="w-5 h-5 text-purple-300" />,
      iconBg: 'bg-purple-600/30',
      borderHover: 'hover:border-purple-400',
    },
    {
      id: 'differences',
      title: 'తేడాలు కనుక్కోండి',
      subtitle: 'చిత్రాలలో తేడాలు',
      icon: <Search className="w-5 h-5 text-cyan-300" />,
      iconBg: 'bg-cyan-600/30',
      borderHover: 'hover:border-cyan-400',
    },
    {
      id: 'word-puzzle',
      title: 'పద పజిల్',
      subtitle: 'పదాలు వెతకండి',
      icon: <SpellCheck className="w-5 h-5 text-emerald-300" />,
      iconBg: 'bg-emerald-600/30',
      borderHover: 'hover:border-emerald-400',
    },
    {
      id: 'math-challenge',
      title: 'గణిత సవాలు',
      subtitle: 'సులభమైన లెక్కలు',
      icon: <Calculator className="w-5 h-5 text-amber-300" />,
      iconBg: 'bg-amber-600/30',
      borderHover: 'hover:border-amber-400',
    },
    {
      id: 'crossword',
      title: 'పదబంధం (Crossword)',
      subtitle: 'తెలుగు పదాలు',
      icon: <Grid3X3 className="w-5 h-5 text-rose-300" />,
      iconBg: 'bg-rose-600/30',
      borderHover: 'hover:border-rose-400',
    },
    {
      id: 'quiz-challenge',
      title: 'క్విజ్ ఛాలెంజ్',
      subtitle: 'సమయంతో పోటీ',
      icon: <HelpCircle className="w-5 h-5 text-indigo-300" />,
      iconBg: 'bg-indigo-600/30',
      borderHover: 'hover:border-indigo-400',
    },
    {
      id: 'drag-drop',
      title: 'డ్రాగ్ & డ్రాప్',
      subtitle: 'సరైన స్థానంలో ఉంచండి',
      icon: <Target className="w-5 h-5 text-teal-300" />,
      iconBg: 'bg-teal-600/30',
      borderHover: 'hover:border-teal-400',
    },
    {
      id: 'color-pattern',
      title: 'రంగుల ప్యాటర్న్',
      subtitle: 'క్రమం పూర్తి చేయండి',
      icon: <Sparkles className="w-5 h-5 text-yellow-300" />,
      iconBg: 'bg-yellow-600/30',
      borderHover: 'hover:border-yellow-400',
    },
  ];

  return (
    <div className="w-full my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <h3 className="text-lg sm:text-xl font-bold font-serif-telugu text-white">
            మరిన్ని ఆటలు & సరదా
          </h3>
        </div>
        <button
          onClick={onOpenAllGames}
          className="text-xs sm:text-sm font-serif-telugu font-semibold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
        >
          అన్నీ చూడండి ➔
        </button>
      </div>

      {/* 8-Card Grid (4 columns on lg, 2 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`group p-4 rounded-2xl bg-[#1D183B] border border-purple-500/20 ${game.borderHover} shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-200 cursor-pointer flex flex-col justify-between`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl ${game.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner`}
              >
                {game.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold font-serif-telugu text-white group-hover:text-pink-300 transition-colors truncate">
                  {game.title}
                </h4>
                <p className="text-xs text-purple-200/70 font-serif-telugu line-clamp-1 mt-0.5">
                  {game.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20 flex justify-end">
              <span className="text-xs font-bold font-serif-telugu text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-1">
                ఆడండి ➔
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
