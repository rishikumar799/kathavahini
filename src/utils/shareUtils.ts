/**
 * Production-ready Web Share and Clipboard copy utility with universal fallback
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
  contentType?: 'story' | 'novel' | 'author' | 'profile' | 'episode' | 'balavinodhini';
  id?: string;
  coverImage?: string;
  dialogTitle?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'cancelled' | 'failed';
  message: string;
  url?: string;
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
 * Resolves the public, canonical base URL of KathaVahini.
 * 
 * Crucial: In AI Studio development sandbox, `window.location.origin` is `ais-dev-...run.app`,
 * which is protected by developer Google login (applet-auth-bridge).
 * Converting `ais-dev-` to `ais-pre-` allows anyone with the shared link (WhatsApp, Instagram, mobile, guest)
 * to open the story, novel, episode, or author profile immediately without signing into Google / Gemini AI.
 */
export function getPublicShareOrigin(): string {
  // 1. Explicit production domain configured via env
  const metaEnv = (import.meta as any)?.env;
  const configuredAppUrl = (metaEnv?.VITE_APP_URL || metaEnv?.VITE_PUBLIC_APP_URL || metaEnv?.APP_URL || '') as string;
  if (
    configuredAppUrl &&
    configuredAppUrl.startsWith('http') &&
    !configuredAppUrl.includes('YOUR_REAL_KATHAVAHINI_DOMAIN') &&
    !configuredAppUrl.includes('MY_APP_URL')
  ) {
    return configuredAppUrl.replace(/\/+$/, '');
  }

  // 2. Use active browser origin; convert private ais-dev- preview host to public ais-pre- shared host
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  }

  return 'https://kathavahini-9a9c1.web.app';
}

/**
 * Sanitizes any URL to ensure that if it was generated with an internal ais-dev- domain,
 * it is safely translated to the public ais-pre- shared domain so external readers aren't prompted for Google sign-in.
 */
export function sanitizePublicUrl(url: string): string {
  if (!url) return '';
  if (url.includes('ais-dev-')) {
    return url.replace('ais-dev-', 'ais-pre-');
  }
  return url;
}

/**
 * Helper to construct canonical shareable URLs for stories, novels, authors, and profiles.
 * Generates clean canonical pathnames (/story/:id, /novel/:id, /author/:id, /episode/:id)
 * that perfectly trigger Firebase Hosting Cloud Function rewrites and produce rich social media previews.
 */
export function getCanonicalShareUrl(
  type: 'story' | 'novel' | 'author' | 'profile' | 'episode' | 'balavinodhini', 
  id: string, 
  extraParams?: Record<string, string>
): string {
  const base = getPublicShareOrigin();
  const cleanId = encodeURIComponent(id.trim());

  let path = '';
  const params = new URLSearchParams();

  if (type === 'story') {
    path = `/story/${cleanId}`;
  } else if (type === 'novel') {
    path = `/novel/${cleanId}`;
  } else if (type === 'episode') {
    path = `/episode/${cleanId}`;
  } else if (type === 'author' || type === 'profile') {
    path = `/author/${cleanId}`;
  } else if (type === 'balavinodhini') {
    path = '/';
    params.set('tab', 'balavinodhini');
    params.set('item', cleanId);
  } else {
    path = `/story/${cleanId}`;
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }

  const queryStr = params.toString();
  return `${base}${path}${queryStr ? `?${queryStr}` : ''}`;
}

/**
 * Share content using Web Share API when supported, falling back to clipboard copy
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  let targetUrl = options.url;
  if (!targetUrl && options.contentType && options.id) {
    targetUrl = getCanonicalShareUrl(options.contentType, options.id);
  }

  const baseOrigin = getPublicShareOrigin();
  let fullUrl = (targetUrl && targetUrl.startsWith('http'))
    ? targetUrl
    : `${baseOrigin}${targetUrl ? (targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`) : ''}`;

  fullUrl = sanitizePublicUrl(fullUrl);

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
        url: fullUrl,
      };
    } catch (err: any) {
      // User cancelled/closed the native share sheet
      if (err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('canceled')) {
        return {
          success: false,
          method: 'cancelled',
          message: '',
          url: fullUrl,
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
      message: 'లింక్ కాపీ చేయబడింది! (ఎవరైనా లాగిన్ లేకుండానే చదువుకోవచ్చు)',
      url: fullUrl,
    };
  }

  return {
    success: false,
    method: 'failed',
    message: 'లింక్ కాపీ చేయడంలో సమస్య ఏర్పడింది. (Failed to copy link)',
    url: fullUrl,
  };
}
