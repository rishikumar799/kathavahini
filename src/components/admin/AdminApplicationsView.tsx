import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { WriterApplication } from '../../types';
import { formatSafeDate } from '../../utils/dateUtils';

interface AdminApplicationsViewProps {
  applications: WriterApplication[];
  onApprove: (app: WriterApplication) => void;
  onReject: (app: WriterApplication, reason: string) => void;
  actionLoading: boolean;
  selectedAppForReview: WriterApplication | null;
  onOpenReview: (app: WriterApplication) => void;
  onCloseReview: () => void;
}

export const AdminApplicationsView: React.FC<AdminApplicationsViewProps> = ({
  applications,
  onApprove,
  onReject,
  actionLoading,
  selectedAppForReview,
  onOpenReview,
  onCloseReview,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalApp, setRejectModalApp] = useState<WriterApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filtered = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const nameMatch = (app.fullName || app.displayName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const penMatch = (app.penName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (app.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && (nameMatch || penMatch || emailMatch);
  });

  const handleConfirmReject = () => {
    if (!rejectModalApp || !rejectionReason.trim()) return;
    onReject(rejectModalApp, rejectionReason.trim());
    setRejectModalApp(null);
    setRejectionReason('');
    if (selectedAppForReview?.id === rejectModalApp.id) {
      onCloseReview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="దరఖాస్తుదారు పేరు, కలం పేరు లేదా ఇమెయిల్‌తో శోధించండి..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#121118] p-1 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E] overflow-x-auto">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            సమీక్షలో ఉన్నవి ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            ఆమోదించినవి ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            తిరస్కరించినవి ({applications.filter(a => a.status === 'rejected').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#7A284B] text-white shadow-sm'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
            }`}
          >
            అన్నీ ({applications.length})
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <FileCheck2 className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎలాంటి దరఖాస్తులు లేవు
            </p>
            <p>ఎంచుకున్న ఫిల్టర్‌కు సరిపోయే రికార్డులు కనుగొనబడలేదు.</p>
          </div>
        ) : (
          filtered.map(app => {
            const isPending = app.status === 'pending';
            const isApproved = app.status === 'approved';
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col gap-4 transition-all hover:border-[#7A284B]/40 w-full min-w-0 overflow-hidden"
              >
                {/* Card Header: Status, Date & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1DA]/70 dark:border-[#26242E]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isPending
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : isApproved
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}>
                      {isPending ? 'సమీక్షలో ఉంది (Pending)' : isApproved ? 'ఆమోదించబడింది (Approved)' : 'తిరస్కరించబడింది (Rejected)'}
                    </span>
                    <span className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                      తేదీ: {formatSafeDate((app as any).submittedAt || (app as any).createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                    <button
                      onClick={() => onOpenReview(app)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1A25] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:bg-black/5 cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>పూర్తి వివరాలు & నమూనా</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectModalApp(app)}
                          disabled={actionLoading}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>తిరస్కరించు</span>
                        </button>
                        <button
                          onClick={() => onApprove(app)}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ఆమోదించి రచయితను చేయండి</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Applicant Details */}
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-bold text-base sm:text-lg font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] break-words">
                    {app.fullName || app.displayName}
                  </h4>
                  <p className="text-xs text-[#7A284B] dark:text-[#D87591] font-bold break-words">
                    కలం పేరు (Pen Name): {app.penName || app.displayName || app.fullName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#A29CA6] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-all">{app.email}</span>
                    </span>
                    {(app.mobileNumber || app.phone) && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{app.mobileNumber || app.phone}</span>
                      </span>
                    )}
                    <span>• విభాగాలు: {(app.genres || app.categories || (app as any).preferredGenres || []).join(', ') || 'సాధారణ'}</span>
                  </div>
                </div>

                {/* Sample preview snippet - wrapping lines one below another */}
                {(app.sampleWriting || app.sampleText || (app as any).sampleStory) && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] w-full min-w-0">
                    <div className="text-[11px] font-bold text-[#6F6970] dark:text-[#A29CA6] mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591] shrink-0" />
                      <span>రచనా నమూనా (Writing Sample):</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] leading-relaxed text-[#4A454E] dark:text-[#D5CED8] max-h-48 overflow-y-auto">
                      "{app.sampleWriting || app.sampleText || (app as any).sampleStory}"
                    </p>
                  </div>
                )}

                {isRejected && app.rejectionReason && (
                  <p className="text-xs text-red-600 font-serif-telugu break-words">
                    తిరస్కరణ కారణం: {app.rejectionReason}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FULL REVIEW MODAL */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#18181F] rounded-3xl p-6 border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1DA] dark:border-[#26242E]">
              <div>
                <span className="text-[10px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
                  కథావాహిని రచయిత దరఖాస్తు సమీక్ష
                </span>
                <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                  {selectedAppForReview.fullName || selectedAppForReview.displayName}
                </h3>
              </div>
              <button
                onClick={onCloseReview}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Applicant metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs">
              <div>
                <span className="text-[#6F6970] dark:text-[#A29CA6] block">కలం పేరు (Pen Name):</span>
                <span className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] text-sm">
                  {selectedAppForReview.penName}
                </span>
              </div>
              <div>
                <span className="text-[#6F6970] dark:text-[#A29CA6] block">ఇమెయిల్:</span>
                <span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  {selectedAppForReview.email}
                </span>
              </div>
              {(selectedAppForReview.mobileNumber || selectedAppForReview.phone) && (
                <div>
                  <span className="text-[#6F6970] dark:text-[#A29CA6] block">ఫోన్ నంబర్:</span>
                  <span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">
                    {selectedAppForReview.mobileNumber || selectedAppForReview.phone}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[#6F6970] dark:text-[#A29CA6] block">రచనా శైలులు / విభాగాలు:</span>
                <span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  {(selectedAppForReview.genres || selectedAppForReview.categories || (selectedAppForReview as any).preferredGenres || []).join(', ') || 'సాధారణ'}
                </span>
              </div>
            </div>

            {/* Experience / Bio */}
            {(selectedAppForReview.writingExperience || selectedAppForReview.experience || selectedAppForReview.bio) && (
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  రచనా అనుభవం / బయో (Writing Experience & Bio):
                </h4>
                <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] bg-[#FAF7F2] dark:bg-[#121118] p-3 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E] space-y-1 break-words break-all [overflow-wrap:anywhere]">
                  {selectedAppForReview.bio && <p><strong>బయో:</strong> {selectedAppForReview.bio}</p>}
                  {(selectedAppForReview.writingExperience || selectedAppForReview.experience) && (
                    <p><strong>అనుభవం:</strong> {selectedAppForReview.writingExperience || selectedAppForReview.experience}</p>
                  )}
                  {selectedAppForReview.city && <p><strong>ప్రాంతం:</strong> {selectedAppForReview.city}</p>}
                </div>
              </div>
            )}

            {/* Sample Story Text */}
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                రచనా నమూనా (Sample Story / Writing Sample):
              </h4>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu leading-relaxed text-[#17151A] dark:text-[#F7F3EE] max-h-60 overflow-y-auto whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                {selectedAppForReview.sampleWriting || selectedAppForReview.sampleText || (selectedAppForReview as any).sampleStory || 'నమూనా పాఠ్యం అందించబడలేదు.'}
              </div>
            </div>

            {/* Legal Agreement Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <div className="flex items-center gap-2 font-bold font-serif-telugu">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>6-పాయింట్ల కథావాహిని రచయిత ఒప్పంద ప్రకటన (Digital Agreement 1.0)</span>
              </div>
              <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                దరఖాస్తుదారు ఒరిజినాలిటీ, కాపీరైట్ చట్టాల పాటించడం, మరియు రోజుకు గరిష్టంగా ఒక కథ ప్రచురణ పరిమితి నిబంధనలను అంగీకరించారు.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1DA] dark:border-[#26242E]">
              <button
                onClick={onCloseReview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6F6970] hover:bg-black/5 cursor-pointer"
              >
                మూసివేయి
              </button>

              {selectedAppForReview.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalApp(selectedAppForReview);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                  >
                    తిరస్కరించు
                  </button>
                  <button
                    onClick={() => {
                      onApprove(selectedAppForReview);
                      onCloseReview();
                    }}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    ఆమోదించి రచయిత రోల్ కేటాయించు
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#18181F] rounded-3xl p-6 border border-[#E8E1DA] dark:border-[#26242E] shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              రచయిత దరఖాస్తును తిరస్కరించండి
            </h3>
            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              దరఖాస్తుదారు: <strong>{rejectModalApp.fullName || rejectModalApp.displayName}</strong> ({rejectModalApp.email})
            </p>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                తిరస్కరణకు కారణం (Reason for Rejection) *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="ఉదా: రచనా నమూనా నాణ్యత మరింత మెరుగుపడాలి లేదా పూర్తి వివరాలు లేవు..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectModalApp(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6F6970] cursor-pointer"
              >
                రద్దు చేయి
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? 'తిరస్కరిస్తోంది...' : 'ఖరారు చేయి'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
