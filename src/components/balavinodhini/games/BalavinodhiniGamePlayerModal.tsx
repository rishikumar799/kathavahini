import React from 'react';
import { X, Gamepad2, Sparkles, Trophy, HelpCircle, Star, Share2 } from 'lucide-react';
import { BalavinodhiniGame } from '../../../types';
import { ALL_12_GAMES_METADATA, GameMetadata } from './BalavinodhiniGameRegistry';
import { MemoryMatchGame } from './MemoryMatchGame';
import { KnowledgeQuizGame } from './KnowledgeQuizGame';
import { NumberChallengeGame } from './NumberChallengeGame';
import { TeluguLetterMatchGame } from './TeluguLetterMatchGame';
import { WordPuzzleGame } from './WordPuzzleGame';
import { MathChallengeGame } from './MathChallengeGame';
import { PictureMatchGame } from './PictureMatchGame';
import { FindDifferenceGame } from './FindDifferenceGame';
import { LogicPuzzleGame } from './LogicPuzzleGame';
import { RiddleChallengeGame } from './RiddleChallengeGame';
import { TeluguCrosswordGame } from './TeluguCrosswordGame';
import { QuickQuizGame } from './QuickQuizGame';

interface BalavinodhiniGamePlayerModalProps {
  game: BalavinodhiniGame | GameMetadata;
  onClose: () => void;
  onScoreSave?: (score: number) => void;
}

export const BalavinodhiniGamePlayerModal: React.FC<BalavinodhiniGamePlayerModalProps> = ({
  game,
  onClose,
  onScoreSave,
}) => {
  // Determine game type
  const gameType = (game as any).gameType || game.type || 'memory';

  const renderGameEngine = () => {
    switch (gameType) {
      case 'memory':
        return <MemoryMatchGame onComplete={onScoreSave} />;
      case 'number':
        return <NumberChallengeGame onComplete={onScoreSave} />;
      case 'letters':
      case 'language':
        return <TeluguLetterMatchGame onComplete={onScoreSave} />;
      case 'word':
      case 'puzzle':
        return <WordPuzzleGame onComplete={onScoreSave} />;
      case 'math':
        return <MathChallengeGame onComplete={onScoreSave} />;
      case 'picture':
      case 'match':
        return <PictureMatchGame onComplete={onScoreSave} />;
      case 'difference':
      case 'observation':
      case 'differences':
        return <FindDifferenceGame onComplete={onScoreSave} />;
      case 'logic':
        return <LogicPuzzleGame onComplete={onScoreSave} />;
      case 'riddle':
        return <RiddleChallengeGame onComplete={onScoreSave} />;
      case 'crossword':
        return <TeluguCrosswordGame onComplete={onScoreSave} />;
      case 'knowledge_quiz':
      case 'quiz':
        return <KnowledgeQuizGame onComplete={onScoreSave} />;
      case 'quick_quiz':
        return <QuickQuizGame onComplete={onScoreSave} />;
      default:
        return <MemoryMatchGame onComplete={onScoreSave} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#0F0C1E] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-[#17122C]/95 backdrop-blur border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-purple-950/80 border border-purple-500/30">
              {game.icon || '🎮'}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-white leading-tight">
                {game.teluguName || game.name}
              </h3>
              <p className="text-xs text-purple-300/70 font-serif-telugu">
                {game.description || 'ఆడుకోండి, ఆనందించండి & నేర్చుకోండి!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="మూసివేయండి"
              aria-label="Close game modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Game Canvas Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {renderGameEngine()}
        </div>

        {/* Footer Rules Bar */}
        {game.rules && game.rules.length > 0 && (
          <div className="px-5 py-2.5 bg-[#130E26] border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-serif-telugu text-purple-300/80">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <HelpCircle className="w-3.5 h-3.5" />
              ఆట నియమాలు:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {game.rules.map((rule, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  • {rule}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
