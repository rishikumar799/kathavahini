import React from 'react';
import { Bell, Check, X, BookOpen, Heart, UserPlus, Info } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'story': return <BookOpen className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />;
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'follower': return <UserPlus className="w-4 h-4 text-[#3E8065]" />;
      default: return <Info className="w-4 h-4 text-[#D99A3D]" />;
    }
  };

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#222229]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
          <h3 className="font-bold text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            నోటిఫికేషన్లు
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6F6970] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E1DA]/60 dark:divide-[#2E2D36]/60">
        {notifications.length === 0 ? (
          <p className="p-6 text-center text-xs text-[#6F6970]">
            నోటిఫికేషన్లు ఏవీ లేవు
          </p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#FAF7F2] dark:hover:bg-[#222229] ${
                !n.read ? 'bg-[#7A284B]/5 dark:bg-[#D87591]/5' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] shrink-0">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
