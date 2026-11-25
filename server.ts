import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { ViteDevServer } from 'vite';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  resolveContentMeta,
  injectMetaIntoHtml,
  isSocialCrawler,
  generateCrawlerPreviewHtml,
  isCustomUploadedPhoto,
  normalizeSocialAvatarUrl
} from './src/server/metaHandler.ts';
import {
  resolveWriterBannerProfile,
  renderWriterBannerJpeg,
  getLogoCandidates,
} from './src/server/authorBanner.ts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase.ts';

interface CachedBinary {
  buf: Buffer;
  mimeType: string;
  ts: number;
}
const ogImageCache = new Map<string, CachedBinary>();
const OG_IMAGE_CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedImage(key: string): CachedBinary | null {
  const entry = ogImageCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > OG_IMAGE_CACHE_TTL_MS) {
    ogImageCache.delete(key);
    return null;
  }
  return entry;
}

function setCachedImage(key: string, buf: Buffer, mimeType: string): void {
  if (ogImageCache.size > 120) {
    const oldestKey = ogImageCache.keys().next().value;
    if (oldestKey) ogImageCache.delete(oldestKey);
  }
  ogImageCache.set(key, { buf, mimeType, ts: Date.now() });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const distDir = path.resolve(__dirname, 'dist');
const distIndexPath = path.resolve(distDir, 'index.html');
const publicDir = path.resolve(__dirname, 'public');
const hasDistBuild = fs.existsSync(distIndexPath);
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

// Static file extensions that MUST return 404 if missing (never index.html!)
const STATIC_ASSET_EXT_RE = /\.(?:js|mjs|cjs|css|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|otf|json|xml|txt|pdf|mp3|mp4|webm)$/i;

function stripImageExtension(rawId: string): string {
  return decodeURIComponent(rawId || '').trim().replace(/\.(jpe?g|png|webp)$/i, '');
}

function parseBase64DataUrl(src: string): { mimeType: string; buf: Buffer } | null {
  const match = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/i);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { mimeType, buf: Buffer.from(match[2], 'base64') };
}

let cachedSharpModule: any | null | undefined = undefined;

async function getSharp(): Promise<any | null> {
  if (cachedSharpModule !== undefined) return cachedSharpModule;
  try {
    const mod = await import('sharp');
    cachedSharpModule = mod.default || mod;
  } catch (err) {
    console.warn('Sharp image optimizer unavailable, serving original image buffer:', err);
    cachedSharpModule = null;
  }
  return cachedSharpModule;
}

