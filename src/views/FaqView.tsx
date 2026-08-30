import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle, BookOpen } from 'lucide-react';

interface FaqViewProps {
  onOpenAuth?: () => void;
  onOpenWrite?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ onOpenAuth, onOpenWrite, onSelectTab }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'కథలు మరియు నవలలు చదవడానికి ఖాతా (Login) అవసరమా?',
      a: 'లేదు. కథావాహిని వేదికపై ఉన్న అన్ని పబ్లిక్ కథలు, ధారావాహిక నవలలు, జోక్స్ మరియు విజ్ఞాన సంబంధ వ్యాసాలను మీరు ఎటువంటి లాగిన్ లేకుండా ఉచితంగా చదువుకోవచ్చు.',
    },
    {
      q: 'కథలను బుక్‌మార్క్ చేయడానికి లేదా లైక్ చేయడానికి ఖాతా అవసరమా?',
      a: 'లైబ్రరీలో కథలను శాశ్వతంగా భద్రపరచుకోవడానికి, మీ పఠన పురోగతిని ట్రాక్ చేయడానికి మరియు రచయితలకు వ్యాఖ్యలు (Comments) అందించడానికి ఉచిత ఖాతాలో లాగిన్ అవ్వడం మంచిది. అయితే సాధారణ పఠనం ఎల్లప్పుడూ అందరికీ అందుబాటులో ఉంటుంది.',
    },
    {
      q: 'వ్యాఖ్యలు (Comments) రాయడానికి లాగిన్ ఎందుకు తప్పనిసరి?',
      a: 'రచయితల రచనలపై ఆరోగ్యకరమైన, మర్యాదపూర్వకమైన మరియు నిజమైన అభిప్రాయాలు ఉండేలా చూడడానికి, స్పామ్ లేదా అసభ్యకరమైన వ్యాఖ్యలను నివారించడానికి ధృవీకరించబడిన వినియోగదారులకు మాత్రమే వ్యాఖ్యల సౌకర్యం కల్పించబడింది.',
    },
    {
      q: 'కథావాహినిలో కొత్త ఖాతాను ఎలా సృష్టించాలి?',
      a: 'పై భాగంలోని "ప్రవేశించు" (Login) బటన్ క్లిక్ చేసి, మీ Google ఖాతా ద్వారా లేదా మీ ఈమెయిల్ మరియు పాస్‌వర్డ్‌తో కొద్ది క్షణాల్లో ఉచితంగా ఖాతాను నమోదు చేసుకోవచ్చు.',
    },
    {
      q: 'నేను కథావాహిని వేదికపై రచయితగా కథలు ఎలా రాయగలను?',
      a: 'మీరు లాగిన్ అయిన తర్వాత పైన ఉన్న "కథ రాయండి" బటన్‌పై క్లిక్ చేసి వెంటనే మీ కథ శీర్షిక, వర్గం, సారాంశం మరియు పూర్తి పాఠాన్ని రాసి ప్రచురించవచ్చు. తెలుగు టైపింగ్ మరియు అనుకూల ఫార్మాటింగ్ సాధనాలు ఎడిటర్‌లోనే అందుబాటులో ఉన్నాయి.',
    },
    {
      q: 'ఏదైనా కథలో తప్పులు లేదా కాపీరైట్ ఉల్లంఘన ఉంటే ఎలా నివేదించాలి?',
      a: 'మీరు "సమస్యను నివేదించండి" (Report Issue) పేజీకి వెళ్లి సంబంధిత కథ వివరాలు మరియు సమస్య రకాన్ని ఎంచుకుని మా బృందానికి సులభంగా తెలియజేయవచ్చు. మా నిర్వాహకులు వెంటనే సమీక్షిస్తారు.',
    },
    {
      q: 'కథావాహిని బృందాన్ని నేరుగా ఎలా సంప్రదించాలి?',
      a: 'మా "మమ్మల్ని సంప్రదించండి" (Contact Us) పేజీ ద్వారా సందేశాన్ని పంపవచ్చు లేదా support@kathavahini.org కు ఈమెయిల్ చేయవచ్చు.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] mb-1">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          తరచుగా అడిగే ప్రశ్నలు (FAQ)
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-lg mx-auto leading-relaxed">
          కథావాహిని ప్లాట్‌ఫారమ్ వినియోగం, పఠనం మరియు రచనలకు సంబంధించిన సాధారణ సందేహాలు - సమాధానాలు
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7F2]/50 dark:hover:bg-[#23222A]/50 transition-colors"
              >
                <span className="font-bold font-serif-telugu text-base sm:text-lg text-[#17151A] dark:text-[#F7F3EE]">
                  {faq.q}
                </span>
                <span className="shrink-0 text-[#7A284B] dark:text-[#D87591]">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base font-serif-telugu text-[#4E4852] dark:text-[#C5BFC8] leading-relaxed border-t border-[#E8E1DA]/50 dark:border-[#2E2D36]/50 pt-4 bg-[#FAF7F2]/30 dark:bg-[#151419]/30">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-center space-y-3">
        <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          మీ ప్రశ్నకు సమాధానం దొరకలేదా?
        </h3>
        <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] max-w-md mx-auto">
          మా సపోర్ట్ బృందం మీకు సహాయం చేయడానికి ఎల్లప్పుడూ సిద్ధంగా ఉంది.
        </p>
        <div className="pt-2">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('contact')}
              className="px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-xs sm:text-sm font-serif-telugu transition-colors cursor-pointer"
            >
              మమ్మల్ని సంప్రదించండి
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
