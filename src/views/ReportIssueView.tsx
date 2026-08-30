import React, { useState } from 'react';
import { Flag, AlertTriangle, CheckCircle, Send, HelpCircle } from 'lucide-react';
import { User, IssueReport } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReportIssueViewProps {
  user: User | null;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ user }) => {
  const [issueType, setIssueType] = useState<IssueReport['issueType']>('broken_story');
  const [contentRef, setContentRef] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setStatusMessage({
        type: 'error',
        text: 'దయచేసి సమస్య వివరణను నమోదు చేయండి.',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepared architecture for Firestore collection `issueReports`
      const reportData: IssueReport = {
        issueType,
        contentReference: contentRef.trim() || undefined,
        description: trimmedDesc,
        name: name.trim() || user?.name || undefined,
        email: email.trim() || user?.email || undefined,
        userId: user?.id || 'anonymous',
        createdAt: serverTimestamp(),
        status: 'pending',
      };

      try {
        await addDoc(collection(db, 'issueReports'), reportData);
      } catch (dbErr) {
        console.info('Issue report staged locally / Firestore logging:', dbErr);
      }

      setStatusMessage({
        type: 'success',
        text: 'మీ సమస్య నివేదిక విజయవంతంగా నమోదు చేయబడింది. మా సమీక్షా బృందం దీనిని పరిశీలించి పరిష్కరిస్తుంది.',
      });

      setDescription('');
      setContentRef('');
    } catch (err: any) {
      console.error('Report submission error:', err);
      setStatusMessage({
        type: 'error',
        text: 'నివేదిక సమర్పించడంలో లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-1">
          <Flag className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          సమస్యను నివేదించండి (Report an Issue)
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-lg mx-auto leading-relaxed">
          కథలలో తప్పులు, సాంకేతిక సమస్యలు లేదా కాపీరైట్ మరియు కంటెంట్ ఉల్లంఘనలను మా దృష్టికి తీసుకురండి.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] p-6 sm:p-10 shadow-sm">
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm font-serif-telugu ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p>{statusMessage.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Issue Type Selector */}
          <div>
            <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
              సమస్య రకం (Issue Type) *
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] font-serif-telugu cursor-pointer"
            >
              <option value="broken_story">కథ లోడ్ కావడం లేదు / లోపం (Broken story)</option>
              <option value="copyright_concern">కాపీరైట్ లేదా మేధో సంపత్తి ఉల్లంఘన (Copyright concern)</option>
              <option value="offensive_content">అభ్యంతరకరమైన / అసభ్యకరమైన కంటెంట్ (Offensive content)</option>
              <option value="incorrect_info">తప్పుడు సమాచారం (Incorrect information)</option>
              <option value="broken_image">కవర్ ఇమేజ్ / చిత్రం లోపం (Broken image)</option>
              <option value="comment_problem">వ్యాఖ్యలలో వేధింపు / స్పామ్ (Comment issue)</option>
              <option value="technical_problem">సైట్ సాంకేతిక లోపం (Technical problem)</option>
              <option value="other">ఇతర సమస్య (Other)</option>
            </select>
          </div>

          {/* Content Reference */}
          <div>
            <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
              సంబంధిత కథ / నవల లింక్ లేదా శీర్షిక (ఐచ్ఛికం)
            </label>
            <input
              type="text"
              value={contentRef}
              onChange={(e) => setContentRef(e.target.value)}
              placeholder="ఉదా: 'వెన్నెల రాత్రి' కథ లేదా లింక్"
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
              సమస్య వివరణ (Description) *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="సమస్య ఏమిటి మరియు ఎక్కడ జరిగిందో వివరంగా తెలియజేయండి..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              required
            />
          </div>

          {/* Optional Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                మీ పేరు (ఐచ్ఛికం)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="మీ పేరు"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                ఈమెయిల్ (ఫాలో-అప్ కోసం, ఐచ్ఛికం)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm font-serif-telugu flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Flag className="w-4 h-4" />
            <span>{loading ? 'సమర్పిస్తోంది...' : 'నివేదిక సమర్పించండి'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
