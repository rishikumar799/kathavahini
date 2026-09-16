import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Search,
  Eye,
  Trash2,
  Sparkles,
  Award,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { BalavinodhiniItem } from '../../../types';

interface AdminBalavinodhiniModerationManagerProps {
  items: BalavinodhiniItem[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (item: BalavinodhiniItem) => void;
}

export const AdminBalavinodhiniModerationManager: React.FC<AdminBalavinodhiniModerationManagerProps> = ({
  items,
  onApprove,
  onReject,
  onDelete,
  onEdit,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState<BalavinodhiniItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Focus on creations or drafts/pending items
  const submissions = items.filter(
    item =>
      item.categoryId === 'creations' ||
      item.status === 'draft' ||
      item.authorRole === 'child' ||
      item.tags?.includes('పిల్లల సృజన')
  );

  const filteredSubmissions = submissions.filter(item => {
    if (filterTab === 'pending' && item.status !== 'draft') return false;
    if (filterTab === 'approved' && item.status !== 'published') return false;
    if (filterTab === 'rejected' && item.status !== 'archived') return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (item.teluguTitle && item.teluguTitle.toLowerCase().includes(query)) ||
      (item.authorName && item.authorName.toLowerCase().includes(query)) ||
      (item.content && item.content.toLowerCase().includes(query))
    );
  });

  const handleQuickApprove = async (id: string) => {
    setActioningId(id);
    try {
      await onApprove(id);
    } finally {
      setActioningId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!inspectItem) return;
    setActioningId(inspectItem.id);
    try {
      await onReject(inspectItem.id, rejectReason);
      setShowRejectModal(false);
      setInspectItem(null);
      setRejectReason('');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            పిల్లల రచనల సమీక్ష & అనుమతులు (Creations Moderation)
          </h2>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            చిన్నారులు సమర్పించిన బొమ్మలు, చిన్న కథలు, గేయాలను సమీక్షించి లైవ్ ప్లాట్‌ఫారమ్‌లో ప్రచురించండి
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] w-full sm:w-auto">
          {[
            { id: 'pending', label: 'సమీక్షలో ఉన్నవి (Pending)' },
            { id: 'approved', label: 'ఆమోదించినవి (Approved)' },
            { id: 'all', label: 'అన్నీ (All)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all font-serif-telugu cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="రచయిత లేదా శీర్షిక వెతకండి..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-[#6F6970] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18181D] border border-dashed border-[#E8E1DA] dark:border-[#2E2D36] space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-40" />
          <p className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            ఈ జాబితాలో ఎలాంటి సమర్పణలు లేవు
          </p>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            పిల్లల నుండి కొత్త రచనలు అందినప్పుడు ఇక్కడ కనిపిస్తాయి.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white font-bold flex items-center justify-center text-xs">
                      {item.authorName ? item.authorName[0] : 'బ'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                        {item.authorName || 'బాల రచయిత'}
                      </h4>
                      <p className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">
                        వయస్సు: {item.ageGroup} సం||
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-serif-telugu ${
                      item.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.status === 'published' ? 'ఆమోదించబడింది' : 'సమీక్షలో ఉంది'}
                  </span>
                </div>

                {/* Title & Preview */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                    {item.teluguTitle || item.title}
                  </h3>
                  <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu line-clamp-3 leading-relaxed">
                    {item.content || item.teluguDescription}
                  </p>
                </div>

                {/* Cover / Drawing Image if present */}
                {item.coverImage && (
                  <img
                    src={item.coverImage}
                    alt="Submission attachment"
                    className="w-full h-36 object-cover rounded-2xl border border-black/5"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
                <button
                  onClick={() => setInspectItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-serif-telugu"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>పూర్తిగా చూడండి</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {item.status !== 'published' ? (
                    <button
                      onClick={() => handleQuickApprove(item.id)}
                      disabled={actioningId === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm font-serif-telugu"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ఆమోదించండి</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-bold font-serif-telugu">
                      ✓ ప్రచురణలో ఉంది
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setInspectItem(item);
                      setShowRejectModal(true);
                    }}
                    className="p-1.5 rounded-xl text-[#6F6970] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="తిరస్కరించండి / తీసివేయండి"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectItem && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
              <span className="text-xs font-bold text-amber-600 font-serif-telugu">
                పిల్లల సృజన వివరాలు
              </span>
              <button
                onClick={() => setInspectItem(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:text-[#17151A] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inspectItem.coverImage && (
              <img
                src={inspectItem.coverImage}
                alt=""
                className="w-full h-56 object-cover rounded-2xl border border-black/5"
              />
            )}

            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {inspectItem.teluguTitle || inspectItem.title}
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
                రచయిత: {inspectItem.authorName} ({inspectItem.ageGroup} సం||)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
              {inspectItem.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRejectModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer font-serif-telugu"
              >
                తిరస్కరించండి
              </button>
              {inspectItem.status !== 'published' && (
                <button
                  onClick={() => {
                    handleQuickApprove(inspectItem.id);
                    setInspectItem(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer font-serif-telugu"
                >
                  ఆమోదించి లైవ్ చేయండి
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18181D] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              రచనను తిరస్కరించడానికి కారణం (ఐచ్ఛికం)
            </h3>
            <textarea
              rows={3}
              placeholder="ఉదా: చిత్రాలు అస్పష్టంగా ఉన్నాయి లేదా మరింత సమాచారం అవసరం..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] text-xs font-bold cursor-pointer font-serif-telugu"
              >
                రద్దు
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer font-serif-telugu"
              >
                తిరస్కరించండి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
