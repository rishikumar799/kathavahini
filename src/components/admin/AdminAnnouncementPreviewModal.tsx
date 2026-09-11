import React, { useState } from 'react';
import { X, Monitor, Smartphone, Megaphone, Bell, ArrowRight, ExternalLink } from 'lucide-react';
import { Announcement } from '../../types';

interface AdminAnnouncementPreviewModalProps {
  isOpen: boolean;
  announcement: Partial<Announcement> | null;
  onClose: () => void;
}

export const AdminAnnouncementPreviewModal: React.FC<AdminAnnouncementPreviewModalProps> = ({
  isOpen,
  announcement,
  onClose,
}) => {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen || !announcement) return null;

  const {
    title = 'శీర్షిక (Title Preview)',
    message = 'ప్రకటన వివరాలు ఇక్కడ కనిపిస్తాయి...',
    contentType = 'image_text',
    layout = 'image_left',
    imageURL,
    imageAltText,
    buttonText,
    buttonURL,
    audience = 'everyone',
    priority = 'normal',
    displayDelaySeconds = 3,
    displayFrequency = 'once_per_session',
  } = announcement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#15141B] rounded-3xl shadow-2xl border border-[#E8E1DA] dark:border-[#2C2A36] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E1DA] dark:border-[#2C2A36] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#1A1924]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                ప్రకటన ప్రివ్యూ (Announcement Preview)
              </h2>
              <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
                లైవ్ వెబ్‌సైట్‌లో పాఠకులకు ఈ ప్రకటన ఎలా కనిపిస్తుందో చూడండి
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className="flex items-center bg-[#ECE6DF] dark:bg-[#252330] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-[#15141B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                    : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">డెస్క్‌టాప్</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-[#15141B] text-[#7A284B] dark:text-[#D87591] shadow-xs'
                    : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">మొబైల్</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] text-[#6F6970] dark:text-[#A29CA6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container Canvas */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-[#F2EDE4] dark:bg-[#0E0D13] flex flex-col items-center justify-center min-h-[380px]">
          {/* Metadata Banner */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-[#E8E1DA] dark:border-white/10">
              టార్గెట్ ఆడియన్స్:{' '}
              <strong className="text-[#7A284B] dark:text-[#D87591]">{audience}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-[#E8E1DA] dark:border-white/10">
              డిలే: <strong>{displayDelaySeconds}s</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-[#E8E1DA] dark:border-white/10">
              ఫ్రీక్వెన్సీ: <strong>{displayFrequency}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-[#E8E1DA] dark:border-white/10">
              ప్రాధాన్యత: <strong className="uppercase">{priority}</strong>
            </span>
          </div>

          {/* Card Mockup */}
          <div
            className={`w-full transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-lg'
            }`}
          >
            <div className="relative rounded-3xl bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] shadow-2xl border border-[#E8E1DA] dark:border-[#2C2A36] p-5 sm:p-6 overflow-hidden">
              {/* Close Button X */}
              <button
                type="button"
                className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#23212C] text-[#6F6970] dark:text-[#A29CA6]"
                title="మూసివేయి"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 1. IMAGE ONLY */}
              {contentType === 'image_only' && (
                <div className="pt-2">
                  {imageURL ? (
                    <div className="rounded-2xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#121118]">
                      <img
                        src={imageURL}
                        alt={imageAltText || title}
                        className="w-full h-auto max-h-[300px] object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-44 rounded-2xl border-2 border-dashed border-[#D1C9BE] dark:border-[#383545] flex items-center justify-center text-xs text-[#8C8490]">
                      చిత్రం ఇంకా అప్‌లోడ్ కాలేదు (No image uploaded)
                    </div>
                  )}

                  {buttonText && (
                    <div className="mt-3.5 flex justify-end">
                      <div className="px-4 py-2 rounded-xl bg-[#7A284B] text-white text-xs font-bold font-serif-telugu flex items-center gap-1.5 shadow-md">
                        <span>{buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. TEXT ONLY */}
              {contentType === 'text_only' && (
                <div className="space-y-3 pr-6">
                  <div className="flex items-center gap-2 text-[#7A284B] dark:text-[#D87591]">
                    <div className="p-1 rounded-md bg-[#7A284B]/10 dark:bg-[#D87591]/10">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase font-serif-telugu">
                      కథావాహిని ప్రకటన
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-serif-telugu leading-snug text-[#17151A] dark:text-[#F7F3EE]">
                    {title}
                  </h3>

                  <p className="text-xs text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu leading-relaxed whitespace-pre-wrap">
                    {message}
                  </p>

                  {buttonText && (
                    <div className="pt-2 flex justify-end">
                      <div className="px-4 py-2 rounded-xl bg-[#7A284B] text-white text-xs font-bold font-serif-telugu flex items-center gap-1.5 shadow-md">
                        <span>{buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. IMAGE + TEXT */}
              {contentType === 'image_text' && (
                <div
                  className={`flex flex-col gap-4 items-center pt-2 ${
                    previewDevice === 'desktop'
                      ? layout === 'text_left'
                        ? 'sm:flex-row-reverse'
                        : 'sm:flex-row'
                      : ''
                  }`}
                >
                  <div
                    className={`w-full ${
                      previewDevice === 'desktop' ? 'sm:w-2/5' : ''
                    } shrink-0`}
                  >
                    {imageURL ? (
                      <div className="w-full h-36 rounded-2xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#121118]">
                        <img
                          src={imageURL}
                          alt={imageAltText || title}
                          className="w-full h-full object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 rounded-2xl border-2 border-dashed border-[#D1C9BE] dark:border-[#383545] flex items-center justify-center text-xs text-[#8C8490] p-2 text-center">
                        చిత్రం లేదు (No Image)
                      </div>
                    )}
                  </div>

                  <div
                    className={`w-full ${
                      previewDevice === 'desktop' ? 'sm:w-3/5' : ''
                    } space-y-2 min-w-0 pr-6 sm:pr-0`}
                  >
                    <div className="flex items-center gap-1 text-[#7A284B] dark:text-[#D87591]">
                      <Bell className="w-3 h-3" />
                      <span className="text-[10px] font-bold tracking-wider uppercase font-serif-telugu">
                        ప్రకటన
                      </span>
                    </div>

                    <h3 className="text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-snug line-clamp-2">
                      {title}
                    </h3>

                    <p className="text-xs text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {message}
                    </p>

                    {buttonText && (
                      <div className="pt-1 flex justify-start">
                        <div className="px-3 py-1.5 rounded-xl bg-[#7A284B] text-white text-xs font-bold font-serif-telugu flex items-center gap-1 shadow">
                          <span>{buttonText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E8E1DA] dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#1A1924] flex items-center justify-between">
          <p className="text-xs text-[#6F6970] dark:text-[#A29CA6]">
            గమనిక: ఇది కేవలం ప్రివ్యూ మాత్రమే. మీ వెబ్‌సైట్ డాక్యుమెంట్లు లేదా డేటాబేస్ ప్రభావితం కావు.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#E8E1DA] dark:bg-[#2C2A36] hover:bg-[#DED7CE] dark:hover:bg-[#383545] text-xs font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] transition-colors cursor-pointer"
          >
            పూర్తయింది (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
