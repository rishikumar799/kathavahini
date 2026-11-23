import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
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
} from './src/server/metaHandler';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function parseBase64DataUrl(src: string): { mimeType: string; buf: Buffer } | null {
  const match = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/i);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { mimeType, buf: Buffer.from(match[2], 'base64') };
}

function sendFallbackLogo(res: Response) {
  const fallbackLogo = path.resolve(__dirname, 'public/logo.png');
  if (fs.existsSync(fallbackLogo)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(fallbackLogo);
  }
  return res.status(404).send('Image not found');
}

async function startServer() {
  const app = express();
  let vite: ViteDevServer | null = null;

  // 1. Public binary image endpoints for base64 & remote covers / avatars (accessible by WhatsApp/Facebook without auth)
  app.get('/api/cover/:id', async (req: Request, res: Response) => {
    const id = decodeURIComponent(req.params.id || '').trim();
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      if (id) {
        let snap = await getDoc(doc(db, 'stories', id));
        if (!snap.exists()) snap = await getDoc(doc(db, 'novels', id));
        if (!snap.exists()) snap = await getDoc(doc(db, 'episodes', id));

        if (snap.exists()) {
          const data = snap.data();
          let cover = data.coverImage || data.coverImageUrl;

          // If episode lacks its own cover, check parent novel
          if ((!cover || typeof cover !== 'string') && data.novelId) {
            const parentSnap = await getDoc(doc(db, 'novels', data.novelId));
            if (parentSnap.exists()) {
              const pData = parentSnap.data();
              cover = pData.coverImage || pData.coverImageUrl;
            }
          }

          if (cover && typeof cover === 'string') {
            const trimmed = cover.trim();
            if (trimmed.startsWith('data:image/')) {
              const parsed = parseBase64DataUrl(trimmed);
              if (parsed) {
                res.setHeader('Content-Type', parsed.mimeType);
                res.setHeader('Content-Length', String(parsed.buf.length));
                res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
                return res.status(200).send(parsed.buf);
              }
            } else if ((trimmed.startsWith('https://') || trimmed.startsWith('http://')) && !trimmed.startsWith('blob:')) {
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

  app.get('/api/avatar/:id', async (req: Request, res: Response) => {
    const id = decodeURIComponent(req.params.id || '').trim();
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
              res.setHeader('Content-Type', parsed.mimeType);
              res.setHeader('Content-Length', String(parsed.buf.length));
              res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
              return res.status(200).send(parsed.buf);
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
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const origin = `${proto}://${host}`;
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

  // 3. Mount Vite Dev Server middleware in development, or immutable static assets in production
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      '/assets',
      express.static(path.resolve(__dirname, 'dist/assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false, maxAge: '1h' }));
  }

  // 4. Universal route handler for Crawlers & Browsers
  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    const userAgent = req.headers['user-agent'] || '';
    const isCrawler = isSocialCrawler(userAgent);

    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const origin = `${proto}://${host}`;

    // Extract potential entity IDs from search params or clean paths
    const urlObj = new URL(url, origin);
    const params = urlObj.searchParams;
    const pathname = urlObj.pathname;

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
      const templatePath = isProd
        ? path.resolve(__dirname, 'dist/index.html')
        : path.resolve(__dirname, 'index.html');

      if (!fs.existsSync(templatePath)) {
        return res.status(404).send('Application build not found. Please build or run dev.');
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      if (hasSpecificContent) {
        const meta = await resolveContentMeta({ storyId, novelId, authorId, episodeId, isReader }, origin);
        template = injectMetaIntoHtml(template, meta);
      }

      if (vite && !isProd) {
        template = await vite.transformIndexHtml(url, template);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(template);
    } catch (err) {
      if (vite) {
        vite.ssrFixStacktrace(err as Error);
      }
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kathavahini full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Kathavahini server:', err);
  process.exit(1);
});
