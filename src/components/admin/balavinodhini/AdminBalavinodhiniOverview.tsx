import React from 'react';
import {
  Sparkles,
  BookOpen,
  Atom,
  Feather,
  Smile,
  HelpCircle,
  Gamepad2,
  Brain,
  Palette,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import { BalavinodhiniItem, BalavinodhiniTab } from '../../../types';
import { balavinodhiniService } from '../../../services/balavinodhiniService';

interface AdminBalavinodhiniOverviewProps {
  items: BalavinodhiniItem[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateModal: (contentType?: string, categoryId?: string) => void;
  onEditItem: (item: BalavinodhiniItem) => void;
  onDeleteItem: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onModerateSubmission: (id: string, action: 'approve' | 'reject') => void;
  onOpenPreview?: (item: BalavinodhiniItem) => void;
}

export const AdminBalavinodhiniOverview: React.FC<AdminBalavinodhiniOverviewProps> = ({
  items,
  onNavigateTab,
  onOpenCreateModal,
  onEditItem,
  onDeleteItem,
  onTogglePublish,
  onModerateSubmission,
  onOpenPreview,
}) => {
  const stats = balavinodhiniService.getStats();
  const pendingSubmissions = items.filter(
    i => i.moderationStatus === 'pending' || i.status === 'pending_review'
  );
  const recentItems = [...items].slice(0, 8);
  const todayConfig = balavinodhiniService.getTodayConfig();

  const categoryBreakdown = [
    { label: 'బాలల కథలు (Stories)', count: stats.storiesCount, color: 'bg-amber-500', tab: 'balavinodhini-stories', icon: BookOpen },
    { label: 'శాస్త్ర విజ్ఞానం (Science)', count: stats.scienceCount, color: 'bg-emerald-500', tab: 'balavinodhini-science', icon: Atom },
    { label: 'బాలల గేయాలు (Poems)', count: stats.poemsCount, color: 'bg-indigo-500', tab: 'balavinodhini-poems', icon: Feather },
    { label: 'పొడుపు కథలు (Riddles)', count: stats.riddlesCount, color: 'bg-yellow-500', tab: 'balavinodhini-riddles', icon: HelpCircle },
    { label: 'బాలల జోక్స్ (Jokes)', count: stats.jokesCount, color: 'bg-rose-500', tab: 'balavinodhini-jokes', icon: Smile },
    { label: 'చిన్నారుల సృజనలు (Creations)', count: stats.creationsCount, color: 'bg-purple-500', tab: 'balavinodhini-submissions', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-amber-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold font-serif-telugu">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>బాలవినోదిని ప్రధాన నిర్వాహక ప్యానెల్ (Children's Ecosystem Control)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-telugu tracking-tight">
              బాలవినోదిని సమగ్ర నివేదిక & నిర్వహణ
            </h1>
            <p className="text-xs sm:text-sm text-white/90 font-serif-telugu leading-relaxed">
              కథలు, సైన్స్, గేయాలు, పొడుపు కథలు, గేమ్స్, క్విజ్‌లు మరియు చిన్నారుల సృజనాత్మక రచనలను ప్రత్యక్షంగా సృష్టించండి, సవరించండి & నియంత్రించండి.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenCreateModal('story', 'stories')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-rose-700 hover:bg-amber-50 font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer font-serif-telugu"
            >
              <Plus className="w-4 h-4" />
              <span>కొత్త కంటెంట్ జోడించండి</span>
            </button>
            <button
              onClick={() => onNavigateTab('balavinodhini-today')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 backdrop-blur-md text-white border border-white/20 font-bold text-xs transition-all cursor-pointer font-serif-telugu"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>నేటి బాలవినోదిని</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10">మొత్తం</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.totalItems}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">మొత్తం రచనలు</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10">లైవ్</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.publishedCount}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">ప్రచురితమైనవి</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10">ఆమోదం</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.pendingModeration}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">సమీక్షలో ఉన్నవి</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10">ఆటలు</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.gamesCount}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">తెలుగు ఆటలు</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <Brain className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10">క్విజ్</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.quizzesCount}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">క్విజ్ ప్రశ్నలు</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <Star className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10">హైలైట్స్</span>
          </div>
          <p className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE]">{stats.featuredCount}</p>
          <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">ఫీచర్డ్ అంశాలు</p>
        </div>
      </div>

      {/* Pending Moderation Queue Alert */}
      {pendingSubmissions.length > 0 && (
        <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {pendingSubmissions.length} చిన్నారుల సృజనాత్మక రచనలు సమీక్ష కోసం వేచి ఉన్నాయి!
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                పిల్లలు గీసిన చిత్రాలు, రాసిన పుస్తకాలు మరియు కథలను సమీక్షించి ఆమోదించండి.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('balavinodhini-submissions')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors font-serif-telugu shrink-0"
          >
            <span>సమీక్షించండి</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBreakdown.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(cat.tab)}
              className="group p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {cat.label}
                  </h4>
                  <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                    {cat.count} అంశాలు అందుబాటులో ఉన్నాయి
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#222229] flex items-center justify-center text-[#6F6970] group-hover:text-amber-600 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Balavinodhini Live Sync Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-800/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌟</span>
            <div>
              <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                నేటి బాలవినోదిని ముఖ్యాంశాలు (Today's Live Configuration)
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                హోమ్‌పేజీలో కనిపించే నేటి కథ, సైన్స్ నిజం, పొడుపు కథ & టాస్క్
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('balavinodhini-today')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer font-serif-telugu"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>మార్చండి</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181D] border border-amber-100 dark:border-amber-900/30">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-serif-telugu">📖 నేటి కథ</span>
            <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate mt-0.5 font-serif-telugu">
              {todayConfig.storyTitle}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181D] border border-amber-100 dark:border-amber-900/30">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 font-serif-telugu">🔬 నేటి సైన్స్ ఫాక్ట్</span>
            <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate mt-0.5 font-serif-telugu">
              {todayConfig.scienceTitle}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181D] border border-amber-100 dark:border-amber-900/30">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 font-serif-telugu">❓ నేటి పొడుపు కథ</span>
            <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate mt-0.5 font-serif-telugu">
              {todayConfig.riddleQuestion}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181D] border border-amber-100 dark:border-amber-900/30">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 font-serif-telugu">🎨 నేటి సృజనాత్మక టాస్క్</span>
            <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate mt-0.5 font-serif-telugu">
              {todayConfig.creativeTaskTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Items Table */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఇటీవలి బాలవినోదిని కంటెంట్ (Recent Content)
            </h3>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
              చివరిగా జోడించిన మరియు నవీకరించిన రచనలు
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('balavinodhini-content')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline font-serif-telugu inline-flex items-center gap-1 cursor-pointer"
          >
            <span>అన్నీ చూడండి</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-serif-telugu">
            <thead>
              <tr className="border-b border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] dark:text-[#AAA4AC]">
                <th className="pb-3 font-bold">శీర్షిక (Title)</th>
                <th className="pb-3 font-bold">విభాగం (Category)</th>
                <th className="pb-3 font-bold">వయో వర్గం (Age)</th>
                <th className="pb-3 font-bold">స్థితి (Status)</th>
                <th className="pb-3 font-bold">స్పందనలు (Likes/Comments)</th>
                <th className="pb-3 font-bold text-right">చర్యలు (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1DA]/50 dark:divide-[#2E2D36]/50">
              {recentItems.map(item => (
                <tr key={item.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#222229]/40 transition-colors">
                  <td className="py-3 pr-3 font-medium text-[#17151A] dark:text-[#F7F3EE]">
                    <div className="flex items-center gap-2.5">
                      {item.coverImage && (
                        <img
                          src={item.coverImage}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-black/5"
                        />
                      )}
                      <div>
                        <p className="font-bold text-xs truncate max-w-[220px]">{item.teluguTitle || item.title}</p>
                        <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">{item.authorName || 'కథావాహిని'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      {item.subcategoryId || item.categoryId}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[#6F6970] dark:text-[#AAA4AC]">
                    {item.ageGroup} సం||
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => onTogglePublish(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        item.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/25'
                      }`}
                    >
                      {item.status === 'published' ? '● ప్రచురితం' : '○ డ్రాఫ్ట్'}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-[#6F6970] dark:text-[#AAA4AC]">
                    ❤️ {item.likeCount || 0} | 💬 {item.commentCount || 0}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditItem(item)}
                        title="సవరించండి"
                        className="p-1.5 rounded-lg text-[#6F6970] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        title="తొలగించండి"
                        className="p-1.5 rounded-lg text-[#6F6970] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
