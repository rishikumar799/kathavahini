import React from 'react';
import { 
  HelpCircle, UserCheck, BookOpen, Feather, Flag, Mail, ArrowRight, ShieldAlert 
} from 'lucide-react';

interface HelpViewProps {
  onSelectTab: (tab: string) => void;
  onOpenAuth?: () => void;
  onOpenWrite?: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onSelectTab, onOpenAuth, onOpenWrite }) => {
  const helpCategories = [
    {
      icon: <UserCheck className="w-6 h-6 text-[#7A284B] dark:text-[#D87591]" />,
      title: 'ఖాతా & లాగిన్ సహాయం',
      description: 'Google లాగిన్, ఈమెయిల్ నమోదు, ప్రొఫైల్ సవరణ మరియు పాస్‌వర్డ్ నిర్వహణ వివరాలు.',
      actionLabel: 'ప్రవేశించండి / ఖాతా తెరవండి',
      onClick: () => {
        if (onOpenAuth) onOpenAuth();
      },
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#7A284B] dark:text-[#D87591]" />,
      title: 'పఠన సహాయం & మోడ్స్',
      description: 'ఫాంట్ సైజు సర్దుబాటు, డార్క్ మోడ్ థీమ్ మార్పు మరియు కథల విభాగాల అన్వేషణ.',
      actionLabel: 'కథలను చూడండి',
      onClick: () => onSelectTab('stories'),
    },
    {
      icon: <Feather className="w-6 h-6 text-[#7A284B] dark:text-[#D87591]" />,
      title: 'రచన & ప్రచురణ గైడ్',
      description: 'కథలు, నవలలు ఎలా ప్రచురించాలి, తెలుగులో ఎలా టైప్ చేయాలి అనే సమాచారం.',
      actionLabel: 'కథ రాయండి',
      onClick: () => {
        if (onOpenWrite) onOpenWrite();
      },
    },
    {
      icon: <Flag className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      title: 'సమస్యలు & నివేదికలు',
      description: 'సాంకేతిక లోపాలు, కథలలో తప్పులు లేదా కాపీరైట్ ఉల్లంఘనలపై ఫిర్యాదు చేయండి.',
      actionLabel: 'సమస్యను నివేదించండి',
      onClick: () => onSelectTab('report-issue'),
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-[#7A284B] dark:text-[#D87591]" />,
      title: 'తరచుగా అడిగే ప్రశ్నలు',
      description: 'ప్లాట్‌ఫారమ్ గురించిన సాధారణ ప్రశ్నలు మరియు వాటి సమగ్ర సమాధానాలు.',
      actionLabel: 'FAQ చూడండి',
      onClick: () => onSelectTab('faq'),
    },
    {
      icon: <Mail className="w-6 h-6 text-[#7A284B] dark:text-[#D87591]" />,
      title: 'నేరుగా సంప్రదించండి',
      description: 'మా బృందానికి సందేశం పంపి త్వరిత సహాయం లేదా మార్గదర్శనం పొందండి.',
      actionLabel: 'సంప్రదింపు ఫారమ్',
      onClick: () => onSelectTab('contact'),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] mb-1">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          సహాయ కేంద్రం (Help Center)
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-lg mx-auto leading-relaxed">
          కథావాహిని ప్లాట్‌ఫారమ్‌లో మీకు అవసరమైన మార్గదర్శకత్వం మరియు సేవలను సులభంగా పొందండి.
        </p>
      </div>

      {/* Grid of Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {helpCategories.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
                {item.description}
              </p>
            </div>

            <button
              onClick={item.onClick}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer pt-2"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Literary Policy Guide Card */}
      <div className="bg-[#FAF7F2] dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold font-serif-telugu text-base text-[#17151A] dark:text-[#F7F3EE]">
            కాపీరైట్ & కమ్యూనిటీ నిబంధనల సమాచారం
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
            రచనల భద్రత, కాపీరైట్ హక్కులు మరియు వినియోగ నిబంధనల గురించి మరింత తెలుసుకోండి.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectTab('content-policy')}
            className="px-4 py-2 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] bg-white dark:bg-[#23222A] text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] cursor-pointer"
          >
            కంటెంట్ విధానం
          </button>
          <button
            onClick={() => onSelectTab('terms')}
            className="px-4 py-2 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] bg-white dark:bg-[#23222A] text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] cursor-pointer"
          >
            నిబంధనలు & షరతులు
          </button>
        </div>
      </div>
    </div>
  );
};
