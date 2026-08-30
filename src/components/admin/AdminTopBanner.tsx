import React from 'react';
import { ShieldCheck, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { User } from '../../types';

interface AdminTopBannerProps {
  currentUser: User | null;
  onReturnToAdmin: () => void;
}

export const AdminTopBanner: React.FC<AdminTopBannerProps> = ({
  currentUser,
  onReturnToAdmin,
}) => {
  return (
    <div className="bg-[#121118] text-white border-b border-[#26242E] px-4 py-2 text-xs flex items-center justify-between z-50 sticky top-0 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className="w-4 h-4 text-[#D87591]" />
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          KATHAVAHINI ADMIN MODE
        </span>
        <span className="text-[#A29CA6] hidden sm:inline">•</span>
        <span className="text-[#A29CA6] text-[11px] font-serif-telugu hidden sm:inline">
          మీరు పబ్లిక్ వెబ్‌సైట్ మునుజూపులో ఉన్నారు
        </span>
      </div>

      <button
        onClick={onReturnToAdmin}
        className="px-3 py-1 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>అడ్మిన్ కంట్రోల్ సెంటర్‌కి తిరిగి వెళ్లండి →</span>
      </button>
    </div>
  );
};
