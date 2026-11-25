import React, { useEffect, useMemo, useState } from 'react';
import { X, Share2, Copy, Check, Image as ImageIcon, MessageCircle, Download, Loader2 } from 'lucide-react';
import {
  buildWhatsAppShareUrl,
  canShareImageFiles,
  copyToClipboard,
  getCanonicalShareUrl,
  shareContent,
  shareWithImageFile,
  waitForWarmPreview,
  warmSharePreview,
} from '../../utils/shareUtils';
import {
  GeneratedShareCard,
  generateStoryShareCard,
  generateWriterBannerCard,
} from '../../utils/shareCardGenerator';

export interface ShareModalPayload {
  contentType: 'story' | 'novel' | 'episode' | 'author';
  id: string;
  title: string;
  description?: string;
  authorName?: string;
  coverImage?: string;
  // Writer profile banner fields (only used when contentType === 'author')
  avatarUrl?: string;
  isVerified?: boolean;
  storiesCount?: number;
  totalViews?: number;
  followersCount?: number;
}

interface ShareModalProps {
  isOpen: boolean;
  payload: ShareModalPayload | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, payload, onClose }) => {
  const [card, setCard] = useState<GeneratedShareCard | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharingCard, setIsSharingCard] = useState(false);

  const canonicalUrl = useMemo(() => {
    if (!payload) return '';
    return getCanonicalShareUrl(payload.contentType, payload.id);
  }, [payload]);

  const formattedShareText = useMemo(() => {
    if (!payload) return '';
    if (payload.contentType === 'author') {
      const bio = (payload.description || '').trim();
      const stats: string[] = [`${payload.storiesCount ?? 0} కథలు`];
      if (payload.totalViews && payload.totalViews > 0) {
        stats.push(`${payload.totalViews.toLocaleString()} వీక్షణలు`);
      }
      stats.push(`${(payload.followersCount ?? 0).toLocaleString()} అనుచరులు`);
      return [
        bio || `${payload.title} గారి తెలుగు రచనలు కథావాహినిలో చదవండి.`,
        stats.join(' • '),
        'Kathavahini — తెలుగు సాహిత్య ప్రపంచం',
      ].join('\n');
    }

    return [
      (payload.description || '').trim(),
      payload.authorName ? `By: ${payload.authorName}` : '',
      'Kathavahini | తెలుగు కథలు',
    ]
      .filter(Boolean)
      .join('\n');
  }, [payload]);

  const supportsFileShare = useMemo(() => canShareImageFiles(), []);
  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Generate 1200x630 preview card immediately when modal opens & ensure server OG cache is warm
  useEffect(() => {
    if (!isOpen || !payload) {
      setCard(null);
      setStatusMessage(null);
      setCopiedLink(false);
      return;
    }

    warmSharePreview(payload.contentType, payload.id);

    let cancelled = false;
    setIsGeneratingCard(true);
    setCard(null);

    const run = async () => {
      try {
        const generated =
          payload.contentType === 'author'
            ? await generateWriterBannerCard({
                id: payload.id,
                displayName: payload.title,
                bio: payload.description,
                avatarUrl: payload.avatarUrl,
                isVerified: payload.isVerified === true,
                storiesCount: payload.storiesCount ?? 0,
                totalViews: payload.totalViews ?? 0,
                followersCount: payload.followersCount ?? 0,
                canonicalUrl,
              })
            : await generateStoryShareCard({
                id: payload.id,
                contentType: payload.contentType,
                title: payload.title,
                excerpt: payload.description,
                authorName: payload.authorName,
                coverImage: payload.coverImage,
                canonicalUrl,
              });

        if (!cancelled) {
          setCard(generated);
        }
      } catch (err) {
        console.warn('Share card generation error:', err);
      } finally {
        if (!cancelled) {
          setIsGeneratingCard(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isOpen, payload, canonicalUrl]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !payload) return null;

  const showNotice = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    window.setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(canonicalUrl);
    if (ok) {
      setCopiedLink(true);
      showNotice('లింక్ కాపీ చేయబడింది! ఎక్కడైనా పేస్ట్ చేసి షేర్ చేయవచ్చు.');
      window.setTimeout(() => setCopiedLink(false), 2500);
    } else {
      showNotice('లింక్ కాపీ చేయడంలో సమస్య ఏర్పడింది.', true);
    }
  };

  const handleWhatsAppLinkShare = async () => {
    await waitForWarmPreview(payload.contentType, payload.id, 450);
    const waUrl = buildWhatsAppShareUrl(payload.title, formattedShareText, canonicalUrl);
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeLinkShare = async () => {
    await waitForWarmPreview(payload.contentType, payload.id, 450);
    const res = await shareContent({
      contentType: payload.contentType,
      id: payload.id,
      title: payload.title,
      text: formattedShareText,
      url: canonicalUrl,
    });
    if (res.success) {
      showNotice(res.message);
    } else if (res.method === 'failed') {
      showNotice(res.message, true);
    }
  };

  const handleShareImageCard = async () => {
    if (!card || isSharingCard) return;
    setIsSharingCard(true);
    try {
      const res = await shareWithImageFile(card.file, payload.title, formattedShareText, canonicalUrl);
      if (res.success) {
        showNotice(res.message);
      } else if (res.method === 'failed') {
        showNotice(res.message, true);
      }
    } finally {
      setIsSharingCard(false);
    }
  };

  const headingLabel =
    payload.contentType === 'author'
      ? 'రచయిత ప్రొఫైల్‌ను షేర్ చేయండి'
      : payload.contentType === 'novel'
      ? 'నవలను షేర్ చేయండి'
      : payload.contentType === 'episode'
      ? 'ఎపిసోడ్‌ను షేర్ చేయండి'
      : 'కథను షేర్ చేయండి';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={headingLabel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#18181D] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] dark:bg-[#1F1E26] border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#7A284B] text-white shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                {headingLabel}
              </h3>
              <p className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] truncate">
                {payload.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#6F6970] hover:text-[#17151A] dark:text-[#AAA4AC] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="మూసివేయి"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Instant 1200x630 Share Preview Card */}
          <div className="rounded-2xl overflow-hidden border border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#222229] aspect-[1200/630] flex items-center justify-center relative">
            {card ? (
              <img
                src={card.previewDataUrl}
                alt={payload.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#6F6970] dark:text-[#AAA4AC]">
                <Loader2 className={`w-6 h-6 text-[#7A284B] ${isGeneratingCard ? 'animate-spin' : ''}`} />
                <span className="text-xs font-serif-telugu">ప్రివ్యూ కార్డ్ సిద్ధమవుతోంది...</span>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Instant WhatsApp Link Share */}
            <button
              type="button"
              onClick={handleWhatsAppLinkShare}
              className="w-full px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp లో షేర్ చేయండి</span>
            </button>

            {/* Instant Preview Card Image + Link Share (Web Share API with files / Download fallback) */}
            <button
              type="button"
              disabled={!card || isSharingCard}
              onClick={handleShareImageCard}
              className="w-full px-4 py-3 rounded-2xl bg-[#7A284B] hover:bg-[#631F3C] dark:bg-[#D87591] dark:hover:bg-[#C2627E] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSharingCard ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : supportsFileShare ? (
                <ImageIcon className="w-4 h-4 shrink-0" />
              ) : (
                <Download className="w-4 h-4 shrink-0" />
              )}
              <span>
                {supportsFileShare ? 'కార్డ్ చిత్రం + లింక్ షేర్' : 'కార్డ్ డౌన్‌లోడ్ + లింక్ కాపీ'}
              </span>
            </button>
          </div>

          {/* Secondary Row: Native Share + Copy Canonical URL */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#6F6970] dark:text-[#AAA4AC] truncate select-all">
              {canonicalUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white dark:bg-[#222229] border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:border-[#7A284B]'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'కాపీ అయింది' : 'లింక్ కాపీ'}</span>
            </button>

            {supportsNativeShare && (
              <button
                type="button"
                onClick={handleNativeLinkShare}
                className="p-2.5 rounded-xl bg-white dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:border-[#7A284B] transition-colors cursor-pointer shrink-0"
                title="ఇతర యాప్స్ లో షేర్ చేయండి"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Feedback */}
          {statusMessage && (
            <div
              className={`px-4 py-2.5 rounded-xl text-xs font-bold text-center animate-fade-in ${
                statusMessage.isError
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
