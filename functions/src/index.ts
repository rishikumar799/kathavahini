import * as functions from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Core engine to check and publish scheduled content across collections
 * Idempotent, safe against re-execution, and validates strict status/visibility conditions.
 */
export async function executeScheduledPublication(): Promise<{
  publishedStories: number;
  publishedNovels: number;
  publishedEpisodes: number;
  publishedJokes: number;
  publishedKnowledge: number;
  publishedAnnouncements: number;
  timestamp: string;
}> {
  const now = admin.firestore.Timestamp.now();
  const nowISO = new Date(now.toMillis()).toISOString();
  const todayDateStr = nowISO.split('T')[0];

  let publishedStories = 0;
  let publishedNovels = 0;
  let publishedEpisodes = 0;
  let publishedJokes = 0;
  let publishedKnowledge = 0;

  // 1. Process Scheduled Stories
  const storiesSnap = await db
    .collection('stories')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of storiesSnap.docs) {
    const data = docSnap.data();

    // Check if the scheduled time has arrived
    const scheduledAtTs = data.scheduledPublishAt || data.scheduledAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    // Safety checks: do NOT publish if visibility is hidden/private or time not reached
    if (isTimeReached && data.visibility !== 'hidden' && data.visibility !== 'private') {
      const batch = db.batch();

      batch.update(docSnap.ref, {
        status: 'published',
        visibility: 'public',
        publishedAt: todayDateStr,
        publishedTimestamp: now,
        updatedAt: now,
      });

      // Update author's published story count
      if (data.authorId) {
        const authorRef = db.collection('users').doc(data.authorId);
        batch.set(
          authorRef,
          { publishedCount: admin.firestore.FieldValue.increment(1) },
          { merge: true }
        );
      }

      // Add audit log record
      const auditRef = db.collection('adminAuditLogs').doc();
      batch.set(auditRef, {
        action: 'story_published_by_scheduler',
        targetType: 'story',
        targetId: docSnap.id,
        targetTitle: `Story "${data.title || data.teluguTitle || docSnap.id}" auto-published by backend scheduler`,
        performedBy: 'system_scheduler',
        performedByEmail: 'scheduler@kathavahini.internal',
        timestamp: now,
        metadata: {
          scheduledAt: scheduledAtTs,
          publishedAt: nowISO,
        },
      });

      await batch.commit();
      publishedStories++;
    }
  }

  // 2. Process Scheduled Novels
  const novelsSnap = await db
    .collection('novels')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of novelsSnap.docs) {
    const data = docSnap.data();
    const scheduledAtTs = data.scheduledPublishAt || data.scheduledAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    if (isTimeReached && data.visibility !== 'hidden' && data.visibility !== 'private') {
      await docSnap.ref.update({
        status: 'published',
        visibility: 'public',
        publishedAt: todayDateStr,
        updatedAt: now,
      });
      publishedNovels++;
    }
  }

  // 3. Process Scheduled Episodes
  const episodesSnap = await db
    .collection('episodes')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of episodesSnap.docs) {
    const data = docSnap.data();
    const scheduledAtTs = data.scheduledPublishAt || data.scheduledAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    if (isTimeReached && data.visibility !== 'hidden' && data.visibility !== 'private') {
      await docSnap.ref.update({
        status: 'published',
        visibility: 'public',
        publishedAt: todayDateStr,
        updatedAt: now,
      });
      publishedEpisodes++;
    }
  }

  // 4. Process Scheduled Jokes
  const jokesSnap = await db
    .collection('jokes')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of jokesSnap.docs) {
    const data = docSnap.data();
    const scheduledAtTs = data.scheduledPublishAt || data.scheduledAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    if (isTimeReached && data.visibility !== 'hidden' && data.visibility !== 'private') {
      await docSnap.ref.update({
        status: 'published',
        visibility: 'public',
        publishedAt: todayDateStr,
        updatedAt: now,
      });
      publishedJokes++;
    }
  }

  // 5. Process Scheduled Knowledge Articles
  const knowledgeSnap = await db
    .collection('knowledge')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of knowledgeSnap.docs) {
    const data = docSnap.data();
    const scheduledAtTs = data.scheduledPublishAt || data.scheduledAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    if (isTimeReached && data.visibility !== 'hidden' && data.visibility !== 'private') {
      await docSnap.ref.update({
        status: 'published',
        visibility: 'public',
        publishedAt: todayDateStr,
        updatedAt: now,
      });
      publishedKnowledge++;
    }
  }

  // 6. Process Scheduled Announcements
  let publishedAnnouncements = 0;
  const announcementsSnap = await db
    .collection('announcements')
    .where('status', '==', 'scheduled')
    .get();

  for (const docSnap of announcementsSnap.docs) {
    const data = docSnap.data();
    const scheduledAtTs = data.scheduledAt || data.startAt;
    let isTimeReached = false;

    if (scheduledAtTs instanceof admin.firestore.Timestamp) {
      isTimeReached = scheduledAtTs.toMillis() <= now.toMillis();
    } else if (typeof scheduledAtTs === 'string') {
      isTimeReached = new Date(scheduledAtTs).getTime() <= now.toMillis();
    }

    if (isTimeReached) {
      await docSnap.ref.update({
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      });
      publishedAnnouncements++;
    }
  }

  // 7. Check for Expired Published Announcements (endAt <= now)
  const publishedAnnouncementsSnap = await db
    .collection('announcements')
    .where('status', '==', 'published')
    .get();

  for (const docSnap of publishedAnnouncementsSnap.docs) {
    const data = docSnap.data();
    if (data.endAt) {
      const endAtTs = data.endAt;
      let isExpired = false;
      if (endAtTs instanceof admin.firestore.Timestamp) {
        isExpired = endAtTs.toMillis() <= now.toMillis();
      } else if (typeof endAtTs === 'string') {
        isExpired = new Date(endAtTs).getTime() <= now.toMillis();
      }

      if (isExpired) {
        await docSnap.ref.update({
          status: 'archived',
          updatedAt: now,
        });
      }
    }
  }

  return {
    publishedStories,
    publishedNovels,
    publishedEpisodes,
    publishedJokes,
    publishedKnowledge,
    publishedAnnouncements,
    timestamp: nowISO,
  };
}

