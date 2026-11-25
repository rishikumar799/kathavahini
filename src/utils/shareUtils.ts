/**
 * Production-ready Web Share, Pre-Warming, Image-File Share & Clipboard utility
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
  method: 'native' | 'native-file' | 'download-copy' | 'clipboard' | 'cancelled' | 'failed';
  message: string;
  url?: string;
}

// Track pre-warming requests in memory so each entity is warmed at most once per page session
const warmedPreviewMap = new Map<string, Promise<void>>();

/**
 * Silently pre-warms the server OG HTML and 1200x630 JPEG cache (/api/og-warm)
 * as soon as a user opens a Story, Novel, Episode, or Writer Profile.
 * Eliminates cold-start delay when the user clicks Share and immediately sends via WhatsApp.
 */
export function warmSharePreview(
  contentType: 'story' | 'novel' | 'episode' | 'author' | 'profile',
  id?: string
): void {
  if (!id || typeof window === 'undefined' || typeof fetch !== 'function') return;
  const cleanId = id.trim();
  if (!cleanId) return;

  const key = `${contentType}:${cleanId}`;
  if (warmedPreviewMap.has(key)) return;

  const endpoint = `/api/og-warm?type=${encodeURIComponent(contentType)}&id=${encodeURIComponent(cleanId)}`;
  const promise = fetch(endpoint, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
    .then(() => undefined)
    .catch(() => {
      // Never block UI if warming endpoint is unreachable
    });

  warmedPreviewMap.set(key, promise);
}

/**
 * Awaits an in-flight pre-warm briefly (capped at maxWaitMs) so the share action stays instantaneous.
 */
export async function waitForWarmPreview(
  contentType: 'story' | 'novel' | 'episode' | 'author' | 'profile',
  id?: string,
  maxWaitMs = 500
): Promise<void> {
  if (!id) return;
  const key = `${contentType}:${id.trim()}`;
  const existing = warmedPreviewMap.get(key);
  if (!existing) {
    warmSharePreview(contentType, id);
  }
  const target = warmedPreviewMap.get(key);
  if (!target) return;
  await Promise.race([target, new Promise<void>((resolve) => window.setTimeout(resolve, maxWaitMs))]);
}

/**
 * Universal copy text to clipboard with legacy fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to legacy copy:', err);
    }
  }

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
 */
export function getPublicShareOrigin(): string {
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

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  }

  return 'https://kathavahini.in';
}

export function sanitizePublicUrl(url: string): string {
  if (!url) return '';
  if (url.includes('ais-dev-')) {
    return url.replace('ais-dev-', 'ais-pre-');
  }
  return url;
}

/**
 * Constructs canonical shareable URLs (/story/:id, /novel/:id, /author/:id, /episode/:id)
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
 * Builds a clean WhatsApp share intent URL with rich Telugu copy + clickable canonical URL.
 */
export function buildWhatsAppShareUrl(title: string, text: string, url: string): string {
  const cleanUrl = sanitizePublicUrl(url);
  const parts = [title ? `*${title.trim()}*` : '', text.trim(), cleanUrl].filter(Boolean);
  return `https://wa.me/?text=${encodeURIComponent(parts.join('\n\n'))}`;
}

/**
 * Checks whether the current browser supports Web Share API with image files (mobile Chrome/Safari/Edge).
 */
export function canShareImageFiles(sampleFile?: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    const testFile = sampleFile || new File([new Uint8Array([0])], 'preview.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Shares a generated 1200x630 JPEG card image + text + canonical link directly via Web Share API
 * (guarantees an instant visual preview in WhatsApp even if WhatsApp's crawler is slow or cached).
 * On desktop / unsupported browsers, downloads the JPEG card and copies the message + link to clipboard.
 */
export async function shareWithImageFile(
  file: File,
  title: string,
  text: string,
  url: string
): Promise<ShareResult> {
  const cleanUrl = sanitizePublicUrl(url);
  const caption = [title, text, cleanUrl].filter(Boolean).join('\n\n');

  if (canShareImageFiles(file)) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: caption,
      });
      return {
        success: true,
        method: 'native-file',
        message: 'ప్రివ్యూ కార్డ్ మరియు లింక్ విజయవంతంగా షేర్ చేయబడ్డాయి!',
        url: cleanUrl,
      };
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('canceled')) {
        return {
          success: false,
          method: 'cancelled',
          message: '',
          url: cleanUrl,
        };
      }
      console.warn('Web Share API with files failed, falling back to download + copy:', err);
    }
  }

  // Clean Desktop / Unsupported Browser fallback: download 1200x630 JPEG + copy share text & URL
  try {
    const blobUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    const copied = await copyToClipboard(caption);
    return {
      success: true,
      method: 'download-copy',
      message: copied
        ? 'ప్రివ్యూ కార్డ్ డౌన్‌లోడ్ అయింది & లింక్ కాపీ చేయబడింది! WhatsApp లో నేరుగా పంపవచ్చు.'
        : 'ప్రివ్యూ కార్డ్ చిత్రం డౌన్‌లోడ్ అయింది!',
      url: cleanUrl,
    };
  } catch {
    const copied = await copyToClipboard(cleanUrl);
    if (copied) {
      return {
        success: true,
        method: 'clipboard',
        message: 'లింక్ కాపీ చేయబడింది!',
        url: cleanUrl,
      };
    }
    return {
      success: false,
      method: 'failed',
      message: 'షేర్ చేయడంలో సమస్య ఏర్పడింది. మళ్లీ ప్రయత్నించండి.',
      url: cleanUrl,
    };
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

  const baseOrigin = getPublicShareOrigin();
  let fullUrl = (targetUrl && targetUrl.startsWith('http'))
    ? targetUrl
    : `${baseOrigin}${targetUrl ? (targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`) : ''}`;

  fullUrl = sanitizePublicUrl(fullUrl);

  if (options.contentType && options.contentType !== 'balavinodhini' && options.id) {
    warmSharePreview(options.contentType, options.id);
  }

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
