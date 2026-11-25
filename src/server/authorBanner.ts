import fs from 'fs';
import path from 'path';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import {
  escapeHtml,
  isCustomUploadedPhoto,
  normalizeSocialAvatarUrl,
  sanitizePublicText,
} from './metaHandler.ts';

export interface WriterBannerProfile {
  id: string;
  displayName: string;
  bio: string;
  isVerified: boolean;
  avatarSource: string;
  storiesCount: number;
  totalViews: number;
  followersCount: number;
  canonicalUrl: string;
  versionSeed: string;
}

const ALLOWED_BANNER_IMAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'kathavahini.in',
  'www.kathavahini.in',
  'kathavahini-9a9c1.firebasestorage.app',
  'kathavahini-9a9c1.appspot.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'api.dicebear.com',
]);

function isAllowedImageUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:' && ALLOWED_BANNER_IMAGE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function parseBase64DataUrl(src: string): Buffer | null {
  const match = src.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/i);
  if (!match) return null;
  try {
    return Buffer.from(match[1], 'base64');
  } catch {
    return null;
  }
}

function formatCompactCount(num: number): string {
  const n = Math.max(0, Math.floor(Number(num) || 0));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function wrapTextLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const clean = sanitizePublicText(text);
  if (!clean) return [];
  const words = clean.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) break;
      }
      current = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine - 1) : word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    const joined = lines.join(' ');
    if (joined.length < clean.length) {
      const last = lines[maxLines - 1].replace(/[.,;:\-\s—]+$/, '');
      lines[maxLines - 1] = `${last.slice(0, Math.max(4, maxCharsPerLine - 1))}…`;
    }
  }
  return lines;
}

function isStoryPubliclyCountable(data: Record<string, any>): boolean {
  const status = String(data.status || '').toLowerCase().trim();
  if (['draft', 'pending', 'rejected', 'deleted', 'hidden', 'archived', 'private', 'unpublished'].includes(status)) {
    return false;
  }
  if (data.deleted === true || data.isHidden === true || data.isPrivate === true) {
    return false;
  }
  const vis = String(data.visibility || '').toLowerCase().trim();
  if (vis === 'private' || vis === 'hidden' || vis === 'draft') {
    return false;
  }
  return true;
}

/**
 * Fetches live, authoritative writer profile data & stats from Firestore in parallel.
 */