/**
 * Cloud Scheduler Trigger: Runs every 5 minutes automatically on the backend
 */
export const publishScheduledContent = functions.onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Kolkata',
    retryCount: 3,
    memory: '256MiB',
  },
  async (event: any) => {
    console.log('Starting automated scheduled content publisher at:', event.scheduleTime);
    const result = await executeScheduledPublication();
    console.log('Automated scheduler execution summary:', result);
  }
);

/**
 * HTTPS Trigger for manual administrative trigger or webhook invocation
 */
export const publishScheduledContentHttp = onRequest(
  {
    cors: true,
    region: 'us-central1',
  },
  async (req: any, res: any) => {
    try {
      const result = await executeScheduledPublication();
      res.status(200).json({
        success: true,
        message: 'Scheduled content evaluated and published successfully.',
        data: result,
      });
    } catch (err: any) {
      console.error('Error executing scheduled publisher HTTP handler:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Internal error in scheduled publisher',
      });
    }
  }
);

const CRAWLER_UA_LIST = [
  'facebookexternalhit',
  'facebot',
  'whatsapp',
  'twitterbot',
  'telegrambot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'skypeuripreview',
  'googlebot',
  'bingbot',
  'applebot',
  'pinterest',
  'redditbot',
  'viber',
  'vkshare',
  'w3c_validator',
  'metainspector',
  'embedly',
  'iframely',
  'bitlybot'
];

function isSocialCrawlerUA(ua: string | undefined): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return CRAWLER_UA_LIST.some(bot => lower.includes(bot));
}

