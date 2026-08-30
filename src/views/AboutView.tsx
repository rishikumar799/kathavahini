import React from 'react';
import { BookOpen, Feather, Heart, Users, ShieldCheck, Sparkles } from 'lucide-react';

interface AboutViewProps {
  onOpenWrite?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenWrite, onSelectTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#7A284B] dark:bg-[#D87591] text-white font-serif-telugu font-bold text-3xl shadow-lg mb-2">
          క
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          మా గురించి (About Kathavahini)
        </h1>
        <p className="text-base sm:text-lg text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-2xl mx-auto leading-relaxed">
          తెలుగు భాషా మాధుర్యాన్ని, కథా శిల్పాన్ని సరికొత్త సాంకేతిక యుగంలో విశ్వవ్యాప్తం చేసే సాహిత్య వేదిక.
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 space-y-6 shadow-sm">
        <h2 className="text-2xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591] flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          కథావాహిని కథనం & మా సంకల్పం
        </h2>
        <div className="prose dark:prose-invert max-w-none text-base font-serif-telugu leading-relaxed space-y-4 text-[#2E2D36] dark:text-[#E8E1DA]">
          <p>
            ‘కథావాహిని’ (Kathavahini) అనేది తెలుగు భాష, కథా సాహిత్యం మరియు సమకాలీన రచనలను ఒకే వేదికపైకి తీసుకురావాలనే లక్ష్యంతో రూపొందించబడిన డిజిటల్ ప్లాట్‌ఫారమ్. చిన్ననాటి అమ్మమ్మ కథల నుండి నేటి ఆధునిక సామాజిక నవలల వరకు, తెలుగు వారి కథల దాహాన్ని తీర్చేందుకు ఈ వేదిక నిర్మించబడింది.
          </p>
          <p>
            సాహిత్యం కేవలం పుస్తకాలకే పరిమితం కాకుండా, ప్రతి ఒక్కరి చేతిలోని మొబైల్ మరియు కంప్యూటర్ ద్వారా సులభంగా, ఆహ్లాదకరమైన పఠనానుభవంతో (Reading Experience) అందరికీ చేరువ కావాలన్నదే మా ముఖ్య ఉద్దేశం.
          </p>
        </div>
      </div>

      {/* Core Values / Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            పాఠకులకు ప్రాధాన్యత
          </h3>
          <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
            కంటికి అలసట లేని రీడింగ్ మోడ్స్, ఫాంట్ సైజు సర్దుబాట్లు మరియు వర్గాల వారీగా నచ్చిన కథలను వెతుక్కునే సౌలభ్యం.
          </p>
        </div>

        <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold">
            <Feather className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            రచయితలకు వేదిక
          </h3>
          <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
            ప్రతి తెలుగు రచయిత తమ భావాలను, కథలను, నవలలను వేలాది మంది పాఠకులతో పంచుకోవడానికి అనువైన రచన వేదిక.
          </p>
        </div>

        <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            ఆరోగ్యకర సమాజం
          </h3>
          <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
            సారవంతమైన చర్చలు, కాపీరైట్ గౌరవం, మరియు భావవ్యక్తీకరణకు స్నేహపూర్వక వాతావరణం.
          </p>
        </div>
      </div>

      {/* Community Engagement Section */}
      <div className="bg-gradient-to-br from-[#7A284B] to-[#541A32] dark:from-[#232029] dark:to-[#18181D] rounded-3xl text-white p-8 sm:p-10 space-y-4 shadow-md">
        <h3 className="text-2xl font-bold font-serif-telugu">
          మీరూ కథావాహిని ప్రయాణంలో భాగస్వాములు అవ్వండి
        </h3>
        <p className="text-sm font-serif-telugu text-[#E8E1DA] leading-relaxed max-w-2xl">
          మీ వద్ద మంచి కథలు, కవితలు లేదా నవలలు ఉన్నాయా? అయితే కథావాహిని ద్వారా మీ రచనలను ప్రచురించి తెలుగు పాఠకుల హృదయాలను గెలుచుకోండి.
        </p>
        <div className="pt-2 flex flex-wrap gap-4">
          {onOpenWrite && (
            <button
              onClick={onOpenWrite}
              className="px-6 py-3 rounded-full bg-white text-[#7A284B] font-bold text-sm font-serif-telugu hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-sm"
            >
              రచన ప్రారంభించండి
            </button>
          )}
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('stories')}
              className="px-6 py-3 rounded-full bg-transparent border border-white/40 text-white font-bold text-sm font-serif-telugu hover:bg-white/10 transition-colors cursor-pointer"
            >
              కథలను అన్వేషించండి
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
