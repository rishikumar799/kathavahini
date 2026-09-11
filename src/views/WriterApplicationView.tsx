import React, { useState, useEffect } from 'react';
import { 
  Feather, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  HelpCircle,
  ScrollText,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { User, WriterApplication, StoryCategory } from '../types';
import { writerService } from '../services/writerService';
import { authService } from '../services/authService';

interface WriterApplicationViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onBack: () => void;
  onNavigateToDashboard: () => void;
}

const CATEGORY_OPTIONS: StoryCategory[] = [
  'జీవితం',
  'కుటుంబం',
  'ప్రేమ',
  'స్నేహం',
  'ప్రేరణ',
  'హాస్యం',
  'రహస్యం',
  'థ్రిల్లర్',
  'ఫాంటసీ',
  'చారిత్రక',
  'భయం',
  'పిల్లల కథలు',
  'ఆధ్యాత్మికం',
  'సామాజికం',
];

export const WriterApplicationView: React.FC<WriterApplicationViewProps> = ({
  user,
  onOpenAuth,
  onBack,
  onNavigateToDashboard,
}) => {
  const [existingApp, setExistingApp] = useState<WriterApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState(user?.displayName || user?.name || '');
  const [penName, setPenName] = useState(user?.teluguName || user?.displayName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState(user?.teluguBio || user?.bio || '');
  const [writingExperience, setWritingExperience] = useState('బ్లాగులు & సోషల్ మీడియాలో రాశాను');
  const [reasonForApplying, setReasonForApplying] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['జీవితం', 'కుటుంబం']);
  const [sampleWriting, setSampleWriting] = useState('');

  // 6 Mandatory Writer Declarations
  const [decOriginality, setDecOriginality] = useState(false);
  const [decNoCopy, setDecNoCopy] = useState(false);
  const [decGuidelines, setDecGuidelines] = useState(false);
  const [decCooperation, setDecCooperation] = useState(false);
  const [decAiUsage, setDecAiUsage] = useState(false);
  const [decModeration, setDecModeration] = useState(false);

  // Digital Signature
  const [signatureName, setSignatureName] = useState(user?.displayName || user?.name || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const isReaderConversion = !!user;

  useEffect(() => {
    async function loadApp() {
      if (user) {
        setLoadingApp(true);
        const app = await writerService.getUserApplication(user.id);
        setExistingApp(app);
        if (app) {
          setFullName(app.fullName || app.displayName || user.displayName || user.name);
          setPenName(app.penName || app.displayName || user.teluguName || user.name);
          setEmail(app.email || user.email);
          setMobileNumber(app.mobileNumber || app.phone || '');
          setUsername(app.username || '');
          setCity(app.city || '');
          setBio(app.bio || user.bio || '');
          setWritingExperience(app.writingExperience || app.experience || 'బ్లాగులు & సోషల్ మీడియాలో రాశాను');
          setReasonForApplying(app.reasonForApplying || app.reason || '');
          setSelectedCategories(app.genres || app.categories || ['జీవితం', 'కుటుంబం']);
          setSampleWriting(app.sampleWriting || app.sampleText || '');
          setSignatureName(app.agreementAcceptedName || user.displayName || user.name);
        }
        setLoadingApp(false);
      } else {
        setLoadingApp(false);
      }
    }
    loadApp();
  }, [user]);

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const allDeclarationsChecked = 
    decOriginality && 
    decNoCopy && 
    decGuidelines && 
    decCooperation && 
    decAiUsage && 
    decModeration;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.');
      return;
    }
    if (!penName.trim()) {
      setErrorMsg('దయచేసి రచయిత కలం పేరు నమోదు చేయండి.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('దయచేసి సరైన ఈమెయిల్ అడ్రస్ నమోదు చేయండి.');
      return;
    }
    if (!isReaderConversion) {
      if (password.length < 6) {
        setErrorMsg('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('పాస్‌వర్డ్ మరియు నిర్ధారణ పాస్‌వర్డ్ సరిపోలడం లేదు.');
        return;
      }
    }
    if (!bio.trim()) {
      setErrorMsg('దయచేసి రచయిత బయో / పరిచయం రాయండి.');
      return;
    }
    if (!sampleWriting.trim() || sampleWriting.trim().length < 50) {
      setErrorMsg('మీ రచన యొక్క నమూనా (కనీసం 50 అక్షరాలు) రాయండి.');
      return;
    }
    if (!allDeclarationsChecked) {
      setErrorMsg('దయచేసి అన్ని 6 రచయిత నిబంధనల ప్రకటనలను అంగీకరించండి.');
      return;
    }
    if (!signatureName.trim()) {
      setErrorMsg('డిజిటల్ అంగీకారం కోసం దయచేసి మీ పేరును సంతకంగా టైప్ చేయండి.');
      return;
    }

    setSubmitting(true);

    try {
      if (isReaderConversion && user) {
        // CASE B: Authenticated Reader Converting to Writer
        const appRes = await writerService.submitApplication({
          applicantUid: user.id,
          applicantType: 'reader_conversion',
          fullName: fullName.trim(),
          penName: penName.trim(),
          username: username.trim(),
          email: email.trim(),
          mobileNumber: mobileNumber.trim(),
          city: city.trim(),
          bio: bio.trim(),
          writingExperience: writingExperience.trim(),
          reasonForApplying: reasonForApplying.trim() || 'తెలుగు కథా ప్రేమికులతో నా రచనలు పంచుకోవడానికి.',
          genres: selectedCategories,
          sampleWriting: sampleWriting.trim(),
          photoURL: user.avatar,
          agreementAcceptedName: signatureName.trim(),
        });
        setExistingApp(appRes);
        setSuccessSubmitted(true);
      } else {
        // CASE A: New Visitor Registering as Writer
        await authService.registerWriterApplicant({
          fullName: fullName.trim(),
          penName: penName.trim(),
          displayName: penName.trim(),
          username: username.trim(),
          email: email.trim(),
          pass: password,
          mobileNumber: mobileNumber.trim(),
          city: city.trim(),
          bio: bio.trim(),
          writingExperience: writingExperience.trim(),
          genres: selectedCategories,
          reasonForApplying: reasonForApplying.trim() || 'తెలుగు కథా ప్రేమికులతో నా రచనలు పంచుకోవడానికి.',
          sampleText: sampleWriting.trim(),
          agreementAcceptedName: signatureName.trim(),
        });
        setSuccessSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'దరఖాస్తు సమర్పించడంలో సమస్య ఎదురైంది.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SUBMITTED SCREEN (For New Writer Applicant or Reader Conversion)
  if (successSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#3E8065]/10 text-[#3E8065] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              రచయిత ఖాతా అభ్యర్థన అడ్మిన్ ప్యానెల్‌కు పంపబడింది
            </h2>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] max-w-lg mx-auto leading-relaxed space-y-2 text-left sm:text-center">
              <p className="font-semibold text-[#17151A] dark:text-[#F7F3EE]">
                కథావాహిని అడ్మిన్ మీ దరఖాస్తును పరిశీలిస్తున్నారు.
              </p>
              <p>
                అడ్మిన్ పరిశీలించి ఆమోదించిన తర్వాత మాత్రమే మీ రచయిత ఖాతా జోడించబడుతుంది మరియు మీరు లాగిన్ అవ్వగలరు. అప్పటివరకు దయచేసి వేచి ఉండండి.
              </p>
              {isReaderConversion && (
                <p className="text-xs text-[#7A284B] dark:text-[#D87591] font-bold pt-1">
                  ఆమోదం వచ్చే వరకు మీరు సాధారణ పాఠకుడిగా (Reader) కథావాహిని వేదికను ఉపయోగించవచ్చు.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            {!isReaderConversion && (
              <button
                onClick={onOpenAuth}
                className="px-8 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>లాగిన్ పేజీకి వెళ్లండి (Go to Login)</span>
              </button>
            )}
            <button
              onClick={onBack}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                !isReaderConversion
                  ? 'bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#E8E1DA]/50'
                  : 'bg-[#7A284B] hover:bg-[#631F3C] text-white shadow-md'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>హోమ్‌పేజీకి వెళ్లండి</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already an approved active writer
  if (user && ((user.role === 'writer' && user.status === 'active') || user.role === 'admin')) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#3E8065]/10 text-[#3E8065] flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3E8065]/10 text-[#3E8065] text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>ఆమోదించబడిన రచయిత (Approved Writer)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            మీరు ఇప్పుడు అధికారిక రచయిత!
          </h2>
          <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu max-w-md mx-auto">
            మీ రచయిత ఖాతా సక్రియంగా ఉంది. రచయిత స్టూడియో ద్వారా మీ కథలను సమర్పించవచ్చు.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onNavigateToDashboard}
            className="px-8 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Feather className="w-4 h-4" />
            <span>రచయిత డ్యాష్‌బోర్డ్‌కు వెళ్లండి</span>
          </button>
        </div>
      </div>
    );
  }

  // Pending Application Banner for existing Reader or pending writer
  if ((existingApp && existingApp.status === 'pending') || (user && user.role === 'writer' && user.status === 'pending')) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6F6970] hover:text-[#7A284B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>వెనుకకు</span>
        </button>

        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <span>రచయిత దరఖాస్తు పరిశీలనలో ఉంది (Application Pending Review)</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              మీ దరఖాస్తును నిర్వాహకులు పరిశీలిస్తున్నారు
            </h2>
            <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] max-w-lg mx-auto leading-relaxed">
              సాధారణంగా 24 గంటల్లో లేదా అంతకంటే ముందే మీ దరఖాస్తుపై నిర్ణయం తీసుకోవడానికి ప్రయత్నిస్తాము. ఆమోదం వచ్చే వరకు మీరు Readerగా సైట్‌ను యథావిధిగా ఉపయోగించవచ్చు.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-left text-xs space-y-2">
            <p className="text-[#6F6970] font-semibold">సమర్పించిన దరఖాస్తు వివరాలు:</p>
            <p><span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">పూర్తి పేరు:</span> {existingApp.fullName || existingApp.name}</p>
            <p><span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">కలం పేరు:</span> {existingApp.penName || existingApp.displayName}</p>
            <p><span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">విభాగాలు:</span> {(existingApp.genres || existingApp.categories || []).join(', ')}</p>
            <p><span className="font-bold text-[#17151A] dark:text-[#F7F3EE]">డిజిటల్ అంగీకారం:</span> {existingApp.agreementAcceptedName || 'అంగీకరించబడింది'} (వెర్షన్ {existingApp.agreementVersion || '1.0'})</p>
          </div>

          <button
            onClick={onBack}
            className="px-8 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
          >
            హోమ్‌పేజీకి వెళ్లండి
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#6F6970] hover:text-[#7A284B] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>వెనుకకు</span>
      </button>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#7A284B] to-[#551B33] text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-sm">
          <Feather className="w-3.5 h-3.5" />
          <span>రచయిత దరఖాస్తు & ఒప్పంద పత్రం (Writer Onboarding)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-telugu">
          {isReaderConversion ? 'రచయితగా మారండి (Convert to Writer)' : 'కథావాహిని రచయితగా నమోదు (Register as Writer)'}
        </h1>
        <div className="text-xs sm:text-sm text-white/90 font-serif-telugu max-w-xl leading-relaxed space-y-1.5">
          <p>
            రచయితగా నమోదు చేసుకోవడం ద్వారా మీరు రచయితగా దరఖాస్తు చేస్తున్నారు. మీ దరఖాస్తును నిర్వాహకులు పరిశీలించి ఆమోదించిన తర్వాత మాత్రమే మీ రచయిత ఖాతా సక్రియమవుతుంది.
          </p>
          <p className="text-white/75 text-xs">
            సాధారణంగా మీ దరఖాస్తును 24 గంటల్లో లేదా అంతకంటే ముందే పరిశీలించడానికి ప్రయత్నిస్తాము.
          </p>
        </div>
      </div>

      {/* Previous Rejection Notice if applicable */}
      {existingApp && existingApp.status === 'rejected' && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-4 h-4" />
            <span>రచయిత దరఖాస్తు తిరస్కరించబడింది (Application Rejected)</span>
          </div>
          <p className="text-xs font-serif-telugu">
            కారణం: {existingApp.rejectionReason || 'రచనా నాణ్యత లేదా నిబంధనల ప్రకారం తిరస్కరించబడింది.'}
          </p>
          <p className="text-[11px] opacity-80 font-serif-telugu">
            మీరు సరైన మార్పులతో తిరిగి కొత్త దరఖాస్తును సమర్పించవచ్చు.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE CANONICAL WRITER APPLICATION FORM */}
      {/* ========================================================================= */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm space-y-8">
        
        {/* Section 1: Writer Profile Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#7A284B]" />
            <span>1. రచయిత వివరాలు (Writer Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                పూర్తి పేరు (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="ఉదా: కొమ్మూరి సత్యనారాయణ"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                రచయిత కలం పేరు (Pen Name / Author Name) *
              </label>
              <input
                type="text"
                required
                value={penName}
                onChange={e => setPenName(e.target.value)}
                placeholder="ఉదా: సత్యం"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                ఈమెయిల్ అడ్రస్ (Email Address) *
              </label>
              <input
                type="email"
                required
                disabled={isReaderConversion}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B] ${
                  isReaderConversion ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                మొబైల్ నంబర్ (Mobile Number - ఐచ్ఛికం)
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                యూజర్‌నేమ్ (Username - ఐచ్ఛికం)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="satyam_writer"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                నగరం / ప్రాంతం (City / Location)
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="హైదరాబాద్ / విజయవాడ"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
              />
            </div>
          </div>

          {/* Password fields only for new registration visitor */}
          {!isReaderConversion && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                  పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 pr-11 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-[#F7F3EE] transition-colors cursor-pointer"
                    title={showPassword ? 'పాస్‌వర్డ్‌ను దాచండి (Hide password)' : 'పాస్‌వర్డ్‌ను చూపించండి (Show password)'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                  పాస్‌వర్డ్ నిర్ధారణ (Confirm Password) *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 pr-11 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-[#F7F3EE] transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'పాస్‌వర్డ్‌ను దాచండి (Hide password)' : 'పాస్‌వర్డ్‌ను చూపించండి (Show password)'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
              రచయిత పరిచయం / బయో (Bio) *
            </label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="మీ గురించి, మీ అభిరుచులు మరియు రచనల పట్ల ఆసక్తిని సంక్షిప్తంగా వివరించండి..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
              గత రచనా అనుభవం (Writing Experience)
            </label>
            <input
              type="text"
              value={writingExperience}
              onChange={e => setWritingExperience(e.target.value)}
              placeholder="ఉదా: గత 3 సంవత్సరాలుగా కథలు రాస్తున్నాను / బ్లాగులు రాశాను"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
              కథావాహిని వేదికపై ఎందుకు రాయాలనుకుంటున్నారు? (Why do you want to write on Kathavahini?)
            </label>
            <input
              type="text"
              value={reasonForApplying}
              onChange={e => setReasonForApplying(e.target.value)}
              placeholder="తెలుగు పాఠకులతో నా రచనలు పంచుకోవడానికి మరియు గుర్తింపు పొందడానికి"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>
        </div>

        {/* Section 2: Writing Preferences & Sample */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] pt-2 pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center gap-2">
            <Feather className="w-5 h-5 text-[#7A284B]" />
            <span>2. రచనా ప్రాధాన్యతలు & నమూనా (Genres & Sample)</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-2 font-serif-telugu">
              మీరు రాయాలనుకుంటున్న విభాగాలు (Genres / Categories) *
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => {
                const isSel = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#7A284B] text-white shadow-sm'
                        : 'bg-[#FAF7F2] dark:bg-[#222229] text-[#6F6970] hover:bg-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
              రచన యొక్క నమూనా / కథా భాగం (Sample Writing / Excerpt - కనీసం 50 అక్షరాలు) *
            </label>
            <textarea
              required
              rows={5}
              value={sampleWriting}
              onChange={e => setSampleWriting(e.target.value)}
              placeholder="మీరు రాసిన కథ లేదా వ్యాసం నుండి ఒక నమూనా పేరాగ్రాఫ్‌ను ఇక్కడ రాయండి. ఇది సూపర్ అడ్మిన్ సమీక్ష మరియు నాణ్యతా పరిశీలన కోసం ఉపయోగపడుతుంది..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
          </div>
        </div>

        {/* Section 3: COMPLETE 12-SECTION WRITER AGREEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2 pb-2 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
            <h2 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-[#7A284B]" />
              <span>WRITER AGREEMENT — రచయిత ఒప్పంద పత్రం (వెర్షన్ 1.0)</span>
            </h2>
            <span className="text-[11px] font-bold text-[#7A284B] bg-[#7A284B]/10 px-2.5 py-1 rounded-full">
              పూర్తి నిబంధనలు
            </span>
          </div>

          {/* Scrollable Agreement View */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] max-h-72 overflow-y-auto text-xs font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] space-y-4 leading-relaxed divide-y divide-[#E8E1DA] dark:divide-[#2E2D36]">
            
            <div className="space-y-1.5 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">1. రచయిత వివరాలు (Writer Details)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                కథావాహిని వేదికపై రచయితగా నమోదు చేసుకునే ప్రతి ఒక్కరూ తమ నిజమైన లేదా ధృవీకరించదగిన కలం పేరు (Pen Name), ఈమెయిల్ మరియు వివరాలను అందించాలి. తప్పుడు సమాచారంతో సృష్టించబడిన దరఖాస్తులు తిరస్కరించబడతాయి.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">2. రచనల స్వంతత్వం మరియు Originality (Content Originality)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                రచయిత సమర్పించే ప్రతీ కథ, నవల, వ్యాసం లేదా రచన స్వంత రచన అయి ఉండాలి. ఇతరుల రచనలను అనుమతి లేకుండా కాపీ చేయడం, అనువదించడం లేదా పునరుత్పత్తి చేయడం ఖచ్చితంగా నిషేధించబడింది.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">3. Copyright మరియు Content Rights (Copyright & License)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                రచయిత తన రచనలపై పూర్తి కాపీరైట్ యాజమాన్యాన్ని కలిగి ఉంటారు. అయితే కథావాహిని వేదికపై ప్రచురించడానికి, ప్రదర్శించడానికి మరియు తెలుగు పాఠకులకు అందుబాటులో ఉంచడానికి కథావాహిని ప్లాట్‌ఫారమ్‌కు నాన్-ఎక్స్‌క్లూజివ్ పబ్లిషింగ్ లైసెన్స్‌ను మంజూరు చేస్తున్నారు.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">4. Content Guidelines (కథా నియమావళి & గౌరవ ప్రవర్తన)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                ద్వేషపూరితమైన, అసభ్యకరమైన, హింసను ప్రేరేపించే లేదా ఏ మత, కుల, లింగ వర్గాలను కించపరిచే కంటెంట్‌ను ప్రచురించకూడదు. కథావాహిని కమ్యూనిటీ గౌరవ నిబంధనలను పాటించాలి.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">5. AI-Assisted Content (AI టూల్స్ పరిమిత వినియోగం)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                కృత్రిమ మేధస్సు (AI) టూల్స్‌ను ఆలోచనలు లేదా సహాయం కోసం మాత్రమే ఉపయోగించవచ్చు. AI ద్వారా పూర్తిగా లేదా గణనీయమైన భాగం రూపొందించిన కథలను స్వంత రచనలుగా సమర్పించడం నిషిద్ధం.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">6. Content Review మరియు Publication (సూపర్ అడ్మిన్ సమీక్ష & ఆమోదం)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                రచయిత సమర్పించే ప్రతీ రచన కథావాహిని సూపర్ అడ్మిన్ ద్వారా సమీక్షించబడుతుంది. నిబంధనల ప్రకారం ఆమోదించబడిన రచనలు మాత్రమే పబ్లిష్ చేయబడతాయి.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">7. Writer Account & 1 Story Per Day Rule (రోజుకు ఒక కథ నిబంధన)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                నాణ్యతను కాపాడేందుకు రచయిత ఒక క్యాలెండర్ రోజులో గరిష్టంగా ఒక కథను మాత్రమే సమర్పించగలరు. సూపర్ అడ్మిన్ ఆమోదం పొందిన తర్వాత మాత్రమే ఖాతా సక్రియమవుతుంది.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">8. Copyright Complaints మరియు Disputes (కాపీరైట్ వివాదాలు)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                రచనలపై ఏదైనా థర్డ్-పార్టీ కాపీరైట్ క్లెయిమ్ వచ్చినప్పుడు రచయిత పూర్తి బాధ్యత వహించాలి మరియు ప్లాట్‌ఫారమ్‌కు అవసరమైన ఆధారాలతో సహకరించాలి.
              </p>
            </div>

            <div className="space-y-1.5 pt-3 pb-2">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">9. Agreement Acceptance (ఒప్పంద అంగీకారం)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                ఈ నిబంధనలను మరియు కథావాహిని కంటెంట్ పాలసీని పూర్తిగా చదివి అంగీకరిస్తున్నాను.
              </p>
            </div>

            <div className="space-y-1.5 pt-3">
              <h3 className="font-bold text-sm text-[#7A284B] dark:text-[#D87591]">10. సంతకం / Digital Acceptance (డిజిటల్ ఆమోదం)</h3>
              <p className="text-[#6F6970] dark:text-[#AAA4AC]">
                దిగువన మీ పేరును టైప్ చేయడం ద్వారా ఇది చట్టబద్ధమైన డిజిటల్ సంతకంగా పరిగణించబడుతుంది మరియు ప్లాట్‌ఫారమ్‌లో భద్రపరచబడుతుంది.
              </p>
            </div>

          </div>
        </div>

        {/* Section 4: 6 MANDATORY WRITER DECLARATIONS */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            రచయిత నిర్ధారణ ప్రకటనలు (Mandatory Writer Declarations - 6/6 తప్పనిసరి) *
          </h2>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-3 text-xs font-serif-telugu">
            
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decOriginality}
                onChange={e => setDecOriginality(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                నేను సమర్పించే రచనలు నా స్వంత రచనలు లేదా వాటిని publish చేయడానికి నాకు అవసరమైన హక్కులు/అనుమతులు ఉన్నాయి.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decNoCopy}
                onChange={e => setDecNoCopy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                నేను ఇతరుల copyrighted contentను అనుమతి లేకుండా copy చేయను.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decGuidelines}
                onChange={e => setDecGuidelines(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                నేను Website Writer Guidelines మరియు Content Policyని పాటిస్తాను.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decCooperation}
                onChange={e => setDecCooperation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                నా contentకు సంబంధించి third-party claim వస్తే Websiteతో సహకరిస్తాను.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decAiUsage}
                onChange={e => setDecAiUsage(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                AI toolsను ideas/brainstorming వంటి పరిమిత సహాయానికి మాత్రమే ఉపయోగిస్తాను; AI ద్వారా పూర్తిగా లేదా గణనీయమైన భాగం రూపొందించిన కథను నా స్వంత రచనగా submit చేయను.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={decModeration}
                onChange={e => setDecModeration(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7A284B] focus:ring-[#7A284B]"
              />
              <span className="text-[#17151A] dark:text-[#F7F3EE] leading-relaxed">
                Website content review, rejection, removal మరియు account moderation policiesని అంగీకరిస్తున్నాను.
              </span>
            </label>

          </div>
        </div>

        {/* Section 5: DIGITAL SIGNATURE / ACCEPTANCE */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#7A284B]/5 dark:bg-[#D87591]/10 border border-[#7A284B]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-serif-telugu text-[#7A284B] dark:text-[#D87591] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>సంతకం / Digital Acceptance</span>
            </h3>
            <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-mono">
              తేదీ: {new Date().toLocaleDateString('te-IN')}
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
              డిజిటల్ సంతకం కోసం మీ పూర్తి పేరును ఇక్కడ టైప్ చేయండి (Type your Full Name) *
            </label>
            <input
              type="text"
              required
              value={signatureName}
              onChange={e => setSignatureName(e.target.value)}
              placeholder="మీ పూర్తి పేరు"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
            />
            <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
              ఈ పేరు, తేదీ మరియు ఒప్పంద వెర్షన్ (1.0) మీ అకౌంట్‌తో పాటు శాశ్వతంగా రికార్డ్ చేయబడుతుంది.
            </p>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || !allDeclarationsChecked || !signatureName.trim()}
          className="w-full py-4 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span>దరఖాస్తు సమర్పిస్తోంది...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>రచయిత దరఖాస్తును సమర్పించండి (Submit Writer Application)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