function sanitizePublicMetaText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/(?:\+?\d[\d\s\-()]{8,}\d)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectMimeType(src: string): string {
  if (!src) return 'image/png';
  const match = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/i);
  if (match) {
    const ext = match[1].toLowerCase();
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

function normalizeAvatarForCrawler(url: string): string {
  if (!url) return '';
  if (url.includes('api.dicebear.com') && url.includes('/svg')) {
    const pngUrl = url.replace('/svg', '/png');
    return pngUrl.includes('size=') ? pngUrl : `${pngUrl}${pngUrl.includes('?') ? '&' : '?'}size=512`;
  }
  return url;
}

function isCustomPhoto(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('api.dicebear.com')) return false;
    if (lower.includes('ui-avatars.com')) return false;
    if (lower.endsWith('/logo.png')) return false;
    return true;
  }
  return false;
}

function parseBase64Img(src: string): { mimeType: string; buf: Buffer } | null {
  const match = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/i);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { mimeType, buf: Buffer.from(match[2], 'base64') };
}

/**
 * Dynamic OpenGraph share preview & binary image proxy endpoint for WhatsApp, Facebook, Twitter/X, Telegram, LinkedIn crawlers
 */
export const sharePreview = onRequest(
  {
    cors: true,
    region: 'us-central1',
  },
  async (req: any, res: any) => {
    try {
      const url = req.url || '';
      const reqPath = req.path || '';
      const query = req.query || {};
      const userAgent = String(req.headers['user-agent'] || '');
      const isCrawler = isSocialCrawlerUA(userAgent);

      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'kathavahini-9a9c1.web.app';
      const origin = `${proto}://${host}`.replace(/\/+$/, '');
      const defaultLogo = `${origin}/logo.png`;

      // 1. Public binary cover image endpoint (/api/cover/:id or /api/cover/:id.jpg)
      if (reqPath.includes('/api/cover/') || reqPath.includes('/cover/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const rawCoverId = reqPath.split('/cover/')[1]?.split('?')[0] || '';
        const coverId = decodeURIComponent(rawCoverId).trim().replace(/\.(jpe?g|png|webp)$/i, '');
        if (coverId) {
          let snap = await db.collection('stories').doc(coverId).get();
          if (!snap.exists) snap = await db.collection('novels').doc(coverId).get();
          if (!snap.exists) snap = await db.collection('episodes').doc(coverId).get();

          if (snap.exists) {
            const data = snap.data() || {};
            let cover = data.coverImage || data.coverImageUrl || data.coverImageURL;

            // Episode fallback to parent novel cover
            if ((!cover || typeof cover !== 'string') && data.novelId) {
              const parentNovel = await db.collection('novels').doc(data.novelId).get();
              if (parentNovel.exists) {
                const pData = parentNovel.data() || {};
                cover = pData.coverImage || pData.coverImageUrl || pData.coverImageURL;
              }
            }

            if (cover && typeof cover === 'string') {
              const trimmed = cover.trim();
              if (trimmed.startsWith('data:image/')) {
                const parsed = parseBase64Img(trimmed);
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
        return res.redirect(302, defaultLogo);
      }

      // 2. Public binary writer/user avatar endpoint (/api/avatar/:id or /api/avatar/:id.jpg)
      if (reqPath.includes('/api/avatar/') || reqPath.includes('/avatar/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const rawAvatarId = reqPath.split('/avatar/')[1]?.split('?')[0] || '';
        const avatarId = decodeURIComponent(rawAvatarId).trim().replace(/\.(jpe?g|png|webp)$/i, '');
        if (avatarId) {
          // Parallel fetch across users, writers, authors so custom uploaded photos always take priority
          const [uSnap, wSnap, aSnap] = await Promise.all([
            db.collection('users').doc(avatarId).get().catch(() => null),
            db.collection('writers').doc(avatarId).get().catch(() => null),
            db.collection('authors').doc(avatarId).get().catch(() => null),
          ]);

          const docs = [
            uSnap?.exists ? uSnap.data() : null,
            wSnap?.exists ? wSnap.data() : null,
            aSnap?.exists ? aSnap.data() : null,
          ];

          const candidates: string[] = [];
          for (const d of docs) {
            if (!d) continue;
            for (const key of ['photoURL', 'profileImageURL', 'avatar', 'profileImage', 'imageUrl']) {
              const val = (d as any)[key];
              if (typeof val === 'string' && val.trim() && !val.trim().startsWith('blob:')) {
                candidates.push(val.trim());
              }
            }
          }

          const chosen =
            candidates.find(c => isCustomPhoto(c)) ||
            candidates.find(c => c.startsWith('https://') || c.startsWith('http://'));

          if (chosen) {
            if (chosen.startsWith('data:image/')) {
              const parsed = parseBase64Img(chosen);
              if (parsed) {
                res.setHeader('Content-Type', parsed.mimeType);
                res.setHeader('Content-Length', String(parsed.buf.length));
                res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
                return res.status(200).send(parsed.buf);
              }
            } else if (chosen.startsWith('https://') || chosen.startsWith('http://')) {
              return res.redirect(302, normalizeAvatarForCrawler(chosen));
            }
          }
        }
        return res.redirect(302, defaultLogo);
      }

      // 3. Extract Content IDs from clean paths or query params
      const cleanPath = reqPath || url.split('?')[0] || '';
      const rawStoryId =
        query.story ||
        (cleanPath.includes('/story/') ? cleanPath.split('/story/')[1]?.split('/')[0] : null);
      const rawEpisodeId =
        query.episode ||
        (cleanPath.includes('/episode/') ? cleanPath.split('/episode/')[1]?.split('/')[0] : null);
      const rawNovelId =
        query.novel ||
        (cleanPath.includes('/novel/') ? cleanPath.split('/novel/')[1]?.split('/')[0] : null);
      const rawAuthorId =
        query.author ||
        query.writer ||
        query.profile ||
        query.user ||
        (cleanPath.includes('/author/') ? cleanPath.split('/author/')[1]?.split('/')[0] : null) ||
        (cleanPath.includes('/profile/') ? cleanPath.split('/profile/')[1]?.split('/')[0] : null);

      const storyId = rawStoryId ? decodeURIComponent(String(rawStoryId)).trim() : null;
      const episodeId = rawEpisodeId ? decodeURIComponent(String(rawEpisodeId)).trim() : null;
      const novelId = rawNovelId ? decodeURIComponent(String(rawNovelId)).trim() : null;
      const authorId = rawAuthorId ? decodeURIComponent(String(rawAuthorId)).trim() : null;
      const isReaderMode = query.reader === 'true' || Boolean(episodeId);

      let title = 'కథావాహిని — తెలుగు కథా వేదిక | Kathavahini';
      let description = 'తెలుగు కథలు, నవలలు, బాలవినోదిని మరియు సాహిత్య రచనల వేదిక. మీ కథలను ప్రపంచంతో పంచుకోండి.';
      let image = defaultLogo;
      let imageType = 'image/png';
      let imageWidth = 1200;
      let imageHeight = 630;
      let canonicalUrl = origin;
      let appDirectUrl = origin;
      let contentType = 'website';

      const targetStoryOrEpId = storyId || episodeId;

      if (targetStoryOrEpId) {
        const encodedId = encodeURIComponent(targetStoryOrEpId);
        canonicalUrl = isReaderMode ? `${origin}/episode/${encodedId}` : `${origin}/story/${encodedId}`;
        appDirectUrl = isReaderMode ? `${origin}/?story=${encodedId}&reader=true` : `${origin}/?story=${encodedId}`;

        const sDoc = await db.collection('stories').doc(targetStoryOrEpId).get();
        if (sDoc.exists) {
          const s = sDoc.data() || {};
          const isHidden =
            s.deleted === true ||
            s.status === 'deleted' ||
            s.status === 'draft' ||
            s.status === 'pending' ||
            s.status === 'rejected' ||
            s.visibility === 'hidden' ||
            s.visibility === 'private';

          let isFutureScheduled = false;
          if (s.status === 'scheduled') {
            const sched = s.scheduledPublishAt || s.scheduledAt;
            const schedMs = sched instanceof admin.firestore.Timestamp
              ? sched.toMillis()
              : new Date(sched).getTime();
            if (schedMs > Date.now()) isFutureScheduled = true;
          }

          if (!isHidden && !isFutureScheduled) {
            const rawTitle = sanitizePublicMetaText(s.teluguTitle || s.title || 'తెలుగు కథ') || 'తెలుగు కథ';
            const author = sanitizePublicMetaText(
              s.author?.teluguName || s.author?.name || s.teluguName || s.authorName || 'కథావాహిని రచయిత'
            ) || 'కథావాహిని రచయిత';
            title = rawTitle;

            let excerpt = sanitizePublicMetaText(s.teluguExcerpt || s.excerpt || s.description || '');
            if (!excerpt && Array.isArray(s.content)) {
              excerpt = sanitizePublicMetaText(s.content.join(' ')).slice(0, 128);
            }
            const cleanExcerpt = excerpt.slice(0, 128);
            description = cleanExcerpt
              ? `${cleanExcerpt} — By: ${author}`
              : `Read "${rawTitle}" on Kathavahini — By: ${author}`;
            contentType = 'article';

            const coverCandidate = s.coverImage || s.coverImageUrl || s.coverImageURL;
            if (typeof coverCandidate === 'string' && coverCandidate.trim()) {
              const trimmed = coverCandidate.trim();
              if (trimmed.startsWith('data:image/')) {
                image = `${origin}/api/cover/${encodedId}.jpg`;
                imageType = detectMimeType(trimmed);
              } else if ((trimmed.startsWith('https://') || trimmed.startsWith('http://')) && !trimmed.startsWith('blob:')) {
                image = trimmed;
                imageType = detectMimeType(trimmed);
              }
            }
          }
        } else {
          // Check episodes collection
          const epDoc = await db.collection('episodes').doc(targetStoryOrEpId).get();
          if (epDoc.exists) {
            const ep = epDoc.data() || {};
            if (
              ep.deleted !== true &&
              ep.status !== 'deleted' &&
              ep.status !== 'draft' &&
              ep.visibility !== 'hidden' &&
              ep.visibility !== 'private'
            ) {
              const epNum = ep.episodeNumber || 1;
              const nTitle = sanitizePublicMetaText(ep.novelTitle || 'తెలుగు నవల') || 'తెలుగు నవల';
              const epTitle = sanitizePublicMetaText(ep.teluguTitle || `${epNum}వ భాగం`) || `${epNum}వ భాగం`;
              title = `${nTitle} - ${epTitle} | కథావాహిని`;

              let excerpt = sanitizePublicMetaText(ep.teluguExcerpt || ep.excerpt || '');
              if (!excerpt && Array.isArray(ep.content)) {
                excerpt = sanitizePublicMetaText(ep.content.join(' ')).slice(0, 180);
              }
              description = excerpt
                ? `${excerpt}... కథావాహినిలో చదవండి.`
                : `${nTitle} ధారావాహిక నవలలోని ${epTitle} ను కథావాహినిలో చదవండి.`;
              canonicalUrl = `${origin}/episode/${encodedId}`;
              appDirectUrl = `${origin}/?story=${encodedId}&reader=true`;
              contentType = 'article';

              const epCover = ep.coverImage || ep.coverImageUrl;
              if (typeof epCover === 'string' && epCover.trim()) {
                const trimmed = epCover.trim();
                if (trimmed.startsWith('data:image/')) {
                  image = `${origin}/api/cover/${encodedId}`;
                  imageType = detectMimeType(trimmed);
                } else if ((trimmed.startsWith('https://') || trimmed.startsWith('http://')) && !trimmed.startsWith('blob:')) {
                  image = trimmed;
                  imageType = detectMimeType(trimmed);
                }
              } else if (ep.novelId) {
                const parentNovel = await db.collection('novels').doc(ep.novelId).get();
                if (parentNovel.exists) {
                  const pData = parentNovel.data() || {};
                  const pCover = pData.coverImage || pData.coverImageUrl;
                  if (typeof pCover === 'string' && pCover.trim()) {
                    const trimmed = pCover.trim();
                    if (trimmed.startsWith('data:image/')) {
                      image = `${origin}/api/cover/${encodeURIComponent(ep.novelId)}`;
                      imageType = detectMimeType(trimmed);
                    } else if ((trimmed.startsWith('https://') || trimmed.startsWith('http://')) && !trimmed.startsWith('blob:')) {
                      image = trimmed;
                      imageType = detectMimeType(trimmed);
                    }
                  }
                }
              }
            }
          }
        }
      } else if (novelId) {
        const encodedId = encodeURIComponent(novelId);
        canonicalUrl = `${origin}/novel/${encodedId}`;
        appDirectUrl = `${origin}/?novel=${encodedId}`;
        const nDoc = await db.collection('novels').doc(novelId).get();
        if (nDoc.exists) {
          const n = nDoc.data() || {};
          if (
            n.deleted !== true &&
            n.status !== 'deleted' &&
            n.status !== 'draft' &&
            n.visibility !== 'hidden' &&
            n.visibility !== 'private'
          ) {
            const rawTitle = sanitizePublicMetaText(n.teluguTitle || n.title || 'తెలుగు నవల') || 'తెలుగు నవల';
            const author = sanitizePublicMetaText(
              n.author?.teluguName || n.author?.name || n.authorName || 'కథావాహిని రచయిత'
            ) || 'కథావాహిని రచయిత';
            title = `${rawTitle} | ధారావాహిక నవల | రచన: ${author} | కథావాహిని`;
            const desc = sanitizePublicMetaText(n.teluguDescription || n.description || '');
            description = desc
              ? `${desc} - కథావాహినిలో నవలను ఉచితంగా చదవండి.`
              : `కథావాహినిలో "${rawTitle}" తెలుగు ధారావాహిక నవలను చదవండి. రచయిత: ${author}.`;
            contentType = 'article';

            const coverCandidate = n.coverImage || n.coverImageUrl;
            if (typeof coverCandidate === 'string' && coverCandidate.trim()) {
              const trimmed = coverCandidate.trim();
              if (trimmed.startsWith('data:image/')) {
                image = `${origin}/api/cover/${encodedId}`;
                imageType = detectMimeType(trimmed);
              } else if ((trimmed.startsWith('https://') || trimmed.startsWith('http://')) && !trimmed.startsWith('blob:')) {
                image = trimmed;
                imageType = detectMimeType(trimmed);
              }
            }
          }
        }
      } else if (authorId) {
        const encodedId = encodeURIComponent(authorId);
        canonicalUrl = `${origin}/author/${encodedId}`;
        appDirectUrl = `${origin}/?author=${encodedId}`;

        // Merge users, writers, and authors in parallel so updated custom profile photos always win
        const [uSnap, wSnap, aSnap] = await Promise.all([
          db.collection('users').doc(authorId).get().catch(() => null),
          db.collection('writers').doc(authorId).get().catch(() => null),
          db.collection('authors').doc(authorId).get().catch(() => null),
        ]);

        const uData = uSnap?.exists ? uSnap.data() : null;
        const wData = wSnap?.exists ? wSnap.data() : null;
        const aData = aSnap?.exists ? aSnap.data() : null;

        if ((uData || wData || aData) && uData?.deleted !== true && wData?.deleted !== true) {
          const rawName =
            wData?.teluguName ||
            uData?.teluguName ||
            aData?.teluguName ||
            wData?.penName ||
            uData?.penName ||
            uData?.displayName ||
            wData?.displayName ||
            wData?.name ||
            uData?.name ||
            aData?.name ||
            'కథావాహిని రచయిత';
          const aName = sanitizePublicMetaText(rawName) || 'కథావాహిని రచయిత';
          title = aName;

          const rawBio =
            uData?.teluguBio ||
            wData?.teluguBio ||
            aData?.teluguBio ||
            uData?.bio ||
            wData?.bio ||
            aData?.bio ||
            '';
          const cleanBio = sanitizePublicMetaText(rawBio).slice(0, 125);
          description = cleanBio
            ? `${cleanBio} • Writer on Kathavahini.`
            : `Writer on Kathavahini. Read original Telugu stories, novels, and series by ${aName}.`;
          contentType = 'profile';
          imageWidth = 1200;
          imageHeight = 630;
          image = `${origin}/api/author-card/${encodedId}.jpg`;
          imageType = 'image/jpeg';
        }
      }

      // Escape HTML entities safely
      const escapeHtml = (str: string) =>
        (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const safeTitle = escapeHtml(title);
      const safeDesc = escapeHtml(description);
      const safeImg = escapeHtml(image);
      const safeImgType = escapeHtml(imageType);
      const safeCanonicalUrl = escapeHtml(canonicalUrl);
      const safeDirectUrl = escapeHtml(appDirectUrl);
      const ogSiteName =
        contentType === 'profile'
          ? 'Kathavahini — తెలుగు సాహిత్య ప్రపంచం'
          : 'Kathavahini | తెలుగు కథలు';

      const ctaLabel =
        contentType === 'profile'
          ? 'రచయిత ప్రొఫైల్ చూడండి (Open Profile)'
          : 'కథను తెరవండి (Open Story)';

      // IMPORTANT: NEVER emit <meta http-equiv="refresh">!
      // Social crawlers (WhatsApp, Facebook, X, Telegram, LinkedIn) follow meta-refresh to /?story=... (static index.html)
      // and discard the preview. Only human JS-capable browsers execute the script redirect below.
      const browserRedirectScript = !isCrawler
        ? `\n  <script>window.location.replace(${JSON.stringify(appDirectUrl)});</script>`
        : '';

      const html = `<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">

  <!-- Open Graph (Facebook, WhatsApp, Telegram, LinkedIn) -->
  <meta property="og:site_name" content="${escapeHtml(ogSiteName)}">
  <meta property="og:type" content="${contentType}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImg}">
  <meta property="og:image:secure_url" content="${safeImg}">
  <meta property="og:image:type" content="${safeImgType}">
  <meta property="og:image:width" content="${imageWidth}">
  <meta property="og:image:height" content="${imageHeight}">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${safeCanonicalUrl}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@kathavahini">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImg}">

  <link rel="canonical" href="${safeCanonicalUrl}">
  <link rel="icon" type="image/png" href="/logo.png">${browserRedirectScript}
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background-color: #FAF7F2; color: #17151A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center;">
  <div style="max-width: 520px; background: white; border: 1px solid #E8E1DA; border-radius: 24px; padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    <img src="${safeImg}" alt="${safeTitle}" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 16px; margin-bottom: 18px;" onerror="this.style.display='none'">
    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #17151A;">${safeTitle}</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #6F6970; margin: 0 0 22px;">${safeDesc}</p>
    <a href="${safeDirectUrl}" style="display: inline-block; background-color: #7A284B; color: white; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
      ${ctaLabel}
    </a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      return res.status(200).send(html);
    } catch (err: any) {
      console.error('Error generating share preview:', err);
      return res.redirect(302, 'https://kathavahini-9a9c1.web.app');
    }
  }
);


