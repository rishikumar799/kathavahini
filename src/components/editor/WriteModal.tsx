import React, { useState, useEffect } from 'react';
import { X, Feather, BookOpen, Laugh, Image as ImageIcon, Send, Clock, AlertCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { StoryCategory, User } from '../../types';
import { writerService } from '../../services/writerService';
import { jokeService } from '../../services/jokeService';
import { novelService } from '../../services/novelService';

interface WriteModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onPublishSuccess: () => void;
  onApplyWriter: () => void;
  onRequireAuth: (prompt?: string) => void;
}

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onPublishSuccess,
  onApplyWriter,
  onRequireAuth,
}) => {
  const [contentType, setContentType] = useState<'story' | 'novel' | 'joke'>('story');
  
  // Story state
  const [title, setTitle] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('జీవితం');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('తెలుగు,కథ');
  
  // Joke state
  const [jokeText, setJokeText] = useState('');
  const [jokeCategory, setJokeCategory] = useState('హాస్యం');

  // Daily limit check
  const [canSubmitToday, setCanSubmitToday] = useState(true);
  const [limitReason, setLimitReason] = useState('');
  const [checkingLimit, setCheckingLimit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isWriterOrAdmin = currentUser && (
    currentUser.role === 'writer' || 
    currentUser.role === 'superadmin' || 
    currentUser.role === 'author'
  );

  useEffect(() => {
    async function checkDaily() {
      if (isOpen && currentUser && isWriterOrAdmin) {
        setCheckingLimit(true);
        const check = await writerService.checkCanSubmitToday(currentUser.id);
        setCanSubmitToday(check.canSubmit || currentUser.role === 'superadmin');
        if (!check.canSubmit && currentUser.role !== 'superadmin') {
          setLimitReason(check.reason || 'రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు.');
        }
        setCheckingLimit(false);
      }
    }
    checkDaily();
  }, [isOpen, currentUser, isWriterOrAdmin]);

  if (!isOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('కథలను సమర్పించడానికి దయచేసి ప్రవేశించండి.');
      return;
    }

    if (!isWriterOrAdmin) {
      setErrorMsg('కథలను సమర్పించడానికి ముందుగా రచయితగా ఆమోదం పొందాలి.');
      return;
    }

    if (!canSubmitToday && currentUser.role !== 'superadmin') {
      setErrorMsg(limitReason || 'ఈరోజుకు కథల సమర్పణ పరిమితి పూర్తయింది (1 Story/Day limit).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (contentType === 'story') {
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        await writerService.submitStory({
          title: title || teluguTitle || 'Untitled Story',
          teluguTitle: teluguTitle || title || 'నా కొత్త కథ',
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: paragraphs[0]?.slice(0, 100) || 'కథ వివరణ',
          teluguExcerpt: paragraphs[0]?.slice(0, 100) || 'కథ వివరణ',
          content: paragraphs.length > 0 ? paragraphs : [content],
          tags: tags.split(',').map(t => t.trim()),
        }, currentUser);

        setSuccessMsg('మీ కథ సూపర్ అడ్మిన్ సమీక్ష కోసం సమర్పించబడింది! ఆమోదం తర్వాత ఇది ప్రచురించబడుతుంది.');
      } else if (contentType === 'novel') {
        await novelService.createNovel({
          title: title || 'My Novel',
          teluguTitle: teluguTitle || title || 'నా కొత్త నవల',
          category,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          description: content.slice(0, 150),
          teluguDescription: content.slice(0, 150),
        });
        setSuccessMsg('మీ నవల సమీక్ష కోసం సమర్పించబడింది!');
      } else if (contentType === 'joke') {
        await jokeService.publishJoke(jokeText, jokeCategory);
        setSuccessMsg('జోక్ విజయవంతంగా జోడించబడింది!');
      }

      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('');
        onPublishSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'కథను సమర్పించడంలో సమస్య ఎదురైంది.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#222229]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7A284B] dark:bg-[#D87591] text-white">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                రచనా సమర్పణ (Story Submission)
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                మీ ఆలోచనలను రచించి అడ్మిన్ ఆమోదం కోసం సమర్పించండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6F6970] dark:text-[#AAA4AC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth / Role Verification Gate */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <ShieldAlert className="w-12 h-12 text-[#7A284B] mx-auto" />
            <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              కథను సమర్పించడానికి ముందుగా ప్రవేశించండి
            </h3>
            <p className="text-xs text-[#6F6970] max-w-md mx-auto">
              కథలు రాయడానికి మరియు ప్రచురణ కోసం సమర్పించడానికి మీ కథావాహిని ఖాతాలోకి లాగిన్ చేయండి.
            </p>
            <button
              onClick={() => {
                onClose();
                onRequireAuth('కథలను సమర్పించడానికి లాగిన్ చేయండి.');
              }}
              className="px-6 py-2.5 rounded-full bg-[#7A284B] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              లాగిన్ చేయండి
            </button>
          </div>
        ) : !isWriterOrAdmin ? (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                రచయిత గుర్తింపు అవసరం
              </h3>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] max-w-md mx-auto font-serif-telugu leading-relaxed">
                మీరు ప్రస్తుతం <strong>పాఠకుడు (Reader)</strong> గా ఉన్నారు. కథావాహిని వేదికపై కథలను సమర్పించడానికి దయచేసి రచయితగా దరఖాస్తు చేసుకోండి. సూపర్ అడ్మిన్ ఆమోదం పొందిన తర్వాత మీరు రచనలను సమర్పించవచ్చు.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full border border-[#E8E1DA] text-xs font-bold text-[#6F6970] cursor-pointer"
              >
                తర్వాత
              </button>
              <button
                onClick={() => {
                  onClose();
                  onApplyWriter();
                }}
                className="px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>రచయితగా దరఖాస్తు చేసుకోండి →</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Daily limit badge */}
            <div className="px-6 py-2.5 bg-[#FAF7F2] dark:bg-[#222229] border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#7A284B] dark:text-[#D87591] font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>రోజువారీ సమర్పణ పరిమితి: గరిష్టంగా 1 కథ / రోజుకు (1 Story/Day Rule)</span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                canSubmitToday ? 'bg-[#3E8065]/10 text-[#3E8065]' : 'bg-red-500/10 text-red-500'
              }`}>
                {canSubmitToday ? 'ఈరోజు సమర్పించవచ్చు (1/1 Available)' : 'ఈరోజు పూర్తయింది (Limit Reached)'}
              </span>
            </div>

            {/* Content Type Selector */}
            <div className="flex p-2 gap-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] bg-white dark:bg-[#18181D]">
              <button
                onClick={() => setContentType('story')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                  contentType === 'story'
                    ? 'bg-[#7A284B] text-white shadow-md'
                    : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
                }`}
              >
                <Feather className="w-4 h-4" />
                <span>కథ రాయండి (Story)</span>
              </button>

              <button
                onClick={() => setContentType('novel')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                  contentType === 'novel'
                    ? 'bg-[#7A284B] text-white shadow-md'
                    : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>నవల సృష్టించండి</span>
              </button>

              <button
                onClick={() => setContentType('joke')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                  contentType === 'joke'
                    ? 'bg-[#7A284B] text-white shadow-md'
                    : 'text-[#6F6970] hover:bg-[#FAF7F2] dark:hover:bg-[#222229]'
                }`}
              >
                <Laugh className="w-4 h-4" />
                <span>జోక్ / చిన్న రచన</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-[#3E8065]/10 text-[#3E8065] border border-[#3E8065]/30 text-center font-bold text-xs">
                  {successMsg}
                </div>
              )}

              {contentType !== 'joke' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                        తెలుగు శీర్షిక (Story Title) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: నిన్నటి వాన"
                        value={teluguTitle}
                        onChange={(e) => setTeluguTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                        విభాగం (Category) *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as StoryCategory)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      >
                        <option value="జీవితం">జీవితం</option>
                        <option value="కుటుంబం">కుటుంబం</option>
                        <option value="ప్రేమ">ప్రేమ</option>
                        <option value="స్నేహం">స్నేహం</option>
                        <option value="ప్రేరణ">ప్రేరణ</option>
                        <option value="హాస్యం">హాస్యం</option>
                        <option value="రహస్యం">రహస్యం</option>
                        <option value="థ్రిల్లర్">థ్రిల్లర్</option>
                        <option value="ఫాంటసీ">ఫాంటసీ</option>
                        <option value="చారిత్రక">చారిత్రక</option>
                        <option value="భయం">భయం</option>
                        <option value="పిల్లల కథలు">పిల్లల కథలు</option>
                        <option value="ఆధ్యాత్మికం">ఆధ్యాత్మికం</option>
                        <option value="సామాజికం">సామాజికం</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      కవర్ చిత్రం URL (Cover Image URL - ఐచ్ఛికం)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                      <ImageIcon className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      కథ కంటెంట్ (తెలుగులో) *
                    </label>
                    <textarea
                      required
                      rows={8}
                      placeholder="ఇక్కడ మీ కథను తెలుగులో వివరంగా రాయండి. పేరాగ్రాఫ్‌ల మధ్య ఖాళీ ఇవ్వడం మర్చిపోకండి..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-base font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      ట్యాగ్‌లు (Tags - కామాతో వేరు చేయండి)
                    </label>
                    <input
                      type="text"
                      placeholder="ఉదా: ప్రేమ, జ్ఞాపకాలు, వర్షం"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      విభాగం (Category)
                    </label>
                    <select
                      value={jokeCategory}
                      onChange={(e) => setJokeCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    >
                      <option value="హాస్యం">హాస్యం</option>
                      <option value="ఆఫీస్">ఆఫీస్</option>
                      <option value="కుటుంబం">కుటుంబం</option>
                      <option value="స్నేహం">స్నేహం</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      జోక్ / సరదా కబురు
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="ఇక్కడ మీ సరదా జోక్ లేదా చిన్న కబురు రాయండి..."
                      value={jokeText}
                      onChange={(e) => setJokeText(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-base font-sans-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B] leading-relaxed"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E1DA] dark:border-[#2E2D36]">
                <span className="text-[11px] text-[#6F6970] font-serif-telugu">
                  * కథ సమర్పించిన తర్వాత సూపర్ అడ్మిన్ సమీక్షకు వెళుతుంది.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#6F6970] dark:text-[#AAA4AC] hover:bg-[#FAF7F2] dark:hover:bg-[#222229] transition-colors cursor-pointer"
                  >
                    రద్దు చేయి
                  </button>

                  <button
                    type="submit"
                    disabled={loading || (!canSubmitToday && currentUser.role !== 'superadmin')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'సమర్పిస్తోంది...' : 'సమీక్ష కోసం సమర్పించండి (Submit)'}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
