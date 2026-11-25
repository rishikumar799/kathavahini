import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { resolveContentAuthor } from '../utils/authorResolver.ts';
import { MOCK_STORIES, MOCK_NOVELS, MOCK_AUTHORS } from '../services/mockData.ts';

export interface ContentMeta {
  title: string;
  description: string;
  imageUrl: string;
  imageType: string;
  url: string;
  appRedirectUrl?: string;
  siteName: string;
  type: 'article' | 'profile' | 'website';
  authorName?: string;
  imageWidth: number;
  imageHeight: number;
}

export const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'WhatsApp',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'SkypeUriPreview',
  'Google-Structured-Data-Testing-Tool',
  'Googlebot',
  'bingbot',
  'Applebot',
  'Pinterest',
  'redditbot',
  'Viber',
  'vkShare',
  'W3C_Validator',
  'MetaInspector',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'Iframely',
  'bitlybot'
];

export function isSocialCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(crawler => ua.includes(crawler.toLowerCase()));
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Strip private PII (emails, phone numbers) so public Open Graph metadata never leaks personal data.
 */
export function sanitizePublicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/(?:\+?\d[\d\s\-()]{8,}\d)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Infer MIME type from data URI or image URL.
 */
export function detectImageMimeType(src: string): string {
  if (!src) return 'image/png';
  const dataMatch = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/i);
  if (dataMatch) {
    const ext = dataMatch[1].toLowerCase();
    return ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  }
  const lower = src.toLowerCase().split('?')[0];
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (src.includes('api.dicebear.com') && src.includes('/png')) return 'image/png';
  return 'image/jpeg';
}

/**
 * Convert Dicebear SVG avatar URLs to high-res PNG URLs for social crawlers (WhatsApp/Facebook reject SVG).
 */
export function normalizeSocialAvatarUrl(url: string): string {
  if (!url) return '';
  if (url.includes('api.dicebear.com') && url.includes('/svg')) {
    const pngUrl = url.replace('/svg', '/png');
    return pngUrl.includes('size=') ? pngUrl : `${pngUrl}${pngUrl.includes('?') ? '&' : '?'}size=512`;
  }
  return url;
}

/**
 * Determine whether an image candidate is a real custom-uploaded photo rather than a default generated icon.
 */
export function isCustomUploadedPhoto(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('api.dicebear.com')) return false;
    if (lower.includes('ui-avatars.com')) return false;
    if (lower.endsWith('/logo.png')) return false;
    return true;
  }
  return false;
}

