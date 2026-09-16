import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  Clock, 
  Sparkles, 
  Volume2, 
  Printer, 
  Download, 
  MessageSquare, 
  Send, 
  UserCheck, 
  ShieldAlert,
  Type
} from 'lucide-react';
import { BalavinodhiniItem, User } from '../../types';

interface BalavinodhiniItemDetailModalProps {
  item: BalavinodhiniItem;
  currentUser: User | null;
  onClose: () => void;
  onLikeToggle: (id: string) => void;
  onShare: (item: BalavinodhiniItem) => void;
  onRequireAuth?: () => void;
  onOpenCreatorProfile?: (authorName: string, authorBio?: string, authorAvatar?: string) => void;
}

export const BalavinodhiniItemDetailModal: React.FC<BalavinodhiniItemDetailModalProps> = ({
  item,
  currentUser,
  onClose,
  onLikeToggle,
  onShare,
  onRequireAuth,
  onOpenCreatorProfile,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Array<{ id: string; name: string; text: string; time: string }>>([
    { id: '1', name: 'శ్రీను', text: 'చాలా మంచి కథ! ఎంతో అర్థవంతంగా ఉంది.', time: 'నిన్న' },
    { id: '2', name: 'అనుపమ', text: 'పిల్లలకు చాలా ఉపయోగకరమైన విజ్ఞానం.', time: '2 రోజుల క్రితం' },
  ]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'huge': return 'text-xl sm:text-2xl leading-loose';
      case 'large': return 'text-lg sm:text-xl leading-relaxed';
      default: return 'text-base sm:text-lg leading-relaxed';
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${item.teluguTitle || item.title}</title>
            <style>
              body { font-family: 'Mandali', 'Suranna', sans-serif; padding: 40px; color: #17151A; }
              h1 { color: #7A284B; }
              p { font-size: 18px; line-height: 1.8; }
            </style>
          </head>
          <body>
            <h1>${item.teluguTitle || item.title}</h1>
            <p><strong>రచన:</strong> ${item.authorName || 'కథావాహిని'} | <strong>విభాగం:</strong> ${item.subcategoryId || 'బాల సాహిత్యం'}</p>
            <hr/>
            <div style="white-space: pre-wrap;">${item.content}</div>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!commentText.trim()) return;

    setLocalComments([
      ...localComments,
      {
        id: Date.now().toString(),
        name: currentUser.name || 'పాఠకుడు',
        text: commentText.trim(),
        time: 'ఇప్పుడే',
      },
    ]);
    setCommentText('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#FFFDF9] dark:bg-[#151419] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden">
        
        {/* STICKY TOP HEADER WITH PROMINENT CLOSE BUTTON */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-[#18181D]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#7A284B]/10 dark:bg-[#D87591]/20 text-[#7A284B] dark:text-[#D87591] font-serif-telugu truncate">
              {item.subcategoryId || item.categoryName || 'బాల సాహిత్యం'}
            </span>
            {item.readingTimeMinutes && (
              <span className="hidden sm:flex text-xs text-[#6F6970] dark:text-[#AAA4AC] items-center gap-1 font-serif-telugu">
                <Clock className="w-3.5 h-3.5" />
                {item.readingTimeMinutes} నిమిషాలు
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(f => f === 'normal' ? 'large' : f === 'large' ? 'huge' : 'normal')}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] transition-colors cursor-pointer"
              title="అక్షరాల సైజు"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] transition-colors cursor-pointer"
              title="ప్రింట్ చేయండి"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* PROMINENT CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm font-serif-telugu shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-rose-300 dark:ring-rose-900"
              title="మూసివేయి (Close)"
              aria-label="మూసివేయి"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">మూసివేయి</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Title & Metadata */}
          <div className="space-y-3 pb-4 border-b border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-snug">
              {item.teluguTitle || item.title}
            </h2>

            {/* Author Profile Bar */}
            <div className="flex items-center justify-between">
              <div 
                onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(item.authorName || 'కథావాహిని', item.authorBio, item.authorAvatar)}
                className="flex items-center gap-2.5 cursor-pointer group/auth"
              >
                <div className="w-9 h-9 rounded-full bg-[#7A284B]/10 dark:bg-[#D87591]/20 flex items-center justify-center font-bold text-sm text-[#7A284B] dark:text-[#D87591] overflow-hidden">
                  {item.authorAvatar ? <img src={item.authorAvatar} alt="" className="w-full h-full object-cover" /> : item.authorName?.charAt(0) || 'బ'}
                </div>
                <div>
                  <span className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] group-hover/auth:text-[#7A284B] dark:group-hover/auth:text-[#D87591] flex items-center gap-1">
                    {item.authorName || 'కథావాహిని'}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] block font-serif-telugu">
                    రచన • బాలవినోదిని వేదిక
                  </span>
                </div>
              </div>

              {/* Likes & Share in Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLikeToggle(item.id)}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-serif-telugu cursor-pointer ${
                    item.isLiked
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40'
                      : 'bg-[#FAF7F2] dark:bg-[#23222A] border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] dark:text-[#AAA4AC] hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                  <span>{item.likeCount || 0} లైక్స్</span>
                </button>

                <button
                  onClick={() => onShare(item)}
                  className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] hover:text-[#17151A] transition-colors cursor-pointer"
                  title="షేర్ చేయండి"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cover image if available */}
          {item.coverImage && (
            <div className="w-full max-h-80 overflow-hidden rounded-2xl shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]">
              <img
                src={item.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Story / Article Content */}
          <div className={`font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] whitespace-pre-wrap ${getFontSizeClass()}`}>
            {item.content}
          </div>

          {/* Interactive Comments Section */}
          <div className="pt-6 border-t border-[#E8E1DA] dark:border-[#2E2D36] space-y-4">
            <h4 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
              <span>స్పందనలు & వ్యాఖ్యలు ({localComments.length})</span>
            </h4>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="మీ ప్రోత్సాహకరమైన వ్యాఖ్యను రాయండి..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7A284B] text-white dark:bg-[#D87591] font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs font-serif-telugu"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>పంపండి</span>
                </button>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm font-serif-telugu flex items-center justify-between text-amber-800 dark:text-amber-300">
                <span>వ్యాఖ్యానించడానికి లేదా భద్రపరచడానికి లాగిన్ అవ్వండి.</span>
                {onRequireAuth && (
                  <button
                    onClick={onRequireAuth}
                    className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    లాగిన్ చేయండి
                  </button>
                )}
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-2.5 pt-2">
              {localComments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">{c.name}</span>
                    <span className="text-[10px] text-[#6F6970] dark:text-[#AAA4AC]">{c.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
