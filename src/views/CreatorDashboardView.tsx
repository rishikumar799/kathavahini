import React, { useState, useEffect } from 'react';
import { 
  Eye, Heart, Users, Feather, TrendingUp, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, ShieldCheck,
  Edit3, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { CreatorStats, Story, User } from '../types';
import { writerService } from '../services/writerService';
import { formatSafeDate } from '../utils/dateUtils';

interface CreatorDashboardViewProps {
  stats: CreatorStats;
  currentUser: User | null;
  myStories: Story[];
  onOpenWrite: () => void;
  onSelectStory: (story: Story) => void;
  onApplyWriter: () => void;
  onEditStory?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => Promise<void> | void;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({
  stats,
  currentUser,
  myStories,
  onOpenWrite,
  onSelectStory,
  onApplyWriter,
  onEditStory,
  onDeleteStory,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [writerStories, setWriterStories] = useState<Story[]>(myStories);
  const [dailyLimit, setDailyLimit] = useState<{ canSubmit: boolean; countToday: number; reason?: string }>({
    canSubmit: true,
    countToday: 0,
  });
  const [loading, setLoading] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isWriter = currentUser && (
    (currentUser.role === 'writer' && currentUser.status === 'active') || 
    currentUser.role === 'admin'
  );

  const isPendingWriter = currentUser && (
    currentUser.role === 'writer' && currentUser.status === 'pending'
  );

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (currentUser?.id && isWriter) {
        setLoading(true);
        try {
          const [stories, limitCheck] = await Promise.all([
            writerService.getWriterStories(currentUser.id),
            writerService.checkCanSubmitToday(currentUser.id),
          ]);

          if (isMounted) {
            if (stories.length > 0) {
              setWriterStories(stories);
            } else if (myStories && myStories.length > 0) {
              setWriterStories(myStories);
            }
            setDailyLimit(limitCheck);
          }
        } catch (e) {
          console.warn('Error loading creator stories:', e);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isWriter]);

  const filteredStories = writerStories.filter(s => {
    if (filterTab === 'all') return true;
    return s.status === filterTab;
  });

  const pendingCount = writerStories.filter(s => s.status === 'pending').length;
  const publishedCount = writerStories.filter(s => s.status === 'published').length;
  const rejectedCount = writerStories.filter(s => s.status === 'rejected').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>రచయిత డ్యాష్‌బోర్డ్ (Creator Studio)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1">
            రచనల నిర్వహణ & విశ్లేషణ
          </h1>
          <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            మీ కథల సమర్పణ స్థితి, పరిశీలన నివేదికలు మరియు పాఠకుల వివరాలు
          </p>
        </div>

        {isWriter ? (
          <button
            onClick={onOpenWrite}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] text-white text-sm font-bold shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>కొత్త కథను సమర్పించండి</span>
          </button>
        ) : isPendingWriter ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>దరఖాస్తు పరిశీలనలో ఉంది</span>
          </div>
        ) : (
          <button
            onClick={onApplyWriter}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-sm font-bold shadow-md cursor-pointer transition-all"
          >
            <Feather className="w-4 h-4" />
            <span>రచయితగా దరఖాస్తు చేసుకోండి</span>
          </button>
        )}
      </div>

      {/* Pending Application Notice */}
      {isPendingWriter && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm font-serif-telugu">
              <Clock className="w-4 h-4" />
              <span>మీ రచయిత దరఖాస్తు ప్రస్తుతం పరిశీలనలో ఉంది (Application Under Review)</span>
            </div>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu leading-relaxed">
              కథావాహిని అడ్మిన్ మీ దరఖాస్తును మరియు నమూనా రచనను సమీక్షిస్తున్నారు. ఆమోదం పొందిన తర్వాత మీకు రచనలను సమర్పించే సదుపాయం ప్రారంభించబడుతుంది.
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold shrink-0">
            స్థితి: పరిశీలనలో ఉంది (Pending)
          </div>
        </div>
      )}

      {/* Reader Prompt if not a writer and not pending */}
      {!isWriter && !isPendingWriter && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#222229] dark:to-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              మీరు ప్రస్తుతం పాఠకుడు (Reader) పాత్రలో ఉన్నారు
            </h3>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
              మీ స్వంత రచనలను కథావాహిని వేదికపై ప్రచురించడానికి ముందుగా రచయితగా దరఖాస్తు చేసుకోవాలి.
            </p>
          </div>
          <button
            onClick={onApplyWriter}
            className="px-6 py-2.5 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-md hover:bg-[#631F3C] cursor-pointer transition-all shrink-0"
          >
            దరఖాస్తు ఫారమ్ తెరవండి →
          </button>
        </div>
      )}

      {/* Daily Submission Limit Alert Card */}
      {isWriter && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${dailyLimit.canSubmit ? 'bg-[#3E8065]/10 text-[#3E8065]' : 'bg-[#D99A3D]/15 text-[#D99A3D]'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                రోజువారీ కథల సమర్పణ నిబంధన (1 Story Per Calendar Day)
              </p>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu mt-0.5">
                {dailyLimit.canSubmit 
                  ? 'ఈరోజు మీరు 1 కథను సమీక్ష కోసం సమర్పించవచ్చు.' 
                  : 'ఈరోజు మీ కోటా (1/1) పూర్తయింది. తదుపరి కథను రేపు సమర్పించవచ్చు.'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36]">
            <span className={`w-2 h-2 rounded-full ${dailyLimit.canSubmit ? 'bg-[#3E8065]' : 'bg-[#D99A3D]'}`} />
            <span>ఈరోజు స్థితి: {dailyLimit.countToday}/1 సమర్పించబడింది</span>
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-semibold uppercase">మొత్తం చదువులు (Reads)</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mt-0.5">
              {stats.totalReads.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
            <Heart className="w-6 h-6 fill-red-500" />
          </div>
          <div>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-semibold uppercase">మొత్తం లైక్‌లు (Likes)</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mt-0.5">
              {stats.totalLikes.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#3E8065]/10 text-[#3E8065]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-semibold uppercase">ప్రచురితమైన కథలు</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mt-0.5">
              {publishedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Stories Submissions & Status Management */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-3">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#7A284B] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:bg-black/5'
            }`}
          >
            అన్నీ ({writerStories.length})
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-[#D99A3D] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:bg-black/5'
            }`}
          >
            పరిశీలనలో ఉన్నవి ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              filterTab === 'published'
                ? 'bg-[#3E8065] text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:bg-black/5'
            }`}
          >
            ప్రచురించబడినవి ({publishedCount})
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
              filterTab === 'rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:bg-black/5'
            }`}
          >
            తిరస్కరించబడినవి ({rejectedCount})
          </button>
        </div>

        {filteredStories.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-3">
            <Feather className="w-10 h-10 text-[#6F6970] mx-auto opacity-40" />
            <p className="text-sm font-bold font-serif-telugu text-[#6F6970]">
              ఈ విభాగంలో ఎటువంటి కథలు లేవు.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStories.map(story => (
              <div
                key={story.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={story.coverImage}
                    alt={story.teluguTitle}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {story.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#3E8065]/10 text-[#3E8065]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ప్రచురించబడింది</span>
                        </span>
                      ) : story.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#D99A3D]/15 text-[#D99A3D]">
                          <Clock className="w-3 h-3" />
                          <span>పరిశీలనలో ఉంది (Pending Review)</span>
                        </span>
                      ) : story.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600">
                          <XCircle className="w-3 h-3" />
                          <span>తిరస్కరించబడింది</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 text-[#6F6970]">
                          డ్రాఫ్ట్
                        </span>
                      )}

                      <span className="text-xs text-[#6F6970]">
                        {formatSafeDate(story.publishedAt || story.submittedAt)}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectStory(story)}
                      className="font-bold font-serif-telugu text-base text-[#17151A] dark:text-[#F7F3EE] hover:text-[#7A284B] transition-colors cursor-pointer"
                    >
                      {story.teluguTitle}
                    </h4>

                    {story.status === 'rejected' && story.rejectionReason && (
                      <p className="text-xs text-red-600 font-serif-telugu bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900">
                        <strong>తిరస్కరణ కారణం:</strong> {story.rejectionReason}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-[#6F6970]">
                      <span><Eye className="w-3.5 h-3.5 inline mr-1" />{story.viewCount} చదువులు</span>
                      <span><Heart className="w-3.5 h-3.5 inline mr-1" />{story.likeCount} లైక్‌లు</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  {onEditStory && (
                    <button
                      type="button"
                      onClick={() => onEditStory(story)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7A284B]/10 hover:bg-[#7A284B] text-[#7A284B] hover:text-white dark:text-[#D87591] dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                      title="కథను సవరించండి"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>సవరించండి</span>
                    </button>
                  )}

                  {onDeleteStory && (
                    <button
                      type="button"
                      onClick={() => setStoryToDelete(story)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                      title="కథను తొలగించండి"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>తొలగించు</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectStory(story)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] dark:bg-[#222229] hover:bg-[#7A284B] hover:text-white transition-colors cursor-pointer"
                  >
                    చదవండి
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {storyToDelete && (
        <div 
          onClick={() => !isDeleting && setStoryToDelete(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#1E1E24] rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-500/20 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-red-600/10 text-red-600 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  కథను తొలగించాలా? (Delete Story)
                </h3>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu leading-relaxed">
                  "<strong>{storyToDelete.teluguTitle}</strong>" కథను మరియు దానితో ముడిపడిన అన్ని పేజీలు, చిత్రాలు మరియు పత్రాలను శాశ్వతంగా తొలగించాలనుకుంటున్నారా? ఈ చర్యను రద్దు చేయలేరు.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStoryToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                రద్దు చేయండి
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteStory || !storyToDelete) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteStory(storyToDelete.id);
                    setWriterStories(prev => prev.filter(s => s.id !== storyToDelete.id));
                    setStoryToDelete(null);
                  } catch (err) {
                    console.error('Error deleting story in creator studio:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>తొలగిస్తోంది...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ఖచ్చితంగా తొలగించండి</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
