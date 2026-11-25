/**
 * Client-side 1200x630 Editorial Share Card Generator (HTML5 Canvas)
 *
 * Uses the browser's native HarfBuzz/CoreText Telugu text shaping (Noto Serif Telugu / Noto Sans Telugu)
 * to produce crisp 1200x630 JPEG cards for Stories, Novels, Episodes, and Writer Profiles.
 * Enables instant Web Share API file sharing (`navigator.share({ files: [jpegFile], ... })`)
 * and instant preview rendering in ShareModal without waiting for remote crawlers.
 */

export interface StoryShareCardInput {
  id: string;
  contentType: 'story' | 'novel' | 'episode';
  title: string;
  excerpt?: string;
  authorName?: string;
  coverImage?: string;
  canonicalUrl: string;
}

export interface WriterShareCardInput {
  id: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  storiesCount: number;
  totalViews?: number;
  followersCount: number;
  canonicalUrl: string;
}

export interface GeneratedShareCard {
  file: File;
  previewDataUrl: string;
}

const CARD_W = 1200;
const CARD_H = 630;

function formatCompact(num: number): string {
  const n = Math.max(0, Math.floor(Number(num) || 0));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function cleanText(raw: string | undefined): string {
  if (!raw) return '';
  return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const clean = cleanText(text);
  if (!clean) return [];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) {
          current = '';
          break;
        }
      }
      current = word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    const joined = lines.join(' ');
    if (joined.length < clean.length) {
      let last = lines[maxLines - 1].replace(/[.,;:\-\s—]+$/, '');
      while (last.length > 4 && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

function loadCanvasImage(src: string, timeoutMs = 4500): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src || src.startsWith('blob:')) {
      resolve(null);
      return;
    }
    const img = new Image();
    let settled = false;
    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(result);
    };
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => finish(img.naturalWidth > 0 ? img : null);
    img.onerror = () => finish(null);
    img.src = src;
  });
}

async function loadBestImage(candidates: Array<string | undefined>): Promise<HTMLImageElement | null> {
  for (const src of candidates) {
    if (!src) continue;
    const loaded = await loadCanvasImage(src);
    if (loaded) return loaded;
  }
  return null;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  biasY = 0.35
): void {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  const srcAspect = sw / sh;
  const dstAspect = dw / dh;
  let sx = 0;
  let sy = 0;
  let cropW = sw;
  let cropH = sh;

  if (srcAspect > dstAspect) {
    cropW = sh * dstAspect;
    sx = (sw - cropW) / 2;
  } else {
    cropH = sw / dstAspect;
    sy = (sh - cropH) * biasY;
  }

  ctx.drawImage(img, sx, sy, cropW, cropH, dx, dy, dw, dh);
}

async function ensureTeluguFontsReady(): Promise<void> {
  try {
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((r) => setTimeout(r, 800)),
      ]);
    }
  } catch {
    // Non-blocking
  }
}

async function exportCanvasToCard(
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<GeneratedShareCard> {
  const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas JPEG export failed'))),
      'image/jpeg',
      0.9
    );
  });
  const file = new File([blob], fileName, { type: 'image/jpeg' });
  return { file, previewDataUrl };
}

/**
 * Generates a 1200x630 editorial Story / Novel / Episode share card JPEG.
 */
