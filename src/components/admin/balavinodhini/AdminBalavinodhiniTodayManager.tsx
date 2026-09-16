import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  BookOpen,
  Atom,
  HelpCircle,
  Smile,
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock
} from 'lucide-react';
import { BalavinodhiniTodayConfig } from '../../../types';
import { balavinodhiniService } from '../../../services/balavinodhiniService';

interface AdminBalavinodhiniTodayManagerProps {
  onSaveSuccess?: () => void;
}

export const AdminBalavinodhiniTodayManager: React.FC<AdminBalavinodhiniTodayManagerProps> = ({
  onSaveSuccess,
}) => {
  const [config, setConfig] = useState<BalavinodhiniTodayConfig>(() =>
    balavinodhiniService.getTodayConfig()
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = balavinodhiniService.subscribeTodayConfig(latest => {
      setConfig(latest);
    });
    return () => unsub();
  }, []);

  const handleChange = (key: keyof BalavinodhiniTodayConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(false);

    try {
      await balavinodhiniService.updateTodayConfig(config);
      setSuccessMsg(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'డేటా భద్రపరచడంలో లోపం తలెత్తింది.');
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
            నేటి బాలవినోదిని కాన్ఫిగరేషన్ (Today's Balavinodhini Live Control)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            బాలవినోదిని ప్రధాన పేజీలో ప్రతిరోజూ ప్రదర్శించబడే ప్రత్యేక కథ, సైన్స్ నిజం, పొడుపు కథ, జోక్ & సృజనాత్మక టాస్క్
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-serif-telugu disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'భద్రపరుస్తోంది...' : 'లైవ్ లోకి ప్రచురించండి'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-serif-telugu flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>నేటి బాలవినోదిని ముఖ్యాంశాలు విజయవంతంగా నవీకరించబడ్డాయి! ప్రత్యక్ష పేజీలో తక్షణమే కనిపిస్తాయి.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold font-serif-telugu flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-serif-telugu">
        {/* 1. Story of the Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 pb-3">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
              1. నేటి కథ (Story of the Day)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                కథ శీర్షిక (Story Title)
              </label>
              <input
                type="text"
                required
                value={config.storyTitle}
                onChange={e => handleChange('storyTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                కథ కవర్ ఇమేజ్ లింక్ (Cover Image URL)
              </label>
              <input
                type="url"
                value={config.storyCover || ''}
                onChange={e => handleChange('storyCover', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
              కథ సంక్షిప్త సారాంశం (Excerpt)
            </label>
            <textarea
              rows={2}
              value={config.storyExcerpt}
              onChange={e => handleChange('storyExcerpt', e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Science Fact of the Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 pb-3">
            <Atom className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
              2. నేటి సైన్స్ అద్భుతం (Science Fact of the Day)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                సైన్స్ శీర్షిక
              </label>
              <input
                type="text"
                required
                value={config.scienceTitle}
                onChange={e => handleChange('scienceTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                ముఖ్యమైన నిజం (Key Fact)
              </label>
              <input
                type="text"
                required
                value={config.scienceFact}
                onChange={e => handleChange('scienceFact', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
              సైన్స్ వివరణ (Kids Explanation)
            </label>
            <textarea
              rows={2}
              value={config.scienceExplanation}
              onChange={e => handleChange('scienceExplanation', e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Riddle & Joke of the Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Riddle */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 pb-3">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
                3. నేటి పొడుపు కథ (Riddle of the Day)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                పొడుపు కథ ప్రశ్న
              </label>
              <textarea
                rows={2}
                required
                value={config.riddleQuestion}
                onChange={e => handleChange('riddleQuestion', e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                జవాబు (Answer)
              </label>
              <input
                type="text"
                required
                value={config.riddleAnswer}
                onChange={e => handleChange('riddleAnswer', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Joke */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 pb-3">
              <Smile className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
                4. నేటి హాస్యం (Joke of the Day)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                జోక్ సంభాషణ (Joke Text)
              </label>
              <textarea
                rows={2}
                value={config.jokeText}
                onChange={e => handleChange('jokeText', e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                పంచ్‌లైన్ (Punchline)
              </label>
              <input
                type="text"
                value={config.jokePunchline}
                onChange={e => handleChange('jokePunchline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Creative Task of the Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 pb-3">
            <Palette className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
              5. నేటి సృజనాత్మక సవాలు (Creative Task of the Day)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
              టాస్క్ శీర్షిక
            </label>
            <input
              type="text"
              required
              value={config.creativeTaskTitle}
              onChange={e => handleChange('creativeTaskTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
              టాస్క్ వివరణ / సూచనలు
            </label>
            <textarea
              rows={2}
              value={config.creativeTaskDescription}
              onChange={e => handleChange('creativeTaskDescription', e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'భద్రపరుస్తోంది...' : 'మార్పులను భద్రపరచండి (Save & Publish)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
