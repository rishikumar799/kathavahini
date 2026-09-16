import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Save,
  X,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';
import { BalavinodhiniQuizQuestion, BALAVINODHINI_QUIZ_BANK } from '../../../services/balavinodhiniService';

interface AdminBalavinodhiniQuizzesManagerProps {
  questions?: BalavinodhiniQuizQuestion[];
  onSaveQuestions?: (questions: BalavinodhiniQuizQuestion[]) => void;
}

export const AdminBalavinodhiniQuizzesManager: React.FC<AdminBalavinodhiniQuizzesManagerProps> = ({
  questions = BALAVINODHINI_QUIZ_BANK,
  onSaveQuestions,
}) => {
  const [quizList, setQuizList] = useState<BalavinodhiniQuizQuestion[]>(questions);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BalavinodhiniQuizQuestion | null>(null);

  // Form state
  const [formQuestion, setFormQuestion] = useState('');
  const [formOpt1, setFormOpt1] = useState('');
  const [formOpt2, setFormOpt2] = useState('');
  const [formOpt3, setFormOpt3] = useState('');
  const [formOpt4, setFormOpt4] = useState('');
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = quizList.filter(q => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      q.question.toLowerCase().includes(query) ||
      q.explanation.toLowerCase().includes(query) ||
      q.options.some(o => o.toLowerCase().includes(query))
    );
  });

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormQuestion('');
    setFormOpt1('');
    setFormOpt2('');
    setFormOpt3('');
    setFormOpt4('');
    setFormCorrectIndex(0);
    setFormExplanation('');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (q: BalavinodhiniQuizQuestion) => {
    setEditingQuestion(q);
    setFormQuestion(q.question);
    setFormOpt1(q.options[0] || '');
    setFormOpt2(q.options[1] || '');
    setFormOpt3(q.options[2] || '');
    setFormOpt4(q.options[3] || '');
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation);
    setError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('ఈ క్విజ్ ప్రశ్నను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?')) {
      const updated = quizList.filter(q => q.id !== id);
      setQuizList(updated);
      if (onSaveQuestions) onSaveQuestions(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      setError('దయచేసి క్విజ్ ప్రశ్నను నమోదు చేయండి.');
      return;
    }
    if (!formOpt1.trim() || !formOpt2.trim() || !formOpt3.trim() || !formOpt4.trim()) {
      setError('దయచేసి మొత్తం 4 సమాధానాల ఎంపికలను నమోదు చేయండి.');
      return;
    }

    const newQuestionObj: BalavinodhiniQuizQuestion = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      question: formQuestion.trim(),
      options: [formOpt1.trim(), formOpt2.trim(), formOpt3.trim(), formOpt4.trim()],
      correctIndex: formCorrectIndex,
      explanation: formExplanation.trim() || 'సరియైన సమాధానం!',
    };

    let updated: BalavinodhiniQuizQuestion[];
    if (editingQuestion) {
      updated = quizList.map(q => (q.id === editingQuestion.id ? newQuestionObj : q));
    } else {
      updated = [...quizList, newQuestionObj];
    }

    setQuizList(updated);
    if (onSaveQuestions) onSaveQuestions(updated);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            క్విజ్ ప్రశ్నల నిర్వహణ (Quiz Bank Management)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            సాధారణ విజ్ఞానం, తెలుగు సాహిత్యం, సైన్స్ & చరిత్రపై ఇంటరాక్టివ్ క్విజ్ ప్రశ్నలు
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-serif-telugu"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త ప్రశ్నను జోడించండి</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="ప్రశ్న లేదా వివరణను వెతకండి..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-[#6F6970] absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          మొత్తం: <strong>{filtered.length}</strong> ప్రశ్నలు
        </span>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((q, idx) => (
          <div
            key={q.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold text-[10px] font-serif-telugu">
                  ప్రశ్న #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-lg text-[#6F6970] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                    title="సవరించండి"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg text-[#6F6970] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="తొలగించండి"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-snug">
                {q.question}
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-serif-telugu">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex;
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between gap-1.5 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold'
                          : 'bg-[#FAF7F2] dark:bg-[#222229] border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE]'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] leading-relaxed">
                  💡 <strong>వివరణ:</strong> {q.explanation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {editingQuestion ? 'క్విజ్ ప్రశ్నను సవరించండి' : 'కొత్త క్విజ్ ప్రశ్నను చేర్చండి'}
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
                  ప్రశ్న (Question in Telugu) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ఉదా: భారతదేశ జాతీయ పక్షి ఏది?"
                  value={formQuestion}
                  onChange={e => setFormQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  4 సమాధానాల ఎంపికలు & సరైన సమాధానాన్ని ఎంచుకోండి
                </label>
                {[
                  { val: formOpt1, setVal: setFormOpt1, idx: 0, label: 'ఎంపిక 1' },
                  { val: formOpt2, setVal: setFormOpt2, idx: 1, label: 'ఎంపిక 2' },
                  { val: formOpt3, setVal: setFormOpt3, idx: 2, label: 'ఎంపిక 3' },
                  { val: formOpt4, setVal: setFormOpt4, idx: 3, label: 'ఎంపిక 4' },
                ].map(opt => (
                  <div key={opt.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={formCorrectIndex === opt.idx}
                      onChange={() => setFormCorrectIndex(opt.idx)}
                      className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      title="ఈ ఎంపికను సరైన జవాబుగా గుర్తించండి"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`${opt.label}...`}
                      value={opt.val}
                      onChange={e => opt.setVal(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                  వివరణ (Explanation for Children)
                </label>
                <textarea
                  rows={2}
                  placeholder="పిల్లలకు సులభంగా అర్థమయ్యే వివరణ..."
                  value={formExplanation}
                  onChange={e => setFormExplanation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>భద్రపరచండి</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
