import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  Printer, 
  Download, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BalavinodhiniBookPage, BalavinodhiniAgeGroup } from '../../types';
import { balavinodhiniService } from '../../services/balavinodhiniService';

interface BalavinodhiniBookCreatorProps {
  currentUserId?: string;
  currentUserName?: string;
  onSuccessSubmit?: () => void;
  onClose?: () => void;
}

export const BalavinodhiniBookCreator: React.FC<BalavinodhiniBookCreatorProps> = ({
  currentUserId,
  currentUserName,
  onSuccessSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [authorName, setArtistName] = useState(currentUserName || '');
  const [ageGroup, setAgeGroup] = useState<BalavinodhiniAgeGroup>('7-9');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800');
  const [pages, setPages] = useState<BalavinodhiniBookPage[]>([
    {
      pageNumber: 1,
      title: 'పేజీ 1: ప్రారంభం',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=600',
    },
    {
      pageNumber: 2,
      title: 'పేజీ 2: సాహసం',
      content: '',
      imageUrl: '',
    },
  ]);

  const [activePreviewPage, setActivePreviewPage] = useState<number>(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleAddPage = () => {
    if (pages.length >= 10) return;
    const newPageNum = pages.length + 1;
    setPages([
      ...pages,
      {
        pageNumber: newPageNum,
        title: `పేజీ ${newPageNum}`,
        content: '',
        imageUrl: '',
      },
    ]);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return;
    const updated = pages.filter((_, i) => i !== index).map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
    }));
    setPages(updated);
  };

  const handlePageChange = (index: number, field: keyof BalavinodhiniBookPage, val: string) => {
    const updated = [...pages];
    updated[index] = { ...updated[index], [field]: val };
    setPages(updated);
  };

  const handlePublishBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teluguTitle.trim() && !title.trim()) return;

    setIsSubmitting(true);
    try {
      const finalTitle = teluguTitle.trim() || title.trim();
      await balavinodhiniService.submitCreation({
        title: finalTitle,
        teluguTitle: finalTitle,
        description: `చిన్నారి రచయిత ${authorName || 'సృజనకారుడు'} రచించిన ${pages.length} పేజీల సచిత్ర డిజిటల్ పుస్తకం.`,
        teluguDescription: `చిన్నారి రచయిత ${authorName || 'సృజనకారుడు'} రచించిన ${pages.length} పేజీల సచిత్ర డిజిటల్ పుస్తకం.`,
        content: pages.map((p) => `### ${p.title}\n${p.content}`).join('\n\n'),
        contentType: 'book',
        section: 'balavinodhini',
        categoryId: 'creations',
        subcategoryId: 'డిజిటల్ పుస్తకాలు',
        ageGroup,
        coverImage,
        authorId: currentUserId || 'guest-creator',
        authorName: authorName.trim() || 'చిరు రచయిత',
        authorBio: `${ageGroup} సం. చిన్నారి రచయిత`,
        readingTimeMinutes: Math.max(2, pages.length),
        bookPages: pages,
        status: 'published',
        moderationStatus: 'approved',
      });

      setSubmitted(true);
      setTimeout(() => {
        if (onSuccessSubmit) onSuccessSubmit();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Sub-header */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📚</span>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold font-serif-telugu text-amber-900 dark:text-amber-200">
            సచిత్ర డిజిటల్ పుస్తక సృష్టి (Book Studio)
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-serif-telugu">
            బహుళ పేజీల సచిత్ర కథలను రాయండి, బొమ్మలు జతచేయండి మరియు డిజిటల్ రూపంలో ప్రచురించండి!
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-fadeIn">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h4 className="text-lg font-bold font-serif-telugu text-emerald-800 dark:text-emerald-300">
            అభినందనలు! మీ డిజిటల్ పుస్తకం ప్రచురించబడింది!
          </h4>
          <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
            మీ పుస్తకం ఇప్పుడు "సృజనాత్మక ప్రపంచం" విభాగంలో ప్రదర్శించబడుతుంది.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePublishBook} className="space-y-6">
          {/* Book Meta Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                పుస్తకం పేరు (తెలుగు శీర్షిక) *
              </label>
              <input
                type="text"
                required
                value={teluguTitle}
                onChange={(e) => setTeluguTitle(e.target.value)}
                placeholder="ఉదా: చందమామ పైకి నా ప్రయాణం"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
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
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="మీ పేరు"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                కవర్ పేజీ ఇమేజ్ URL (ఐచ్ఛికం)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-mono focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                వయస్సు విభాగం
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as BalavinodhiniAgeGroup)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none cursor-pointer"
              >
                <option value="4-6">4–6 సంవత్సరాలు</option>
                <option value="7-9">7–9 సంవత్సరాలు</option>
                <option value="10-12">10–12 సంవత్సరాలు</option>
                <option value="13-15">13–15 సంవత్సరాలు</option>
              </select>
            </div>
          </div>

          {/* Pages Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                <span>పుస్తక పేజీలు ({pages.length}/10)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddPage}
                disabled={pages.length >= 10}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold font-serif-telugu flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ కొత్త పేజీ కలపండి</span>
              </button>
            </div>

            <div className="space-y-4">
              {pages.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
                    <span className="text-xs font-bold font-serif-telugu px-2.5 py-0.5 rounded-full bg-[#7A284B]/10 dark:bg-[#D87591]/20 text-[#7A284B] dark:text-[#D87591]">
                      పేజీ #{p.pageNumber}
                    </span>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePage(idx)}
                        className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-xs flex items-center gap-1 font-serif-telugu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>పేజీని తొలగించు</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        పేజీ ఉప శీర్షిక
                      </label>
                      <input
                        type="text"
                        value={p.title || ''}
                        onChange={(e) => handlePageChange(idx, 'title', e.target.value)}
                        placeholder={`పేజీ ${idx + 1} శీర్షిక`}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                        పేజీ బొమ్మ URL (ఐచ్ఛికం)
                      </label>
                      <input
                        type="url"
                        value={p.imageUrl || ''}
                        onChange={(e) => handlePageChange(idx, 'imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-mono focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                      పేజీ కథ / సమాచారం (కంటెంట్) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={p.content}
                      onChange={(e) => handlePageChange(idx, 'content', e.target.value)}
                      placeholder="ఈ పేజీలో జరిగే కథనాన్ని ఇక్కడ రాయండి..."
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36] text-xs sm:text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{isPreviewOpen ? 'ప్రివ్యూ మూసివేయి' : 'పుస్తక ప్రివ్యూ చూడండి'}</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !teluguTitle.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#7A284B] text-white dark:bg-[#D87591] font-bold font-serif-telugu text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'పుస్తకం ప్రచురించబడుతోంది...' : 'డిజిటల్ బుక్ ప్రచురించండి 🚀'}</span>
            </button>
          </div>

          {/* In-Editor Live Preview Modal / Drawer */}
          {isPreviewOpen && (
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <span className="text-sm font-bold font-serif-telugu text-amber-800 dark:text-amber-300">
                  📖 లైవ్ పుస్తక ప్రివ్యూ — పేజీ {activePreviewPage} / {pages.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activePreviewPage <= 1}
                    onClick={() => setActivePreviewPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-[#18181D] border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activePreviewPage >= pages.length}
                    onClick={() => setActivePreviewPage((p) => Math.min(pages.length, p + 1))}
                    className="p-1.5 rounded-lg bg-white dark:bg-[#18181D] border disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Page Display */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-4 max-w-lg mx-auto text-center shadow-xs">
                <h3 className="text-lg font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
                  {pages[activePreviewPage - 1]?.title || `పేజీ ${activePreviewPage}`}
                </h3>
                {pages[activePreviewPage - 1]?.imageUrl && (
                  <img
                    src={pages[activePreviewPage - 1].imageUrl}
                    alt=""
                    className="w-full h-44 object-cover rounded-xl mx-auto"
                  />
                )}
                <p className="text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed whitespace-pre-wrap">
                  {pages[activePreviewPage - 1]?.content || 'ఈ పేజీకి కంటెంట్ రాయండి...'}
                </p>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
