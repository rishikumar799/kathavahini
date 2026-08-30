import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#7A284B] dark:text-[#D87591]" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            నిబంధనలు & షరతులు (Terms & Conditions)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          చివరిగా నవీకరించబడిన తేదీ: ఆగస్టు 2026
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-4 shadow-sm text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        <p>
          కథావాహిని (Kathavahini) వెబ్‌సైట్ మరియు సంబంధిత సేవలను ఉపయోగించడం ద్వారా, మీరు ఈ క్రింది నిబంధనలు మరియు షరతులకు అంగీకరిస్తున్నారు. మీరు వీటితో ఏకీభవించకపోతే, దయచేసి మా సేవలను ఉపయోగించవద్దు.
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base font-serif-telugu leading-relaxed text-[#2E2D36] dark:text-[#E8E1DA]">
        {/* Section 1 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            1. సేవా నిబంధనల ఆమోదం & ఖాతా బాధ్యతలు (Acceptance & Accounts)
          </h2>
          <p>
            మీరు ఖాతా సృష్టించినప్పుడు ఖచ్చితమైన సమాచారాన్ని అందించాలి. మీ లాగిన్ వివరాల భద్రతకు మీరే పూర్తి బాధ్యులు. మీ ఖాతా ద్వారా జరిగే అన్ని కార్యకలాపాలకు మీరు జవాబుదారీగా ఉంటారు.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            2. కంటెంట్ యాజమాన్యం & కాపీరైట్ (Content Ownership & Submissions)
          </h2>
          <p>
            రచయితలు తాము సమర్పించే కథలు, నవలలు, కవితలు మరియు వ్యాసాలపై తమ పూర్తి మేధో సంపత్తి హక్కులను (Copyrights) కలిగి ఉంటారు. కథావాహిని వేదికపై మీ రచనను ప్రచురించడం ద్వారా, పాఠకులకు దానిని ప్రదర్శించడానికి, ప్రచారం చేయడానికి కథావాహినికి రద్దు చేయలేని లైసెన్స్‌ను మంజూరు చేస్తున్నారు.
          </p>
          <p className="text-xs sm:text-sm text-[#E05252] dark:text-[#F37B7B] font-bold">
            గమనిక: ఇతరుల అనుమతి లేకుండా వారి రచనలను కాపీ చేసి ప్రచురించడం (Plagiarism) ఖచ్చితంగా నిషేధించబడింది.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            3. నిషిద్ధ కంటెంట్ & ప్రవర్తన (Prohibited Conduct)
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8]">
            <li>ద్వేషపూరిత, అశ్లీల, హింసాత్మక లేదా చట్టవిరుద్ధమైన విషయాలను పోస్ట్ చేయడం.</li>
            <li>ఇతర వినియోగదారులను వేధించడం లేదా అసభ్యకరమైన వ్యాఖ్యలు (Comments) చేయడం.</li>
            <li>ప్లాట్‌ఫారమ్ భద్రతకు హాని కలిగించే లేదా ఆటోమేటెడ్ బాట్‌లను ఉపయోగించి డేటా సేకరించడం.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            4. కంటెంట్ సమీక్ష & ఖాతా రద్దు (Moderation & Termination)
          </h2>
          <p>
            ఈ నిబంధనలను ఉల్లంఘించే ఏ కంటెంట్‌నైనా ఎలాంటి ముందస్తు నోటీసు లేకుండానే తొలగించే లేదా ఖాతాలను సస్పెండ్ చేసే హక్కు కథావాహిని అడ్మినిస్ట్రేషన్‌కు ఉంది.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            5. బాధ్యతా నిరాకరణ (Limitation of Liability & Disclaimer)
          </h2>
          <p>
            కథావాహిని వేదిక "ఉన్నది ఉన్నట్లుగా" (As-Is) అందించబడుతుంది. రచయితలు వ్యక్తం చేసే వ్యక్తిగత అభిప్రాయాలకు లేదా రచనల్లోని సమాచార ఖచ్చితత్వానికి ప్లాట్‌ఫారమ్ ప్రత్యక్షంగా బాధ్యత వహించదు.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold font-serif-telugu text-[#7A284B] dark:text-[#D87591]">
            6. నిబంధనలలో మార్పులు & సంప్రదింపు (Changes & Contact)
          </h2>
          <p>
            మేము ఈ నిబంధనలను ఎప్పటికప్పుడు సమీక్షించి నవీకరించవచ్చు. సందేహాల కొరకు సంప్రదించండి:
          </p>
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] text-xs sm:text-sm text-[#4E4852] dark:text-[#C5BFC8] space-y-1">
            <p><strong>న్యాయ విభాగం / సంప్రదింపు:</strong> legal@kathavahini.org</p>
            <p><strong>ప్లాట్‌ఫారమ్ చిరునామా:</strong> [కథావాహిని సాహిత్య విభాగం - అధికారిక చిరునామా]</p>
          </div>
        </section>
      </div>
    </div>
  );
};
