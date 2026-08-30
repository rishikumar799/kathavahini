import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Eye, Check, MessageSquare } from 'lucide-react';
import { IssueReport } from '../../types';

interface AdminReportsViewProps {
  reports: IssueReport[];
  onUpdateStatus: (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => void;
  actionLoading: boolean;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  reports,
  onUpdateStatus,
  actionLoading,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  const filtered = reports.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
            ఫిర్యాదులు & నివేదికలు (Issue Reports)
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            యూజర్లు నివేదించిన కంటెంట్ మరియు సాంకేతిక సమస్యల సమీక్ష
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#121118] p-1 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E]">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-orange-600 text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            పెండింగ్ ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'resolved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            పరిష్కరించినవి ({reports.filter(r => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            అన్నీ ({reports.length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎలాంటి పెండింగ్ ఫిర్యాదులు లేవు
            </p>
          </div>
        ) : (
          filtered.map(rep => (
            <div
              key={rep.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rep.status === 'pending'
                      ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {rep.status === 'pending' ? 'సమీక్షలో ఉంది' : 'పరిష్కరించబడింది'}
                  </span>
                  <span className="text-xs font-bold text-[#7A284B] dark:text-[#D87591]">
                    రకం: {rep.category || rep.issueType || 'కంటెంట్ సమస్య'}
                  </span>
                  <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                    • {new Date(rep.createdAt).toLocaleString('te-IN')}
                  </span>
                </div>

                <p className="text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                  {rep.description}
                </p>

                <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                  నివేదించినవారు: {rep.userEmail || rep.userId || 'అజ్ఞాత యూజర్'} {rep.targetStoryId && `• టార్గెట్ కథ: ${rep.targetStoryId}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                {rep.status === 'pending' ? (
                  <button
                    onClick={() => onUpdateStatus(rep.id, 'resolved')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>పరిష్కరించినట్లు గుర్తించు</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(rep.id, 'pending')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#6F6970] cursor-pointer"
                  >
                    మళ్లీ తెరవండి
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