export async function resolveWriterBannerProfile(
  rawAuthorId: string,
  origin: string
): Promise<WriterBannerProfile | null> {
  const authorId = decodeURIComponent(rawAuthorId || '').trim();
  if (!authorId) return null;

  const cleanOrigin = (origin || 'https://kathavahini.in').replace(/\/+$/, '');

  const [userSnap, writerSnap, authorSnap, storiesByAuthorSnap, storiesByWriterSnap] = await Promise.all([
    getDoc(doc(db, 'users', authorId)).catch(() => null),
    getDoc(doc(db, 'writers', authorId)).catch(() => null),
    getDoc(doc(db, 'authors', authorId)).catch(() => null),
    getDocs(query(collection(db, 'stories'), where('authorId', '==', authorId))).catch(() => null),
    getDocs(query(collection(db, 'stories'), where('writerId', '==', authorId))).catch(() => null),
  ]);

  const userData = userSnap?.exists() ? userSnap.data() : null;
  const writerData = writerSnap?.exists() ? writerSnap.data() : null;
  const authorData = authorSnap?.exists() ? authorSnap.data() : null;

  if (!userData && !writerData && !authorData) return null;
  if (userData?.deleted === true || writerData?.deleted === true) return null;

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
  const displayName = sanitizePublicText(String(rawName)) || 'కథావాహిని రచయిత';

  const rawBio =
    userData?.teluguBio ||
    writerData?.teluguBio ||
    authorData?.teluguBio ||
    userData?.bio ||
    writerData?.bio ||
    authorData?.bio ||
    '';
  const bio =
    sanitizePublicText(String(rawBio)) ||
    'తెలుగు కథలు, నవలలు మరియు సాహిత్య భావాలతో కూడిన రచనలు.';

  const isVerified = Boolean(
    writerData?.isVerified === true ||
      userData?.isVerified === true ||
      authorData?.isVerified === true ||
      writerData?.verified === true
  );

  // Deduplicate published stories across authorId and writerId queries
  const storyMap = new Map<string, Record<string, any>>();
  for (const snap of [storiesByAuthorSnap, storiesByWriterSnap]) {
    if (!snap) continue;
    snap.forEach((d) => {
      if (!storyMap.has(d.id)) {
        const data = d.data();
        if (isStoryPubliclyCountable(data)) {
          storyMap.set(d.id, data);
        }
      }
    });
  }

  let totalViews = 0;
  for (const s of storyMap.values()) {
    const v = Math.max(0, Number(s.viewsCount ?? s.viewCount ?? 0));
    totalViews += v;
  }

  const storiesCount = Math.max(
    storyMap.size,
    Number(writerData?.publishedStoriesCount || 0),
    Number(authorData?.storiesCount || 0)
  );

  const followersCount = Math.max(
    0,
    Number(writerData?.followersCount || 0),
    Number(userData?.followersCount || 0),
    Number(authorData?.followersCount || 0)
  );

  // Pick best profile image (prioritizing custom uploaded photo over generated Dicebear)
  const candidates: string[] = [];
  for (const d of [userData, writerData, authorData]) {
    if (!d) continue;
    for (const key of ['photoURL', 'profileImageURL', 'profileImage', 'avatar', 'imageUrl']) {
      const val = d[key];
      if (typeof val === 'string' && val.trim() && !val.trim().startsWith('blob:')) {
        candidates.push(val.trim());
      }
    }
  }
  const avatarSource =
    candidates.find((c) => isCustomUploadedPhoto(c)) ||
    candidates.find((c) => c.startsWith('https://') || c.startsWith('http://')) ||
    '';

  const versionSeed = [
    displayName,
    bio.slice(0, 40),
    avatarSource.slice(0, 64),
    storiesCount,
    followersCount,
    totalViews,
    isVerified ? '1' : '0',
  ].join('|');

  return {
    id: authorId,
    displayName,
    bio,
    isVerified,
    avatarSource,
    storiesCount,
    totalViews,
    followersCount,
    canonicalUrl: `${cleanOrigin}/author/${encodeURIComponent(authorId)}`,
    versionSeed,
  };
}

