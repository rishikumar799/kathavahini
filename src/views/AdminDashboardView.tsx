import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  LogIn, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  User, 
  WriterApplication, 
  Story, 
  Novel, 
  Episode,
  Joke, 
  KnowledgeArticle,
  CategoryItem, 
  Comment, 
  IssueReport, 
  ContactSubmission, 
  AdminAuditLog, 
  AccountStatus,
  ContentVisibility,
  ContentStatus
} from '../types';
import { adminService } from '../services/adminService';
import { authService, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD } from '../services/authService';
import { deletionTracker } from '../services/deletionTracker';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminOverviewView } from '../components/admin/AdminOverviewView';
import { AdminUsersView } from '../components/admin/AdminUsersView';
import { AdminApplicationsView } from '../components/admin/AdminApplicationsView';
import { AdminStoriesView } from '../components/admin/AdminStoriesView';
import { AdminNovelsView } from '../components/admin/AdminNovelsView';
import { AdminEpisodesView } from '../components/admin/AdminEpisodesView';
import { AdminJokesView } from '../components/admin/AdminJokesView';
import { AdminKnowledgeView } from '../components/admin/AdminKnowledgeView';
import { AdminCategoriesView } from '../components/admin/AdminCategoriesView';
import { AdminCommentsView } from '../components/admin/AdminCommentsView';
import { AdminReportsView } from '../components/admin/AdminReportsView';
import { AdminContactView } from '../components/admin/AdminContactView';
import { AdminAuditLogsView } from '../components/admin/AdminAuditLogsView';
import { AdminSettingsView } from '../components/admin/AdminSettingsView';
import { AdminAnnouncementsView } from '../components/admin/AdminAnnouncementsView';
import { AdminContentEditorModal } from '../components/admin/AdminContentEditorModal';
import { AdminAddUserModal } from '../components/admin/AdminAddUserModal';

interface AdminDashboardViewProps {
  currentUser: User | null;
  onSelectStory?: (story: Story) => void;
  onBack: () => void;
  onViewWebsite?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onSelectStory,
  onBack,
  onViewWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Platform Data
  const [counts, setCounts] = useState({
    pendingApplications: 0,
    pendingStories: 0,
    publishedStories: 0,
    draftsCount: 0,
    scheduledCount: 0,
    hiddenCount: 0,
    privateCount: 0,
    totalUsers: 0,
    totalReaders: 0,
    totalWriters: 0,
    totalNovels: 0,
    totalEpisodes: 0,
    totalJokes: 0,
    totalKnowledge: 0,
    pendingReports: 0,
    unreadContacts: 0,
  });