export async function generateStoryShareCard(
  input: StoryShareCardInput
): Promise<GeneratedShareCard> {
  await ensureTeluguFontsReady();

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Prefer same-origin proxy (always CORS-clean & JPEG) or inline data URI
  const sameOriginCover =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/cover/${encodeURIComponent(input.id)}.jpg`
      : '';
  const coverCandidates = input.coverImage?.startsWith('data:image/')
    ? [input.coverImage, sameOriginCover]
    : [sameOriginCover, input.coverImage];

  const [coverImg, logoImg] = await Promise.all([
    loadBestImage(coverCandidates),
    loadCanvasImage('/logo.png', 2000),
  ]);

  // Warm cream editorial backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bgGrad.addColorStop(0, '#FBF8F3');
  bgGrad.addColorStop(1, '#EFE6D8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Main white editorial card
  drawRoundedRect(ctx, 32, 32, 1136, 566, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E5D9CA';
  ctx.stroke();

  // Top burgundy & gold header bar
  ctx.save();
  drawRoundedRect(ctx, 32, 32, 1136, 566, 28);
  ctx.clip();
  const topGrad = ctx.createLinearGradient(32, 32, 1168, 32);
  topGrad.addColorStop(0, '#8B2F56');
  topGrad.addColorStop(1, '#5E1C38');
  ctx.fillStyle = topGrad;
  ctx.fillRect(32, 32, 1136, 30);
  ctx.fillStyle = '#D99A3D';
  ctx.fillRect(32, 42, 1136, 4);

  // Footer band
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(32, 496, 1136, 102);
  ctx.strokeStyle = '#EAE1D6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(64, 496);
  ctx.lineTo(1136, 496);
  ctx.stroke();
  ctx.restore();

  // Left cover artwork box
  const covX = 64;
  const covY = 92;
  const covW = 410;
  const covH = 374;
  ctx.save();
  drawRoundedRect(ctx, covX, covY, covW, covH, 22);
  ctx.clip();
  if (coverImg) {
    drawCoverImage(ctx, coverImg, covX, covY, covW, covH, 0.35);
  } else {
    ctx.fillStyle = '#7A284B';
    ctx.fillRect(covX, covY, covW, covH);
    if (logoImg) {
      ctx.drawImage(logoImg, covX + covW / 2 - 64, covY + covH / 2 - 64, 128, 128);
    }
  }
  ctx.restore();
  drawRoundedRect(ctx, covX, covY, covW, covH, 22);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E5D9CA';
  ctx.stroke();

  // Right column content
  const rightX = 510;
  const rightMaxW = 626;

  // Content type eyebrow pill
  const badgeText =
    input.contentType === 'novel'
      ? 'తెలుగు నవల • KATHAVAHINI'
      : input.contentType === 'episode'
      ? 'ధారావాహిక భాగం • KATHAVAHINI'
      : 'తెలుగు కథ • KATHAVAHINI';
  ctx.font = '700 15px "Noto Sans Telugu", "Noto Sans", sans-serif';
  const badgeW = Math.min(320, ctx.measureText(badgeText).width + 36);
  drawRoundedRect(ctx, rightX, 96, badgeW, 36, 18);
  ctx.fillStyle = '#FAF4EC';
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#E5D6C3';
  ctx.stroke();
  ctx.fillStyle = '#7A284B';
  ctx.fillText(badgeText, rightX + 18, 120);

  // Story Title (up to 2 lines)
  ctx.fillStyle = '#17151A';
  ctx.font = '700 40px "Noto Serif Telugu", "Noto Sans Telugu", serif';
  const titleLines = wrapCanvasText(ctx, input.title, rightMaxW, 2);
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, rightX, 188 + idx * 54);
  });

  // Gold editorial accent line
  const dividerY = 188 + titleLines.length * 54 - 22;
  drawRoundedRect(ctx, rightX, dividerY, 84, 4, 2);
  ctx.fillStyle = '#D99A3D';
  ctx.fill();

  // Short Description / Excerpt (up to 3 lines)
  const excerptText =
    cleanText(input.excerpt) ||
    'కథావాహినిలో ఈ ఆసక్తికరమైన తెలుగు కథను ఉచితంగా చదవండి.';
  ctx.fillStyle = '#4E4752';
  ctx.font = '400 22px "Noto Serif Telugu", "Noto Sans Telugu", sans-serif';
  const descLines = wrapCanvasText(ctx, excerptText, rightMaxW, 3);
  const descStartY = dividerY + 42;
  descLines.forEach((line, idx) => {
    ctx.fillText(line, rightX, descStartY + idx * 34);
  });

  // Author Attribution Row
  const authorLabel = cleanText(input.authorName) || 'Kathavahini Writer';
  const authorY = Math.min(448, Math.max(descStartY + descLines.length * 34 + 28, 396));
  drawRoundedRect(ctx, rightX, authorY - 28, Math.min(rightMaxW, 430), 46, 23);
  ctx.fillStyle = '#F7EFF3';
  ctx.fill();
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 21px "Noto Sans Telugu", "Noto Sans", sans-serif';
  ctx.fillText(`✍  By: ${authorLabel}`, rightX + 18, authorY + 2);

  // Bottom Branding Footer
  let brandX = 68;
  if (logoImg) {
    ctx.drawImage(logoImg, 68, 522, 46, 46);
    brandX = 128;
  }
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 24px "Noto Sans", sans-serif';
  ctx.fillText('Kathavahini.in', brandX, 544);
  ctx.fillStyle = '#3D3540';
  ctx.font = '700 21px "Noto Sans Telugu", sans-serif';
  ctx.fillText(' | తెలుగు కథలు', brandX + 174, 544);
  ctx.fillStyle = '#6F6970';
  ctx.font = '600 15px "Noto Sans", sans-serif';
  ctx.fillText('Read original Telugu stories, novels & series', brandX, 571);

  // Canonical URL Pill Right
  const shortUrl = input.canonicalUrl.replace(/^https?:\/\//i, '');
  const displayUrl = shortUrl.length > 42 ? `${shortUrl.slice(0, 39)}…` : shortUrl;
  drawRoundedRect(ctx, 686, 522, 446, 48, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#E2D5C5';
  ctx.stroke();
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 16px "Noto Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(displayUrl, 909, 551);
  ctx.textAlign = 'left';

  const safeFileId = input.id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 48) || 'story';
  return exportCanvasToCard(canvas, `kathavahini-${safeFileId}.jpg`);
}

/**
 * Generates a 1200x630 editorial Writer Profile Sharing Banner JPEG
 * matching the Kathavahini design identity & server-side /api/author-card/:id.jpg.
 */
export async function generateWriterBannerCard(
  input: WriterShareCardInput
): Promise<GeneratedShareCard> {
  await ensureTeluguFontsReady();

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const sameOriginAvatar =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/avatar/${encodeURIComponent(input.id)}.jpg`
      : '';
  const avatarCandidates = input.avatarUrl?.startsWith('data:image/')
    ? [input.avatarUrl, sameOriginAvatar]
    : [sameOriginAvatar, input.avatarUrl];

  const [avatarImg, logoImg] = await Promise.all([
    loadBestImage(avatarCandidates),
    loadCanvasImage('/logo.png', 2000),
  ]);

  // Warm cream editorial backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bgGrad.addColorStop(0, '#FBF8F3');
  bgGrad.addColorStop(1, '#EFE6D8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Subtle decorative watermark circles
  ctx.fillStyle = 'rgba(122, 40, 75, 0.045)';
  ctx.beginPath();
  ctx.arc(1125, 95, 145, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(217, 154, 61, 0.07)';
  ctx.beginPath();
  ctx.arc(88, 548, 120, 0, Math.PI * 2);
  ctx.fill();

  // Main white editorial card
  drawRoundedRect(ctx, 34, 34, 1132, 562, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E5D9CA';
  ctx.stroke();

  // Clipped header accent + footer band
  ctx.save();
  drawRoundedRect(ctx, 34, 34, 1132, 562, 28);
  ctx.clip();
  const topGrad = ctx.createLinearGradient(34, 34, 1166, 34);
  topGrad.addColorStop(0, '#8B2F56');
  topGrad.addColorStop(1, '#5E1C38');
  ctx.fillStyle = topGrad;
  ctx.fillRect(34, 34, 1132, 32);
  ctx.fillStyle = '#D99A3D';
  ctx.fillRect(34, 42, 1132, 5);

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(34, 492, 1132, 104);
  ctx.strokeStyle = '#EAE1D6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(72, 492);
  ctx.lineTo(1128, 492);
  ctx.stroke();
  ctx.restore();

  // Left circular writer photo with double editorial ring
  const cx = 214;
  const cy = 258;
  const avatarR = 132;

  ctx.beginPath();
  ctx.arc(cx, cy, avatarR + 16, 0, Math.PI * 2);
  ctx.fillStyle = '#FAF7F2';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E8DDD0';
  ctx.stroke();

  const ringGrad = ctx.createLinearGradient(cx - avatarR, cy - avatarR, cx + avatarR, cy + avatarR);
  ringGrad.addColorStop(0, '#7A284B');
  ringGrad.addColorStop(0.55, '#B85378');
  ringGrad.addColorStop(1, '#D99A3D');
  ctx.beginPath();
  ctx.arc(cx, cy, avatarR + 7, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = ringGrad;
  ctx.stroke();

  if (avatarImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
    ctx.clip();
    drawCoverImage(ctx, avatarImg, cx - avatarR, cy - avatarR, avatarR * 2, avatarR * 2, 0.25);
    ctx.restore();
  } else {
    const monoGrad = ctx.createLinearGradient(cx - avatarR, cy - avatarR, cx + avatarR, cy + avatarR);
    monoGrad.addColorStop(0, '#8B2F56');
    monoGrad.addColorStop(1, '#5E1C38');
    ctx.beginPath();
    ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = monoGrad;
    ctx.fill();
    const initial = (cleanText(input.displayName)[0] || 'క').toUpperCase();
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '700 96px "Noto Serif Telugu", "Noto Sans", serif';
    ctx.textAlign = 'center';
    ctx.fillText(initial, cx, cy + 34);
    ctx.textAlign = 'left';
  }

  // Subtle Telugu writer label under avatar
  drawRoundedRect(ctx, 112, 420, 204, 34, 17);
  ctx.fillStyle = 'rgba(122, 40, 75, 0.1)';
  ctx.fill();
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 16px "Noto Sans Telugu", "Noto Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('కథావాహిని రచయిత', 214, 443);
  ctx.textAlign = 'left';

  // Right column eyebrow + conditional verified badge (ONLY if isVerified === true)
  drawRoundedRect(ctx, 408, 92, 236, 34, 17);
  ctx.fillStyle = '#FAF4EC';
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#E5D6C3';
  ctx.stroke();
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 13px "Noto Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WRITER ON KATHAVAHINI', 526, 114);
  ctx.textAlign = 'left';

  if (input.isVerified === true) {
    drawRoundedRect(ctx, 658, 92, 138, 34, 17);
    ctx.fillStyle = '#7A284B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(678, 109, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#D99A3D';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(673.5, 109);
    ctx.lineTo(676.8, 112.2);
    ctx.lineTo(683, 106);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 13px "Noto Sans", sans-serif';
    ctx.fillText('VERIFIED', 696, 114);
  }

  // Writer Display Name
  const nameText = cleanText(input.displayName) || 'కథావాహిని రచయిత';
  const shortName = nameText.length > 28 ? `${nameText.slice(0, 27)}…` : nameText;
  ctx.fillStyle = '#17151A';
  ctx.font = '700 46px "Noto Serif Telugu", "Noto Sans Telugu", serif';
  ctx.fillText(shortName, 408, 194, 720);

  // Gold accent bar
  drawRoundedRect(ctx, 408, 214, 84, 4, 2);
  ctx.fillStyle = '#D99A3D';
  ctx.fill();

  // Short Biography (up to 3 lines)
  const bioText =
    cleanText(input.bio) || 'తెలుగు కథలు, నవలలు మరియు సాహిత్య భావాలతో కూడిన రచనలు.';
  ctx.fillStyle = '#4E4752';
  ctx.font = '400 22px "Noto Sans Telugu", "Noto Serif Telugu", sans-serif';
  const bioLines = wrapCanvasText(ctx, bioText, 710, 3);
  bioLines.forEach((line, idx) => {
    ctx.fillText(line, 408, 258 + idx * 35);
  });

  // Real Writer Stats Chips Row
  const statLabels: string[] = [`${Math.max(0, input.storiesCount)} కథలు`];
  if (input.totalViews && input.totalViews > 0) {
    statLabels.push(`${formatCompact(input.totalViews)} వీక్షణలు`);
  }
  statLabels.push(`${formatCompact(input.followersCount)} అనుచరులు`);

  let statX = 408;
  ctx.font = '700 20px "Noto Sans Telugu", "Noto Sans", sans-serif';
  for (const label of statLabels) {
    const measured = ctx.measureText(label).width;
    const chipW = Math.max(156, Math.min(238, measured + 54));
    drawRoundedRect(ctx, statX, 380, chipW, 52, 14);
    ctx.fillStyle = '#FAF7F2';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#E5D9CA';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(statX + 22, 406, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#7A284B';
    ctx.fill();

    ctx.fillStyle = '#17151A';
    ctx.fillText(label, statX + 38, 413);
    statX += chipW + 16;
  }

  // Bottom Branding Footer
  let brandX = 76;
  if (logoImg) {
    ctx.drawImage(logoImg, 76, 520, 44, 44);
    brandX = 132;
  }
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 25px "Noto Sans", sans-serif';
  ctx.fillText('Kathavahini', brandX, 539);
  ctx.fillStyle = '#3D3540';
  ctx.font = '700 22px "Noto Serif Telugu", "Noto Sans Telugu", sans-serif';
  ctx.fillText('— తెలుగు సాహిత్య ప్రపంచం', brandX + 156, 539);
  ctx.fillStyle = '#6F6970';
  ctx.font = '600 16px "Noto Sans", sans-serif';
  ctx.fillText('Read stories, novels & series on Kathavahini', brandX, 568);

  // Canonical Profile URL Pill
  const shortUrl = input.canonicalUrl.replace(/^https?:\/\//i, '');
  const displayUrl = shortUrl.length > 44 ? `${shortUrl.slice(0, 41)}…` : shortUrl;
  drawRoundedRect(ctx, 706, 518, 424, 48, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#E2D5C5';
  ctx.stroke();
  ctx.fillStyle = '#7A284B';
  ctx.font = '700 16px "Noto Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(displayUrl, 918, 548);
  ctx.textAlign = 'left';

  const safeFileId = input.id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 48) || 'writer';
  return exportCanvasToCard(canvas, `kathavahini-writer-${safeFileId}.jpg`);
}
