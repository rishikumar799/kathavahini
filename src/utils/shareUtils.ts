/**
 * Production-ready Web Share and Clipboard copy utility with universal fallback
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
  contentType?: 'story' | 'novel' | 'author' | 'profile' | 'episode';
  id?: string;
  coverImage?: string;
  dialogTitle?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'cancelled' | 'failed';
  message: string;
}

/**
 * Universal copy text to clipboard with legacy fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to legacy copy:', err);
    }
  }

  // Legacy textarea fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('Legacy copy fallback error:', fallbackErr);
    return false;
  }
}

/**
 * Share content using Web Share API when supported, falling back to clipboard copy
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  let targetUrl = options.url;
  if (!targetUrl && options.contentType && options.id) {
    targetUrl = getCanonicalShareUrl(options.contentType, options.id);
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kathavahini.org';
  const fullUrl = (targetUrl && targetUrl.startsWith('http'))
    ? targetUrl
    : `${origin}${targetUrl ? (targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`) : ''}`;

  // Try Native Web Share API if supported
  if (navigator.share && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: options.title,
        text: options.text || options.title,
        url: fullUrl,
      });
      return {
        success: true,
        method: 'native',
        message: 'విజయవంతంగా షేర్ చేయబడింది! (Shared successfully)',
      };
    } catch (err: any) {
      // User cancelled/closed the native share sheet
      if (err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('canceled')) {
        return {
          success: false,
          method: 'cancelled',
          message: '',
        };
      }
      console.warn('Native share error, trying clipboard fallback:', err);
    }
  }

  // Fallback to Clipboard Copy
  const copied = await copyToClipboard(fullUrl);
  if (copied) {
    return {
      success: true,
      method: 'clipboard',
      message: 'లింక్ కాపీ చేయబడింది! (Link copied to clipboard)',
    };
  }

  return {
    success: false,
    method: 'failed',
    message: 'లింక్ కాపీ చేయడంలో సమస్య ఏర్పడింది. (Failed to copy link)',
  };
}

/**
 * Helper to construct canonical shareable URLs for stories, novels, authors, and profiles
 */
export function getCanonicalShareUrl(
  type: 'story' | 'novel' | 'author' | 'profile' | 'episode', 
  id: string, 
  extraParams?: Record<string, string>
): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://kathavahini.org';

  const params = new URLSearchParams();
  params.set(type, id);

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }

  return `${origin}/?${params.toString()}`;
}