  // Admin login gate state
  const [adminEmailInput, setAdminEmailInput] = useState(MASTER_ADMIN_EMAIL);
  const [adminPasswordInput, setAdminPasswordInput] = useState(MASTER_ADMIN_PASSWORD);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Modals state
  const [selectedAppForReview, setSelectedAppForReview] = useState<WriterApplication | null>(null);
  const [selectedStoryForPreview, setSelectedStoryForPreview] = useState<Story | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  // Content Editor Modal state
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    contentType: 'story' | 'novel' | 'episode' | 'joke' | 'knowledge';
    initialData?: any;
    novelContext?: Novel;
  }>({
    isOpen: false,
    contentType: 'story',
    initialData: null,
    novelContext: undefined,
  });

  // Fetch all admin data
  const loadAdminData = async (showLoadingSpinner: boolean = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      await deletionTracker.init();
      const [
        cnts,
        apps,
        sts,
        usrs,
        nvls,
        eps,
        jks,
        kno,
        cats,
        cmts,
        reps,
        cntsList,
        logs,
      ] = await Promise.all([
        adminService.getDashboardCounts(),
        adminService.getWriterApplications(),
        adminService.getStories(),
        adminService.getUsers(),
        adminService.getNovels(),
        adminService.getEpisodes(),
        adminService.getJokes(),
        adminService.getKnowledgeArticles(),
        adminService.getCategories(),
        adminService.getAllComments(),
        adminService.getIssueReports(),
        adminService.getContactSubmissions(),
        adminService.getAuditLogs(),
      ]);

      setCounts(cnts);
      setApplications(apps);
      setStories(sts);
      setUsers(usrs);
      setNovels(nvls);
      setEpisodes(eps);
      setJokes(jks);
      setKnowledge(kno);
      setCategories(cats);
      setComments(cmts);
      setReports(reps);
      setContacts(cntsList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading admin control center data:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData(true);

      const handleRefresh = () => {
        loadAdminData(false);
      };
      const handleItemDeleted = (e: any) => {
        const { id, type } = e.detail || {};
        if (id) {
          if (type === 'story') {
            setStories(prev => prev.filter(s => s.id !== id));
          } else if (type === 'novel') {
            setNovels(prev => prev.filter(n => n.id !== id));
          } else if (type === 'joke') {
            setJokes(prev => prev.filter(j => j.id !== id));
          } else if (type === 'knowledge') {
            setKnowledge(prev => prev.filter(k => k.id !== id));
          } else if (type === 'category') {
            setCategories(prev => prev.filter(c => c.id !== id && c.slug !== id));
          }
        }
        loadAdminData(false);
      };

      window.addEventListener('kathavahini:refresh-content', handleRefresh);
      window.addEventListener('kathavahini:item-deleted', handleItemDeleted);
      window.addEventListener('kathavahini:story-deleted', handleRefresh);
      window.addEventListener('kathavahini:categories-updated', handleRefresh);
      window.addEventListener('kathavahini:announcements-updated', handleRefresh);

      return () => {
        window.removeEventListener('kathavahini:refresh-content', handleRefresh);
        window.removeEventListener('kathavahini:item-deleted', handleItemDeleted);
        window.removeEventListener('kathavahini:story-deleted', handleRefresh);
        window.removeEventListener('kathavahini:categories-updated', handleRefresh);
        window.removeEventListener('kathavahini:announcements-updated', handleRefresh);
      };
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleAdminDirectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      await authService.loginWithEmail(adminEmailInput.trim(), adminPasswordInput);
    } catch (err: any) {
      console.error('Admin direct login error:', err);
      setAdminLoginError(authService.getErrorMessage(err));
    } finally {
      setAdminLoginLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'add-user') {
      setAddUserModalOpen(true);
    }
  }, [activeTab]);

  const adminUid = currentUser?.id || 'admin_session';
  const adminEmail = currentUser?.email || 'thekathavahini@gmail.com';

  // Application Actions
  const handleApproveApplication = async (app: WriterApplication) => {
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
    setCounts(prev => ({ ...prev, pendingApplications: Math.max(0, prev.pendingApplications - 1) }));
    try {
      const targetUid = app.applicantUid || (app as any).uid || (app as any).userId || app.id || '';
      await adminService.approveWriterApplication(app.id || '', targetUid, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error approving application:', err);
      loadAdminData(false);
    }
  };

  const handleRejectApplication = async (app: WriterApplication, reason: string) => {
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected', rejectionReason: reason } : a));
    setCounts(prev => ({ ...prev, pendingApplications: Math.max(0, prev.pendingApplications - 1) }));
    try {
      const targetUid = app.applicantUid || (app as any).uid || (app as any).userId || app.id || '';
      await adminService.rejectWriterApplication(app.id || '', targetUid, adminUid, reason, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error rejecting application:', err);
      loadAdminData(false);
    }
  };

  // Story Actions
  const handleApproveStory = async (story: Story) => {
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: 'published' as ContentStatus } : s));
    setCounts(prev => ({
      ...prev,
      pendingStories: Math.max(0, prev.pendingStories - 1),
      publishedStories: prev.publishedStories + 1,
    }));
    try {
      await adminService.approveStory(story.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error approving story:', err);
      loadAdminData(false);
    }
  };

  const handleRejectStory = async (story: Story, reason: string) => {
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: 'rejected' as ContentStatus, rejectionReason: reason } : s));
    setCounts(prev => ({
      ...prev,
      pendingStories: Math.max(0, prev.pendingStories - 1),
    }));
    try {
      await adminService.rejectStory(story.id, reason, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error rejecting story:', err);
      loadAdminData(false);
    }
  };

  const handleArchiveStory = async (story: Story) => {
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: 'archived' as ContentStatus } : s));
    try {
      await adminService.archiveStory(story.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error archiving story:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteStory = async (story: Story) => {
    // Immediate UI update - removed immediately from frontend
    setStories(prev => prev.filter(s => s.id !== story.id));
    setCounts(prev => ({
      ...prev,
      publishedStories: story.status === 'published' ? Math.max(0, prev.publishedStories - 1) : prev.publishedStories,
      pendingStories: story.status === 'pending' ? Math.max(0, prev.pendingStories - 1) : prev.pendingStories,
    }));
    try {
      await adminService.deleteStory(story.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting story:', err);
      loadAdminData(false);
    }
  };

  const handlePublishStoryNow = async (story: Story) => {
    setStories(prev => prev.map(s => s.id === story.id ? { 
      ...s, 
      status: 'published' as ContentStatus, 
      visibility: 'public' as ContentVisibility,
      publishedAt: new Date().toISOString().split('T')[0]
    } : s));
    try {
      await adminService.publishStoryNow(story.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error publishing story now:', err);
      loadAdminData(false);
    }
  };

  const handleSetStoryVisibility = async (story: Story, visibility: ContentVisibility) => {
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, visibility } : s));
    try {
      await adminService.setStoryVisibility(story.id, visibility, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error setting story visibility:', err);
      loadAdminData(false);
    }
  };

  // Novel & Episode Actions
  const handleArchiveNovel = async (novel: Novel) => {
    setNovels(prev => prev.map(n => n.id === novel.id ? { ...n, status: 'archived' as any } : n));
    try {
      await adminService.archiveNovel(novel.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error archiving novel:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteNovel = async (novel: Novel) => {
    // Immediate UI update
    setNovels(prev => prev.filter(n => n.id !== novel.id));
    setCounts(prev => ({ ...prev, totalNovels: Math.max(0, prev.totalNovels - 1) }));
    try {
      await adminService.deleteNovel(novel.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting novel:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteEpisode = async (episode: Episode) => {
    // Immediate UI update
    setEpisodes(prev => prev.filter(e => e.id !== episode.id));
    setCounts(prev => ({ ...prev, totalEpisodes: Math.max(0, prev.totalEpisodes - 1) }));
    try {
      await adminService.deleteEpisode(episode.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting episode:', err);
      loadAdminData(false);
    }
  };

  // Joke Actions
  const handleDeleteJoke = async (joke: Joke) => {
    // Immediate UI update
    setJokes(prev => prev.filter(j => j.id !== joke.id));
    setCounts(prev => ({ ...prev, totalJokes: Math.max(0, prev.totalJokes - 1) }));
    try {
      await adminService.deleteJoke(joke.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting joke:', err);
      loadAdminData(false);
    }
  };

  // Knowledge Actions
  const handleDeleteKnowledge = async (art: KnowledgeArticle) => {
    // Immediate UI update
    setKnowledge(prev => prev.filter(k => k.id !== art.id));
    setCounts(prev => ({ ...prev, totalKnowledge: Math.max(0, prev.totalKnowledge - 1) }));
    try {
      await adminService.deleteKnowledgeArticle(art.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting knowledge article:', err);
      loadAdminData(false);
    }
  };

  // User Actions
  const handleToggleUserStatus = async (user: User, newStatus: AccountStatus) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    try {
      await adminService.updateUserStatus(user.id, newStatus, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error updating user status:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Immediate UI update
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setCounts(prev => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
    try {
      await adminService.deleteUser(user.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      loadAdminData(false);
    }
  };

  const handlePromoteUserToWriter = async (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'writer' as const } : u));
    setCounts(prev => ({
      ...prev,
      totalWriters: prev.totalWriters + 1,
      totalReaders: Math.max(0, prev.totalReaders - 1),
    }));
    try {
      await adminService.promoteUserToWriter(user.id, {
        penName: user.displayName || user.name,
        bio: user.bio,
      }, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error promoting user to writer:', err);
      loadAdminData(false);
    }
  };

  // Categories & Comments & Reports & Contact
  const handleAddCategory = async (catData: { name: string; teluguName: string; description?: string }) => {
    try {
      const newCat = await adminService.addCategory(catData, adminUid, adminEmail);
      setCategories(prev => [newCat, ...prev]);
      loadAdminData(false);
    } catch (err) {
      console.error('Error adding category:', err);
      loadAdminData(false);
    }
  };

  const handleToggleCategoryStatus = async (catId: string, status: 'active' | 'archived') => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, status, isActive: status === 'active' } : c));
    try {
      await adminService.toggleCategoryStatus(catId, status, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error toggling category status:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    // Immediate UI update
    setCategories(prev => prev.filter(c => c.id !== catId));
    try {
      await adminService.deleteCategory(catId, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting category:', err);
      loadAdminData(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    // Immediate UI update
    setComments(prev => prev.filter(c => c.id !== comment.id));
    try {
      await adminService.deleteComment(comment.id, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error deleting comment:', err);
      loadAdminData(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    try {
      await adminService.updateReportStatus(reportId, status, adminUid, adminEmail);
      loadAdminData(false);
    } catch (err) {
      console.error('Error updating report status:', err);
      loadAdminData(false);
    }
  };

  const handleUpdateContactStatus = async (contactId: string, status: 'unread' | 'read' | 'resolved') => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status } : c));
    try {
      await adminService.updateContactStatus(contactId, status);
      loadAdminData(false);
    } catch (err) {
      console.error('Error updating contact status:', err);
      loadAdminData(false);
    }
  };

  // Save from unified editor modal
  const handleSaveEditorContent = async (data: any) => {
    setActionLoading(true);
    try {
      const type = editorModal.contentType;
      const isEdit = !!editorModal.initialData?.id;
      const itemId = editorModal.initialData?.id;

      if (type === 'story') {
        if (isEdit) {
          await adminService.updateStory(itemId, data, adminUid, adminEmail);
        } else {
          await adminService.createStory(data, adminUid, adminEmail);
        }
      } else if (type === 'novel') {
        if (isEdit) {
          await adminService.updateNovel(itemId, data, adminUid, adminEmail);
        } else {
          await adminService.createNovel(data, adminUid, adminEmail);
        }
      } else if (type === 'episode') {
        if (isEdit) {
          await adminService.updateEpisode(itemId, data, adminUid, adminEmail);
        } else {
          await adminService.createEpisode(data, adminUid, adminEmail);
        }
      } else if (type === 'joke') {
        if (isEdit) {
          await adminService.updateJoke(itemId, data, adminUid, adminEmail);
        } else {
          await adminService.createJoke(data, adminUid, adminEmail);
        }
      } else if (type === 'knowledge') {
        if (isEdit) {
          await adminService.updateKnowledgeArticle(itemId, data, adminUid, adminEmail);
        } else {
          await adminService.createKnowledgeArticle(data, adminUid, adminEmail);
        }
      }

      setEditorModal(prev => ({ ...prev, isOpen: false, initialData: null }));
      await loadAdminData();
    } catch (err) {
      console.error('Error saving content in modal:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onBack();
  };

  const pendingAppsList = applications.filter(a => a.status === 'pending');
  const pendingStoriesList = stories.filter(s => s.status === 'pending');

  // Gated Access Screen for Non-Admin
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF7F2] dark:bg-[#0E0D13]">
        <div className="w-full max-w-md bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer font-serif-telugu"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>హోమ్ పేజీకి వెళ్లండి</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 px-2.5 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span>అడ్మిన్ పోర్టల్</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              కథావాహిని ప్రధాన నిర్వాహకుడు
            </h2>
            <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
              కంట్రోల్ ప్యానెల్ యాక్సెస్ చేయడానికి అధికారిక అడ్మిన్ క్రెడెన్షియల్స్‌తో లాగిన్ అవ్వండి.
            </p>
          </div>

          {currentUser && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 font-serif-telugu space-y-1">
              <p className="font-bold">⚠️ ప్రస్తుత లాగిన్: {currentUser.name} ({currentUser.email})</p>
              <p className="text-[11px] opacity-85">ఈ ఖాతాకు అడ్మిన్ అనుమతులు లేవు. ప్రధాన అడ్మిన్ ఖాతాతో లాగిన్ అవ్వండి.</p>
            </div>
          )}

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed">{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                అడ్మిన్ ఈమెయిల్ (Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Mail className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                పాస్‌వర్డ్ (Password)
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Lock className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-2.5 p-1 text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{adminLoginLoading ? 'ధృవీకరిస్తోంది...' : 'అడ్మిన్‌గా లాగిన్ అవ్వండి'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAdminEmailInput(MASTER_ADMIN_EMAIL);
                setAdminPasswordInput(MASTER_ADMIN_PASSWORD);
                authService.loginWithEmail(MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD).catch(err => {
                  setAdminLoginError(authService.getErrorMessage(err));
                });
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ఒకే క్లిక్‌తో అడ్మిన్‌గా ప్రవేశించండి (Instant Access)</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0E0D13] text-[#17151A] dark:text-[#F7F3EE] flex">
      {/* 1. ADMIN SIDEBAR */}
      <AdminSidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        counts={{
          pendingApplications: pendingAppsList.length,
          pendingStories: pendingStoriesList.length,
          pendingReports: counts.pendingReports,
          unreadContacts: counts.unreadContacts,
        }}
        onViewWebsite={onViewWebsite || onBack}
        onLogout={handleLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. ADMIN MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <AdminHeader
          currentTab={activeTab}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onRefresh={loadAdminData}
          loading={loading || actionLoading}
          onViewWebsite={onViewWebsite || onBack}
          onLogout={handleLogout}
          notificationsCount={pendingAppsList.length + pendingStoriesList.length}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <AdminOverviewView
              counts={counts}
              pendingApplications={pendingAppsList}
              pendingStories={pendingStoriesList}
              recentUsers={users}
              recentStories={stories}
              recentAuditLogs={auditLogs}
              onNavigateTab={setActiveTab}
              onOpenAppReview={app => setSelectedAppForReview(app)}
              onOpenStoryPreview={story => setSelectedStoryForPreview(story)}
              onQuickApproveApp={handleApproveApplication}
              onQuickRejectApp={app => setSelectedAppForReview(app)}
              onQuickApproveStory={handleApproveStory}
              onQuickRejectStory={story => setSelectedStoryForPreview(story)}
              onOpenCreateStory={() => setEditorModal({ isOpen: true, contentType: 'story', initialData: null })}
              onOpenCreateNovel={() => setEditorModal({ isOpen: true, contentType: 'novel', initialData: null })}
              onOpenAddUser={() => setAddUserModalOpen(true)}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersView
              users={users}
              onToggleStatus={handleToggleUserStatus}
              onPromoteToWriter={handlePromoteUserToWriter}
              onOpenAddUser={() => setAddUserModalOpen(true)}
              onDeleteUser={handleDeleteUser}
              actionLoading={actionLoading}
              filterRole="all"
            />
          )}

          {activeTab === 'readers' && (
            <AdminUsersView
              users={users}
              onToggleStatus={handleToggleUserStatus}
              onPromoteToWriter={handlePromoteUserToWriter}
              onOpenAddUser={() => setAddUserModalOpen(true)}
              onDeleteUser={handleDeleteUser}
              actionLoading={actionLoading}
              filterRole="reader"
            />
          )}

          {activeTab === 'writers' && (
            <AdminUsersView
              users={users}
              onToggleStatus={handleToggleUserStatus}
              onPromoteToWriter={handlePromoteUserToWriter}
              onOpenAddUser={() => setAddUserModalOpen(true)}
              onDeleteUser={handleDeleteUser}
              actionLoading={actionLoading}
              filterRole="writer"
            />
          )}

          {activeTab === 'add-user' && (
            <AdminUsersView
              users={users}
              onToggleStatus={handleToggleUserStatus}
              onPromoteToWriter={handlePromoteUserToWriter}
              onOpenAddUser={() => setAddUserModalOpen(true)}
              onDeleteUser={handleDeleteUser}
              actionLoading={actionLoading}
              filterRole="all"
            />
          )}

          {activeTab === 'writer-applications' && (
            <AdminApplicationsView
              applications={applications}
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              actionLoading={actionLoading}
              selectedAppForReview={selectedAppForReview}
              onOpenReview={app => setSelectedAppForReview(app)}
              onCloseReview={() => setSelectedAppForReview(null)}
            />
          )}

          {(activeTab === 'stories' || activeTab === 'pending-stories') && (
            <AdminStoriesView
              stories={stories}
              initialFilter={activeTab === 'pending-stories' ? 'pending' : 'all'}
              onApprove={handleApproveStory}
              onReject={handleRejectStory}
              onArchive={handleArchiveStory}
              onDeleteStory={handleDeleteStory}
              onEditStory={story => setEditorModal({ isOpen: true, contentType: 'story', initialData: story })}
              onPublishNow={handlePublishStoryNow}
              onSetVisibility={handleSetStoryVisibility}
              onCreateNewStory={() => setEditorModal({ isOpen: true, contentType: 'story', initialData: null })}
              actionLoading={actionLoading}
              selectedStoryForPreview={selectedStoryForPreview}
              onOpenPreview={story => setSelectedStoryForPreview(story)}
              onClosePreview={() => setSelectedStoryForPreview(null)}
            />
          )}

          {activeTab === 'novels' && (
            <AdminNovelsView
              novels={novels}
              onArchiveNovel={handleArchiveNovel}
              onDeleteNovel={handleDeleteNovel}
              onEditNovel={novel => setEditorModal({ isOpen: true, contentType: 'novel', initialData: novel })}
              onCreateNovel={() => setEditorModal({ isOpen: true, contentType: 'novel', initialData: null })}
              onCreateEpisode={novel => setEditorModal({ isOpen: true, contentType: 'episode', initialData: null, novelContext: novel })}
              onViewEpisodes={novel => setActiveTab('episodes')}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'episodes' && (
            <AdminEpisodesView
              episodes={episodes}
              novels={novels}
              onCreateEpisode={novel => setEditorModal({ isOpen: true, contentType: 'episode', initialData: null, novelContext: novel })}
              onEditEpisode={ep => setEditorModal({ isOpen: true, contentType: 'episode', initialData: ep })}
              onDeleteEpisode={handleDeleteEpisode}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'jokes' && (
            <AdminJokesView
              jokes={jokes}
              onDeleteJoke={handleDeleteJoke}
              onEditJoke={joke => setEditorModal({ isOpen: true, contentType: 'joke', initialData: joke })}
              onCreateJoke={() => setEditorModal({ isOpen: true, contentType: 'joke', initialData: null })}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'knowledge' && (
            <AdminKnowledgeView
              articles={knowledge}
              onCreateArticle={() => setEditorModal({ isOpen: true, contentType: 'knowledge', initialData: null })}
              onEditArticle={art => setEditorModal({ isOpen: true, contentType: 'knowledge', initialData: art })}
              onDeleteArticle={handleDeleteKnowledge}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesView
              categories={categories}
              onAddCategory={handleAddCategory}
              onToggleStatus={handleToggleCategoryStatus}
              onDeleteCategory={handleDeleteCategory}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsView currentUser={currentUser} />
          )}

          {activeTab === 'comments' && (
            <AdminCommentsView
              comments={comments}
              onDeleteComment={handleDeleteComment}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReportsView
              reports={reports}
              onUpdateStatus={handleUpdateReportStatus}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'contact' && (
            <AdminContactView
              contacts={contacts}
              onUpdateStatus={handleUpdateContactStatus}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AdminAuditLogsView logs={auditLogs} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Unified Content Editor Modal */}
      <AdminContentEditorModal
        isOpen={editorModal.isOpen}
        onClose={() => setEditorModal(prev => ({ ...prev, isOpen: false, initialData: null }))}
        contentType={editorModal.contentType}
        initialData={editorModal.initialData}
        novelContext={editorModal.novelContext}
        novelsList={novels}
        onSave={handleSaveEditorContent}
      />

      {/* Admin Add User Modal */}
      <AdminAddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserCreated={loadAdminData}
        adminUid={adminUid}
        adminEmail={adminEmail}
      />
    </div>
  );
};
