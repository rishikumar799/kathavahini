import React, { useState, useEffect } from 'react';
import { 
  X, 
  Palette, 
  BookOpen, 
  Feather, 
  Sparkles, 
  Send, 
  Save, 
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { BalavinodhiniContentType, BalavinodhiniAgeGroup } from '../../types';
import { balavinodhiniService } from '../../services/balavinodhiniService';
import { BalavinodhiniDrawingEditor } from './BalavinodhiniDrawingEditor';
import { BalavinodhiniBookCreator } from './BalavinodhiniBookCreator';

interface BalavinodhiniCreationModalProps {
  currentUserId?: string;
  currentUserName?: string;
  onClose: () => void;
  onSuccessSubmit: () => void;
}

export const BalavinodhiniCreationModal: React.FC<BalavinodhiniCreationModalProps> = ({
  currentUserId,
  currentUserName,
  onClose,
  onSuccessSubmit,
}) => {
  const [selectedType, setSelectedType] = useState<BalavinodhiniContentType | null>(null);

  // Form state for Story/Poem
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUserName || '');
  const [ageGroup, setAgeGroup] = useState<BalavinodhiniAgeGroup>('7-9');
  const [category, setCategory] = useState<'stories' | 'poems' | 'science' | 'jokes'>('stories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const creationOptions = [
    {
      type: 'drawing' as BalavinodhiniContentType,
      title: 'రంగుల బొమ్మ (Drawing Studio)',
      desc: 'డిజిటల్ బ్రష్‌తో అందమైన పెయింటింగ్ వేయండి.',
      icon: '🎨',
      bg: 'from-rose-500/15 to-pink-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300',
    },
    {
      type: 'book' as BalavinodhiniContentType,
      title: 'సచిత్ర డిజిటల్ పుస్తకం (Book Studio)',
      desc: 'బహుళ పేజీల బొమ్మల పుస్తకాన్ని సృష్టించండి.',
      icon: '📚',
      bg: 'from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300',
    },
    {
      type: 'story' as BalavinodhiniContentType,
      title: 'నీతి కథ / సాహస కథ (Story)',
      desc: 'మీ మనసులో మెదిలే అద్భుతమైన కథను రాయండి.',
      icon: '📖',
      bg: 'from-emerald-500/15 to-teal-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
    },
    {
      type: 'poem' as BalavinodhiniContentType,
      title: 'బాలల కవిత / గేయం (Poem)',
      desc: 'ముచ్చటైన ప్రాసతో పద్యం లేదా పాట రాయండి.',
      icon: '✍️',
      bg: 'from-blue-500/15 to-cyan-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300',
    },
  ];

  const handleSubmitStoryOrPoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await balavinodhiniService.submitCreation({
        title: title.trim(),
        teluguTitle: title.trim(),
        description: content.slice(0, 120),
        teluguDescription: content.slice(0, 120),
        content: content.trim(),
        contentType: selectedType || 'story',
        section: 'balavinodhini',
        categoryId: category,
        subcategoryId: selectedType === 'poem' ? 'బాలల కవితలు' : 'పిల్లల కథలు',
        ageGroup,
        authorId: currentUserId || 'guest-creator',
        authorName: authorName.trim() || 'చిరు సృజనకారుడు',
        authorBio: `${ageGroup} సం. చిన్నారి రచయిత`,
        status: 'published',
        moderationStatus: 'approved',
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccessSubmit();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeTitle = () => {
    switch (selectedType) {
      case 'drawing': return 'రంగుల బొమ్మ (Drawing Studio)';
      case 'book': return 'సచిత్ర డిజిటల్ పుస్తకం (Book Studio)';
      case 'poem': return 'బాలల కవిత / గేయం (Poem)';
      case 'story': return 'బాలల కథ (Story)';
      default: return 'కొత్త సృజనను రూపొందించండి';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#FFFDF9] dark:bg-[#151419] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden">
        
        {/* STICKY TOP HEADER WITH PROMINENT CLOSE BUTTON */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-[#18181D]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36] text-[#7A284B] dark:text-[#D87591] text-xs font-bold font-serif-telugu flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                title="వెనుకకు వెళ్ళండి"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">రకాన్ని మార్చండి</span>
              </button>
            )}

            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate flex items-center gap-2">
                <span className="text-lg sm:text-xl">✨</span>
                <span>{getTypeTitle()}</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu truncate">
                మీ ఆలోచనలను కథగా, కవితగా, బొమ్మగా లేదా పుస్తకంగా మార్చండి!
              </p>
            </div>
          </div>

          {/* PROMINENT CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="flex-shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm font-serif-telugu shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-rose-300 dark:ring-rose-900"
            title="మూసివేయి (Close)"
            aria-label="మూసివేయి"
          >
            <X className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">మూసివేయి</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          
          {/* Step 1: Choose Type */}
          {!selectedType && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                మీరు ఏమి సృష్టించాలనుకుంటున్నారు? కింద ఒక ఎంపికను ఎంచుకోండి:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creationOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${opt.bg} border shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer text-left flex items-start gap-4`}
                  >
                    <span className="text-3xl flex-shrink-0">{opt.icon}</span>
                    <div>
                      <h5 className="font-bold text-base font-serif-telugu mb-1">
                        {opt.title}
                      </h5>
                      <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Drawing Studio */}
          {selectedType === 'drawing' && (
            <BalavinodhiniDrawingEditor
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onSuccessSubmit={() => {
                onSuccessSubmit();
                onClose();
              }}
              onClose={() => setSelectedType(null)}
            />
          )}

          {/* Step 2: Digital Book Studio */}
          {selectedType === 'book' && (
            <BalavinodhiniBookCreator
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onSuccessSubmit={() => {
                onSuccessSubmit();
                onClose();
              }}
              onClose={() => setSelectedType(null)}
            />
          )}

          {/* Step 2: Story or Poem Form */}
          {(selectedType === 'story' || selectedType === 'poem') && (
            <div className="space-y-5">
              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fadeIn">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold font-serif-telugu text-emerald-800 dark:text-emerald-300">
                    మీ రచన విజయవంతంగా ప్రచురించబడింది!
                  </h4>
                </div>
              ) : (
                <form onSubmit={handleSubmitStoryOrPoem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        శీర్షిక (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={selectedType === 'poem' ? 'ఉదా: చిన్ని తారక' : 'ఉదా: తెలివైన జింక'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        రచయిత / చిన్నారి పేరు *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="మీ పేరు"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        వయస్సు విభాగం
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value as BalavinodhiniAgeGroup)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none cursor-pointer"
                      >
                        <option value="4-6">4–6 సంవత్సరాలు</option>
                        <option value="7-9">7–9 సంవత్సరాలు</option>
                        <option value="10-12">10–12 సంవత్సరాలు</option>
                        <option value="13-15">13–15 సంవత్సరాలు</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        విభాగం
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none cursor-pointer"
                      >
                        <option value="stories">బాలల కథలు</option>
                        <option value="poems">బాలల కవితలు</option>
                        <option value="science">బాల విజ్ఞానం</option>
                        <option value="jokes">బాలల హాస్యం</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                      కథ / కవిత పూర్తి సమాచారం *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="ఇక్కడ మీ రచనను రాయండి..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !content.trim()}
                      className="px-6 py-2.5 rounded-xl bg-[#7A284B] text-white dark:bg-[#D87591] font-bold font-serif-telugu text-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'ప్రచురించబడుతోంది...' : 'ప్రచురించండి 🚀'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
