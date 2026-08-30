import React from 'react';
import {
  Menu,
  ShieldCheck,
  Bell,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  currentTab: AdminTab;
  currentUser: User | null;
  onOpenMobileSidebar: () => void;
  onRefresh: () => void;
  loading: boolean;
  onViewWebsite: () => void;
  onLogout: () => void;
  notificationsCount: number;
}

const TAB_TITLES: Record<AdminTab, { title: string; telugu: string; desc: string }> = {
  'dashboard': { title: 'Dashboard Overview', telugu: 'పరిపాలనా డాష్‌బోర్డ్', desc: 'మొత్తం గణాంకాలు, త్వరిత సమీక్షల సారాంశం' },
  'users': { title: 'User Management', telugu: 'వినియోగదారుల నిర్వహణ', desc: 'అన్ని రకాల ఖాతాల జాబితా మరియు స్థితి నియంత్రణ' },
  'readers': { title: 'Reader Directory', telugu: 'పాఠకుల జాబితా', desc: 'నమోదైన తెలుగు కథా పాఠకుల వివరాలు' },
  'writers': { title: 'Official Writers', telugu: 'అధికారిక రచయితలు', desc: 'ఆమోదం పొందిన కథావాహిని రచయితల ప్రొఫైల్స్ & కథలు' },
  'add-user': { title: 'Add User', telugu: 'కొత్త యూజర్‌ను జోడించండి', desc: 'పాఠకుడు లేదా రచయిత ఖాతాను నేరుగా సృష్టించండి' },
  'writer-applications': { title: 'Writer Applications', telugu: 'రచయిత దరఖాస్తులు & ఒప్పందాలు', desc: 'రచయితగా మారడానికి వచ్చిన దరఖాస్తుల సమీక్ష & ఆమోదం' },
  'stories': { title: 'Story Moderation Queue', telugu: 'కథల నిర్వహణ & ప్రచురణ', desc: 'కథల సృష్టి, సవరణ, షెడ్యూలింగ్, ప్రచురణ మరియు గోప్యతా నియంత్రణ' },
  'pending-stories': { title: 'Stories Pending Moderation', telugu: 'సమీక్షలో కథలు', desc: 'ప్రచురణకు ఆమోదం కోరిన కథల పరిశీలన మరియు ఆమోదం' },
  'novels': { title: 'Novel Management', telugu: 'నవలలు & భాగాలు', desc: 'ధారావాహిక నవలలు మరియు అధ్యాయాల పర్యవేక్షణ' },
  'episodes': { title: 'Novel Episodes', telugu: 'ఎపిసోడ్లు / అధ్యాయాలు', desc: 'నవలల భాగాల సృష్టి, క్రమం మరియు ప్రచురణ' },
  'jokes': { title: 'Humor & Jokes', telugu: 'హాస్య విభాగాలు', desc: 'సరదా జోక్స్ మరియు యూజర్ ప్రతిస్పందనలు' },
  'knowledge': { title: 'Literary Knowledge', telugu: 'సాహిత్య విజ్ఞానం', desc: 'సాహిత్య వ్యాసాలు మరియు జ్ఞాన విభాగం' },
  'categories': { title: 'Category Management', telugu: 'వర్గాలు & ఉపవర్గాలు', desc: 'కథా విభాగాలు, వివరణలు మరియు కథల గణన' },
  'comments': { title: 'Comment Moderation', telugu: 'వ్యాఖ్యల నియంత్రణ', desc: 'కథలపై వచ్చిన కామెంట్ల పరిశీలన మరియు స్పామ్ తొలగింపు' },
  'reports': { title: 'Issue Reports', telugu: 'వినియోగదారుల ఫిర్యాదులు', desc: 'కంటెంట్ మరియు సాంకేతిక సమస్యల పరిష్కారం' },
  'contact': { title: 'Contact Submissions', telugu: 'సంప్రదింపు ఫారమ్ సందేశాలు', desc: 'యూజర్లు పంపిన వినతులు మరియు ప్రశ్నలు' },
  'audit-logs': { title: 'System Audit Logs', telugu: 'అడ్మిన్ ఆడిట్ రికార్డులు', desc: 'అడ్మిన్ తీసుకున్న ప్రతి చర్య యొక్క శాశ్వత చరిత్ర' },
  'settings': { title: 'System Configuration', telugu: 'వ్యవస్థ సెట్టింగ్స్ & నిబంధనలు', desc: 'రోజువారీ కథల పరిమితి (1 Story/Day) మరియు భద్రతా నియమాలు' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  currentUser,
  onOpenMobileSidebar,
  onRefresh,
  loading,
  onViewWebsite,
  onLogout,
  notificationsCount,
}) => {
  const currentInfo = TAB_TITLES[currentTab] || { title: 'Admin', telugu: 'అడ్మిన్', desc: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#121118]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#26242E] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1A25] text-[#17151A] dark:text-[#F7F3EE] lg:hidden hover:bg-black/5 cursor-pointer border border-[#E8E1DA] dark:border-[#26242E]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#7A284B] dark:text-[#D87591] uppercase tracking-wider">
              {currentInfo.title}
            </span>
            <span className="text-xs text-[#8E8797]">•</span>
            <span className="text-xs font-serif-telugu font-bold text-[#17151A] dark:text-[#F7F3EE]">
              {currentInfo.telugu}
            </span>
          </div>
          <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6] font-serif-telugu hidden sm:block">
            {currentInfo.desc}
          </p>
        </div>
      </div>

      {/* Right: Actions & Admin Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="డేటా రిఫ్రెష్ చేయండి"
          className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1A25] border border-[#E8E1DA] dark:border-[#26242E] text-[#17151A] dark:text-[#F7F3EE] hover:bg-black/5 cursor-pointer transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7A284B]' : ''}`} />
        </button>

        {/* View Public Website */}
        <button
          onClick={onViewWebsite}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1A25] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:border-[#7A284B] cursor-pointer transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
          <span>వెబ్‌సైట్ చూడండి</span>
        </button>

        {/* Super Admin Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E8E1DA] dark:border-[#26242E]">
          <div className="w-8 h-8 rounded-full bg-[#7A284B] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] leading-tight">
                {currentUser?.displayName || 'కథావాహిని అడ్మిన్'}
              </span>
              <ShieldCheck className="w-3 h-3 text-[#7A284B] dark:text-[#D87591]" />
            </div>
            <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6] block leading-tight">
              {currentUser?.email || 'kathavahini@gmail.com'}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="లాగౌట్"
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#A29CA6] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
