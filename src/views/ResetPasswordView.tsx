import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Mail,
  Home
} from 'lucide-react';
import { authService } from '../services/authService';

interface ResetPasswordViewProps {
  onOpenLogin: () => void;
  onOpenForgotPassword: () => void;
  onBackToHome: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onOpenLogin,
  onOpenForgotPassword,
  onBackToHome,
}) => {
  const [oobCode, setOobCode] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [status, setStatus] = useState<'verifying' | 'form' | 'success' | 'invalid_link'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Extract oobCode and parameters from window search or hash
    const extractCode = (): string | null => {
      if (typeof window === 'undefined') return null;

      // 1. Check standard query params: ?mode=resetPassword&oobCode=...
      const urlParams = new URLSearchParams(window.location.search);
      let code = urlParams.get('oobCode');
      if (code) return code;

      // 2. Check hash query params if routed via hash
      if (window.location.hash && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'));
        const hashParams = new URLSearchParams(hashQuery);
        code = hashParams.get('oobCode');
        if (code) return code;
      }

      return null;
    };

    const code = extractCode();
    if (!code) {
      setStatus('invalid_link');
      setErrorMessage('పాస్వర్డ్ రీసెట్ కోడ్ కనుగొనబడలేదు లేదా లింక్ అసంపూర్ణంగా ఉంది. దయచేసి కొత్త రీసెట్ లింక్ను అభ్యర్థించండి.');
      return;
    }

    setOobCode(code);

    // Verify the action code with Firebase Authentication
    let isMounted = true;
    authService.verifyPasswordResetCode(code)
      .then((email) => {
        if (!isMounted) return;
        setVerifiedEmail(email);
        setStatus('form');
        setErrorMessage('');
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to verify reset code:', err);
        setStatus('invalid_link');
        setErrorMessage(authService.getErrorMessage(err));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!oobCode) {
      setStatus('invalid_link');
      setErrorMessage('చెల్లుబాటు అయ్యే రీసెట్ కోడ్ కనుగొనబడలేదు. దయచేసి కొత్త లింక్ అభ్యర్థించండి.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('పాస్వర్డ్ మరియు నిర్ధారణ పాస్‌వర్డ్ సరిపోలడం లేదు. సరిచూసుకోండి.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.confirmPasswordReset(oobCode, newPassword);
      
      // Wipe password state immediately from memory
      setNewPassword('');
      setConfirmPassword('');
      
      // Clean sensitive reset parameters from address bar history
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname === '/reset-password' ? '/' : window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      setIsSubmitting(false);
      setStatus('success');
    } catch (err: any) {
      console.error('Password reset confirmation failed:', err);
      setIsSubmitting(false);
      const msg = authService.getErrorMessage(err);
      setErrorMessage(msg);
      
      // If code was already used or expired during submit
      if (err?.code === 'auth/invalid-action-code' || err?.code === 'auth/expired-action-code') {
        setStatus('invalid_link');
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* State 1: Verifying Action Code */}
        {status === 'verifying' && (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7A284B]/10 dark:bg-[#D87591]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center mx-auto animate-pulse">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
              పాస్వర్డ్ రీసెట్ లింక్ ధృవీకరించబడుతోంది...
            </h2>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
              దయచేసి ఒక్క క్షణం వేచి ఉండండి.
            </p>
          </div>
        )}

        {/* State 2: Invalid / Expired Link */}
        {status === 'invalid_link' && (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                రీసెట్ లింక్ చెల్లదు లేదా గడువు ముగిసింది
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu leading-relaxed">
                {errorMessage || 'ఈ పాస్వర్డ్ రీసెట్ లింక్ ఇప్పటికే ఉపయోగించబడింది లేదా దాని కాలపరిమితి ముగిసింది. దయచేసి కొత్త లింక్ అభ్యర్థించండి.'}
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>కొత్త రీసెట్ లింక్ పొందండి (Request New Link)</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEAE2] dark:bg-[#222229] dark:hover:bg-[#2A2A33] text-[#6F6970] dark:text-[#AAA4AC] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-serif-telugu"
              >
                <Home className="w-3.5 h-3.5" />
                <span>హోమ్ పేజీకి వెళ్లండి</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Reset Password Form */}
        {status === 'form' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#7A284B] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                కొత్త పాస్‌వర్డ్ సెట్ చేయండి
              </h2>
              
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-1 font-serif-telugu">
                కథావాహిని ఖాతా కోసం మీ కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి
              </p>

              {verifiedEmail && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  <Mail className="w-3 h-3 text-[#7A284B] dark:text-[#D87591]" />
                  <span className="font-medium text-[#17151A] dark:text-[#F7F3EE]">{verifiedEmail}</span>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                  కొత్త పాస్‌వర్డ్ (New Password) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="కనీసం 6 అక్షరాలు"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                  <Lock className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#6F6970] hover:text-[#17151A] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] mt-1 font-serif-telugu">
                  కనీసం 6 అక్షరాలు లేదా సంఖ్యలు ఉండాలి
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
                  పాస్‌వర్డ్ నిర్ధారించండి (Confirm Password) *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="పాస్‌వర్డ్ మళ్లీ నమోదు చేయండి"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  />
                  <ShieldCheck className="w-4 h-4 text-[#6F6970] absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#6F6970] hover:text-[#17151A] dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'పాస్‌వర్డ్ నవీకరిస్తోంది...' : 'పాస్‌వర్డ్ సేవ్ చేయండి (Save Password)'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="text-xs font-semibold text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] transition-colors inline-flex items-center gap-1 font-serif-telugu cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>హోమ్ పేజీకి తిరిగి వెళ్లండి</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State 4: Success */}
        {status === 'success' && (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#3E8065]/15 text-[#3E8065] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu leading-relaxed">
                మీ ఖాతా కొత్త పాస్‌వర్డ్ విజయవంతంగా నవీకరించబడింది. మీరు ఇప్పుడు మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ చేయవచ్చు.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#EA8DA7] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>లాగిన్ చేయండి (Login Now)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
