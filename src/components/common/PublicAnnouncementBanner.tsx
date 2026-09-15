import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ArrowRight, Megaphone, Bell } from 'lucide-react';
import { Announcement, User } from '../../types';
import { announcementService } from '../../services/announcementService';

interface PublicAnnouncementBannerProps {
  currentUser: User | null;
  onNavigateTab?: (tab: string) => void;
}

export const PublicAnnouncementBanner: React.FC<PublicAnnouncementBannerProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout | null = null;

    const fetchAndScheduleAnnouncement = async () => {
      try {
        const activeList = await announcementService.getActiveAnnouncementsForUser(currentUser);
        if (!isMounted || activeList.length === 0) return;

        // Choose the top priority announcement (at most ONE announcement visible at a time)
        const topAnnouncement = activeList[0];
        setAnnouncement(topAnnouncement);

        // Display delay calculation (Default: 3 seconds, 0 = immediately)
        const delaySeconds = typeof topAnnouncement.displayDelaySeconds === 'number'
          ? topAnnouncement.displayDelaySeconds
          : 3;
        const delayMs = Math.max(0, delaySeconds * 1000);

        timerId = setTimeout(() => {
          if (isMounted) {
            setIsVisible(true);
            announcementService.recordImpression(topAnnouncement.id).catch(() => {});
          }
        }, delayMs);
      } catch (err) {
        console.warn('Silent announcement banner loader warning:', err);
      }
    };

    fetchAndScheduleAnnouncement();

    const handleAnnouncementsUpdated = () => {
      announcementService.getActiveAnnouncementsForUser(currentUser).then((activeList) => {
        if (!isMounted) return;
        if (activeList.length === 0) {
          setIsVisible(false);
          setAnnouncement(null);
        } else {
          const top = activeList[0];
          setAnnouncement(top);
          setIsVisible(true);
        }
      }).catch(() => {});
    };

    window.addEventListener('kathavahini:announcements-updated', handleAnnouncementsUpdated);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('kathavahini:announcements-updated', handleAnnouncementsUpdated);
    };
  }, [currentUser]);

  // Keyboard accessibility: Escape key dismisses the announcement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, announcement]);

  const handleDismiss = () => {
    if (!announcement) return;
    setIsVisible(false);
    setHasDismissed(true);
    announcementService.recordDismissal(
      announcement.id,
      currentUser,
      announcement.displayFrequency
    );
  };

  const handleActionClick = () => {
    if (!announcement) return;
    announcementService.recordClick(announcement.id);

    if (announcement.buttonURL) {
      const url = announcement.buttonURL.trim();
      // Internal route like '#stories', 'stories', '/novels'
      if (url.startsWith('#') || !url.startsWith('http')) {
        const targetTab = url.replace(/^[#/]+/, '');
        if (onNavigateTab && targetTab) {
          onNavigateTab(targetTab);
          handleDismiss();
          return;
        }
      }
      // External link or standard URL
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = url;
      }
    }
  };

  if (!announcement || !isVisible || hasDismissed) {
    return null;
  }

  const { contentType, layout, title, message, imageURL, imageAltText, buttonText, buttonURL } = announcement;

  return (
    <aside
      aria-label="ముఖ్యమైన ప్రకటన (Important Announcement)"
      role="region"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md lg:max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="relative rounded-3xl bg-white dark:bg-[#18181F] text-[#17151A] dark:text-[#F7F3EE] shadow-2xl border border-[#E8E1DA] dark:border-[#2C2A36] p-5 sm:p-6 overflow-hidden ring-1 ring-black/5">
        {/* Accent Glow Background */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-[#7A284B]/10 dark:bg-[#D87591]/10 blur-2xl pointer-events-none" />

        {/* Close Button (X) at Top Right */}
        <button
          onClick={handleDismiss}
          aria-label="Close announcement"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-[#FAF7F2] dark:bg-[#23212C] text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-white hover:bg-[#E8E1DA] dark:hover:bg-[#2C2A36] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LAYOUT 1: IMAGE ONLY */}
        {contentType === 'image_only' && imageURL ? (
          <div className="pt-2">
            <div
              className={`rounded-2xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#121118] ${
                buttonURL ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
              }`}
              onClick={buttonURL ? handleActionClick : undefined}
            >
              <img
                src={imageURL}
                alt={imageAltText || title || 'కథావాహిని ప్రకటన'}
                className="w-full h-auto max-h-[65vh] object-contain mx-auto"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            {buttonText && buttonURL && (
              <div className="mt-3.5 pt-2 flex justify-end">
                <button
                  onClick={handleActionClick}
                  className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#903058] text-white text-xs font-bold font-serif-telugu transition-all shadow-md cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* LAYOUT 2: TEXT ONLY */}
        {contentType === 'text_only' || (!imageURL && contentType !== 'image_only') ? (
          <div className="space-y-3 pr-6">
            <div className="flex items-center gap-2 text-[#7A284B] dark:text-[#D87591]">
              <div className="p-1.5 rounded-lg bg-[#7A284B]/10 dark:bg-[#D87591]/10">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold tracking-wide uppercase font-serif-telugu">
                కథావాహిని ప్రకటన
              </span>
            </div>

            {title && (
              <h3 className="text-base sm:text-lg font-bold font-serif-telugu leading-snug text-[#17151A] dark:text-[#F7F3EE]">
                {title}
              </h3>
            )}

            {message && (
              <p className="text-xs sm:text-sm text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            )}

            {buttonText && buttonURL && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleActionClick}
                  className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#903058] text-white text-xs font-bold font-serif-telugu transition-all shadow-md cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* LAYOUT 3: IMAGE + TEXT (IMAGE LEFT or TEXT LEFT) */}
        {contentType === 'image_text' && imageURL && (
          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-5 items-center pt-2 ${
              layout === 'text_left' ? 'sm:flex-row-reverse' : ''
            }`}
          >
            {/* Image Column */}
            <div className="w-full sm:w-2/5 shrink-0">
              <div className="w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-[#E8E1DA]/60 dark:border-[#2C2A36] bg-[#FAF7F2] dark:bg-[#121118]">
                <img
                  src={imageURL}
                  alt={imageAltText || title || 'ప్రకటన చిత్రం'}
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Text Column */}
            <div className="w-full sm:w-3/5 space-y-2.5 min-w-0 pr-6 sm:pr-0">
              <div className="flex items-center gap-1.5 text-[#7A284B] dark:text-[#D87591]">
                <Bell className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-wider uppercase font-serif-telugu">
                  ప్రకటన (Announcement)
                </span>
              </div>

              {title && (
                <h3 className="text-sm sm:text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] leading-snug line-clamp-2">
                  {title}
                </h3>
              )}

              {message && (
                <p className="text-xs text-[#4A454E] dark:text-[#D5CED8] font-serif-telugu leading-relaxed line-clamp-3 whitespace-pre-wrap">
                  {message}
                </p>
              )}

              {buttonText && buttonURL && (
                <div className="pt-1">
                  <button
                    onClick={handleActionClick}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7A284B] hover:bg-[#903058] text-white text-xs font-bold font-serif-telugu transition-all shadow cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#7A284B]"
                  >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
