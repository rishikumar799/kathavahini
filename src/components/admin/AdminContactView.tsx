import React, { useState } from 'react';
import { Mail, CheckCircle2, Clock, Check, Phone } from 'lucide-react';
import { ContactSubmission } from '../../types';

interface AdminContactViewProps {
  contacts: ContactSubmission[];
  onUpdateStatus: (id: string, status: 'unread' | 'read' | 'resolved') => void;
  actionLoading: boolean;
}

export const AdminContactView: React.FC<AdminContactViewProps> = ({
  contacts,
  onUpdateStatus,
  actionLoading,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');

  const filtered = contacts.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
            సంప్రదింపు సందేశాలు (Contact Messages)
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            సందర్శకులు మరియు రచయితల నుండి వచ్చిన సంప్రదింపు ప్రశ్నలు
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#121118] p-1 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E]">
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'unread' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            చదవనివి ({contacts.filter(c => c.status === 'unread').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'resolved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            పరిష్కరించినవి ({contacts.filter(c => c.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#7A284B] text-white shadow-sm' : 'text-[#6F6970] dark:text-[#A29CA6]'
            }`}
          >
            అన్నీ ({contacts.length})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <Mail className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              సందేశాలు ఏవీ లేవు
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'unread'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {item.status === 'unread' ? 'చదవనిది' : 'పరిష్కరించబడింది'}
                  </span>
                  <span className="font-bold text-xs text-[#17151A] dark:text-[#F7F3EE]">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                    ({item.email}) {item.phone && `• ఫోన్: ${item.phone}`}
                  </span>
                  <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                    • {new Date(item.createdAt).toLocaleString('te-IN')}
                  </span>
                </div>

                <p className="text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed bg-[#FAF7F2] dark:bg-[#121118] p-3 rounded-2xl border border-[#E8E1DA] dark:border-[#26242E]">
                  "{item.message}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                {item.status === 'unread' ? (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'resolved')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>పరిష్కరించినట్లు మార్చు</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'unread')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#6F6970] cursor-pointer"
                  >
                    చదవనిదిగా గుర్తించు
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
