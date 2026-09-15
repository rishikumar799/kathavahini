"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishScheduledContentHttp = exports.publishScheduledContent = void 0;
exports.executeScheduledPublication = executeScheduledPublication;
const functions = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Core engine to check and publish scheduled content across collections
 * Idempotent, safe against re-execution, and validates strict status/visibility conditions.
 */
async function executeScheduledPublication() {
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
                batch.set(authorRef, { publishedCount: admin.firestore.FieldValue.increment(1) }, { merge: true });
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
        }
        else if (typeof scheduledAtTs === 'string') {
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
            }
            else if (typeof endAtTs === 'string') {
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
exports.publishScheduledContent = functions.onSchedule({
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Kolkata',
    retryCount: 3,
    memory: '256MiB',
}, async (event) => {
    console.log('Starting automated scheduled content publisher at:', event.scheduleTime);
    const result = await executeScheduledPublication();
    console.log('Automated scheduler execution summary:', result);
});
/**
 * HTTPS Trigger for manual administrative trigger or webhook invocation
 */
exports.publishScheduledContentHttp = (0, https_1.onRequest)({
    cors: true,
    region: 'us-central1',
}, async (req, res) => {
    try {
        const result = await executeScheduledPublication();
        res.status(200).json({
            success: true,
            message: 'Scheduled content evaluated and published successfully.',
            data: result,
        });
    }
    catch (err) {
        console.error('Error executing scheduled publisher HTTP handler:', err);
        res.status(500).json({
            success: false,
            error: err?.message || 'Internal error in scheduled publisher',
        });
    }
});
//# sourceMappingURL=index.js.map