function truncateClean(text: string, maxLen: number): string {
  const clean = sanitizePublicText(text);
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed = lastSpace > maxLen * 0.55 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.replace(/[.,;:\-\s—]+$/, '')}…`;
}

function buildVersionTag(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Resolve a cover image string (base64 or public URL) into a crawler-accessible HTTPS URL and MIME type.
 * Routes all story/novel covers through /api/cover/:id.jpg so WhatsApp always receives a 1200x630 JPEG.
 */
function resolveCoverImage(
  coverCandidate: unknown,
  entityId: string,
  origin: string,
  defaultLogo: string,
  versionSeed = ''
): { imageUrl: string; imageType: string } {
  if (typeof coverCandidate === 'string') {
    const trimmed = coverCandidate.trim();
    if (trimmed && !trimmed.startsWith('blob:')) {
      const v = buildVersionTag(`${trimmed.slice(0, 96)}:${trimmed.length}:${versionSeed}`);
      if (trimmed.startsWith('data:image/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
        return {
          imageUrl: `${origin}/api/cover/${encodeURIComponent(entityId)}.jpg?v=${v}`,
          imageType: 'image/jpeg',
        };
      }
    }
  }
  return { imageUrl: defaultLogo, imageType: 'image/png' };
}

/**
 * Pick the highest-priority profile image across merged user/writer/author documents.
 * Always prefers a writer's actual uploaded profile photograph over a generated Dicebear avatar.
 */
export function pickBestProfileImage(
  docs: Array<Record<string, any> | null | undefined>,
  authorDocId: string,
  origin: string,
  defaultLogo: string
): { imageUrl: string; imageType: string; isCustom: boolean } {
  const candidates: string[] = [];
  for (const d of docs) {
    if (!d) continue;
    for (const key of ['photoURL', 'profileImageURL', 'avatar', 'profileImage', 'imageUrl']) {
      const val = d[key];
      if (typeof val === 'string' && val.trim() && !val.trim().startsWith('blob:')) {
        candidates.push(val.trim());
      }
    }
  }

  // Pass 1: Custom uploaded photograph (base64 data URI or Firebase Storage / HTTPS photo)
  for (const c of candidates) {
    if (isCustomUploadedPhoto(c)) {
      if (c.startsWith('data:image/')) {
        return {
          imageUrl: `${origin}/api/avatar/${encodeURIComponent(authorDocId)}.jpg`,
          imageType: 'image/jpeg',
          isCustom: true,
        };
      }
      const mime = detectImageMimeType(c);
      if (mime === 'image/webp') {
        return {
          imageUrl: `${origin}/api/avatar/${encodeURIComponent(authorDocId)}.jpg`,
          imageType: 'image/jpeg',
          isCustom: true,
        };
      }
      return {
        imageUrl: c,
        imageType: mime,
        isCustom: true,
      };
    }
  }

  // Pass 2: Generated Dicebear or external avatar (converted to PNG so WhatsApp accepts it)
  for (const c of candidates) {
    if (c.startsWith('https://') || c.startsWith('http://')) {
      const normalized = normalizeSocialAvatarUrl(c);
      return {
        imageUrl: normalized,
        imageType: detectImageMimeType(normalized),
        isCustom: false,
      };
    }
  }

  return { imageUrl: defaultLogo, imageType: 'image/png', isCustom: false };
}

/**
 * Resolves content metadata dynamically from Firestore
 */
export async function resolveContentMeta(
  params: {
    storyId?: string | null;
    novelId?: string | null;
    authorId?: string | null;
    episodeId?: string | null;
    isReader?: boolean;
  },
  origin: string
): Promise<ContentMeta> {
  const fallbackOrigin = (origin || 'https://kathavahini.in').replace(/\/+$/, '');
  const defaultLogo = `${fallbackOrigin}/logo.png`;

  const defaultMeta: ContentMeta = {
    title: 'Kathavahini | తెలుగు కథలు & నవలలు',
    description: 'Read original Telugu stories, novels, episodes, Balavinodhini, and timeless literature on Kathavahini.',
    imageUrl: defaultLogo,
    imageType: 'image/png',
    url: fallbackOrigin,
    appRedirectUrl: fallbackOrigin,
    siteName: 'Kathavahini | తెలుగు కథలు',
    type: 'website',
    imageWidth: 1200,
    imageHeight: 630
  };

  try {
    // 1. Resolve Story or Episode
    const storyTargetId = params.storyId || params.episodeId;
    if (storyTargetId) {
      const cleanId = decodeURIComponent(storyTargetId).trim();
      const isReaderMode = params.isReader || Boolean(params.episodeId);

      // Check stories collection first
      const storySnap = await getDoc(doc(db, 'stories', cleanId));
      if (storySnap.exists()) {
        const data = storySnap.data();

        // Security check: Never expose deleted, hidden, private, or draft content
        if (
          data.deleted === true ||
          data.status === 'deleted' ||
          data.status === 'draft' ||
          data.status === 'pending' ||
          data.status === 'rejected' ||
          data.visibility === 'hidden' ||
          data.visibility === 'private'
        ) {
          return defaultMeta;
        }

        // Check scheduled publication
        if (data.status === 'scheduled') {
          const sched = data.scheduledPublishAt || data.scheduledAt;
          const schedTime = sched?.toMillis ? sched.toMillis() : new Date(sched).getTime();
          if (schedTime > Date.now()) return defaultMeta;
        }

        const resolvedAuthor = resolveContentAuthor({ id: storySnap.id, ...data });
        const authorName = sanitizePublicText(
          resolvedAuthor.teluguName || resolvedAuthor.name || data.authorName || 'కథావాహిని రచయిత'
        ) || 'కథావాహిని రచయిత';
        const rawTitle = sanitizePublicText(data.teluguTitle || data.title || 'తెలుగు కథ') || 'తెలుగు కథ';

        let excerpt = sanitizePublicText(data.teluguExcerpt || data.excerpt || data.description || '');
        if (!excerpt && Array.isArray(data.content)) {
          excerpt = sanitizePublicText(data.content.join(' '));
        } else if (!excerpt && typeof data.content === 'string') {
          excerpt = sanitizePublicText(data.content);
        }
        const shortExcerpt = truncateClean(excerpt, 128);
        const fullDescription = shortExcerpt
          ? `${shortExcerpt}${shortExcerpt.toLowerCase().includes(authorName.toLowerCase()) ? '' : ` — By: ${authorName}`}`
          : `Read "${rawTitle}" on Kathavahini — By: ${authorName}`;

        const coverCandidate = data.coverImage || data.coverImageUrl || data.coverImageURL;
        const { imageUrl, imageType } = resolveCoverImage(
          coverCandidate,
          storySnap.id,
          fallbackOrigin,
          defaultLogo,
          String(data.updatedAt?.seconds || data.publishedAt || '')
        );

        const encodedId = encodeURIComponent(storySnap.id);
        const canonical = isReaderMode
          ? `${fallbackOrigin}/episode/${encodedId}`
          : `${fallbackOrigin}/story/${encodedId}`;
        const appRedirectUrl = canonical;

        return {
          title: rawTitle,
          description: fullDescription,
          imageUrl,
          imageType,
          url: canonical,
          appRedirectUrl,
          siteName: 'Kathavahini | తెలుగు కథలు',
          type: 'article',
          authorName,
          imageWidth: 1200,
          imageHeight: 630
        };
      }

      // Check episodes collection if not in stories
      const epSnap = await getDoc(doc(db, 'episodes', cleanId));
      if (epSnap.exists()) {
        const epData = epSnap.data();
        if (
          epData.deleted === true ||
          epData.status === 'deleted' ||
          epData.status === 'draft' ||
          epData.visibility === 'hidden' ||
          epData.visibility === 'private'
        ) {
          return defaultMeta;
        }

        const epNum = epData.episodeNumber || 1;
        const novelTeluguTitle = sanitizePublicText(epData.novelTitle || 'తెలుగు నవల') || 'తెలుగు నవల';
        const epTitle = sanitizePublicText(epData.teluguTitle || `${epNum}వ భాగం`) || `${epNum}వ భాగం`;
        const fullTitle = `${novelTeluguTitle} - ${epTitle} | కథావాహిని`;

        let excerpt = sanitizePublicText(epData.teluguExcerpt || epData.excerpt || '');
        if (!excerpt && Array.isArray(epData.content)) {
          excerpt = sanitizePublicText(epData.content.join(' ')).slice(0, 180);
        }

        let resolvedImg = resolveCoverImage(
          epData.coverImage || epData.coverImageUrl || epData.coverImageURL,
          epSnap.id,
          fallbackOrigin,
          defaultLogo
        );

        if (resolvedImg.imageUrl === defaultLogo && epData.novelId) {
          const parentNovelSnap = await getDoc(doc(db, 'novels', epData.novelId));
          if (parentNovelSnap.exists()) {
            const pData = parentNovelSnap.data();
            resolvedImg = resolveCoverImage(
              pData.coverImage || pData.coverImageUrl || pData.coverImageURL,
              epData.novelId,
              fallbackOrigin,
              defaultLogo
            );
          }
        }

        const encodedId = encodeURIComponent(epSnap.id);
        const epAuthorName = sanitizePublicText(epData.authorName || '');
        const shortEpExcerpt = truncateClean(excerpt, 128);
        return {
          title: `${novelTeluguTitle} - ${epTitle}`,
          description: shortEpExcerpt
            ? `${shortEpExcerpt}${epAuthorName ? ` — By: ${epAuthorName}` : ''}`
            : `${novelTeluguTitle} — ${epTitle}${epAuthorName ? ` — By: ${epAuthorName}` : ''}`,
          imageUrl: resolvedImg.imageUrl,
          imageType: resolvedImg.imageType,
          url: `${fallbackOrigin}/episode/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/episode/${encodedId}`,
          siteName: 'Kathavahini | తెలుగు కథలు',
          type: 'article',
          authorName: epAuthorName,
          imageWidth: 1200,
          imageHeight: 630
        };
      }

      // Check mock stories fallback
      const mockStory = MOCK_STORIES.find(s => s.id === cleanId);
      if (mockStory) {
        const resolvedAuthor = resolveContentAuthor(mockStory);
        const authorName = resolvedAuthor.teluguName || resolvedAuthor.name || 'కథావాహిని రచయిత';
        const rawTitle = mockStory.teluguTitle || mockStory.title || 'తెలుగు కథ';
        const fullTitle = `${rawTitle} | రచన: ${authorName} | కథావాహిని`;
        const desc = mockStory.teluguExcerpt || mockStory.excerpt || '';
        const { imageUrl, imageType } = resolveCoverImage(mockStory.coverImage, mockStory.id, fallbackOrigin, defaultLogo);
        const encodedId = encodeURIComponent(mockStory.id);
        return {
          title: fullTitle,
          description: desc ? `${desc.trim()} - కథావాహినిలో పూర్తి కథను చదవండి.` : `కథావాహినిలో "${rawTitle}" తెలుగు కథను చదవండి.`,
          imageUrl,
          imageType,
          url: `${fallbackOrigin}/story/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/?story=${encodedId}`,
          siteName: 'కథావాహిని (Kathavahini)',
          type: 'article',
          authorName,
          imageWidth: 1200,
          imageHeight: 630
        };
      }
    }

    // 2. Resolve Novel
    if (params.novelId) {
      const cleanNovelId = decodeURIComponent(params.novelId).trim();
      const novelSnap = await getDoc(doc(db, 'novels', cleanNovelId));
      if (novelSnap.exists()) {
        const data = novelSnap.data();
        if (
          data.deleted === true ||
          data.status === 'deleted' ||
          data.status === 'draft' ||
          data.visibility === 'hidden' ||
          data.visibility === 'private'
        ) {
          return defaultMeta;
        }

        const resolvedAuthor = resolveContentAuthor({ id: novelSnap.id, ...data });
        const authorName = sanitizePublicText(
          resolvedAuthor.teluguName || resolvedAuthor.name || data.authorName || 'కథావాహిని రచయిత'
        ) || 'కథావాహిని రచయిత';
        const rawTitle = sanitizePublicText(data.teluguTitle || data.title || 'తెలుగు నవల') || 'తెలుగు నవల';

        const { imageUrl, imageType } = resolveCoverImage(
          data.coverImage || data.coverImageUrl || data.coverImageURL,
          novelSnap.id,
          fallbackOrigin,
          defaultLogo,
          String(data.updatedAt?.seconds || '')
        );

        const desc = truncateClean(data.teluguDescription || data.description || '', 128);
        const fullDescription = desc
          ? `${desc} — By: ${authorName}`
          : `Read "${rawTitle}" Telugu novel on Kathavahini — By: ${authorName}`;

        const encodedId = encodeURIComponent(novelSnap.id);
        return {
          title: rawTitle,
          description: fullDescription,
          imageUrl,
          imageType,
          url: `${fallbackOrigin}/novel/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/novel/${encodedId}`,
          siteName: 'Kathavahini | తెలుగు కథలు',
          type: 'article',
          authorName,
          imageWidth: 1200,
          imageHeight: 630
        };
      }

      // Check seed / mock novels fallback
      const mockNovel = MOCK_NOVELS.find(n => n.id === cleanNovelId);
      if (mockNovel) {
        const resolvedAuthor = resolveContentAuthor(mockNovel);
        const authorName = resolvedAuthor.teluguName || resolvedAuthor.name || 'కథావాహిని రచయిత';
        const rawTitle = mockNovel.teluguTitle || mockNovel.title || 'తెలుగు నవల';
        const fullTitle = `${rawTitle} | ధారావాహిక నవల | రచన: ${authorName} | కథావాహిని`;
        const desc = mockNovel.teluguDescription || mockNovel.description || '';
        const { imageUrl, imageType } = resolveCoverImage(mockNovel.coverImage, mockNovel.id, fallbackOrigin, defaultLogo);
        const encodedId = encodeURIComponent(mockNovel.id);
        return {
          title: fullTitle,
          description: desc ? `${desc.trim()} - కథావాహినిలో నవలను ఉచితంగా చదవండి.` : `కథావాహినిలో "${rawTitle}" తెలుగు ధారావాహిక నవలను చదవండి.`,
          imageUrl,
          imageType,
          url: `${fallbackOrigin}/novel/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/?novel=${encodedId}`,
          siteName: 'కథావాహిని (Kathavahini)',
          type: 'article',
          authorName,
          imageWidth: 1200,
          imageHeight: 630
        };
      }
    }

    // 3. Resolve Writer or Reader Profile (parallel merge across users, writers, authors so updated photos always win)
    if (params.authorId) {
      const authorDocId = decodeURIComponent(params.authorId).trim();

      const [userSnap, writerSnap, authorSnap] = await Promise.all([
        getDoc(doc(db, 'users', authorDocId)).catch(() => null),
        getDoc(doc(db, 'writers', authorDocId)).catch(() => null),
        getDoc(doc(db, 'authors', authorDocId)).catch(() => null),
      ]);

      const userData = userSnap?.exists() ? userSnap.data() : null;
      const writerData = writerSnap?.exists() ? writerSnap.data() : null;
      const authorData = authorSnap?.exists() ? authorSnap.data() : null;

      if (userData || writerData || authorData) {
        // Respect privacy: do not leak deleted/disabled accounts
        if (userData?.deleted === true || writerData?.deleted === true) {
          return defaultMeta;
        }

        const merged = {
          ...(authorData || {}),
          ...(writerData || {}),
          ...(userData || {}),
        };

        const rawName =
          writerData?.teluguName ||
          userData?.teluguName ||
          authorData?.teluguName ||
          writerData?.penName ||
          userData?.penName ||
          userData?.displayName ||
          writerData?.displayName ||
          writerData?.name ||
          userData?.name ||
          authorData?.name ||
          'కథావాహిని రచయిత';

        const name = sanitizePublicText(rawName) || 'కథావాహిని రచయిత';

        const rawBio =
          userData?.teluguBio ||
          writerData?.teluguBio ||
          authorData?.teluguBio ||
          userData?.bio ||
          writerData?.bio ||
          authorData?.bio ||
          '';
        const cleanBio = truncateClean(rawBio, 125);

        const fullDescription = cleanBio
          ? `${cleanBio} • Writer on Kathavahini.`
          : `Writer on Kathavahini. Read original Telugu stories, novels, and series by ${name}.`;

        const encodedId = encodeURIComponent(authorDocId);
        const avatarSeed =
          userData?.photoURL ||
          userData?.profileImageURL ||
          writerData?.photoURL ||
          writerData?.profileImageURL ||
          writerData?.avatar ||
          '';
        const bannerVersion = buildVersionTag(
          `${name}|${cleanBio}|${String(avatarSeed).slice(0, 64)}|${writerData?.followersCount || userData?.followersCount || 0}|${writerData?.publishedStoriesCount || 0}`
        );
        const bannerImageUrl = `${fallbackOrigin}/api/author-card/${encodedId}.jpg?v=${bannerVersion}`;

        return {
          title: name,
          description: fullDescription,
          imageUrl: bannerImageUrl,
          imageType: 'image/jpeg',
          url: `${fallbackOrigin}/author/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/author/${encodedId}`,
          siteName: 'Kathavahini — తెలుగు సాహిత్య ప్రపంచం',
          type: 'profile',
          authorName: name,
          imageWidth: 1200,
          imageHeight: 630
        };
      }

      // Check mock authors fallback
      const mockAuthor = MOCK_AUTHORS.find(a => a.id === authorDocId);
      if (mockAuthor) {
        const name = sanitizePublicText(mockAuthor.teluguName || mockAuthor.name) || 'కథావాహిని రచయిత';
        const fullTitle = `${name} - రచయిత ప్రొఫైల్ | కథావాహిని`;
        const cleanBio = sanitizePublicText(mockAuthor.teluguBio || mockAuthor.bio || '');
        const fullDescription = cleanBio
          ? `${cleanBio} — ${name} గారి రచనలు కథావాహినిలో చదవండి.`
          : `${name} గారి రచయిత ప్రొఫైల్ మరియు తెలుగు రచనలు కథావాహినిలో చూడండి.`;
        const { imageUrl, imageType } = pickBestProfileImage([mockAuthor as any], authorDocId, fallbackOrigin, defaultLogo);
        const encodedId = encodeURIComponent(authorDocId);
        return {
          title: fullTitle,
          description: fullDescription,
          imageUrl,
          imageType,
          url: `${fallbackOrigin}/author/${encodedId}`,
          appRedirectUrl: `${fallbackOrigin}/?author=${encodedId}`,
          siteName: 'కథావాహిని (Kathavahini)',
          type: 'profile',
          authorName: name,
          imageWidth: 512,
          imageHeight: 512
        };
      }
    }
  } catch (err) {
    console.warn('Error resolving content meta for preview:', err);
  }

  return defaultMeta;
}

/**
 * Generate standard-compliant Open Graph and Twitter Card HTML snippet
 */
export function generateMetaHtml(meta: ContentMeta): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeImage = escapeHtml(meta.imageUrl);
  const safeImageType = escapeHtml(meta.imageType || 'image/jpeg');
  const safeUrl = escapeHtml(meta.url);
  const safeSite = escapeHtml(meta.siteName);

  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />

    <!-- Open Graph (Facebook, WhatsApp, Telegram, LinkedIn) -->
    <meta property="og:site_name" content="${safeSite}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:type" content="${safeImageType}" />
    <meta property="og:image:width" content="${meta.imageWidth}" />
    <meta property="og:image:height" content="${meta.imageHeight}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="og:url" content="${safeUrl}" />

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@kathavahini" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${safeUrl}" />
  `.trim();
}

