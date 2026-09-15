import React from 'react';
import {
  Users,
  BookOpen,
  Feather,
  FileCheck2,
  Library,
  CheckCircle2,
  Bookmark,
  Smile,
  Lightbulb,
  Tags,
  AlertTriangle,
  Mail,
  ArrowRight,
  Clock,
  ShieldCheck,
  Eye,
  Check,
  X,
  History,
  Plus,
  Layers,
  FileText,
  UserPlus
} from 'lucide-react';
import { WriterApplication, Story, User, AdminAuditLog } from '../../types';
import { AdminTab } from './AdminSidebar';
import { formatSafeDate, formatSafeDateTime } from '../../utils/dateUtils';

interface AdminOverviewViewProps {
  counts: {
    pendingApplications: number;
    pendingStories: number;
    publishedStories: number;
    draftsCount?: number;
    scheduledCount?: number;
    hiddenCount?: number;
    privateCount?: number;
    totalUsers: number;
    totalReaders: number;
    totalWriters: number;
    totalNovels?: number;
    totalEpisodes?: number;
    totalJokes?: number;
    totalKnowledge?: number;
    pendingReports: number;
    unreadContacts: number;
  };
  pendingApplications: WriterApplication[];
  pendingStories: Story[];
  recentUsers: User[];
  recentStories: Story[];
  recentAuditLogs: AdminAuditLog[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAppReview: (app: WriterApplication) => void;
  onOpenStoryPreview: (story: Story) => void;
  onQuickApproveApp: (app: WriterApplication) => void;
  onQuickRejectApp: (app: WriterApplication) => void;
  onQuickApproveStory: (story: Story) => void;
  onQuickRejectStory: (story: Story) => void;
  onOpenCreateStory?: () => void;
  onOpenCreateNovel?: () => void;
  onOpenAddUser?: () => void;
  actionLoading: boolean;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  counts,
  pendingApplications,
  pendingStories,
  recentUsers,
  recentStories,
  recentAuditLogs,
  onNavigateTab,
  onOpenAppReview,
  onOpenStoryPreview,
  onQuickApproveApp,
  onQuickRejectApp,
  onQuickApproveStory,
  onQuickRejectStory,
  onOpenCreateStory,
  onOpenCreateNovel,
  onOpenAddUser,
  actionLoading,
}) => {
  const totalReaders = counts.totalReaders ?? Math.max(counts.totalUsers - counts.totalWriters, 0);

  const stats = [
    { label: 'మొత్తం యూజర్లు', sub: 'Total Users', val: counts.totalUsers, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', tab: 'readers' as AdminTab },
    { label: 'పాఠకుల సంఖ్య', sub: 'Total Readers', val: totalReaders, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', tab: 'readers' as AdminTab },
    { label: 'రచయితల సంఖ్య', sub: 'Total Writers', val: counts.totalWriters, icon: Feather, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', tab: 'writers' as AdminTab },
    { label: 'రచయిత దరఖాస్తులు', sub: 'Pending Applications', val: counts.pendingApplications, icon: FileCheck2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', urgent: counts.pendingApplications > 0, tab: 'writer-applications' as AdminTab },
    { label: 'సమీక్షలో కథలు', sub: 'Pending Stories', val: counts.pendingStories, icon: Clock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', urgent: counts.pendingStories > 0, tab: 'pending-stories' as AdminTab },
    { label: 'ప్రచురిత కథలు', sub: 'Published Stories', val: counts.publishedStories, icon: CheckCircle2, color: 'text-[#7A284B] dark:text-[#D87591]', bg: 'bg-[#7A284B]/10', tab: 'stories' as AdminTab },
    { label: 'నవలల విభాగం', sub: 'Novels', val: counts.totalNovels ?? 6, icon: Bookmark, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', tab: 'novels' as AdminTab },
    { label: 'ఎపిసోడ్లు / భాగాలు', sub: 'Episodes', val: counts.totalEpisodes ?? 0, icon: Layers, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/10', tab: 'episodes' as AdminTab },
    { label: 'హాస్య జోకులు', sub: 'Jokes', val: counts.totalJokes ?? 12, icon: Smile, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', tab: 'jokes' as AdminTab },
    { label: 'సాహిత్య విజ్ఞానం', sub: 'Knowledge', val: counts.totalKnowledge ?? 8, icon: Lightbulb, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', tab: 'knowledge' as AdminTab },
    { label: 'ఫిర్యాదులు (Reports)', sub: 'Pending Reports', val: counts.pendingReports, icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', tab: 'reports' as AdminTab },
    { label: 'సందేశాలు (Messages)', sub: 'Unread Messages', val: counts.unreadContacts, icon: Mail, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', tab: 'contact' as AdminTab },
  ];

  return (
    <div className="space-y-8">
      {/* 0. QUICK LAUNCH ACTION TILES */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#7A284B]/10 via-[#FAF7F2] to-[#7A284B]/5 dark:from-[#7A284B]/20 dark:via-[#18181F] dark:to-[#7A284B]/10 border border-[#7A284B]/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            శీఘ్ర నిర్వహణ చర్యలు (Quick Publishing & User Actions)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            అడ్మిన్ అధికారంతో నేరుగా కంటెంట్ సృష్టించండి లేదా యూజర్లను చేర్చండి
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCreateStory && (
            <button
              onClick={onOpenCreateStory}
              className="px-3.5 py-2 rounded-2xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all shadow-md shadow-[#7A284B]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>కొత్త కథ రాయండి</span>
            </button>
          )}
          {onOpenCreateNovel && (
            <button
              onClick={onOpenCreateNovel}
              className="px-3.5 py-2 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              <span>కొత్త నవల</span>
            </button>
          )}
          {onOpenAddUser && (
            <button
              onClick={onOpenAddUser}
              className="px-3.5 py-2 rounded-2xl bg-[#18181F] dark:bg-white text-white dark:text-[#18181F] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#26242E]"
            >
              <UserPlus className="w-4 h-4" />
              <span>యూజర్‌ను జోడించండి</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. METRICS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
              సిస్టమ్ గణాంకాలు & సారాంశం (Platform Metrics)
            </h2>
            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              కథావాహిని ప్లాట్‌ఫారమ్ యొక్క ప్రస్తుత డేటా మరియు సమీక్ష క్యూలు
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateTab(s.tab)}
                className={`p-4 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                  s.urgent ? 'ring-2 ring-amber-500/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl ${s.bg} ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {s.urgent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-0.5">
                  <div className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE] tracking-tight">
                    {s.val}
                  </div>
                  <div className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu truncate">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] flex items-center justify-between">
                    <span>{s.sub}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#7A284B] dark:text-[#D87591]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. URGENT REVIEW QUEUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Writer Applications */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                    రచయిత దరఖాస్తులు (Pending Applications)
                  </h3>
                  <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                    పరిశీలనకు వేచి ఉన్న రచయితల అభ్యర్థనలు ({pendingApplications.length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('writer-applications')}
                className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer flex items-center gap-1"
              >
                అన్నీ చూడండి <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingApplications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-1 bg-[#FAF7F2] dark:bg-[#121118] rounded-2xl border border-dashed border-[#E8E1DA] dark:border-[#26242E]">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 opacity-80 mb-1" />
                <p className="font-bold text-[#17151A] dark:text-[#F7F3EE]">పెండింగ్ దరఖాస్తులు ఏవీ లేవు</p>
                <p>అన్ని దరఖాస్తులు సమీక్షించబడ్డాయి.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingApplications.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between gap-3 hover:border-[#7A284B]/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#17151A] dark:text-[#F7F3EE] truncate">
                          {app.penName || app.displayName || app.fullName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600">
                          {app.applicantType === 'reader_conversion' ? 'Reader Conversion' : 'New Writer'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] truncate">
                        {app.email || app.mobileNumber || 'సమర్పణ: ' + formatSafeDate(app.submittedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenAppReview(app)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] hover:bg-[#FAF7F2] text-[#17151A] dark:text-[#F7F3EE] cursor-pointer"
                      >
                        సమీక్షించు
                      </button>
                      <button
                        onClick={() => onQuickApproveApp(app)}
                        disabled={actionLoading}
                        className="p-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                        title="ఆమోదించు"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Stories Moderation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                    సమీక్షలో కథలు (Stories for Approval)
                  </h3>
                  <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                    ప్రచురణకు ఆమోదం కోరిన కథలు ({pendingStories.length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('pending-stories')}
                className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer flex items-center gap-1"
              >
                అన్నీ చూడండి <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingStories.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-1 bg-[#FAF7F2] dark:bg-[#121118] rounded-2xl border border-dashed border-[#E8E1DA] dark:border-[#26242E]">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 opacity-80 mb-1" />
                <p className="font-bold text-[#17151A] dark:text-[#F7F3EE]">సమీక్షలో కథలు ఏవీ లేవు</p>
                <p>అన్ని సమర్పించిన కథలు ప్రాసెస్ చేయబడ్డాయి.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingStories.slice(0, 3).map(story => (
                  <div
                    key={story.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between gap-3 hover:border-[#7A284B]/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                        {story.teluguTitle || story.title}
                      </h4>
                      <p className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] truncate">
                        రచయిత: {story.authorName || story.author?.name} • వర్గం: {story.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenStoryPreview(story)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] hover:bg-[#FAF7F2] text-[#17151A] dark:text-[#F7F3EE] cursor-pointer"
                      >
                        చదవండి
                      </button>
                      <button
                        onClick={() => onQuickApproveStory(story)}
                        disabled={actionLoading}
                        className="p-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                        title="ప్రచురించు"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RECENT AUDIT LOGS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                ఇటీవలి అడ్మిన్ ఆడిట్ లాగ్స్ (Recent Audit Actions)
              </h3>
              <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                సిస్టమ్ మార్పులు, ఆమోదాలు మరియు భద్రతా రికార్డులు
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer flex items-center gap-1"
          >
            అన్ని లాగ్స్ <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentAuditLogs.slice(0, 4).map(log => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#7A284B] shrink-0" />
                <span className="font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                  {log.action}
                </span>
                <span className="text-[#6F6970] dark:text-[#A29CA6] truncate hidden sm:inline">
                  {log.targetTitle || log.targetId}
                </span>
              </div>
              <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] shrink-0 font-mono">
                {formatSafeDateTime(log.createdAt || (log as any).timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
