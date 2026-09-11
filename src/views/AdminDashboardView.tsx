import React, { useState, useEffect } from 'react';
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
import { authService } from '../services/authService';
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
  const loadAdminData = async () => {
    setLoading(true);
    try {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const adminUid = currentUser?.id || 'admin_session';
  const adminEmail = currentUser?.email || 'thekathavahini@gmail.com';

  // Application Actions
  const handleApproveApplication = async (app: WriterApplication) => {
    setActionLoading(true);
    try {
      const targetUid = app.applicantUid || (app as any).uid || (app as any).userId || app.id || '';
      await adminService.approveWriterApplication(app.id || '', targetUid, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error approving application:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (app: WriterApplication, reason: string) => {
    setActionLoading(true);
    try {
      const targetUid = app.applicantUid || (app as any).uid || (app as any).userId || app.id || '';
      await adminService.rejectWriterApplication(app.id || '', targetUid, adminUid, reason, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error rejecting application:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Story Actions
  const handleApproveStory = async (story: Story) => {
    setActionLoading(true);
    try {
      await adminService.approveStory(story.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error approving story:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStory = async (story: Story, reason: string) => {
    setActionLoading(true);
    try {
      await adminService.rejectStory(story.id, reason, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error rejecting story:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveStory = async (story: Story) => {
    setActionLoading(true);
    try {
      await adminService.archiveStory(story.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error archiving story:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStory = async (story: Story) => {
    setActionLoading(true);
    try {
      await adminService.deleteStory(story.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting story:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishStoryNow = async (story: Story) => {
    setActionLoading(true);
    try {
      await adminService.publishStoryNow(story.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error publishing story now:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetStoryVisibility = async (story: Story, visibility: ContentVisibility) => {
    setActionLoading(true);
    try {
      await adminService.setStoryVisibility(story.id, visibility, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error setting story visibility:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Novel & Episode Actions
  const handleArchiveNovel = async (novel: Novel) => {
    setActionLoading(true);
    try {
      await adminService.archiveNovel(novel.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error archiving novel:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNovel = async (novel: Novel) => {
    setActionLoading(true);
    try {
      await adminService.deleteNovel(novel.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting novel:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEpisode = async (episode: Episode) => {
    setActionLoading(true);
    try {
      await adminService.deleteEpisode(episode.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting episode:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Joke Actions
  const handleDeleteJoke = async (joke: Joke) => {
    setActionLoading(true);
    try {
      await adminService.deleteJoke(joke.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting joke:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Knowledge Actions
  const handleDeleteKnowledge = async (art: KnowledgeArticle) => {
    setActionLoading(true);
    try {
      await adminService.deleteKnowledgeArticle(art.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting knowledge article:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // User Actions
  const handleToggleUserStatus = async (user: User, newStatus: AccountStatus) => {
    setActionLoading(true);
    try {
      await adminService.updateUserStatus(user.id, newStatus, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error updating user status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteUserToWriter = async (user: User) => {
    setActionLoading(true);
    try {
      await adminService.promoteUserToWriter(user.id, {
        penName: user.displayName || user.name,
        bio: user.bio,
      }, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error promoting user to writer:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Categories & Comments & Reports & Contact
  const handleAddCategory = async (catData: { name: string; teluguName: string; description?: string }) => {
    setActionLoading(true);
    try {
      await adminService.addCategory(catData, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCategoryStatus = async (catId: string, status: 'active' | 'archived') => {
    setActionLoading(true);
    try {
      await adminService.toggleCategoryStatus(catId, status, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error toggling category status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    setActionLoading(true);
    try {
      await adminService.deleteComment(comment.id, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setActionLoading(true);
    try {
      await adminService.updateReportStatus(reportId, status, adminUid, adminEmail);
      await loadAdminData();
    } catch (err) {
      console.error('Error updating report status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateContactStatus = async (contactId: string, status: 'unread' | 'read' | 'resolved') => {
    setActionLoading(true);
    try {
      await adminService.updateContactStatus(contactId, status);
      await loadAdminData();
    } catch (err) {
      console.error('Error updating contact status:', err);
    } finally {
      setActionLoading(false);
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
              actionLoading={actionLoading}
              filterRole="writer"
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
