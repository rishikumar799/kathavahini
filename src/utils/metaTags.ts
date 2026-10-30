/**
 * Dynamic OpenGraph & Meta Tag Updater for KathaVahini
 * Injects canonical title, description, cover image, and URL for crawlers and browser sharing
 */

export interface PageMetaOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'article' | 'profile' | 'website';
}

export function updatePageMeta(data: PageMetaOptions): void {
  if (typeof document === 'undefined') return;

  const titleText = `${data.title} | కథావాహిని`;
  document.title = titleText;

  const setMeta = (attr: string, key: string, content: string) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kathavahini.org';
  const fullUrl = data.url 
    ? (data.url.startsWith('http') ? data.url : `${origin}${data.url.startsWith('/') ? data.url : `/${data.url}`}`)
    : (typeof window !== 'undefined' ? window.location.href : origin);

  const fallbackImage = `${origin}/logo.png`;
  const imageUrl = data.image || fallbackImage;

  // Standard SEO
  setMeta('name', 'description', data.description);

  // OpenGraph (Facebook, WhatsApp, LinkedIn, Telegram)
  setMeta('property', 'og:site_name', 'కథావాహిని (Kathavahini)');
  setMeta('property', 'og:title', data.title);
  setMeta('property', 'og:description', data.description);
  setMeta('property', 'og:image', imageUrl);
  setMeta('property', 'og:image:secure_url', imageUrl);
  setMeta('property', 'og:image:width', '1200');
  setMeta('property', 'og:image:height', '630');
  setMeta('property', 'og:image:alt', data.title);
  setMeta('property', 'og:url', fullUrl);
  setMeta('property', 'og:type', data.type || 'article');

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:site', '@kathavahini');
  setMeta('name', 'twitter:title', data.title);
  setMeta('name', 'twitter:description', data.description);
  setMeta('name', 'twitter:image', imageUrl);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', fullUrl);
}