async function fetchAvatarBuffer(source: string): Promise<Buffer | null> {
  if (!source) return null;
  if (source.startsWith('data:image/')) {
    return parseBase64DataUrl(source);
  }
  const normalized = normalizeSocialAvatarUrl(source);
  if (!isAllowedImageUrl(normalized)) return null;
  try {
    const res = await fetch(normalized, { redirect: 'manual' });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Generates a premium 1200x630 literary/editorial Writer Profile Banner JPEG using sharp + SVG (Pango/HarfBuzz).
 */
export async function renderWriterBannerJpeg(
  profile: WriterBannerProfile,
  logoPathCandidates: string[]
): Promise<Buffer | null> {
  let sharpFn: any = null;
  try {
    const mod = await import('sharp');
    sharpFn = mod.default || mod;
  } catch {
    return null;
  }

  const W = 1200;
  const H = 630;
  const AVATAR_SIZE = 264;
  const AVATAR_X = 82;
  const AVATAR_Y = 126;

  // Prepare circular writer photo buffer
  let circularAvatarBuf: Buffer | null = null;
  const rawAvatar = await fetchAvatarBuffer(profile.avatarSource);
  if (rawAvatar) {
    try {
      const circleMask = Buffer.from(
        `<svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" xmlns="http://www.w3.org/2000/svg"><circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="#ffffff"/></svg>`
      );
      circularAvatarBuf = await sharpFn(rawAvatar)
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'attention' })
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .png()
        .toBuffer();
    } catch {
      circularAvatarBuf = null;
    }
  }

  // Optional Kathavahini logo mark for bottom bar
  let logoMarkBuf: Buffer | null = null;
  for (const p of logoPathCandidates) {
    if (fs.existsSync(p)) {
      try {
        logoMarkBuf = await sharpFn(p)
          .resize(44, 44, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .png()
          .toBuffer();
        break;
      } catch {}
    }
  }

  const safeName = escapeHtml(
    profile.displayName.length > 28 ? `${profile.displayName.slice(0, 27)}…` : profile.displayName
  );
  const bioLines = wrapTextLines(profile.bio, 42, 3);
  const displayUrl = profile.canonicalUrl.replace(/^https?:\/\//i, '');
  const shortDisplayUrl =
    displayUrl.length > 44 ? `${displayUrl.slice(0, 41)}…` : displayUrl;
  const initialChar = escapeHtml((profile.displayName.trim()[0] || 'క').toUpperCase());

  // Build stats chips dynamically from real backend values
  const statItems: Array<{ label: string; icon: string }> = [
    { label: `${profile.storiesCount} కథలు`, icon: 'book' },
  ];
  if (profile.totalViews > 0) {
    statItems.push({ label: `${formatCompactCount(profile.totalViews)} వీక్షణలు`, icon: 'eye' });
  }
  statItems.push({ label: `${formatCompactCount(profile.followersCount)} అనుచరులు`, icon: 'users' });

  let statX = 408;
  const statsSvgParts = statItems.map((item) => {
    const chipW = Math.max(166, Math.min(230, item.label.length * 13 + 56));
    const iconSvg =
      item.icon === 'book'
        ? `<g transform="translate(${statX + 18}, 396)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H2z"/><path d="M20 4h-6a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h7z"/></g>`
        : item.icon === 'eye'
        ? `<g transform="translate(${statX + 18}, 397)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="11" cy="10" r="3"/></g>`
        : `<g transform="translate(${statX + 18}, 396)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="3.5"/><path d="M21 19v-2a4 4 0 0 0-3-3.8"/><path d="M15 3.2a3.5 3.5 0 0 1 0 6.8"/></g>`;

    const chip = `
      <rect x="${statX}" y="380" width="${chipW}" height="52" rx="14" fill="#FAF7F2" stroke="#E5D9CA" stroke-width="1.5"/>
      ${iconSvg}
      <text x="${statX + 50}" y="413" font-family="Noto Sans Telugu, Noto Serif Telugu, Noto Sans, sans-serif" font-size="20" font-weight="700" fill="#17151A">${escapeHtml(item.label)}</text>
    `;
    statX += chipW + 16;
    return chip;
  });

  // Verified badge placed cleanly in top-right badge row or next to eyebrow
  const verifiedChipSvg = profile.isVerified
    ? `
      <g transform="translate(658, 92)">
        <rect x="0" y="0" width="142" height="34" rx="17" fill="#7A284B"/>
        <circle cx="20" cy="17" r="9" fill="#D99A3D"/>
        <path d="M15.5 17.2l3 3 6-6.2" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="38" y="23" font-family="Noto Sans, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">VERIFIED</text>
      </g>
    `
    : '';

  const fallbackMonogramSvg = !circularAvatarBuf
    ? `
      <circle cx="${AVATAR_X + AVATAR_SIZE / 2}" cy="${AVATAR_Y + AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="url(#maroonGrad)"/>
      <text x="${AVATAR_X + AVATAR_SIZE / 2}" y="${AVATAR_Y + AVATAR_SIZE / 2 + 34}" text-anchor="middle" font-family="Noto Serif Telugu, Noto Sans, sans-serif" font-size="96" font-weight="700" fill="#FAF7F2">${initialChar}</text>
    `
    : '';

  const bioSvgLines = bioLines
    .map(
      (line, idx) =>
        `<text x="408" y="${258 + idx * 35}" font-family="Noto Sans Telugu, Noto Serif Telugu, Noto Sans, sans-serif" font-size="22" font-weight="400" fill="#4E4752">${escapeHtml(line)}</text>`
    )
    .join('\n');

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF8F3"/>
        <stop offset="100%" stop-color="#EFE6D8"/>
      </linearGradient>
      <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B2F56"/>
        <stop offset="100%" stop-color="#5E1C38"/>
      </linearGradient>
      <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7A284B"/>
        <stop offset="55%" stop-color="#B85378"/>
        <stop offset="100%" stop-color="#D99A3D"/>
      </linearGradient>
    </defs>

    <!-- Warm Cream Editorial Backdrop -->
    <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

    <!-- Subtle Decorative Literary Watermark Circles -->
    <circle cx="1125" cy="95" r="145" fill="#7A284B" opacity="0.045"/>
    <circle cx="88" cy="548" r="120" fill="#D99A3D" opacity="0.07"/>

    <!-- Main Editorial Card Surface -->
    <rect x="34" y="34" width="1132" height="562" rx="28" fill="#FFFFFF" stroke="#E5D9CA" stroke-width="2"/>

    <!-- Top Burgundy Brand Accent Stripe -->
    <path d="M62 34 H1138 A28 28 0 0 1 1166 62 V66 H34 V62 A28 28 0 0 1 62 34 Z" fill="url(#maroonGrad)"/>
    <rect x="34" y="42" width="1132" height="5" fill="#D99A3D" opacity="0.85"/>

    <!-- Left Avatar Soft Glow & Double Editorial Ring -->
    <circle cx="${AVATAR_X + AVATAR_SIZE / 2}" cy="${AVATAR_Y + AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2 + 16}" fill="#FAF7F2" stroke="#E8DDD0" stroke-width="2"/>
    <circle cx="${AVATAR_X + AVATAR_SIZE / 2}" cy="${AVATAR_Y + AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2 + 7}" fill="#FFFFFF" stroke="url(#goldRing)" stroke-width="5"/>
    ${fallbackMonogramSvg}

    <!-- Subtle Label Under Avatar -->
    <rect x="112" y="420" width="204" height="34" rx="17" fill="#7A284B" opacity="0.1"/>
    <text x="214" y="443" text-anchor="middle" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#7A284B">కథావాహిని రచయిత</text>

    <!-- Right Column: Eyebrow + Optional Verified Chip -->
    <rect x="408" y="92" width="236" height="34" rx="17" fill="#FAF4EC" stroke="#E5D6C3" stroke-width="1.2"/>
    <text x="526" y="115" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="14" font-weight="700" letter-spacing="1.2" fill="#7A284B">WRITER ON KATHAVAHINI</text>
    ${verifiedChipSvg}

    <!-- Writer Display Name -->
    <text x="408" y="196" font-family="Noto Serif Telugu, Noto Sans Telugu, Noto Sans, sans-serif" font-size="46" font-weight="700" fill="#17151A">${safeName}</text>

    <!-- Gold Editorial Accent Divider -->
    <rect x="408" y="214" width="84" height="4" rx="2" fill="#D99A3D"/>

    <!-- Writer Biography -->
    ${bioSvgLines}

    <!-- Real Stats Chips Row -->
    ${statsSvgParts.join('\n')}

    <!-- Bottom Branding Footer Band -->
    <line x1="72" y1="490" x2="1128" y2="490" stroke="#EAE1D6" stroke-width="1.5"/>
    <rect x="36" y="492" width="1128" height="102" rx="26" fill="#FAF7F2"/>
    <rect x="36" y="492" width="1128" height="24" fill="#FAF7F2"/>

    <!-- Brand Identity Left -->
    <text x="${logoMarkBuf ? 132 : 76}" y="538" font-family="Noto Sans, sans-serif" font-size="25" font-weight="700" fill="#7A284B">Kathavahini</text>
    <text x="${logoMarkBuf ? 286 : 230}" y="538" font-family="Noto Serif Telugu, Noto Sans Telugu, sans-serif" font-size="22" font-weight="700" fill="#3D3540">— తెలుగు సాహిత్య ప్రపంచం</text>
    <text x="${logoMarkBuf ? 132 : 76}" y="568" font-family="Noto Sans, sans-serif" font-size="16" font-weight="600" fill="#6F6970">Read stories, novels &amp; series on Kathavahini</text>

    <!-- Canonical Writer URL Pill Right -->
    <rect x="706" y="518" width="424" height="48" rx="24" fill="#FFFFFF" stroke="#E2D5C5" stroke-width="1.5"/>
    <text x="918" y="548" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#7A284B">${escapeHtml(shortDisplayUrl)}</text>
  </svg>`;

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  if (circularAvatarBuf) {
    composites.push({ input: circularAvatarBuf, left: AVATAR_X, top: AVATAR_Y });
  }
  if (logoMarkBuf) {
    composites.push({ input: logoMarkBuf, left: 76, top: 520 });
  }

  let pipeline = sharpFn(Buffer.from(svg));
  if (composites.length > 0) {
    pipeline = pipeline.composite(composites);
  }
  return await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

export function getLogoCandidates(baseDir: string): string[] {
  return [
    path.resolve(baseDir, 'dist', 'logo.png'),
    path.resolve(baseDir, 'public', 'logo.png'),
  ];
}
