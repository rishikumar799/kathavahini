/**
 * Consistent Avatar & Identity Resolution Utilities
 * - Shows updated real profile image if user/writer uploaded one
 * - If not updated, replaces placeholder cartoon faces with clean, elegant initial monogram icons
 */

const BRAND_AVATAR_PALETTES = [
  { bg: '#7A284B', text: '#FFFFFF' }, // Kathavahini Signature Berry
  { bg: '#1E3A8A', text: '#FFFFFF' }, // Deep Royal Blue
  { bg: '#047857', text: '#FFFFFF' }, // Rich Emerald
  { bg: '#92400E', text: '#FFFFFF' }, // Warm Amber / Bronze
  { bg: '#6D28D9', text: '#FFFFFF' }, // Deep Violet
  { bg: '#BE185D', text: '#FFFFFF' }, // Crimson Rose
  { bg: '#0F766E', text: '#FFFFFF' }, // Dark Teal
  { bg: '#C2410C', text: '#FFFFFF' }, // Warm Terracotta
];

/**
 * Checks whether an avatar candidate is a real, custom-uploaded profile image
 * (e.g. Base64 data URL, Firebase Storage upload, or custom photo).
 * Filters out DiceBear cartoon generators and dummy placeholders.
 */
export function isCustomUploadedAvatar(avatar?: string | null): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  const trimmed = avatar.trim();
  if (trimmed.length < 10) return false;
  
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('dicebear.com') ||
    lower.includes('ui-avatars.com') ||
    lower.includes('avatar.iran.liara.run') ||
    lower.includes('seed=random') ||
    lower.includes('robohash.org')
  ) {
    return false;
  }
  return true;
}

/**
 * Generate an elegant inline SVG avatar monogram using the user's name initial
 */
export function getInitialAvatar(name?: string, bgHex?: string, textHex: string = '#FFFFFF'): string {
  const cleanName = (name || '').trim();
  let initial = 'క';
  if (cleanName) {
    const chars = Array.from(cleanName);
    initial = chars[0] ? chars[0].toUpperCase() : 'క';
  }

  // Deterministically select a branded color if not specified
  let selectedBg = bgHex;
  if (!selectedBg) {
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BRAND_AVATAR_PALETTES.length;
    selectedBg = BRAND_AVATAR_PALETTES[index].bg;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="30" fill="${selectedBg}" />
    <text x="50" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="'Noto Serif Telugu', 'Noto Sans Telugu', system-ui, -apple-system, sans-serif" font-weight="bold" font-size="44" fill="${textHex}">
      ${initial}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Resolve avatar image URL safely.
 * - If user updated their profile with a real image: return the updated image
 * - If user has NOT updated their profile (or has only cartoon dicebear): return the monogram icon
 */
export function resolveAvatarUrl(avatarCandidate?: string | null, name?: string): string {
  if (isCustomUploadedAvatar(avatarCandidate)) {
    return avatarCandidate!.trim();
  }
  return getInitialAvatar(name);
}

/**
 * Resolve author display name safely
 */
export function resolveAuthorName(author?: { name?: string; teluguName?: string; displayName?: string; penName?: string } | null, fallback: string = 'కథావాహిని రచయిత'): string {
  if (!author) return fallback;
  return author.teluguName || author.penName || author.displayName || author.name || fallback;
}
