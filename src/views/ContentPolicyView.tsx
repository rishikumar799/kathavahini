import React from 'react';
import { ShieldAlert, BookOpen, AlertCircle, Flag, ChevronRight } from 'lucide-react';

interface ContentPolicyViewProps {
  onSelectTab?: (tab: string) => void;
}

export const ContentPolicyView: React.FC<ContentPolicyViewProps> = ({ onSelectTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-[#7A284B] dark:text-[#D87591]" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            కంటెంట్ & కాపీరైట్ విధానం (Content & Copyright Policy)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          తెలుగు రచయితల మేధో సంపత్తికి మరియు ఆరోగ్యకరమైన పఠనావరణానికి మా నిబద్ధత
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-4 shadow-sm text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        <p>
          కథావాహిని ప్లాట్‌ఫారమ్ తెలుగు భాషా ప్రేమికులు, సృజనాత్మక రచయితలు మరియు పాఠకుల కోసం రూపొందించబడిన స్వతంత్ర వేదిక. ఇక్కడ ప్రచురించబడే ప్రతి రచన అసలైనదై ఉండాలి మరియు ఇతరుల హక్కులకు భంగం కలిగించరాదు.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        {/* Section 1: Copyright Ownership */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            1. కాపీరైట్ యాజమాన్యం (Original Author Rights)
          </h2>
          <p>
            రచయితలకు తాము సృష్టించిన రచనలపై సంపూర్ణ హక్కులు ఉంటాయి. వేదికపై ప్రచురించినప్పటికీ, మీ కథలకు మీరే ఏకైక యజమాని. మీ రచనను పుస్తకరూపంలో ప్రచురించుకునే లేదా ఇతర మాధ్యమాలకు ఇచ్చే పూర్తి స్వేచ్ఛ మీకే ఉంటుంది.
          </p>
        </section>

        {/* Section 2: Plagiarism Prohibited */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            2. చౌర్యం & అనుమతి లేని కాపీయింగ్ నిషేధం (Anti-Plagiarism)
          </h2>
          <p>
            ఇతర రచయితల కథలు, పత్రికలలోని కథనాలు, పుస్తకాలు లేదా ఆన్‌లైన్ బ్లాగుల నుండి వారి స్పష్టమైన అనుమతి లేకుండా కాపీ చేసి ప్రచురించడం చట్టవిరుద్ధం మరియు కథావాహిని నిబంధనలకు తీవ్ర విరుద్ధం. అలాంటి రచనలు గుర్తించిన వెంటనే తొలగించబడతాయి.
          </p>
        </section>

        {/* Section 3: Inappropriate & Prohibited Content */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            3. నిషేధించబడిన కంటెంట్ మార్గదర్శకాలు (Prohibited Content)
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8]">
            <li>ఏ వ్యక్తి, మతం, కులం లేదా వర్గాన్ని కించపరిచే విధంగా ఉండే కంటెంట్.</li>
            <li>పిల్లల సంరక్షణకు హాని కలిగించే లేదా లైంగిక అసభ్యకరమైన రచనలు.</li>
            <li>హింస, ఆత్మహత్యను ప్రేరేపించే విషయాలు లేదా చట్టవిరుద్ధ కార్యకలాపాలు.</li>
            <li>ఇతరుల వ్యక్తిగత వివరాలను (ఫోన్ నంబర్లు, వ్యక్తిగత ఫోటోలు) దుర్వినియోగం చేయడం.</li>
          </ul>
        </section>

        {/* Section 4: Reporting & Takedowns */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            4. ఉల్లంఘనలను నివేదించడం (Reporting & Content Removal)
          </h2>
          <p>
            మీ కాపీరైట్ ఉన్న రచన కథావాహినిలో మీ అనుమతి లేకుండా ప్రచురించబడిందని మీరు భావిస్తే లేదా ఏదైనా కథలో అభ్యంతరకరమైన విషయాలు ఉంటే, వెంటనే మా దృష్టికి తీసుకురావచ్చు.
          </p>
          <div className="pt-2">
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('report-issue')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs sm:text-sm font-bold font-serif-telugu transition-colors cursor-pointer shadow-sm"
              >
                <Flag className="w-4 h-4" />
                <span>సమస్యను లేదా కాపీరైట్ ఉల్లంఘనను నివేదించండి</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
