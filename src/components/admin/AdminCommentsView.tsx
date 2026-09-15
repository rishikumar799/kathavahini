import React, { useState } from 'react';
import { MessageSquare, Search, Trash2, Heart, User as UserIcon } from 'lucide-react';
import { Comment } from '../../types';
import { formatSafeDate } from '../../utils/dateUtils';

interface AdminCommentsViewProps {
  comments: Comment[];
  onDeleteComment: (comment: Comment) => void;
  actionLoading: boolean;
}

export const AdminCommentsView: React.FC<AdminCommentsViewProps> = ({
  comments,
  onDeleteComment,
  actionLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = comments.filter(c =>
    (c.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6970] dark:text-[#A29CA6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="వ్యాఖ్యలోని పాఠ్యం లేదా యూజర్ పేరుతో శోధించండి..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu">
          మొత్తం కామెంట్లు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{comments.length}</strong>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181F] rounded-3xl border border-[#E8E1DA] dark:border-[#26242E] shadow-sm text-xs text-[#6F6970] dark:text-[#A29CA6] space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              ఎలాంటి వ్యాఖ్యలు లేవు
            </p>
          </div>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={c.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={c.user?.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E8E1DA] dark:border-[#26242E]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#17151A] dark:text-[#F7F3EE]">
                      {c.user?.name || 'పాఠకుడు'}
                    </span>
                    <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                      {formatSafeDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                    {c.content}
                  </p>
                  <p className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                    కథ ఐడీ: {c.storyId} • లైకులు: {c.likes || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onDeleteComment(c)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> స్పామ్ తొలగించు
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
