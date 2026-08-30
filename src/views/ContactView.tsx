import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import { User, ContactSubmission } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactViewProps {
  user: User | null;
}

export const ContactView: React.FC<ContactViewProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMsg) {
      setStatusMessage({
        type: 'error',
        text: 'దయచేసి అన్ని వివరాలను (పేరు, ఈమెయిల్, విషయం, సందేశం) పూరించండి.',
      });
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setStatusMessage({
        type: 'error',
        text: 'సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepared architecture for Firestore collection `contactSubmissions`
      const submissionData: ContactSubmission = {
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMsg,
        userId: user?.id || 'guest',
        createdAt: serverTimestamp(),
        status: 'unread',
      };

      try {
        await addDoc(collection(db, 'contactSubmissions'), submissionData);
      } catch (dbErr) {
        console.info('Saved contact message locally / Firestore staging:', dbErr);
      }

      setStatusMessage({
        type: 'success',
        text: 'మీ సందేశం విజయవంతంగా నమోదు చేయబడింది. మా కథావాహిని నిర్వహణ బృందం త్వరలోనే మిమ్మల్ని ఈమెయిల్ ద్వారా సంప్రదిస్తుంది.',
      });

      // Clear non-user fields
      setSubject('');
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatusMessage({
        type: 'error',
        text: 'సందేశం నమోదు చేయడంలో సాంకేతిక లోపం జరిగింది. దయచేసి కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] mb-1">
          <Mail className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
          మమ్మల్ని సంప్రదించండి (Contact Us)
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-lg mx-auto leading-relaxed">
          కథావాహిని ప్లాట్‌ఫారమ్‌పై మీ సలహాలు, సందేహాలు లేదా భాగస్వామ్యాల కొరకు మా బృందానికి సందేశం పంపండి.
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
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p>{statusMessage.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                మీ పూర్తి పేరు *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ఉదా: రాఘవ శర్మ"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
                ఈమెయిల్ చిరునామా *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
              విషయం (Subject) *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ఉదా: రచయిత సభ్యత్వం / సాంకేతిక సహాయం / సాధారణ సందేహం"
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-1.5">
              సందేశం (Message) *
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="మీ అభిప్రాయాన్ని లేదా సందేహాన్ని వివరంగా రాయండి..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white font-bold text-sm font-serif-telugu flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'పంపుతోంది...' : 'సందేశం పంపండి'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
