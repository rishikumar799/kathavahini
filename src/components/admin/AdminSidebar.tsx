import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Feather,
  FileCheck2,
  Library,
  Bookmark,
  Smile,
  Lightbulb,
  Tags,
  MessageSquare,
  AlertTriangle,
  Mail,
  History,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
  UserPlus,
  Layers,
  FileText,
  Megaphone
} from 'lucide-react';
import { User } from '../../types';

export type AdminTab = 
  | 'dashboard'
  // Content
  | 'stories'
  | 'novels'
  | 'episodes'
  | 'jokes'
  | 'knowledge'
  | 'categories'
  | 'announcements'
  // People
  | 'readers'
  | 'writers'
  | 'add-user'
  | 'writer-applications'
  | 'users'
  // Moderation
  | 'pending-stories'
  | 'comments'
  | 'reports'
  | 'contact'
  // System
  | 'audit-logs'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: User | null;
  counts: {
    pendingApplications: number;
    pendingStories: number;
    pendingReports: number;
    unreadContacts: number;
  };
  onViewWebsite: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateModal?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  counts,
  onViewWebsite,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const sections: {
    title: string;
    items: {
      id: AdminTab;
      label: string;
      teluguLabel: string;
      icon: any;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Overview', teluguLabel: 'సమీక్షా డాష్‌బోర్డ్', icon: LayoutDashboard },
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'stories', label: 'Stories', teluguLabel: 'కథల నిర్వహణ', icon: Library },
        { id: 'novels', label: 'Novels', teluguLabel: 'నవలలు', icon: Bookmark },
        { id: 'episodes', label: 'Episodes', teluguLabel: 'ఎపిసోడ్లు / భాగాలు', icon: Layers },
        { id: 'jokes', label: 'Jokes', teluguLabel: 'హాస్య జోక్స్', icon: Smile },
        { id: 'knowledge', label: 'Knowledge', teluguLabel: 'సాహిత్య విజ్ఞానం', icon: Lightbulb },
        { id: 'categories', label: 'Categories', teluguLabel: 'కేటగిరీలు', icon: Tags },
        { id: 'announcements', label: 'Announcements', teluguLabel: 'ప్రకటనలు (CMS)', icon: Megaphone },
      ]
    },
    {
      title: 'PEOPLE',
      items: [
        { id: 'readers', label: 'Readers', teluguLabel: 'పాఠకుల జాబితా', icon: BookOpen },
        { id: 'writers', label: 'Writers', teluguLabel: 'రచయితలు', icon: Feather },
        { id: 'add-user', label: 'Add User', teluguLabel: 'యూజర్‌ను జోడించండి', icon: UserPlus },
        { 
          id: 'writer-applications', 
          label: 'Writer Applications', 
          teluguLabel: 'రచయిత దరఖాస్తులు', 
          icon: FileCheck2, 
          badge: counts.pendingApplications,
          badgeColor: 'bg-amber-500 text-white'
        },
      ]
    },
    {
      title: 'MODERATION',
      items: [
        { 
          id: 'pending-stories', 
          label: 'Pending Stories', 
          teluguLabel: 'సమీక్ష కథలు', 
          icon: FileText,
          badge: counts.pendingStories,
          badgeColor: 'bg-[#7A284B] text-white'
        },
        { id: 'comments', label: 'Comments', teluguLabel: 'వ్యాఖ్యలు', icon: MessageSquare },
        { 
          id: 'reports', 
          label: 'Reports', 
          teluguLabel: 'ఫిర్యాదులు & రిపోర్టులు', 
          icon: AlertTriangle,
          badge: counts.pendingReports,
          badgeColor: 'bg-red-600 text-white'
        },
        { 
          id: 'contact', 
          label: 'Contact Messages', 
          teluguLabel: 'సందేశాలు', 
          icon: Mail,
          badge: counts.unreadContacts,
          badgeColor: 'bg-blue-600 text-white'
        },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'audit-logs', label: 'Audit Logs', teluguLabel: 'ఆడిట్ లాగ్స్', icon: History },
        { id: 'settings', label: 'Settings', teluguLabel: 'సెట్టింగ్స్', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#121118] text-[#F7F3EE] border-r border-[#26242E] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#26242E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A284B] flex items-center justify-center font-serif-telugu font-bold text-xl text-white shadow-lg shadow-[#7A284B]/30">
              క
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-white uppercase">KATHAVAHINI CMS</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#7A284B] text-white">ADMIN</span>
              </div>
              <p className="text-[11px] text-[#A29CA6] font-serif-telugu">కంటెంట్ మేనేజ్‌మెంట్ కన్సోల్</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#A29CA6] hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Admin Identity Banner */}
        <div className="px-4 py-3 bg-[#1A1822] border-b border-[#26242E] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7A284B]/20 text-[#D87591] flex items-center justify-center font-bold text-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#D87591]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">అడ్మినిస్ట్రేటర్</p>
            <p className="text-[10px] text-[#A29CA6] truncate">{currentUser?.email || 'thekathavahini@gmail.com'}</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {sections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6F6970] uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#7A284B] text-white shadow-sm shadow-[#7A284B]/30'
                          : 'text-[#A29CA6] hover:text-white hover:bg-[#1E1C28]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#A29CA6]'}`} />
                        <div className="text-left truncate">
                          <p className="truncate leading-none">{item.label}</p>
                          <p className={`text-[10px] truncate mt-0.5 font-serif-telugu ${isActive ? 'text-white/80' : 'text-[#6F6970]'}`}>
                            {item.teluguLabel}
                          </p>
                        </div>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#7A284B] text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#26242E] space-y-2 bg-[#121118]">
          <button
            onClick={onViewWebsite}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1A1822] hover:bg-[#242130] text-[#D87591] hover:text-white text-xs font-bold transition-all cursor-pointer border border-[#26242E]"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>పబ్లిక్ వెబ్‌సైట్‌కు వెళ్లండి</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#A29CA6] hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>లాగ్ అవుట్ (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
