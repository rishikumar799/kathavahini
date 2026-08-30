import React from 'react';
import { Cookie, Settings, ShieldCheck } from 'lucide-react';

export const CookiePolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Cookie className="w-8 h-8 text-[#7A284B] dark:text-[#D87591]" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            కుకీస్ & స్థానిక నిల్వ విధానం (Cookie Policy)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          చివరిగా నవీకరించబడిన తేదీ: ఆగస్టు 2026
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-4 shadow-sm text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        <p>
          కథావాహిని (Kathavahini) ప్లాట్‌ఫారమ్ పాఠకులకు అత్యుత్తమ మరియు నిరంతరాయమైన పఠనానుభవాన్ని అందించడానికి కుకీలు (Cookies) మరియు బ్రౌజర్ స్థానిక నిల్వను (LocalStorage/IndexedDB) ఉపయోగిస్తుంది. ఈ పేజీ మేము ఏ సాంకేతికతలను ఎందుకు ఉపయోగిస్తున్నామో వివరిస్తుంది.
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        {/* Section 1: What is a Cookie */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            1. కుకీలు & బ్రౌజర్ స్టోరేజ్ అంటే ఏమిటి?
          </h2>
          <p>
            కుకీలు మరియు లోకల్ స్టోరేజ్ అనేది మీరు వెబ్‌సైట్‌ను సందర్శించినప్పుడు మీ బ్రౌజర్‌లో భద్రపరచబడే చిన్న డేటా భాగాలు. ఇవి మీ ప్రాధాన్యతలను గుర్తుంచుకోవడంలో సహాయపడతాయి.
          </p>
        </section>

        {/* Section 2: How we use them */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            2. మేము ఉపయోగించే సాంకేతికతలు (Technologies Used on Kathavahini)
          </h2>
          <ul className="list-disc list-inside space-y-3 pl-2 text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8]">
            <li>
              <strong>ఫైర్‌బేస్ ప్రామాణీకరణ సెషన్స్ (Firebase Auth Persistence):</strong> మీరు లాగిన్ అయినప్పుడు ప్రతి పేజీకి మళ్లీ పాస్‌వర్డ్ ఇవ్వకుండా మీ సెషన్‌ను సురక్షితంగా నిర్వహించడానికి Firebase LocalStorage మరియు IndexedDB నిల్వను ఉపయోగిస్తుంది.
            </li>
            <li>
              <strong>పఠన ప్రాధాన్యతలు (Reading Preferences):</strong> మీరు ఎంచుకున్న డార్క్/లైట్ మోడ్ థీమ్, ఫాంట్ సైజు (14px - 28px) మరియు ఫాంట్ స్టైల్ సెట్టింగ్‌లను బ్రౌజర్‌లో భద్రపరుస్తాము.
            </li>
            <li>
              <strong>పఠన పురోగతి (Reading History & Progress):</strong> మీరు చదివే కథలో ఏ శాతానికి చేరారో గుర్తుపెట్టుకుని తర్వాత అక్కడి నుంచే చదివేందుకు సహకరిస్తుంది.
            </li>
          </ul>
        </section>

        {/* Section 3: Managing Cookies */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            3. మీ బ్రౌజర్‌లో కుకీలను ఎలా నిర్వహించాలి?
          </h2>
          <p>
            మీరు మీ బ్రౌజర్ సెట్టింగ్స్ (Chrome, Firefox, Safari, Edge) ద్వారా కుకీలను ఎప్పుడైనా తొలగించవచ్చు లేదా నిలిపివేయవచ్చు. అయితే కుకీలు మరియు లోకల్ స్టోరేజ్‌ను పూర్తిగా నిలిపివేస్తే లాగిన్ ఉండడం లేదా డార్క్ మోడ్ గుర్తుంచుకోవడం వంటి ఫీచర్లు సరిగ్గా పనిచేయకపోవచ్చు.
          </p>
        </section>
      </div>
    </div>
  );
};