/**
 * Injects dynamic Open Graph & Twitter meta tags into HTML template
 */
export function injectMetaIntoHtml(html: string, meta: ContentMeta): string {
  const metaSnippet = generateMetaHtml(meta);

  // Replace existing title and basic meta tags if present
  const modified = html
    .replace(/<title>.*?<\/title>/is, '')
    .replace(/<meta\s+name=["']description["'].*?>/is, '')
    .replace(/<meta\s+property=["']og:.*?["'].*?>/gis, '')
    .replace(/<meta\s+name=["']twitter:.*?["'].*?>/gis, '')
    .replace(/<link\s+rel=["']canonical["'].*?>/gis, '');

  // Inject right after <head>
  if (modified.includes('<head>')) {
    return modified.replace('<head>', `<head>\n    ${metaSnippet}`);
  }

  return `${metaSnippet}\n${modified}`;
}

/**
 * Standalone HTML page for social link crawlers (WhatsApp, Facebook, X, Telegram, LinkedIn).
 * NEVER emits <meta http-equiv="refresh"> because social crawlers follow meta refresh redirects
 * away from the canonical URL and lose the rich preview card.
 * When includeBrowserRedirect is true (e.g. /share/* routes), only a JS redirect is included
 * so human browsers jump straight to the SPA while non-JS crawlers stay on HTTP 200 OK.
 */
export function generateCrawlerPreviewHtml(
  meta: ContentMeta,
  options?: { includeBrowserRedirect?: boolean }
): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeImage = escapeHtml(meta.imageUrl);
  const safeImageType = escapeHtml(meta.imageType || 'image/jpeg');
  const safeUrl = escapeHtml(meta.url);
  const safeSite = escapeHtml(meta.siteName);
  const targetUrl = meta.appRedirectUrl || meta.url;
  const safeTargetUrl = escapeHtml(targetUrl);

  const ctaLabel =
    meta.type === 'profile'
      ? 'రచయిత ప్రొఫైల్ చూడండి (Open Profile)'
      : 'కథను తెరవండి (Open Story)';

  const redirectScript = options?.includeBrowserRedirect
    ? `\n  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>`
    : '';

  return `<!doctype html>
<html lang="te">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">

  <!-- Open Graph (WhatsApp, Facebook, Telegram, LinkedIn) -->
  <meta property="og:site_name" content="${safeSite}">
  <meta property="og:type" content="${meta.type}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:type" content="${safeImageType}">
  <meta property="og:image:width" content="${meta.imageWidth}">
  <meta property="og:image:height" content="${meta.imageHeight}">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${safeUrl}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@kathavahini">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <link rel="canonical" href="${safeUrl}">
  <link rel="icon" type="image/png" href="/logo.png">${redirectScript}
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background-color: #FAF7F2; color: #17151A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center;">
  <div style="max-width: 520px; background: white; border: 1px solid #E8E1DA; border-radius: 24px; padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    <img src="${safeImage}" alt="${safeTitle}" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 16px; margin-bottom: 18px;" onerror="this.style.display='none'">
    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #17151A;">${safeTitle}</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #6F6970; margin: 0 0 22px;">${safeDesc}</p>
    <a href="${safeTargetUrl}" style="display: inline-block; background-color: #7A284B; color: white; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
      ${ctaLabel}
    </a>
  </div>
</body>
</html>`;
}
