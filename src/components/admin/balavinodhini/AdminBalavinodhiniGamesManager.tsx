import React, { useState } from 'react';
import {
  Gamepad2,
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Save,
  X,
  AlertCircle,
  Layers,
  Settings
} from 'lucide-react';
import { BalavinodhiniGame, BalavinodhiniAgeGroup } from '../../../types';
import { DEFAULT_BALAVINODHINI_GAMES } from '../../../services/balavinodhiniService';

interface AdminBalavinodhiniGamesManagerProps {
  games?: BalavinodhiniGame[];
  onToggleGameEnabled: (gameId: string, isEnabled: boolean) => void;
  onToggleGameFeatured: (gameId: string, isFeatured: boolean) => void;
  onSaveGame: (game: BalavinodhiniGame) => Promise<void>;
  onDeleteGame?: (gameId: string) => Promise<void>;
}

export const AdminBalavinodhiniGamesManager: React.FC<AdminBalavinodhiniGamesManagerProps> = ({
  games = DEFAULT_BALAVINODHINI_GAMES,
  onToggleGameEnabled,
  onToggleGameFeatured,
  onSaveGame,
  onDeleteGame,
}) => {
  const [gamesList, setGamesList] = useState<BalavinodhiniGame[]>(games);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<BalavinodhiniGame | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTeluguName, setFormTeluguName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('🎮');
  const [formAgeGroup, setFormAgeGroup] = useState<BalavinodhiniAgeGroup>('all');
  const [formDifficulty, setFormDifficulty] = useState<'సులభం' | 'మధ్యస్థం' | 'కఠినం'>('సులభం');
  const [formGradient, setFormGradient] = useState('from-amber-500 to-rose-500');
  const [formRules, setFormRules] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update internal list if prop changes
  React.useEffect(() => {
    if (games && games.length > 0) {
      setGamesList(games);
    }
  }, [games]);

  const handleToggleEnable = (id: string) => {
    setGamesList(prev =>
      prev.map(g => {
        if (g.id === id) {
          const nextVal = !g.isEnabled;
          onToggleGameEnabled(id, nextVal);
          return { ...g, isEnabled: nextVal };
        }
        return g;
      })
    );
  };

  const handleToggleFeature = (id: string) => {
    setGamesList(prev =>
      prev.map(g => {
        if (g.id === id) {
          const nextVal = !g.isFeatured;
          onToggleGameFeatured(id, nextVal);
          return { ...g, isFeatured: nextVal };
        }
        return g;
      })
    );
  };

  const handleOpenEdit = (game: BalavinodhiniGame) => {
    setEditingGame(game);
    setFormName(game.name);
    setFormTeluguName(game.teluguName);
    setFormDescription(game.description);
    setFormIcon(game.icon || '🎮');
    setFormAgeGroup(game.ageGroup || 'all');
    setFormDifficulty(game.difficulty || 'సులభం');
    setFormGradient(game.colorGradient || 'from-amber-500 to-rose-500');
    setFormRules(game.rules ? game.rules.join('\n') : '');
    setFormEnabled(game.isEnabled);
    setFormFeatured(game.isFeatured);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingGame(null);
    setFormName('');
    setFormTeluguName('');
    setFormDescription('');
    setFormIcon('🎯');
    setFormAgeGroup('all');
    setFormDifficulty('సులభం');
    setFormGradient('from-emerald-500 to-teal-600');
    setFormRules('');
    setFormEnabled(true);
    setFormFeatured(false);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeluguName.trim()) {
      setError('దయచేసి ఆట యొక్క తెలుగు పేరును నమోదు చేయండి.');
      return;
    }

    setSaving(true);
    setError(null);

    const rules = formRules
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const gamePayload: BalavinodhiniGame = {
      id: editingGame ? editingGame.id : `bv-game-${Date.now()}`,
      name: formName.trim() || formTeluguName.trim(),
      teluguName: formTeluguName.trim(),
      description: formDescription.trim(),
      type: editingGame ? editingGame.type : 'custom',
      icon: formIcon.trim() || '🎮',
      ageGroup: formAgeGroup,
      difficulty: formDifficulty,
      colorGradient: formGradient,
      rules,
      isEnabled: formEnabled,
      isFeatured: formFeatured,
      playCount: editingGame ? editingGame.playCount : 0,
    };

    try {
      await onSaveGame(gamePayload);
      if (editingGame) {
        setGamesList(prev => prev.map(g => (g.id === gamePayload.id ? gamePayload : g)));
      } else {
        setGamesList(prev => [...prev, gamePayload]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'ఆటను భద్రపరచడంలో లోపం తలెత్తింది.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            బాలవినోదిని ఆటల నిర్వహణ (Interactive Games Manager)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            జ్ఞాపకశక్తి, గణితం, తెలుగు అక్షరమాల, పజిల్స్ & పొడుపు కథల 10 ప్రత్యక్ష ఇంటరాక్టివ్ ఆటల కంట్రోల్ ప్యానెల్
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-serif-telugu"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త ఆటను జోడించండి</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{gamesList.length}</p>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">మొత్తం ఇంటరాక్టివ్ ఆటలు</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#17151A] dark:text-[#F7F3EE]">
              {gamesList.filter(g => g.isEnabled).length}
            </p>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">లైవ్ లో అందుబాటులో ఉన్నవి</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#17151A] dark:text-[#F7F3EE]">
              {gamesList.filter(g => g.isFeatured).length}
            </p>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">ఫీచర్డ్ ఆటలు</p>
          </div>
        </div>
      </div>

      {/* Games List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gamesList.map((game, idx) => (
          <div
            key={game.id}
            className={`p-5 rounded-3xl bg-white dark:bg-[#18181D] border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
              game.isEnabled
                ? 'border-[#E8E1DA] dark:border-[#2E2D36] hover:shadow-md'
                : 'border-dashed border-zinc-300 dark:border-zinc-700 opacity-60'
            }`}
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-2xl p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm">
                  {game.icon || '🎮'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFeature(game.id)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      game.isFeatured ? 'text-amber-500 bg-amber-500/10' : 'text-[#6F6970]'
                    }`}
                    title={game.isFeatured ? 'ఫీచర్డ్' : 'ఫీచర్ చేయండి'}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => handleToggleEnable(game.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold font-serif-telugu cursor-pointer transition-colors ${
                      game.isEnabled
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {game.isEnabled ? '● ఆన్ (Live)' : '○ ఆఫ్ (Hidden)'}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {game.teluguName}
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-serif-telugu">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                  👶 {game.ageGroup} సం||
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  ⚡ {game.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300">
                  🎮 {game.playCount || 0} ఆడినవారు
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
              <button
                onClick={() => handleOpenEdit(game)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer font-serif-telugu"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>సవరించండి</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Game Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {editingGame ? 'ఆట వివరాలను సవరించండి' : 'కొత్త ఆటను జోడించండి'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:text-[#17151A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-serif-telugu">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  తెలుగు పేరు (Telugu Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTeluguName}
                  onChange={e => setFormTeluguName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    ఆంగ్ల పేరు (English Name)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    ఐకాన్ / ఎమోజి (Icon Emoji)
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  వివరణ (Description)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    వయో వర్గం
                  </label>
                  <select
                    value={formAgeGroup}
                    onChange={e => setFormAgeGroup(e.target.value as BalavinodhiniAgeGroup)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">అందరికీ (All)</option>
                    <option value="4-6">4 - 6 సంవత్సరాలు</option>
                    <option value="7-9">7 - 9 సంవత్సరాలు</option>
                    <option value="10-12">10 - 12 సంవత్సరాలు</option>
                    <option value="13-15">13 - 15 సంవత్సరాలు</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                    క్లిష్టత (Difficulty)
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="సులభం">సులభం</option>
                    <option value="మధ్యస్థం">మధ్యస్థం</option>
                    <option value="కఠినం">కఠినం</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  ఆట నియమాలు (Rules - లైన్ కు ఒకటి)
                </label>
                <textarea
                  rows={2}
                  placeholder="కార్డులను సరిపోల్చండి..."
                  value={formRules}
                  onChange={e => setFormRules(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={e => setFormEnabled(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ఆటను ప్రారంభించండి (Live Enabled)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={e => setFormFeatured(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>⭐ ఫీచర్డ్</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] text-xs font-bold cursor-pointer"
                >
                  రద్దు చేయండి
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'భద్రపరుస్తోంది...' : 'భద్రపరచండి'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
