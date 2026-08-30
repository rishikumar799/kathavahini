import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Mail } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#7A284B] dark:text-[#D87591]" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            గోప్యతా విధానం (Privacy Policy)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          చివరిగా నవీకరించబడిన తేదీ: ఆగస్టు 2026 | అమలులోకి వచ్చిన తేది: ఆగస్టు 2026
        </p>
      </div>

      {/* Intro */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-4 shadow-sm text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        <p>
          ‘కథావాహిని’ (Kathavahini Telugu Platform) వెబ్‌సైట్‌ను సందర్శించినందుకు ధన్యవాదాలు. మా వినియోగదారుల వ్యక్తిగత వివరాల గోప్యతను కాపాడడం మా అత్యున్నత బాధ్యత. ఈ గోప్యతా విధానం మేము ఏ సమాచారాన్ని సేకరిస్తాము, ఎలా ఉపయోగిస్తాము మరియు మీ డేటా హక్కుల గురించి వివరిస్తుంది.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-6 text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        {/* Section 1: Information Collected */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            1. మేము సేకరించే సమాచారం (Information We Collect)
          </h2>
          <p>మేము ఈ క్రింది రకాల సమాచారాన్ని సేకరిస్తాము:</p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8]">
            <li><strong>ఖాతా వివరాలు:</strong> మీరు ఖాతా సృష్టించినప్పుడు లేదా Google ద్వారా లాగిన్ అయినప్పుడు మీ పేరు, ఈమెయిల్ చిరునామా, మరియు ప్రొఫైల్ ఫోటో.</li>
            <li><strong>ప్రొఫైల్ సమాచారం:</strong> మీరు అందించే బయో (స్వీయ పరిచయం), మరియు పఠన ప్రాధాన్యతలు (ఫాంట్ సైజు, థీమ్).</li>
            <li><strong>వినియోగదారు సమర్పణలు:</strong> మీరు ప్రచురించే కథలు, నవలలు, జోక్స్, మరియు వ్యాఖ్యలు (Comments).</li>
            <li><strong>కార్యకలాపాల వివరాలు:</strong> మీరు లైక్ చేసిన కథలు, బుక్‌మార్క్ చేసిన అంశాలు, మరియు పఠన పురోగతి (Reading Progress).</li>
          </ul>
        </section>

        {/* Section 2: Firebase Authentication */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            2. ఫైర్‌బేస్ ప్రామాణీకరణ & డేటాబేస్ (Firebase Auth & Services)
          </h2>
          <p>
            కథావాహిని (Kathavahini) ప్లాట్‌ఫారమ్ సురక్షిత లాగిన్ మరియు ఖాతా భద్రత కోసం <strong>Google Firebase Authentication</strong> మరియు <strong>Cloud Firestore</strong> సేవలను ఉపయోగిస్తుంది. మీ పాస్‌వర్డ్‌లు నేరుగా ఎన్‌క్రిప్ట్ చేయబడి భద్రపరచబడతాయి; మా డెవలపర్లు లేదా సిబ్బంది మీ అసలు పాస్‌వర్డ్‌ను చూడలేరు.
          </p>
        </section>

        {/* Section 3: Data Usage */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            3. సమాచార వినియోగం (How We Use Information)
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8]">
            <li>మీ ఖాతాను నిర్వహించడానికి మరియు రచయిత/పాఠక ఫీచర్లను అందించడానికి.</li>
            <li>మీ పఠన అనుభవాన్ని మెరుగుపరచడానికి (సేవ్ చేసిన కథలు, చదివిన పేజీ జ్ఞాపకం ఉంచుకోవడం).</li>
            <li>ప్లాట్‌ఫారమ్ భద్రతను పర్యవేక్షించడానికి మరియు స్పామ్ లేదా అవాంఛనీయ కంటెంట్‌ను నిరోధించడానికి.</li>
            <li>మీరు సమర్పించిన సమస్యలు లేదా సంప్రదింపు సందేశాలకు ప్రత్యుత్తరం ఇవ్వడానికి.</li>
          </ul>
        </section>

        {/* Section 4: Cookies & Local Storage */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            4. కుకీలు & స్థానిక నిల్వ (Cookies & Local Storage)
          </h2>
          <p>
            మీరు లాగిన్ స్థితిని కొనసాగించడానికి మరియు డార్క్/లైట్ మోడ్ ప్రాధాన్యతలను సేవ్ చేయడానికి బ్రౌజర్ యొక్క లోకల్ స్టోరేజ్ మరియు సెషన్ కుకీలను ఉపయోగిస్తాము. వివరాల కోసం మా <span className="font-bold underline">కుకీస్ విధానం</span> చూడండి.
          </p>
        </section>

        {/* Section 5: Data Security & Retention */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            5. డేటా భద్రత & నిల్వ కాలం (Data Security & Retention)
          </h2>
          <p>
            మేము పరిశ్రమ ప్రామాణిక ఎన్‌క్రిప్షన్ ప్రోటోకాల్స్ (HTTPS/TLS) ఉపయోగిస్తాము. మీ ఖాతా క్రియాశీలంగా ఉన్నంత కాలం మీ డేటా సురక్షితంగా నిల్వ ఉంటుంది. మీ ఖాతాను తొలగించాలని కోరినప్పుడు మీ వ్యక్తిగత వివరాలు నిబంధనల ప్రకారం తొలగించబడతాయి.
          </p>
        </section>

        {/* Section 6: User Rights */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            6. మీ హక్కులు (Your Rights)
          </h2>
          <p>
            మీ ప్రొఫైల్ వివరాలను ఎప్పుడైనా సవరించుకునే, మీ పఠన చరిత్రను నిర్వహించే మరియు వ్యక్తిగత డేటా తొలగింపును అభ్యర్థించే పూర్తి హక్కు మీకు ఉంది.
          </p>
        </section>

        {/* Section 7: Contact Placeholder */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            7. సంప్రదింపు సమాచారం (Contact Us)
          </h2>
          <p>ఈ గోప్యతా విధానంపై మీకు ఏవైనా సందేహాలు ఉంటే, మమ్మల్ని సంప్రదించండి:</p>
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8] space-y-1">
            <p><strong>సంస్థ / నిర్వహణ:</strong> [కథావాహిని ప్లాట్‌ఫారమ్ అడ్మినిస్ట్రేషన్]</p>
            <p><strong>ఈమెయిల్:</strong> privacy@kathavahini.org (లేదా సపోర్ట్ పేజీ ద్వారా)</p>
            <p><strong>చిరునామా:</strong> [అధికారిక కార్యాలయ చిరునామా - హైదరాబాద్ / విజయవాడ, ఆంధ్రప్రదేశ్ / తెలంగాణ]</p>
          </div>
        </section>
      </div>
    </div>
  );
};
