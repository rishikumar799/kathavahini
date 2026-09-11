import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  BookOpen, 
  Feather, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { authService } from '../../services/authService';
import { StoryCategory } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateToWriterApp?: () => void;
  customPrompt?: string;
  initialMode?: 'login' | 'register' | 'forgot-password';
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
  'పిల్లల కథలు',
  'సామాజికం',
];

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  onNavigateToWriterApp,
  customPrompt,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [signupTab, setSignupTab] = useState<'reader' | 'writer'>('reader');

  // Common Login & Reader fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Writer Specific Registration Fields
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [writingExperience, setWritingExperience] = useState('బ్లాగులు & సోషల్ మీడియా');
  const [categories, setCategories] = useState<string[]>(['జీవితం', 'కుటుంబం']);
  const [reasonForApplying, setReasonForApplying] = useState('');
  const [sampleText, setSampleText] = useState('');
  
  // 6 Declarations
  const [decOriginality, setDecOriginality] = useState(false);
  const [decNoCopy, setDecNoCopy] = useState(false);
  const [decGuidelines, setDecGuidelines] = useState(false);
  const [decCooperation, setDecCooperation] = useState(false);
  const [decAiUsage, setDecAiUsage] = useState(false);
  const [decModeration, setDecModeration] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [writerSuccessNotice, setWriterSuccessNotice] = useState(false);
  const [pendingWriterNotice, setPendingWriterNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSignupTab('reader');
      setError('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setResetSent(false);
      setResetEmail(email || '');
      setWriterSuccessNotice(false);
      setDecOriginality(false);
      setDecNoCopy(false);
      setDecGuidelines(false);
      setDecCooperation(false);
      setDecAiUsage(false);
      setDecModeration(false);
      setSignatureName('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleCategoryToggle = (cat: string) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const allDeclarationsChecked = 
    decOriginality && 
    decNoCopy && 
    decGuidelines && 
    decCooperation && 
    decAiUsage && 
    decModeration;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('దయచేసి మీ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
      return;
    }
    if (!password) {
      setError('దయచేసి పాస్‌వర్డ్‌ను నమోదు చేయండి.');
      return;
    }

    setLoading(true);
    try {
      await authService.loginWithEmail(trimmedEmail, password);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(authService.getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setError('దయచేసి మీ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
      return;
    }

    setLoading(true);
    try {
      await authService.sendPasswordReset(targetEmail);
      setLoading(false);
      setResetSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setLoading(false);
      if (err?.code === 'auth/invalid-email') {
        setError('సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
      } else if (err?.code === 'auth/network-request-failed') {
        setError('నెట్‌వర్క్ సమస్య ఏర్పడింది. మీ ఇంటర్నెట్ కనెక్షన్‌ను సరిచూసుకోండి.');
      } else if (err?.code === 'auth/user-not-found') {
        setError('ఈ ఈమెయిల్‌తో Firebase Authentication లో ఇంకా ఖాతా సృష్టించబడలేదు. దయచేసి "నమోదు (Register)" ట్యాబ్ ద్వారా కొత్త పాస్‌వర్డ్‌తో ఖాతాను సృష్టించండి.');
      } else {
        setError(authService.getErrorMessage(err));
      }
    }
  };

  const handleReaderRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setError('దయచేసి మీ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
      return;
    }
    if (password.length < 6) {
      setError('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
      return;
    }
    if (password !== confirmPassword) {
      setError('పాస్‌వర్డ్ మరియు నిర్ధారణ పాస్‌వర్డ్ సరిపోలడం లేదు. సరిచూసుకోండి.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(trimmedName || 'తెలుగు పాఠకుడు', trimmedEmail, password);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Reader registration error:', err);
      setError(authService.getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleWriterRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPenName = penName.trim() || trimmedName;

    if (!trimmedName) {
      setError('దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.');
      return;
    }
    if (!trimmedEmail) {
      setError('దయచేసి మీ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
      return;
    }
    if (password.length < 6) {
      setError('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
      return;
    }
    if (password !== confirmPassword) {
      setError('పాస్‌వర్డ్ మరియు నిర్ధారణ పాస్‌వర్డ్ సరిపోలడం లేదు.');
      return;
    }
    if (!bio.trim()) {
      setError('దయచేసి రచయిత పరిచయం / బయో నమోదు చేయండి.');
      return;
    }
    if (!sampleText.trim() || sampleText.trim().length < 50) {
      setError('మీ నమూనా రచన (కనీసం 50 అక్షరాలు) రాయండి.');
      return;
    }
    if (!allDeclarationsChecked) {
      setError('దయచేసి అన్ని 6 రచయిత నిబంధనల ప్రకటనలను అంగీకరించండి.');
      return;
    }
    if (!signatureName.trim()) {
      setError('డిజిటల్ అంగీకారం కోసం దయచేసి మీ పేరును టైప్ చేయండి.');
      return;
    }

    setLoading(true);
    try {
      await authService.registerWriterApplicant({
        fullName: trimmedName,
        penName: trimmedPenName,
        displayName: trimmedPenName,
        email: trimmedEmail,
        pass: password,
        bio: bio.trim(),
        writingExperience: writingExperience.trim(),
        categories: categories,
        reasonForApplying: reasonForApplying.trim() || 'తెలుగు కథా ప్రేమికులతో నా రచనలు పంచుకోవడానికి.',
        sampleText: sampleText.trim(),
        agreementAcceptedName: signatureName.trim(),
      });

      setLoading(false);
      // DO NOT add writer account or direct login.
      // DO NOT redirect to dashboard.
      // Show login page only and let them wait until admin approves.
      setEmail(trimmedEmail);
      setPassword('');
      setConfirmPassword('');
      setError('');
      setPendingWriterNotice('మీ రచయిత ఖాతా అభ్యర్థన విజయవంతంగా అడ్మిన్ ప్యానెల్‌కు పంపబడింది. కథావాహిని అడ్మిన్ పరిశీలించి ఆమోదించిన తర్వాత మాత్రమే మీరు లాగిన్ అవ్వగలరు. అప్పటివరకు దయచేసి వేచి ఉండండి.');
      setMode('login');
    } catch (err: any) {
      console.error('Writer registration error:', err);
      setError(authService.getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FAF7F2] dark:hover:bg-[#222229] text-[#6F6970] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="font-serif-telugu font-bold text-2xl">క</span>
          </div>
          
          <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
            {mode === 'login' 
              ? 'కథావాహినికి స్వాగతం (Login)' 
              : mode === 'forgot-password'
              ? 'పాస్వర్డ్ రీసెట్ (Reset Password)'
              : 'ఖాతాను సృష్టించండి (Register)'}
          </h2>

          {customPrompt && mode !== 'forgot-password' ? (
            <p className="text-xs font-semibold text-[#7A284B] dark:text-[#D87591] mt-2 bg-[#7A284B]/10 dark:bg-[#D87591]/10 py-1 px-3 rounded-full inline-block">
              {customPrompt}
            </p>
          ) : (
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-1 font-serif-telugu">
              {mode === 'login' 
                ? 'మీ ఈమెయిల్ మరియు పాస్‌వర్డ్‌తో ప్రవేశించండి' 
                : mode === 'forgot-password'
                ? 'మీ ఖాతా ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి. పాస్వర్డ్ రీసెట్ లింక్ పంపబడుతుంది.'
                : 'తెలుగు కథలు, నవలలు చదవడానికి లేదా రాయడానికి ఖాతా ఎంచుకోండి'}
            </p>
          )}
        </div>

        {/* Top-Level Mode Selector: Login vs Register (Hidden on forgot password) */}
        {mode !== 'forgot-password' ? (
          <div className="flex rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] p-1 mb-5 border border-[#E8E1DA] dark:border-[#2E2D36]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>లాగిన్ (Login)</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setPendingWriterNotice(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#7A284B] text-white shadow-sm'
                  : 'text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>నమోదు (Register)</span>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setResetSent(false);
              }}
              className="text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline font-serif-telugu flex items-center gap-1 cursor-pointer"
            >
              ← తిరిగి లాగిన్‌కు వెళ్లండి (Back to Login)
            </button>
          </div>
        )}

        {/* Pending Writer Waiting Notice (Shown on Login Screen after signup) */}
        {mode === 'login' && pendingWriterNotice && (
          <div className="p-4 mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-left space-y-2 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Clock className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-xs sm:text-sm font-serif-telugu">
                రచయిత ఖాతా అభ్యర్థన పంపబడింది (Writer Request Sent to Admin)
              </h4>
            </div>
            <p className="text-xs font-serif-telugu leading-relaxed text-amber-900 dark:text-amber-200">
              {pendingWriterNotice}
            </p>
            <div className="text-[11px] font-sans font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              ⏳ అడ్మిన్ మీ దరఖాస్తును సమీక్షించి ఆమోదించే వరకు లాగిన్ సాధ్యపడదు. దయచేసి వేచి ఉండండి.
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Writer Application Success Splash */}
        {writerSuccessNotice && (
          <div className="p-4 mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-center space-y-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-8 h-8 mx-auto text-amber-600" />
            <p className="font-bold text-sm font-serif-telugu">మీ రచయిత దరఖాస్తు విజయవంతంగా సమర్పించబడింది!</p>
            <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
              కథావాహిని అడ్మిన్ మీ దరఖాస్తు మరియు నమూనాను సమీక్షిస్తారు. ఆమోదం లభించిన తర్వాత కథల సమర్పణ సదుపాయం ప్రారంభించబడుతుంది.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 1: ONE COMMON LOGIN FORM (All Roles: Reader, Writer, Super Admin) */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                ఈమెయిల్ అడ్రస్ (Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                />
                <Mail className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  పాస్‌వర్డ్ (Password)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    setResetEmail(email);
                    setError('');
                    setResetSent(false);
                  }}
                  className="text-xs font-medium text-[#7A284B] dark:text-[#D87591] hover:underline font-serif-telugu cursor-pointer"
                >
                  పాస్వర్డ్ మర్చిపోయారా? (Forgot Password?)
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                />
                <Lock className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'వేచి ఉండండి...' : 'లాగిన్ (Login)'}</span>
            </button>

            <p className="text-center text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 font-serif-telugu">
              ఖాతా లేదా?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
              >
                కొత్త ఖాతా సృష్టించండి (Register)
              </button>
            </p>
          </form>
        )}

        {/* ========================================================================= */}
        {/* MODE: FORGOT PASSWORD FORM */}
        {/* ========================================================================= */}
        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 rounded-2xl bg-[#3E8065]/10 border border-[#3E8065]/25 text-center space-y-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-10 h-10 mx-auto text-[#3E8065]" />
                <h3 className="font-bold text-sm text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  పాస్వర్డ్ రీసెట్ అభ్యర్థన పంపబడింది
                </h3>
                <p className="text-xs font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
                  ఈ ఇమెయిల్‌కు సంబంధించిన ఖాతా Firebase Authentication లో ఉంటే, పాస్వర్డ్ రీసెట్ లింక్ పంపబడుతుంది.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-[#8A5000] dark:text-amber-300 font-serif-telugu space-y-1">
                  <p className="font-bold">⚠️ ఈమెయిల్ రాలేదా?</p>
                  <p>1. మీ ఈమెయిల్ <strong>Spam / Junk</strong> మరియు <strong>Promotions</strong> ఫోల్డర్‌లను తనిఖీ చేయండి (noreply@kathavahini-9a9c1.firebaseapp.com నుండి వస్తుంది).</p>
                  <p>2. ఈ ఈమెయిల్‌తో ఇంకా ఖాతా నమోదు చేయకపోతే, మీరు నేరుగా <strong>నమోదు (Register)</strong> ద్వారా కొత్త పాస్‌వర్డ్‌తో ఖాతాను సృష్టించవచ్చు.</p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setResetSent(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    లాగిన్ పేజీకి వెళ్లండి (Go to Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(resetEmail || 'thekathavahini@gmail.com');
                      setMode('register');
                      setError('');
                      setResetSent(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEAE2] dark:bg-[#222229] dark:hover:bg-[#2A2A33] text-[#17151A] dark:text-[#F7F3EE] text-xs font-bold border border-[#E8E1DA] dark:border-[#2E2D36] transition-all cursor-pointer font-serif-telugu"
                  >
                    ఖాతా ఇంకా లేకపోతే నమోదు చేయండి (Register Account)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#7A284B]/5 dark:bg-[#D87591]/10 border border-[#7A284B]/15 text-xs text-[#7A284B] dark:text-[#D87591] font-serif-telugu leading-relaxed">
                  ℹ️ మీ రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి. మేము అధికారిక Firebase పాస్‌వర్డ్ రీసెట్ లింక్‌ను పంపుతాము.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    ఈమెయిల్ అడ్రస్ (Email) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                    <Mail className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'పంపుతోంది...' : 'రీసెట్ లింక్ పంపండి (Send Reset Link)'}</span>
                </button>

                <p className="text-center text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-1 font-serif-telugu">
                  గుర్తుకు వచ్చిందా?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setResetSent(false);
                    }}
                    className="font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
                  >
                    లాగిన్ చేయండి (Login)
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: REGISTRATION WITH TWO DISTINCT TABS (Reader vs Writer) */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div className="space-y-4">
            {/* TWO CLEAR REGISTRATION TABS */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] dark:bg-[#222229] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
              <button
                type="button"
                onClick={() => {
                  setSignupTab('reader');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  signupTab === 'reader'
                    ? 'bg-[#7A284B] text-white shadow-md'
                    : 'text-[#6F6970] dark:text-[#AAA4AC] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>1. పాఠకుడిగా నమోదు</span>
                </div>
                <span className={`text-[10px] font-normal ${signupTab === 'reader' ? 'text-white/80' : 'text-[#6F6970]'}`}>
                  వెంటనే ఖాతా యాక్టివ్
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSignupTab('writer');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold font-serif-telugu transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  signupTab === 'writer'
                    ? 'bg-[#7A284B] text-white shadow-md'
                    : 'text-[#6F6970] dark:text-[#AAA4AC] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Feather className="w-4 h-4" />
                  <span>2. రచయితగా నమోదు</span>
                </div>
                <span className={`text-[10px] font-normal ${signupTab === 'writer' ? 'text-white/80' : 'text-[#6F6970]'}`}>
                  దరఖాస్తు & అడ్మిన్ సమీక్ష
                </span>
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB A: READER REGISTRATION (పాఠకుడిగా నమోదు) */}
            {/* ------------------------------------------------------------- */}
            {signupTab === 'reader' && (
              <form onSubmit={handleReaderRegisterSubmit} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-[#7A284B]/5 dark:bg-[#D87591]/10 border border-[#7A284B]/15 text-xs text-[#7A284B] dark:text-[#D87591] font-serif-telugu leading-relaxed">
                  📖 <strong>పాఠకుడిగా నమోదు:</strong> కథలు చదవండి, వ్యాఖ్యానించండి మరియు మీకు నచ్చిన కథలను సేవ్ చేసుకోండి.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    మీ పేరు (Display Name) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: రాఘవ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                    <UserIcon className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    ఈమెయిల్ అడ్రస్ (Email) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                    <Mail className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                    <Lock className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
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
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    పాస్‌వర్డ్‌ను నిర్ధారించండి (Confirm Password) *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                    <ShieldCheck className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'వేచి ఉండండి...' : 'పాఠకుడిగా నమోదు చేసుకోండి'}</span>
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB B: WRITER APPLICATION REGISTRATION (రచయితగా నమోదు) */}
            {/* ------------------------------------------------------------- */}
            {signupTab === 'writer' && (
              <form onSubmit={handleWriterRegisterSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 font-serif-telugu leading-relaxed space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-[#7A284B] dark:text-[#D87591]">
                    <Feather className="w-4 h-4" />
                    <span>రచయితగా నమోదు (Writer Application Process):</span>
                  </p>
                  <p>
                    రచయితగా నమోదు చేసుకోవడం ద్వారా మీరు రచయితగా దరఖాస్తు చేస్తున్నారు. మీ దరఖాస్తును నిర్వాహకులు పరిశీలించి ఆమోదించిన తర్వాత మాత్రమే మీ రచయిత ఖాతా సక్రియమవుతుంది.
                  </p>
                  <p className="text-[11px] opacity-80">
                    సాధారణంగా మీ దరఖాస్తును 24 గంటల్లో లేదా అంతకంటే ముందే పరిశీలించడానికి ప్రయత్నిస్తాము.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                      పూర్తి పేరు (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: రాఘవేంద్ర రావు"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                      రచయిత కలం పేరు (Pen Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: రాఘవ"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    ఈమెయిల్ అడ్రస్ (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                      పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 pr-9 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 p-1 text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-[#F7F3EE] transition-colors cursor-pointer"
                        title={showPassword ? 'పాస్‌వర్డ్‌ను దాచండి (Hide password)' : 'పాస్‌వర్డ్‌ను చూపించండి (Show password)'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                      పాస్‌వర్డ్ నిర్ధారణ *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 pr-9 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2 p-1 text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-[#F7F3EE] transition-colors cursor-pointer"
                        title={showConfirmPassword ? 'పాస్‌వర్డ్‌ను దాచండి (Hide password)' : 'పాస్‌వర్డ్‌ను చూపించండి (Show password)'}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    రచయిత పరిచయం / బయో (Bio) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="మీ గురించి మరియు మీ రచనల పట్ల ఆసక్తిని సంక్షిప్తంగా వివరించండి..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1.5 font-serif-telugu">
                    మీరు రాయాలనుకుంటున్న విభాగాలు (Categories) *
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#FAF7F2] dark:bg-[#222229] rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36]">
                    {CATEGORY_OPTIONS.map(cat => {
                      const isSel = categories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => handleCategoryToggle(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-serif-telugu transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#7A284B] text-white'
                              : 'bg-white dark:bg-[#18181D] text-[#6F6970] border border-[#E8E1DA] dark:border-[#2E2D36]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                    రచన యొక్క నమూనా / కథా భాగం (Sample Excerpt - కనీసం 50 అక్షరాలు) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="మీరు రాసిన కథ లేదా వ్యాసం నుండి ఒక నమూనా పేరాగ్రాఫ్‌ను ఇక్కడ రాయండి (అడ్మిన్ సమీక్ష కోసం)..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                </div>

                {/* 6 Mandatory Declarations */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-2.5 text-[11px] font-serif-telugu">
                  <div className="font-bold text-xs text-[#17151A] dark:text-[#F7F3EE] pb-1 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
                    రచయిత నిర్ధారణలు (Declarations - 6/6 తప్పనిసరి):
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decOriginality}
                      onChange={e => setDecOriginality(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      1. నేను సమర్పించే రచనలు నా స్వంత రచనలు లేదా publish చేయడానికి నాకు హక్కులు ఉన్నాయి.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decNoCopy}
                      onChange={e => setDecNoCopy(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      2. నేను ఇతరుల copyrighted contentను అనుమతి లేకుండా copy చేయను.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decGuidelines}
                      onChange={e => setDecGuidelines(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      3. నేను Website Writer Guidelines మరియు Content Policyని పాటిస్తాను.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decCooperation}
                      onChange={e => setDecCooperation(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      4. నా contentకు సంబంధించి third-party claim వస్తే Websiteతో సహకరిస్తాను.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decAiUsage}
                      onChange={e => setDecAiUsage(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      5. AI toolsను ideas/brainstorming సహాయానికి మాత్రమే ఉపయోగిస్తాను; AI కథను నా స్వంత రచనగా submit చేయను.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={decModeration}
                      onChange={e => setDecModeration(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#7A284B] focus:ring-[#7A284B]"
                    />
                    <span className="text-[#17151A] dark:text-[#F7F3EE]">
                      6. Website content review, rejection, removal మరియు moderation policiesని అంగీకరిస్తున్నాను.
                    </span>
                  </label>
                </div>

                {/* Typed Signature */}
                <div className="p-3 rounded-xl bg-[#7A284B]/5 dark:bg-[#D87591]/10 border border-[#7A284B]/20 space-y-1.5">
                  <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                    డిజిటల్ సంతకం (Type your Full Name for Signature) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="సంతకం కోసం మీ పేరు టైప్ చేయండి"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                  <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC] block">
                    రచయిత ఒప్పంద పత్రం వెర్షన్ 1.0 ప్రకారం మీ డిజిటల్ సంతకం రికార్డ్ చేయబడుతుంది.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !allDeclarationsChecked || !signatureName.trim()}
                  className="w-full py-3.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Feather className="w-4 h-4" />
                  <span>{loading ? 'దరఖాస్తు సమర్పిస్తోంది...' : 'రచయిత దరఖాస్తు సమర్పించండి'}</span>
                </button>
              </form>
            )}

            <p className="text-center text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-2 font-serif-telugu">
              ఇప్పటికే ఖాతా ఉందా?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer"
              >
                ప్రవేశించండి (Login)
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