const ALLOWED_IMAGE_HOSTS = new Set([
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
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Convert images to WhatsApp-universal JPEG (1200x630 cover / 512x512 avatar)
 * so WhatsApp iOS/Android, Facebook, Telegram, LinkedIn, and iMessage always render crisp thumbnails.
 * Uses lazy sharp import so the server never crashes if native binaries are unavailable.
 */
async function toSocialJpeg(
  buf: Buffer,
  mimeType: string,
  kind: 'cover' | 'avatar'
): Promise<{ mimeType: string; buf: Buffer }> {
  try {
    const sharpFn = await getSharp();
    if (!sharpFn) {
      return { mimeType, buf };
    }
    const maxW = kind === 'cover' ? 1200 : 512;
    const maxH = kind === 'cover' ? 630 : 512;
    const converted = await sharpFn(buf)
      .resize(maxW, maxH, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    return { mimeType: 'image/jpeg', buf: converted };
  } catch (err) {
    console.warn('Sharp JPEG conversion fallback:', err);
    return { mimeType, buf };
  }
}

function sendFallbackLogo(res: Response) {
  const distLogo = path.resolve(distDir, 'logo.png');
  const publicLogo = path.resolve(publicDir, 'logo.png');
  const fallbackLogo = fs.existsSync(distLogo) ? distLogo : publicLogo;
  if (fs.existsSync(fallbackLogo)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(fallbackLogo);
  }
  return res.status(404).send('Image not found');
}

function resolveRequestOrigin(req: Request): string {
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : (protoHeader || req.protocol || 'http');
  const hostHeader = req.headers['x-forwarded-host'];
  const host = Array.isArray(hostHeader) ? hostHeader[0] : (hostHeader || req.get('host') || `localhost:${PORT}`);
  return `${String(proto).split(',')[0].trim()}://${String(host).split(',')[0].trim()}`;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.set('trust proxy', true);

  let vite: ViteDevServer | null = null;
  let servingProductionDist = isProd;

  // 0. Health check endpoint for live backend verification
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      mode: servingProductionDist ? 'production' : 'development',
      projectId: 'kathavahini-9a9c1',
      hasDistBuild: fs.existsSync(distIndexPath),
    });
  });

  // 1. Public binary image endpoints for covers, avatars & 1200x630 writer banners (WhatsApp-compatible JPEG, accessible without auth)
  app.get('/api/cover/:id', async (req: Request, res: Response) => {
    const id = stripImageExtension(req.params.id || '');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const cacheKey = `cover:${id}`;
    const cached = id ? getCachedImage(cacheKey) : null;
    if (cached) {
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Content-Length', String(cached.buf.length));
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cached.buf);
    }

    try {
      if (id) {
        let snap = await getDoc(doc(db, 'stories', id));
        if (!snap.exists()) snap = await getDoc(doc(db, 'novels', id));
        if (!snap.exists()) snap = await getDoc(doc(db, 'episodes', id));

        if (snap.exists()) {
          const data = snap.data();
          const isPrivate =
            data.deleted === true ||
            data.status === 'deleted' ||
            data.status === 'draft' ||
            data.status === 'pending' ||
            data.status === 'rejected' ||
            data.visibility === 'hidden' ||
            data.visibility === 'private';
          if (isPrivate) {
            return sendFallbackLogo(res);
          }

          let cover = data.coverImage || data.coverImageUrl || data.coverImageURL;

          // If episode lacks its own cover, check parent novel
          if ((!cover || typeof cover !== 'string') && data.novelId) {
            const parentSnap = await getDoc(doc(db, 'novels', data.novelId));
            if (parentSnap.exists()) {
              const pData = parentSnap.data();
              cover = pData.coverImage || pData.coverImageUrl || pData.coverImageURL;
            }
          }

          if (cover && typeof cover === 'string') {
            const trimmed = cover.trim();
            if (trimmed.startsWith('data:image/')) {
              const parsed = parseBase64DataUrl(trimmed);
              if (parsed) {
                const finalImg = await toSocialJpeg(parsed.buf, parsed.mimeType, 'cover');
                setCachedImage(cacheKey, finalImg.buf, finalImg.mimeType);
                res.setHeader('Content-Type', finalImg.mimeType);
                res.setHeader('Content-Length', String(finalImg.buf.length));
                res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
                return res.status(200).send(finalImg.buf);
              }
            } else if (isAllowedImageUrl(trimmed)) {
              try {
                const upstream = await fetch(trimmed, { redirect: 'manual' });
                if (upstream.ok) {
                  const rawBuf = Buffer.from(await upstream.arrayBuffer());
                  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
                  const finalImg = await toSocialJpeg(rawBuf, contentType, 'cover');
                  setCachedImage(cacheKey, finalImg.buf, finalImg.mimeType);
                  res.setHeader('Content-Type', finalImg.mimeType);
                  res.setHeader('Content-Length', String(finalImg.buf.length));
                  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
                  return res.status(200).send(finalImg.buf);
                }
              } catch {}
              return res.redirect(302, trimmed);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Cover proxy error:', err);
    }

    return sendFallbackLogo(res);
  });

  // Dynamic 1200x630 Editorial Writer Profile Banner JPEG
  app.get('/api/author-card/:id', async (req: Request, res: Response) => {
    const id = stripImageExtension(req.params.id || '');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const cacheKey = `author-card:${id}`;
    const cached = id ? getCachedImage(cacheKey) : null;
    if (cached) {
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Content-Length', String(cached.buf.length));
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cached.buf);
    }

    try {
      if (id) {
        const origin = resolveRequestOrigin(req);
        const profile = await resolveWriterBannerProfile(id, origin);
        if (profile) {
          const bannerBuf = await renderWriterBannerJpeg(profile, getLogoCandidates(__dirname));
          if (bannerBuf && bannerBuf.length > 0) {
            setCachedImage(cacheKey, bannerBuf, 'image/jpeg');
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', String(bannerBuf.length));
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
            return res.status(200).send(bannerBuf);
          }
        }
      }
    } catch (err) {
      console.warn('Author banner generation error:', err);
    }

    return sendFallbackLogo(res);
  });

  // Instant Pre-Warm Endpoint — called silently when user opens a story/novel/episode/author page
  app.get('/api/og-warm', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const type = String(req.query.type || '').toLowerCase().trim();
    const id = String(req.query.id || '').trim();
    if (!type || !id) {
      return res.status(400).json({ ok: false });
    }

    const origin = resolveRequestOrigin(req);
    try {
      if (type === 'author' || type === 'profile') {
        const cacheKey = `author-card:${id}`;
        if (!getCachedImage(cacheKey)) {
          const profile = await resolveWriterBannerProfile(id, origin);
          if (profile) {
            const bannerBuf = await renderWriterBannerJpeg(profile, getLogoCandidates(__dirname));
            if (bannerBuf && bannerBuf.length > 0) {
              setCachedImage(cacheKey, bannerBuf, 'image/jpeg');
            }
          }
        }
        return res.status(200).json({ ok: true, type: 'author', id });
      }

      const meta = await resolveContentMeta(
        {
          storyId: type === 'story' ? id : null,
          novelId: type === 'novel' ? id : null,
          episodeId: type === 'episode' ? id : null,
        },
        origin
      );
      return res.status(200).json({ ok: true, type, id, imageUrl: meta.imageUrl });
    } catch {
      return res.status(200).json({ ok: false });
    }
  });

  app.get('/api/avatar/:id', async (req: Request, res: Response) => {
    const id = stripImageExtension(req.params.id || '');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      if (id) {
        // Fetch users, writers, and authors in parallel so custom updated profile photos always take priority
        const [userSnap, writerSnap, authorSnap] = await Promise.all([
          getDoc(doc(db, 'users', id)).catch(() => null),
          getDoc(doc(db, 'writers', id)).catch(() => null),
          getDoc(doc(db, 'authors', id)).catch(() => null),
        ]);

        const docs = [
          userSnap?.exists() ? userSnap.data() : null,
          writerSnap?.exists() ? writerSnap.data() : null,
          authorSnap?.exists() ? authorSnap.data() : null,
        ];

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

        // Prioritize custom uploaded profile photograph over default Dicebear icon
        const chosen =
          candidates.find(c => isCustomUploadedPhoto(c)) ||
          candidates.find(c => c.startsWith('https://') || c.startsWith('http://'));

        if (chosen) {
          if (chosen.startsWith('data:image/')) {
            const parsed = parseBase64DataUrl(chosen);
            if (parsed) {
              const finalImg = await toSocialJpeg(parsed.buf, parsed.mimeType, 'avatar');
              res.setHeader('Content-Type', finalImg.mimeType);
              res.setHeader('Content-Length', String(finalImg.buf.length));
              res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
              return res.status(200).send(finalImg.buf);
            }
          } else if (chosen.startsWith('https://') || chosen.startsWith('http://')) {
            return res.redirect(302, normalizeSocialAvatarUrl(chosen));
          }
        }
      }
    } catch (err) {
      console.warn('Avatar proxy error:', err);
    }

    return sendFallbackLogo(res);
  });

  // 2. Dedicated preview endpoint (/share/*)
  app.get(['/share', '/share/*'], async (req: Request, res: Response) => {
    const origin = resolveRequestOrigin(req);
    const isCrawler = isSocialCrawler(req.headers['user-agent']);

    const storyId = (req.query.story as string) || (req.path.startsWith('/share/story/') ? decodeURIComponent(req.path.split('/share/story/')[1] || '') : null);
    const novelId = (req.query.novel as string) || (req.path.startsWith('/share/novel/') ? decodeURIComponent(req.path.split('/share/novel/')[1] || '') : null);
    const authorId =
      ((req.query.author || req.query.writer || req.query.profile) as string) ||
      (req.path.startsWith('/share/author/') ? decodeURIComponent(req.path.split('/share/author/')[1] || '') : null) ||
      (req.path.startsWith('/share/profile/') ? decodeURIComponent(req.path.split('/share/profile/')[1] || '') : null);
    const episodeId = (req.query.episode as string) || (req.path.startsWith('/share/episode/') ? decodeURIComponent(req.path.split('/share/episode/')[1] || '') : null);
    const isReader = req.query.reader === 'true' || Boolean(episodeId);

    const meta = await resolveContentMeta({ storyId, novelId, authorId, episodeId, isReader }, origin);
    const html = generateCrawlerPreviewHtml(meta, { includeBrowserRedirect: !isCrawler });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.status(200).send(html);
  });

  // 3. Mount Vite Dev Server in development, or immutable static assets in production
  if (!servingProductionDist) {
    try {
      const { createServer: createViteServer } = await import('vite');
      vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        },
        appType: 'custom'
      });
      app.use(vite.middlewares);
    } catch (err) {
      if (fs.existsSync(distIndexPath)) {
        console.warn('Vite dev server unavailable, falling back to production dist/ build.');
        servingProductionDist = true;
      } else {
        throw err;
      }
    }
  }

  if (servingProductionDist) {
    app.use(
      '/assets',
      express.static(path.resolve(distDir, 'assets'), {
        maxAge: '1y',
        immutable: true,
        fallthrough: false,
      })
    );
    // Return clean 404 (not index.html!) if a hashed JS/CSS chunk under /assets is missing
    app.use('/assets', (err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (err && (err.status === 404 || err.statusCode === 404 || err.code === 'ENOENT')) {
        return res.status(404).type('text/plain').send('Asset not found');
      }
      return res.status(404).type('text/plain').send('Asset not found');
    });

    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    if (fs.existsSync(publicDir)) {
      app.use(express.static(publicDir, { index: false, maxAge: '1h' }));
    }
  }

  // 4. Universal SPA + Social Crawler Route Handler
  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    const origin = resolveRequestOrigin(req);

    // Parse URL safely
    let urlObj: URL;
    try {
      urlObj = new URL(url, origin);
    } catch {
      urlObj = new URL('/', origin);
    }
    const pathname = urlObj.pathname;

    // CRITICAL: Never serve HTML index.html for missing static files or unknown /api routes!
    // Serving text/html for a missing .js/.css chunk causes browsers to fail with a blank white screen.
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/assets/') ||
      STATIC_ASSET_EXT_RE.test(pathname)
    ) {
      return res.status(404).type('text/plain').send('Not found');
    }

    const userAgent = req.headers['user-agent'] || '';
    const isCrawler = isSocialCrawler(userAgent);
    const params = urlObj.searchParams;

    const pathSegments = pathname.split('/').filter(Boolean);
    const segmentType = pathSegments[0] || '';
    const segmentId = pathSegments[1] ? decodeURIComponent(pathSegments[1]) : null;

    const storyId = params.get('story') || (segmentType === 'story' ? segmentId : null);
    const novelId = params.get('novel') || (segmentType === 'novel' ? segmentId : null);
    const authorId =
      params.get('author') ||
      params.get('writer') ||
      params.get('profile') ||
      params.get('user') ||
      (segmentType === 'author' || segmentType === 'profile' ? segmentId : null);
    const episodeId = params.get('episode') || (segmentType === 'episode' ? segmentId : null);
    const isReader = params.get('reader') === 'true' || Boolean(episodeId);

    const hasSpecificContent = Boolean(storyId || novelId || authorId || episodeId);

    // If social crawler requests content: serve standalone crawler HTML with rich OG tags (HTTP 200, NO redirect)
    if (isCrawler && hasSpecificContent) {
      const meta = await resolveContentMeta({ storyId, novelId, authorId, episodeId, isReader }, origin);
      const crawlerHtml = generateCrawlerPreviewHtml(meta, { includeBrowserRedirect: false });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      return res.status(200).send(crawlerHtml);
    }

    // For Human Browsers or general requests: serve index.html with server-injected OG tags
    try {
      const templatePath = servingProductionDist
        ? distIndexPath
        : path.resolve(__dirname, 'index.html');

      if (!fs.existsSync(templatePath)) {
        return res.status(503).type('text/plain').send('Application build not found. Run npm run build first.');
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      if (hasSpecificContent) {
        const meta = await resolveContentMeta({ storyId, novelId, authorId, episodeId, isReader }, origin);
        template = injectMetaIntoHtml(template, meta);
      }

      if (vite && !servingProductionDist) {
        template = await vite.transformIndexHtml(url, template);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(200).send(template);
    } catch (err) {
      if (vite) {
        vite.ssrFixStacktrace(err as Error);
      }
      next(err);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Kathavahini full-stack server running at http://0.0.0.0:${PORT} (${servingProductionDist ? 'production' : 'development'})`
    );
  });
}

startServer().catch(err => {
  console.error('Failed to start Kathavahini server:', err);
  process.exit(1);
});
