import React from 'react';
import { Heart, Feather, BookOpen, Sparkles, Shield, Mail } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenWrite: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenWrite }) => {
  return (
    <footer className="w-full bg-[#15131A] text-[#FAF7F2] border-t border-[#2E2D36] pt-16 pb-24 md:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2E2D36]">
          {/* Col 1: Brand & Quote */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center font-serif-telugu font-bold text-2xl shadow-md">
                క
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif-telugu tracking-tight text-white">
                  కథావాహిని <span className="text-xs font-sans text-[#D87591] font-semibold uppercase">Kathavahini</span>
                </h3>
                <p className="text-xs text-[#AAA4AC]">తెలుగు రీడింగ్ & రైటింగ్ వేదిక</p>
              </div>
            </div>

            <p className="text-sm font-serif-telugu text-[#AAA4AC] leading-relaxed max-w-md">
              "ప్రతి తెలుగు కథ వెనుక ఒక హృదయ స్పందన ఉంటుంది. పాఠకులకు అమృతతుల్యమైన సాహిత్యాన్ని అందించడమే మా లక్ష్యం."
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenWrite}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Feather className="w-4 h-4" />
                <span>రచయితగా ఉచితంగా చేరండి</span>
              </button>
            </div>
          </div>

          {/* Col 2: కథావాహిని (Kathavahini Navigation) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-serif-telugu text-white uppercase tracking-wider">
              కథావాహిని (Kathavahini)
            </h4>
            <ul className="space-y-2 text-xs font-serif-telugu text-[#AAA4AC]">
              <li><button onClick={() => onSelectTab('about')} className="hover:text-white transition-colors cursor-pointer text-left">మా గురించి</button></li>
              <li><button onClick={() => onSelectTab('stories')} className="hover:text-white transition-colors cursor-pointer text-left">కథల ప్రపంచం</button></li>
              <li><button onClick={() => onSelectTab('novels')} className="hover:text-white transition-colors cursor-pointer text-left">ధారావాహిక నవలలు</button></li>
              <li><button onClick={() => onSelectTab('jokes')} className="hover:text-white transition-colors cursor-pointer text-left">హాస్యం & జోక్స్</button></li>
              <li><button onClick={() => onSelectTab('knowledge')} className="hover:text-white transition-colors cursor-pointer text-left">విజ్ఞానాలు & వ్యాసాలు</button></li>
              <li><button onClick={() => onSelectTab('authors')} className="hover:text-white transition-colors cursor-pointer text-left">రచయితల జాబితా</button></li>
            </ul>
          </div>

          {/* Col 3: సహాయం (Help & Support) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-serif-telugu text-white uppercase tracking-wider">
              సహాయం (Help)
            </h4>
            <ul className="space-y-2 text-xs font-serif-telugu text-[#AAA4AC]">
              <li><button onClick={() => onSelectTab('faq')} className="hover:text-white transition-colors cursor-pointer text-left">తరచుగా అడిగే ప్రశ్నలు (FAQ)</button></li>
              <li><button onClick={() => onSelectTab('help')} className="hover:text-white transition-colors cursor-pointer text-left">సహాయ కేంద్రం</button></li>
              <li><button onClick={() => onSelectTab('contact')} className="hover:text-white transition-colors cursor-pointer text-left">మమ్మల్ని సంప్రదించండి</button></li>
              <li><button onClick={() => onSelectTab('report-issue')} className="hover:text-white transition-colors cursor-pointer text-left">సమస్యను నివేదించండి</button></li>
            </ul>
          </div>

          {/* Col 4: చట్టపరమైన (Legal & Policies) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-serif-telugu text-white uppercase tracking-wider">
              చట్టపరమైన (Legal)
            </h4>
            <ul className="space-y-2 text-xs font-serif-telugu text-[#AAA4AC]">
              <li><button onClick={() => onSelectTab('privacy-policy')} className="hover:text-white transition-colors cursor-pointer text-left">గోప్యతా విధానం</button></li>
              <li><button onClick={() => onSelectTab('terms')} className="hover:text-white transition-colors cursor-pointer text-left">నిబంధనలు & షరతులు</button></li>
              <li><button onClick={() => onSelectTab('cookie-policy')} className="hover:text-white transition-colors cursor-pointer text-left">కుకీస్ విధానం</button></li>
              <li><button onClick={() => onSelectTab('content-policy')} className="hover:text-white transition-colors cursor-pointer text-left">కంటెంట్ & కాపీరైట్</button></li>
              <li className="pt-1"><button onClick={() => onSelectTab('admin')} className="hover:text-purple-400 text-purple-300/80 transition-colors cursor-pointer text-left flex items-center gap-1.5 font-medium"><Shield className="w-3 h-3 text-purple-400" /><span>అడ్మిన్ పోర్టల్ (Admin Login)</span></button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#AAA4AC] gap-4">
          <p>© {new Date().getFullYear()} కథావాహిని (Kathavahini) తెలుగు ప్లాట్‌ఫారమ్. సర్వ హక్కులూ ప్రత్యేకించబడ్డాయి.</p>
          <div className="flex items-center gap-1 text-[#AAA4AC]">
            <span>తెలుగు భాష మరియు సాహిత్యం కోసం</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" />
            <span>తో రూపొందించబడింది</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
