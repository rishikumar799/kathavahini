import React, { useState } from 'react';
import { History, ShieldCheck, Search, Filter, Calendar } from 'lucide-react';
import { AdminAuditLog } from '../../types';
import { formatSafeDateTime } from '../../utils/dateUtils';

interface AdminAuditLogsViewProps {
  logs: AdminAuditLog[];
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter(log =>
    (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.targetTitle || log.targetId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.adminEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="చర్య, శీర్షిక లేదా అడ్మిన్ ఇమెయిల్‌తో శోధించండి..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
          మొత్తం ఆడిట్ లాగ్స్: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{logs.length}</strong>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs text-[#6F6970] dark:text-[#A29CA6] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          కథావాహిని అడ్మిన్ ద్వారా జరిపిన ప్రతి ఆమోదం, తిరస్కరణ, సస్పెన్షన్ మరియు మార్పుల పూర్తి నమోదు (Immutable Audit Trail).
        </span>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6]">
            ఎలాంటి లాగ్స్ లేవు.
          </div>
        ) : (
          filtered.map(log => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider text-[11px]">
                    {log.action.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-[#6F6970]">
                    {log.targetType}
                  </span>
                </div>

                <p className="font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  {log.targetTitle || log.targetId}
                </p>

                <p className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                  అడ్మిన్: {log.adminEmail || log.adminUid} {log.details ? `• వివరాలు: ${JSON.stringify(log.details)}` : ''}
                </p>
              </div>

              <div className="text-[11px] text-[#6F6970] dark:text-[#A29CA6] shrink-0 font-mono">
                {formatSafeDateTime(log.createdAt || (log as any).timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
