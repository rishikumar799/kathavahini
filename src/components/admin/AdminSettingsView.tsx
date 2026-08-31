import React from 'react';
import { Settings, ShieldCheck, Lock, Database, Flame, Clock, Key, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';

interface AdminSettingsViewProps {
  currentUser: User | null;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Platform Information Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8E1DA] dark:border-[#26242E]">
          <div className="p-2.5 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
              కథావాహిని సిస్టమ్ సెట్టింగ్స్ & నిబంధనలు (System Rules & Config)
            </h3>
            <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
              ప్లాట్‌ఫారమ్ భద్రత, రేట్ లిమిట్స్ మరియు డేటాబేస్ స్థితి
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Rate limiting Rule */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                రచయిత రోజువారీ కథల సమర్పణ పరిమితి (Rate Limiting Rule)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                యాక్టివ్ (Enforced)
              </span>
            </div>
            <p className="text-[#6F6970] dark:text-[#A29CA6]">
              ప్రతి అధికారిక రచయిత రోజుకు గరిష్టంగా <strong>1 కథను మాత్రమే</strong> ప్రచురణ సమీక్షకు సమర్పించగలరు (1 story per day limit enforced in <code>writerService.checkCanSubmitToday</code> and Firestore rules).
            </p>
          </div>

          {/* Super Admin Credentials Info */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#17151A] dark:text-[#F7F3EE]">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>సూపర్ అడ్మిన్ అధికారిక సమాచారం</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
              <div>
                అడ్మిన్ ఇమెయిల్: <strong className="text-[#17151A] dark:text-[#F7F3EE]">thekathavahini@gmail.com</strong>
              </div>
              <div>
                ద్వితీయ ఖాతా: <strong className="text-[#17151A] dark:text-[#F7F3EE]">rishikumarvadada@gmail.com</strong>
              </div>
              <div>
                అధికార స్థాయి: <strong className="text-purple-600 dark:text-purple-400">Super Administrator (Role 0)</strong>
              </div>
              <div>
                ఆర్కిటెక్చర్: <strong className="text-emerald-600">Firebase Firestore + Auth</strong>
              </div>
            </div>
          </div>

          {/* Backend & Security Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#17151A] dark:text-[#F7F3EE]">
              <Lock className="w-4 h-4 text-[#7A284B]" />
              <span>భద్రతా నిబంధనలు (Security & Integrity)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#6F6970] dark:text-[#A29CA6] text-[11px]">
              <li>సాధారణ వినియోగదారులు క్లయింట్-సైడ్ నుండి తమ <code>role</code> లేదా <code>status</code> మార్చలేరు.</li>
              <li>రచయిత దరఖాస్తును అడ్మిన్ ఆమోదించిన తర్వాత మాత్రమే రోల్ <code>writer</code> గా మారుతుంది.</li>
              <li>ప్రతి అడ్మిన్ చర్య <code>adminAuditLogs</code> కలెక్షన్‌లో రికార్డవుతుంది.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
