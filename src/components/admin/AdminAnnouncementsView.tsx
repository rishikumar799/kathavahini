import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Feather,
  Globe,
  Upload,
  Image as ImageIcon,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Monitor,
  Smartphone,
  X,
  FileText,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import {
  Announcement,
  AnnouncementAudience,
  AnnouncementContentType,
  AnnouncementFrequency,
  AnnouncementLayout,
  AnnouncementPriority,
  AnnouncementStatus,
  User
} from '../../types';
import { announcementService } from '../../services/announcementService';
import { storageService } from '../../services/storageService';
import { AdminAnnouncementPreviewModal } from './AdminAnnouncementPreviewModal';
import { formatSafeDateTime } from '../../utils/dateUtils';

interface AdminAnnouncementsViewProps {
  currentUser: User | null;
}

export const AdminAnnouncementsView: React.FC<AdminAnnouncementsViewProps> = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all');
  const [audienceFilter, setAudienceFilter] = useState<AnnouncementAudience | 'all'>('all');

  // Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewingAnnouncement, setPreviewingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formContentType, setFormContentType] = useState<AnnouncementContentType>('text_only');
  const [formLayout, setFormLayout] = useState<AnnouncementLayout>('text_only');
  const [formImageURL, setFormImageURL] = useState('');
  const [formImageStoragePath, setFormImageStoragePath] = useState('');
  const [formImageAltText, setFormImageAltText] = useState('');
  const [formButtonText, setFormButtonText] = useState('');
  const [formButtonURL, setFormButtonURL] = useState('');
  const [formAudience, setFormAudience] = useState<AnnouncementAudience>('everyone');
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>('published');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('normal');
  const [formDelaySeconds, setFormDelaySeconds] = useState<number>(3);
  const [formFrequency, setFormFrequency] = useState<AnnouncementFrequency>('once_per_session');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formStartAt, setFormStartAt] = useState('');
  const [formEndAt, setFormEndAt] = useState('');

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mini preview tab inside editor
  const [editorPreviewDevice, setEditorPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await announcementService.getAllAnnouncements(statusFilter, audienceFilter);
      setAnnouncements(list);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
      setErrorBanner('ప్రకటనల డేటాను లోడ్ చేయడంలో లోపం సంభవించింది.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [statusFilter, audienceFilter]);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormMessage('');
    setFormContentType('text_only');
    setFormLayout('text_only');
    setFormImageURL('');
    setFormImageStoragePath('');
    setFormImageAltText('');
    setFormButtonText('');
    setFormButtonURL('');
    setFormAudience('everyone');
    setFormStatus('published');
    setFormPriority('normal');
    setFormDelaySeconds(3);
    setFormFrequency('once_per_session');
    setFormScheduledAt('');
    setFormStartAt('');
    setFormEndAt('');
    setErrorBanner(null);
    setIsEditorOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title || '');
    setFormMessage(ann.message || '');
    setFormContentType(ann.contentType || 'text_only');
    setFormLayout(ann.layout || 'text_only');
    setFormImageURL(ann.imageURL || '');
    setFormImageStoragePath(ann.imageStoragePath || '');
    setFormImageAltText(ann.imageAltText || '');
    setFormButtonText(ann.buttonText || '');
    setFormButtonURL(ann.buttonURL || '');
    setFormAudience(ann.audience || 'everyone');
    setFormStatus(ann.status || 'published');
    setFormPriority(ann.priority || 'normal');
    setFormDelaySeconds(typeof ann.displayDelaySeconds === 'number' ? ann.displayDelaySeconds : 3);
    setFormFrequency(ann.displayFrequency || 'once_per_session');
    setFormScheduledAt(ann.scheduledAt ? new Date(ann.scheduledAt).toISOString().slice(0, 16) : '');
    setFormStartAt(ann.startAt ? new Date(ann.startAt).toISOString().slice(0, 16) : '');
    setFormEndAt(ann.endAt ? new Date(ann.endAt).toISOString().slice(0, 16) : '');
    setErrorBanner(null);
    setIsEditorOpen(true);
  };

  // Handle Image File Upload to Firebase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and format (max 5MB, JPG/PNG/WEBP)
    // Validate image (Announcement images up to 10MB)
    const validation = storageService.validateImageFile(file, 10 * 1024 * 1024);
    if (!validation.isValid) {
      setErrorBanner(validation.error || 'చిత్రం పరిమాణం 10MB లోపు ఉండాలి.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const announcementTempId = editingAnnouncement ? editingAnnouncement.id : `new_${Date.now()}`;
      const result = await storageService.uploadAnnouncementImage(
        announcementTempId,
        file,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      setFormImageURL(result.downloadUrl);
      setFormImageStoragePath(result.storagePath);
      setUploadProgress(100);
      setSuccessBanner('చిత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది!');
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorBanner('చిత్రం అప్‌లోడ్ చేయడంలో లోపం: ' + (err.message || 'Firebase Storage error'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Announcement Handler
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setErrorBanner('దయచేసి ప్రకటన శీర్షికను (Title) నమోదు చేయండి.');
      return;
    }

    if (formContentType !== 'text_only' && !formImageURL.trim()) {
      setErrorBanner('ఈ లేఅవుట్ కోసం దయచేసి ఒక చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా URL ఇవ్వండి.');
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      const payload: any = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        contentType: formContentType,
        layout: formContentType === 'text_only' ? 'text_only' : formLayout,
        imageURL: formImageURL.trim() || undefined,
        imageStoragePath: formImageStoragePath || undefined,
        imageAltText: formImageAltText.trim() || undefined,
        buttonText: formButtonText.trim() || undefined,
        buttonURL: formButtonURL.trim() || undefined,
        audience: formAudience,
        status: formStatus,
        priority: formPriority,
        displayDelaySeconds: Number(formDelaySeconds),
        displayFrequency: formFrequency,
        scheduledAt: formStatus === 'scheduled' && formScheduledAt ? new Date(formScheduledAt).toISOString() : undefined,
        startAt: formStartAt ? new Date(formStartAt).toISOString() : undefined,
        endAt: formEndAt ? new Date(formEndAt).toISOString() : undefined,
      };

      if (editingAnnouncement) {
        await announcementService.updateAnnouncement(editingAnnouncement.id, payload, currentUser);
        setSuccessBanner('ప్రకటన విజయవంతంగా నవీకరించబడింది!');
      } else {
        await announcementService.createAnnouncement(payload, currentUser);
        setSuccessBanner('కొత్త ప్రకటన విజయవంతంగా ప్రచురించబడింది!');
      }

      setIsEditorOpen(false);
      setEditingAnnouncement(null);
      await loadAnnouncements();
      setTimeout(() => setSuccessBanner(null), 3500);
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      setErrorBanner(err.message || 'ప్రకటనను భద్రపరచడంలో లోపం సంభవించింది.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Announcement Handler
  const handleDeleteAnnouncement = async (id: string, storagePath?: string) => {
    try {
      await announcementService.deleteAnnouncement(id, storagePath, currentUser);
      setDeleteConfirmId(null);
      setSuccessBanner('ప్రకటన తొలగించబడింది.');
      await loadAnnouncements();
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      setErrorBanner('ప్రకటన తొలగించడంలో లోపం: ' + err.message);
    }
  };

  // Quick Status Toggle Handler
  const handleToggleStatus = async (ann: Announcement, newStatus: AnnouncementStatus) => {
    try {
      await announcementService.setStatus(ann.id, newStatus, currentUser);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Failed to change status:', err);
      setErrorBanner('స్టేటస్ మార్చడంలో లోపం: ' + err.message);
    }
  };

  // Filtered announcements list
  const filteredList = announcements.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.message && item.message.toLowerCase().includes(query))
    );
  });

  // KPI Calculations
  const totalCount = announcements.length;
  const publishedCount = announcements.filter((a) => a.status === 'published').length;
  const scheduledCount = announcements.filter((a) => a.status === 'scheduled').length;
  const totalImpressions = announcements.reduce((sum, a) => sum + (a.metrics?.impressions || 0), 0);
  const totalClicks = announcements.reduce((sum, a) => sum + (a.metrics?.clicks || 0), 0);

  // Audience helper badge
  const renderAudienceBadge = (aud: AnnouncementAudience) => {
    switch (aud) {
      case 'everyone':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Globe className="w-3 h-3" />
            అందరికీ (Everyone)
          </span>
        );
      case 'readers':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <BookOpen className="w-3 h-3" />
            పాఠకులు మాత్రమే (Readers)
          </span>
        );
      case 'writers':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Feather className="w-3 h-3" />
            రచయితలు మాత్రమే (Writers)
          </span>
        );
      case 'readers_and_writers':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Users className="w-3 h-3" />
            పాఠకులు & రచయితలు
          </span>
        );
      default:
        return null;
    }
  };

  // Status helper badge
  const renderStatusBadge = (st: AnnouncementStatus) => {
    switch (st) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3" />
            లైవ్ (Published)
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            షెడ్యూల్డ్ (Scheduled)
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            డ్రాఫ్ట్ (Draft)
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            దాచబడింది (Hidden)
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
            ఆర్కైవ్ (Archived)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications / Alerts */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15141B] p-6 rounded-3xl border border-[#E8E1DA] dark:border-[#2C2A36] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#7A284B] dark:text-[#D87591]">
            <Megaphone className="w-5 h-5" />
            <h1 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ప్రకటనల నిర్వహణ (Announcements CMS)
            </h1>
          </div>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            పాఠకులు, రచయితలు లేదా సాధారణ సందర్శకులకు వెబ్‌సైట్‌లో బ్యానర్లు, కార్డ్‌ల ద్వారా ముఖ్యమైన ప్రకటనలను ప్రదర్శించండి
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-2xl bg-[#7A284B] hover:bg-[#903058] text-white font-serif-telugu text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>కొత్త ప్రకటనను సృష్టించండి</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#15141B] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
          <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-medium">మొత్తం ప్రకటనలు</div>
          <div className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE] mt-1">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#15141B] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">ప్రస్తుతం లైవ్‌లో ఉన్నవి</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{publishedCount}</div>
        </div>
        <div className="bg-white dark:bg-[#15141B] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">షెడ్యూల్ చేయబడినవి</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{scheduledCount}</div>
        </div>
        <div className="bg-white dark:bg-[#15141B] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
          <div className="text-xs text-[#7A284B] dark:text-[#D87591] font-medium">వీక్షణలు / క్లిక్స్</div>
          <div className="text-2xl font-bold text-[#17151A] dark:text-[#F7F3EE] mt-1">
            {totalImpressions} <span className="text-xs text-[#6F6970] font-normal">/ {totalClicks}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#15141B] p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36] flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8490]" />
          <input
            type="text"
            placeholder="శీర్షిక లేదా వివరాల ద్వారా వెతకండి..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#1F1E29] px-3 py-1.5 rounded-xl border border-[#E8E1DA] dark:border-[#2C2A36]">
            <span className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6]">స్టేటస్:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] focus:outline-none cursor-pointer"
            >
              <option value="all">అన్నీ (All)</option>
              <option value="published">లైవ్ (Published)</option>
              <option value="scheduled">షెడ్యూల్డ్ (Scheduled)</option>
              <option value="draft">డ్రాఫ్ట్ (Draft)</option>
              <option value="hidden">దాచినవి (Hidden)</option>
              <option value="archived">ఆర్కైవ్ (Archived)</option>
            </select>
          </div>

          {/* Audience Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#1F1E29] px-3 py-1.5 rounded-xl border border-[#E8E1DA] dark:border-[#2C2A36]">
            <span className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6]">ఆడియన్స్:</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] focus:outline-none cursor-pointer"
            >
              <option value="all">అందరూ (All)</option>
              <option value="everyone">అందరికీ (Everyone)</option>
              <option value="readers">పాఠకులు (Readers)</option>
              <option value="writers">రచయితలు (Writers)</option>
              <option value="readers_and_writers">పాఠకులు & రచయితలు</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List / Table */}
      <div className="bg-white dark:bg-[#15141B] rounded-3xl border border-[#E8E1DA] dark:border-[#2C2A36] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8C8490] font-serif-telugu">
            ప్రకటనలను లోడ్ చేస్తోంది... దయచేసి వేచి ఉండండి...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#1F1E29] flex items-center justify-center mx-auto text-[#8C8490]">
              <Megaphone className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఏ ప్రకటనలు కనుగొనబడలేదు
            </p>
            <p className="text-xs text-[#8C8490] max-w-sm mx-auto">
              మీరు ఇప్పటివరకు ఎటువంటి ప్రకటనను సృష్టించలేదు లేదా ఎంచుకున్న ఫిల్టర్‌లతో ప్రకటనలు లేవు.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-[#7A284B] text-white text-xs font-bold font-serif-telugu cursor-pointer"
            >
              + కొత్త ప్రకటనను సృష్టించండి
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1DA] dark:divide-[#2C2A36]">
            {filteredList.map((ann) => (
              <div
                key={ann.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 dark:hover:bg-[#1A1924]/50 transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Thumbnail (if image layout) */}
                  {ann.imageURL ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF7F2] dark:bg-[#1A1924] border border-[#E8E1DA] dark:border-[#2C2A36] shrink-0">
                      <img
                        src={ann.imageURL}
                        alt={ann.imageAltText || ann.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A1924] border border-[#E8E1DA] dark:border-[#2C2A36] flex items-center justify-center text-[#8C8490] shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  {/* Text Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ann.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                            : ann.priority === 'low'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                        }`}
                      >
                        {ann.priority}
                      </span>

                      {/* Content Type / Layout */}
                      <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] bg-[#FAF7F2] dark:bg-[#1F1E29] px-2 py-0.5 rounded-md border border-[#E8E1DA] dark:border-[#2C2A36]">
                        {ann.contentType === 'text_only' && 'Text Only'}
                        {ann.contentType === 'image_only' && 'Image Only'}
                        {ann.contentType === 'image_text' && (ann.layout === 'text_left' ? 'Text Left + Image Right' : 'Image Left + Text Right')}
                      </span>

                      {/* Audience Badge */}
                      {renderAudienceBadge(ann.audience)}

                      {/* Status Badge */}
                      {renderStatusBadge(ann.status)}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                      {ann.title}
                    </h3>

                    {ann.message && (
                      <p className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu line-clamp-2">
                        {ann.message}
                      </p>
                    )}

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8C8490] pt-1">
                      <span>డిలే: <strong>{ann.displayDelaySeconds}s</strong></span>
                      <span>•</span>
                      <span>ఫ్రీక్వెన్సీ: <strong>{ann.displayFrequency}</strong></span>
                      {ann.buttonText && (
                        <>
                          <span>•</span>
                          <span>బటన్: <strong>"{ann.buttonText}"</strong></span>
                        </>
                      )}
                      {ann.scheduledAt && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            షెడ్యూల్: {formatSafeDateTime(ann.scheduledAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8E1DA] dark:border-[#2C2A36] w-full lg:w-auto justify-end">
                  {/* Quick Toggle Status */}
                  {ann.status === 'published' ? (
                    <button
                      onClick={() => handleToggleStatus(ann, 'hidden')}
                      title="దాచండి (Hide from website)"
                      className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1E29] hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-xs text-[#6F6970] dark:text-[#A29CA6] font-medium cursor-pointer"
                    >
                      దాచండి
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(ann, 'published')}
                      title="లైవ్ చేయండి (Publish now)"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 font-bold cursor-pointer"
                    >
                      ప్రచురించండి
                    </button>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => {
                      setPreviewingAnnouncement(ann);
                      setIsPreviewOpen(true);
                    }}
                    title="ప్రివ్యూ చూడండి"
                    className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1E29] hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(ann)}
                    title="సవరించండి (Edit)"
                    className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1E29] hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  {deleteConfirmId === ann.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.imageStoragePath)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                      >
                        ఖాయం (Confirm)
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        రద్దు
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(ann.id)}
                      title="తొలగించండి (Delete)"
                      className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1E29] hover:bg-red-50 dark:hover:bg-red-950/40 text-[#6F6970] dark:text-[#A29CA6] hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL EDITOR DRAWER / MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-white dark:bg-[#15141B] rounded-3xl shadow-2xl border border-[#E8E1DA] dark:border-[#2C2A36] flex flex-col max-h-[94vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E1DA] dark:border-[#2C2A36] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#1A1924]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                    {editingAnnouncement ? 'ప్రకటనను సవరించండి (Edit Announcement)' : 'కొత్త ప్రకటనను సృష్టించండి (Create Announcement)'}
                  </h2>
                  <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                    WordPress తరహా పూర్తి ఫీచర్లతో కూడిన ప్రకటనల బిల్డర్
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-full hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: 2-Column Split Form + Live Mini Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Form Area (7 cols on LG) */}
              <form onSubmit={handleSaveAnnouncement} id="announcement-form" className="lg:col-span-7 space-y-6">
                {/* 1. Basic Content */}
                <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                    1. ప్రాథమిక సమాచారం (Basic Info)
                  </h3>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                      ప్రకటన శీర్షిక (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: దీపావళి ప్రత్యేక కథల పోటీ!"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                  </div>

                  {/* Message (Optional for Image Only, required for text) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                      సందేశం / వివరాలు (Message / Content)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="ప్రకటన గురించిన పూర్తి వివరాలను ఇక్కడ రాయండి..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] resize-none"
                    />
                  </div>

                  {/* Optional Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                        బటన్ టెక్స్ట్ (Button Text - ఐచ్ఛికం)
                      </label>
                      <input
                        type="text"
                        placeholder="ఉదా: ఇప్పుడే చదవండి"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                        బటన్ లింక్ / URL (Button Target)
                      </label>
                      <input
                        type="text"
                        placeholder="ఉదా: #stories లేదా https://..."
                        value={formButtonURL}
                        onChange={(e) => setFormButtonURL(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Content Type & Layout Selection */}
                <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                    2. కంటెంట్ రకం & లేఅవుట్ (Layout)
                  </h3>

                  {/* Content Type Radio Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormContentType('text_only');
                        setFormLayout('text_only');
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        formContentType === 'text_only'
                          ? 'bg-white dark:bg-[#1F1E29] border-[#7A284B] dark:border-[#D87591] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6]'
                      }`}
                    >
                      <FileText className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold font-serif-telugu">టెక్స్ట్ మాత్రమే</div>
                      <div className="text-[10px] text-[#8C8490]">Text Only</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormContentType('image_only');
                        setFormLayout('image_only');
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        formContentType === 'image_only'
                          ? 'bg-white dark:bg-[#1F1E29] border-[#7A284B] dark:border-[#D87591] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6]'
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold font-serif-telugu">చిత్రం మాత్రమే</div>
                      <div className="text-[10px] text-[#8C8490]">Image Only</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormContentType('image_text');
                        if (formLayout === 'text_only' || formLayout === 'image_only') {
                          setFormLayout('image_left');
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        formContentType === 'image_text'
                          ? 'bg-white dark:bg-[#1F1E29] border-[#7A284B] dark:border-[#D87591] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6]'
                      }`}
                    >
                      <Layers className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold font-serif-telugu">చిత్రం + టెక్స్ట్</div>
                      <div className="text-[10px] text-[#8C8490]">Image + Text</div>
                    </button>
                  </div>

                  {/* Layout selector (Shown when image_text is chosen) */}
                  {formContentType === 'image_text' && (
                    <div className="pt-2 space-y-2">
                      <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        చిత్రం & టెక్స్ట్ క్రమం (Alignment):
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormLayout('image_left')}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                            formLayout === 'image_left'
                              ? 'bg-white dark:bg-[#1F1E29] border-[#7A284B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                              : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#E8E1DA] dark:bg-[#2C2A36] flex items-center justify-center text-[10px] font-bold">
                            IMG
                          </div>
                          <div className="text-left text-xs font-bold font-serif-telugu">
                            చిత్రం ఎడమ + టెక్స్ట్ కుడి
                            <div className="text-[10px] text-[#8C8490]">Image Left + Text Right</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormLayout('text_left')}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                            formLayout === 'text_left'
                              ? 'bg-white dark:bg-[#1F1E29] border-[#7A284B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                              : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                          }`}
                        >
                          <div className="text-left text-xs font-bold font-serif-telugu">
                            టెక్స్ట్ ఎడమ + చిత్రం కుడి
                            <div className="text-[10px] text-[#8C8490]">Text Left + Image Right</div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-[#E8E1DA] dark:bg-[#2C2A36] flex items-center justify-center text-[10px] font-bold ml-auto">
                            IMG
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Image Upload / Media (Shown if Image Only or Image+Text) */}
                {formContentType !== 'text_only' && (
                  <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                      3. చిత్రం అప్‌లోడ్ (Announcement Image)
                    </h3>

                    {/* Image Preview & Upload Box */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {formImageURL ? (
                        <div className="relative w-36 h-28 rounded-2xl overflow-hidden border border-[#E8E1DA] dark:border-[#2C2A36] group shrink-0">
                          <img
                            src={formImageURL}
                            alt="Announcement Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormImageURL('');
                              setFormImageStoragePath('');
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="చిత్రాన్ని తొలగించండి"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full sm:w-48 h-28 rounded-2xl border-2 border-dashed border-[#D1C9BE] dark:border-[#383545] hover:border-[#7A284B] flex flex-col items-center justify-center text-center p-3 cursor-pointer bg-white dark:bg-[#1F1E29] transition-colors shrink-0"
                        >
                          <Upload className="w-6 h-6 text-[#8C8490] mb-1" />
                          <span className="text-[11px] font-bold text-[#17151A] dark:text-[#F7F3EE]">
                            చిత్రాన్ని అప్‌లోడ్ చేయండి
                          </span>
                          <span className="text-[9px] text-[#8C8490]">JPG, PNG, WEBP (Max 5MB)</span>
                        </div>
                      )}

                      <div className="space-y-2 w-full min-w-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-4 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? `అప్‌లోడ్ అవుతోంది... (${uploadProgress}%)` : 'ఫైల్ ఎంచుకోండి'}</span>
                        </button>

                        <div className="space-y-1">
                          <label className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">లేదా చిత్రం URL నమోదు చేయండి:</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={formImageURL}
                            onChange={(e) => setFormImageURL(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Alt Text */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6]">
                        చిత్రం వివరణ / Alt Text (Accessibility)
                      </label>
                      <input
                        type="text"
                        placeholder="స్క్రీన్ రీడర్ల కోసం సంక్షిప్త వివరణ"
                        value={formImageAltText}
                        onChange={(e) => setFormImageAltText(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Target Audience */}
                <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                    4. టార్గెట్ ఆడియన్స్ (Audience Visibility)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormAudience('everyone')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        formAudience === 'everyone'
                          ? 'bg-white dark:bg-[#1F1E29] border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                      }`}
                    >
                      <Globe className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold font-serif-telugu">అందరికీ (Everyone)</div>
                        <div className="text-[10px] text-[#8C8490] leading-tight">
                          అతిథి పాఠకులు మరియు లాగిన్ అయిన సభ్యులందరికీ కనిపిస్తుంది
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormAudience('readers')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        formAudience === 'readers'
                          ? 'bg-white dark:bg-[#1F1E29] border-blue-600 text-blue-700 dark:text-blue-400 shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold font-serif-telugu">పాఠకులు మాత్రమే (Readers)</div>
                        <div className="text-[10px] text-[#8C8490] leading-tight">
                          కేవలం లాగిన్ అయిన పాఠకులకు మాత్రమే కనిపిస్తుంది
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormAudience('writers')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        formAudience === 'writers'
                          ? 'bg-white dark:bg-[#1F1E29] border-purple-600 text-purple-700 dark:text-purple-400 shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                      }`}
                    >
                      <Feather className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold font-serif-telugu">రచయితలు మాత్రమే (Writers)</div>
                        <div className="text-[10px] text-[#8C8490] leading-tight">
                          కేవలం ఆమోదించబడిన రచయితలకు మాత్రమే కనిపిస్తుంది
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormAudience('readers_and_writers')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        formAudience === 'readers_and_writers'
                          ? 'bg-white dark:bg-[#1F1E29] border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-xs'
                          : 'border-[#E8E1DA] dark:border-[#2C2A36] text-[#6F6970]'
                      }`}
                    >
                      <Users className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold font-serif-telugu">పాఠకులు & రచయితలు</div>
                        <div className="text-[10px] text-[#8C8490] leading-tight">
                          లాగిన్ అయిన పాఠకులు మరియు రచయితలకు మాత్రమే
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 5. Display Delay & Frequency */}
                <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                    5. ప్రదర్శన సమయం & ఫ్రీక్వెన్సీ (Timing & Delay)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Display After Delay */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        ఎప్పుడు కనిపించాలి (Display after):
                      </label>
                      <select
                        value={formDelaySeconds}
                        onChange={(e) => setFormDelaySeconds(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      >
                        <option value={0}>వెంటనే (Immediately - 0s)</option>
                        <option value={1}>1 సెకను తర్వాత (1s)</option>
                        <option value={3}>3 సెకన్లు (3s - Default)</option>
                        <option value={5}>5 సెకన్లు (5s)</option>
                        <option value={10}>10 సెకన్లు (10s)</option>
                        <option value={15}>15 సెకన్లు (15s)</option>
                        <option value={30}>30 సెకన్లు (30s)</option>
                      </select>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        ఎన్నిసార్లు (Show Frequency):
                      </label>
                      <select
                        value={formFrequency}
                        onChange={(e) => setFormFrequency(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      >
                        <option value="once_per_session">సెషన్‌కు ఒకసారి (Once per session)</option>
                        <option value="every_visit">ప్రతి సందర్శనకూ (Every visit)</option>
                        <option value="once_per_day">రోజుకు ఒకసారి (Once per day)</option>
                        <option value="until_dismissed">క్లోజ్ చేసేవరకు (Until dismissed)</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        ప్రాధాన్యత (Priority):
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      >
                        <option value="normal">సాధారణం (Normal)</option>
                        <option value="high">అత్యధికం (High Priority)</option>
                        <option value="low">తక్కువ (Low)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Publication Status & Scheduling */}
                <div className="space-y-4 bg-[#FAF7F2]/50 dark:bg-[#1A1924]/50 p-4 rounded-2xl border border-[#E8E1DA] dark:border-[#2C2A36]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591]">
                    6. ప్రచురణ స్థితి & షెడ్యూల్ (Publishing & Schedule)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                        ప్రచురణ స్థితి (Status):
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      >
                        <option value="published">ఇప్పుడే ప్రచురించండి (Publish Now)</option>
                        <option value="scheduled">తర్వాత సమయానికి షెడ్యూల్ (Schedule)</option>
                        <option value="draft">డ్రాఫ్ట్‌గా భద్రపరచండి (Save as Draft)</option>
                        <option value="hidden">దాచి ఉంచండి (Hidden)</option>
                      </select>
                    </div>

                    {formStatus === 'scheduled' && (
                      <div className="space-y-1 animate-in fade-in">
                        <label className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          షెడ్యూల్ తేదీ & సమయం (IST):
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formScheduledAt}
                          onChange={(e) => setFormScheduledAt(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1E29] border border-amber-300 dark:border-amber-700 text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Start Date & End Date (Automatic Expiration) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6]">
                        ప్రారంభ తేదీ (Start Date - ఐచ్ఛికం):
                      </label>
                      <input
                        type="datetime-local"
                        value={formStartAt}
                        onChange={(e) => setFormStartAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6]">
                        ముగింపు తేదీ / ఎక్స్‌పైరీ (End Date - ఐచ్ఛికం):
                      </label>
                      <input
                        type="datetime-local"
                        value={formEndAt}
                        onChange={(e) => setFormEndAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1E29] border border-[#E8E1DA] dark:border-[#2C2A36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Right: Live Interactive Mini Preview (5 cols on LG) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A284B] dark:text-[#D87591] flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    లైవ్ ప్రివ్యూ (Real-Time Preview)
                  </span>

                  {/* Device Toggle */}
                  <div className="flex items-center bg-[#ECE6DF] dark:bg-[#252330] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEditorPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        editorPreviewDevice === 'desktop'
                          ? 'bg-white dark:bg-[#15141B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                          : 'text-[#6F6970] dark:text-[#A29CA6]'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>డెస్క్‌టాప్</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        editorPreviewDevice === 'mobile'
                          ? 'bg-white dark:bg-[#15141B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                          : 'text-[#6F6970] dark:text-[#A29CA6]'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>మొబైల్</span>
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="flex-1 bg-[#F2EDE4] dark:bg-[#0E0D13] p-4 sm:p-6 rounded-3xl border border-[#E8E1DA] dark:border-[#2C2A36] flex items-center justify-center min-h-[300px] overflow-y-auto">
                  <div className={`w-full ${editorPreviewDevice === 'mobile' ? 'max-w-[280px]' : 'max-w-md'}`}>
                    <div className="relative rounded-2xl bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] shadow-lg border border-[#E8E1DA] dark:border-[#2C2A36] p-4 overflow-hidden">
                      {/* Close Mock Button */}
                      <button type="button" className="absolute top-2.5 right-2.5 p-1 rounded-full bg-[#FAF7F2] dark:bg-[#23212C] text-[#8C8490]">
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* LAYOUT 1: IMAGE ONLY */}
                      {formContentType === 'image_only' && (
                        <div className="pt-2">
                          {formImageURL ? (
                            <div className="rounded-xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36]">
                              <img src={formImageURL} alt={formImageAltText || formTitle} className="w-full h-auto max-h-48 object-contain" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="h-32 rounded-xl border-2 border-dashed border-[#D1C9BE] dark:border-[#383545] flex items-center justify-center text-xs text-[#8C8490]">
                              చిత్రం అప్‌లోడ్ చేయండి
                            </div>
                          )}
                          {formButtonText && (
                            <div className="mt-2.5 flex justify-end">
                              <div className="px-3 py-1.5 rounded-lg bg-[#7A284B] text-white text-[11px] font-bold font-serif-telugu flex items-center gap-1">
                                <span>{formButtonText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LAYOUT 2: TEXT ONLY */}
                      {formContentType === 'text_only' && (
                        <div className="space-y-2 pr-4">
                          <div className="flex items-center gap-1 text-[#7A284B] dark:text-[#D87591]">
                            <Megaphone className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase font-serif-telugu">కథావాహిని ప్రకటన</span>
                          </div>
                          <h4 className="text-sm font-bold font-serif-telugu leading-tight">{formTitle || 'శీర్షిక ఇక్కడ వస్తుంది'}</h4>
                          <p className="text-xs text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu leading-relaxed">
                            {formMessage || 'సందేశం ఇక్కడ కనిపిస్తుంది...'}
                          </p>
                          {formButtonText && (
                            <div className="pt-1 flex justify-end">
                              <div className="px-3 py-1.5 rounded-lg bg-[#7A284B] text-white text-[11px] font-bold font-serif-telugu flex items-center gap-1">
                                <span>{formButtonText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LAYOUT 3: IMAGE + TEXT */}
                      {formContentType === 'image_text' && (
                        <div className={`flex flex-col gap-3 pt-1 ${editorPreviewDevice === 'desktop' ? (formLayout === 'text_left' ? 'sm:flex-row-reverse' : 'sm:flex-row') : ''}`}>
                          <div className={`w-full ${editorPreviewDevice === 'desktop' ? 'sm:w-2/5' : ''} shrink-0`}>
                            {formImageURL ? (
                              <div className="w-full h-24 rounded-xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36]">
                                <img src={formImageURL} alt={formImageAltText || formTitle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="w-full h-24 rounded-xl border-2 border-dashed border-[#D1C9BE] dark:border-[#383545] flex items-center justify-center text-[10px] text-[#8C8490] text-center p-1">
                                చిత్రం లేదు
                              </div>
                            )}
                          </div>
                          <div className={`w-full ${editorPreviewDevice === 'desktop' ? 'sm:w-3/5' : ''} space-y-1.5 min-w-0 pr-4 sm:pr-0`}>
                            <h4 className="text-xs font-bold font-serif-telugu leading-tight line-clamp-2">{formTitle || 'శీర్షిక'}</h4>
                            <p className="text-[11px] text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu line-clamp-3">
                              {formMessage || 'వివరాలు...'}
                            </p>
                            {formButtonText && (
                              <div className="pt-1 flex justify-start">
                                <div className="px-2.5 py-1 rounded-md bg-[#7A284B] text-white text-[10px] font-bold font-serif-telugu flex items-center gap-1">
                                  <span>{formButtonText}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#E8E1DA] dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#1A1924] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#A29CA6] transition-colors cursor-pointer"
              >
                రద్దు చేయండి (Cancel)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="announcement-form"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#903058] text-white text-xs font-bold font-serif-telugu transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>భద్రపరుస్తోంది...</span>
                  ) : editingAnnouncement ? (
                    <span>నవీకరించండి (Save Changes)</span>
                  ) : formStatus === 'scheduled' ? (
                    <span>షెడ్యూల్ చేయండి (Schedule Announcement)</span>
                  ) : formStatus === 'draft' ? (
                    <span>డ్రాఫ్ట్‌గా సేవ్ చేయండి (Save Draft)</span>
                  ) : (
                    <span>ఇప్పుడే ప్రచురించండి (Publish Announcement)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Preview Modal */}
      <AdminAnnouncementPreviewModal
        isOpen={isPreviewOpen}
        announcement={previewingAnnouncement}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewingAnnouncement(null);
        }}
      />
    </div>
  );
};
