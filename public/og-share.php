<?php
/**
 * Kathavahini — Production Server-Side Open Graph, Dynamic Writer Banner & Fast Disk Cache Engine
 *
 * Runs natively on Hostinger / LiteSpeed (PHP 7.4+ / 8.x) without requiring Node.js.
 * - Parallel Firestore REST fetches via curl_multi (eliminates sequential multi-second delays)
 * - Persistent server disk cache for OG HTML (5-min TTL) & 1200x630 JPEG previews (24-hr TTL)
 * - Single-pass pre-generation: HTML resolution immediately caches the 1200x630 cover/banner JPEG
 *   so WhatsApp's subsequent og:image fetch completes in <50ms
 * - Background pre-warming endpoint (/api/og-warm?type=...&id=...) called silently when users open pages
 * - Dynamic 1200x630 Writer Profile Banner (/api/author-card/:id.jpg) built from live Firestore data
 *   (actual writer photo, verified badge ONLY when verified, bio, real published stories, views, followers,
 *   Kathavahini branding, and canonical profile URL)
 */

declare(strict_types=1);

const KATHAVAHINI_SITE_URL = 'https://kathavahini.in';
const KATHAVAHINI_STORY_SITE_NAME = 'Kathavahini | తెలుగు కథలు';
const KATHAVAHINI_PROFILE_SITE_NAME = 'Kathavahini — తెలుగు సాహిత్య ప్రపంచం';
const KATHAVAHINI_DEFAULT_TITLE = 'Kathavahini — Telugu Stories & Novels';
const KATHAVAHINI_DEFAULT_DESC = 'Read original Telugu stories, novels, episodes, Balavinodhini, and timeless literature on Kathavahini.';
const KATHAVAHINI_FIREBASE_PROJECT = 'kathavahini-9a9c1';
const KATHAVAHINI_FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/' . KATHAVAHINI_FIREBASE_PROJECT . '/databases/(default)/documents';

const KATHAVAHINI_HTML_CACHE_TTL = 300;   // 5 minutes
const KATHAVAHINI_IMG_CACHE_TTL = 86400;  // 24 hours

const KATHAVAHINI_ALLOWED_IMAGE_HOSTS = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'kathavahini.in',
    'www.kathavahini.in',
    'kathavahini-9a9c1.firebasestorage.app',
    'kathavahini-9a9c1.appspot.com',
    'images.unsplash.com',
    'lh3.googleusercontent.com',
    'api.dicebear.com',
];

function kv_sanitize_id(string $raw, bool $stripExt = false): string
{
    $id = trim($raw);
    if ($stripExt) {
        $id = preg_replace('/\.(jpe?g|png|webp|gif)$/i', '', $id) ?? $id;
    }
    $id = urldecode($id);
    if (!preg_match('/^[A-Za-z0-9_-]{1,128}$/', $id)) {
        return '';
    }
    return $id;
}

/* --------------------------------------------------------------------------
 * Fast Persistent Disk Cache (survives across requests on Hostinger LiteSpeed)
 * -------------------------------------------------------------------------- */

function kv_cache_dir(): string
{
    $dir = rtrim(sys_get_temp_dir(), '/\\') . '/kv_og_cache_v3';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir;
}

function kv_cache_path(string $bucket, string $key): string
{
    return kv_cache_dir() . '/' . $bucket . '_' . sha1($key);
}

function kv_cache_get(string $bucket, string $key, int $ttl): ?string
{
    $path = kv_cache_path($bucket, $key);
    if (!is_file($path)) {
        return null;
    }
    $mtime = @filemtime($path);
    if ($mtime === false || (time() - $mtime) > $ttl) {
        return null;
    }
    $data = @file_get_contents($path);
    return is_string($data) && $data !== '' ? $data : null;
}

function kv_cache_put(string $bucket, string $key, string $data): void
{
    if ($data === '') {
        return;
    }
    $path = kv_cache_path($bucket, $key);
    $tmp = $path . '.' . getmypid() . '.' . mt_rand(1000, 9999) . '.tmp';
    if (@file_put_contents($tmp, $data, LOCK_EX) !== false) {
        @rename($tmp, $path);
    } else {
        @unlink($tmp);
    }
}

/* --------------------------------------------------------------------------
 * HTTP Client with Parallel curl_multi Support
 * -------------------------------------------------------------------------- */

function kv_http_request(string $url, string $method = 'GET', ?string $jsonBody = null, int $timeout = 5): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            return ['status' => 0, 'body' => '', 'contentType' => ''];
        }
        $opts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_USERAGENT => 'KathavahiniOGBot/2.0 (+https://kathavahini.in)',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_ENCODING => '',
        ];
        if (strtoupper($method) === 'POST') {
            $opts[CURLOPT_POST] = true;
            $opts[CURLOPT_POSTFIELDS] = $jsonBody ?? '{}';
            $opts[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
        }
        curl_setopt_array($ch, $opts);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        return [
            'status' => $status,
            'body' => is_string($body) ? $body : '',
            'contentType' => $contentType,
        ];
    }

    $headers = "User-Agent: KathavahiniOGBot/2.0 (+https://kathavahini.in)\r\n";
    $httpCtx = [
        'method' => strtoupper($method),
        'timeout' => $timeout,
        'follow_location' => 0,
        'ignore_errors' => true,
    ];
    if (strtoupper($method) === 'POST') {
        $headers .= "Content-Type: application/json\r\n";
        $httpCtx['content'] = $jsonBody ?? '{}';
    }
    $httpCtx['header'] = $headers;

    $ctx = stream_context_create(['http' => $httpCtx]);
    $body = @file_get_contents($url, false, $ctx);
    $status = 0;
    $contentType = '';
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $hdr) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $hdr, $m)) {
                $status = (int) $m[1];
            } elseif (stripos($hdr, 'Content-Type:') === 0) {
                $contentType = trim(substr($hdr, 13));
            }
        }
    }
    return [
        'status' => $status,
        'body' => is_string($body) ? $body : '',
        'contentType' => $contentType,
    ];
}

function kv_http_get(string $url, int $timeout = 5): array
{
    return kv_http_request($url, 'GET', null, $timeout);
}

/**
 * Executes multiple HTTP requests concurrently via curl_multi.
 * Each item: ['url' => string, 'method' => 'GET'|'POST', 'body' => ?string]
 */
function kv_http_multi(array $requests, int $timeout = 5): array
{
    $results = [];
    if (empty($requests)) {
        return $results;
    }

    if (!function_exists('curl_multi_init')) {
        foreach ($requests as $key => $req) {
            $results[$key] = kv_http_request(
                (string) $req['url'],
                (string) ($req['method'] ?? 'GET'),
                $req['body'] ?? null,
                $timeout
            );
        }
        return $results;
    }

    $mh = curl_multi_init();
    $handles = [];

    foreach ($requests as $key => $req) {
        $ch = curl_init((string) $req['url']);
        if ($ch === false) {
            $results[$key] = ['status' => 0, 'body' => '', 'contentType' => ''];
            continue;
        }
        $method = strtoupper((string) ($req['method'] ?? 'GET'));
        $opts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_USERAGENT => 'KathavahiniOGBot/2.0 (+https://kathavahini.in)',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_ENCODING => '',
        ];
        if ($method === 'POST') {
            $opts[CURLOPT_POST] = true;
            $opts[CURLOPT_POSTFIELDS] = (string) ($req['body'] ?? '{}');
            $opts[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
        }
        curl_setopt_array($ch, $opts);
        curl_multi_add_handle($mh, $ch);
        $handles[$key] = $ch;
    }

    $running = null;
    do {
        $status = curl_multi_exec($mh, $running);
        if ($running > 0) {
            curl_multi_select($mh, 0.25);
        }
    } while ($running > 0 && $status === CURLM_OK);

    foreach ($handles as $key => $ch) {
        $body = curl_multi_getcontent($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $results[$key] = [
            'status' => $httpCode,
            'body' => is_string($body) ? $body : '',
            'contentType' => $contentType,
        ];
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }

    curl_multi_close($mh);
    return $results;
}

/* --------------------------------------------------------------------------
 * Firestore REST Helpers
 * -------------------------------------------------------------------------- */

function kv_decode_firestore_value($val)
{
    if (!is_array($val)) {
        return null;
    }
    if (array_key_exists('stringValue', $val)) {
        return (string) $val['stringValue'];
    }
    if (array_key_exists('integerValue', $val)) {
        return (int) $val['integerValue'];
    }
    if (array_key_exists('doubleValue', $val)) {
        return (float) $val['doubleValue'];
    }
    if (array_key_exists('booleanValue', $val)) {
        return (bool) $val['booleanValue'];
    }
    if (array_key_exists('timestampValue', $val)) {
        return (string) $val['timestampValue'];
    }
    if (array_key_exists('nullValue', $val)) {
        return null;
    }
    if (isset($val['arrayValue']['values']) && is_array($val['arrayValue']['values'])) {
        $out = [];
        foreach ($val['arrayValue']['values'] as $item) {
            $out[] = kv_decode_firestore_value($item);
        }
        return $out;
    }
    if (isset($val['mapValue']['fields']) && is_array($val['mapValue']['fields'])) {
        $out = [];
        foreach ($val['mapValue']['fields'] as $k => $v) {
            $out[$k] = kv_decode_firestore_value($v);
        }
        return $out;
    }
    return null;
}

function kv_decode_firestore_doc_response(array $res): ?array
{
    if (($res['status'] ?? 0) !== 200 || empty($res['body'])) {
        return null;
    }
    $json = json_decode($res['body'], true);
    if (!is_array($json) || !isset($json['fields']) || !is_array($json['fields'])) {
        return null;
    }
    $data = [];
    foreach ($json['fields'] as $k => $v) {
        $data[$k] = kv_decode_firestore_value($v);
    }
    if (isset($json['updateTime']) && is_string($json['updateTime'])) {
        $data['_updateTime'] = $json['updateTime'];
    }
    if (isset($json['name']) && is_string($json['name'])) {
        $parts = explode('/', $json['name']);
        $data['_docId'] = end($parts);
    }
    return $data;
}

function kv_fetch_firestore_doc(string $collection, string $docId): ?array
{
    if ($docId === '') {
        return null;
    }
    $url = KATHAVAHINI_FIRESTORE_BASE . '/' . rawurlencode($collection) . '/' . rawurlencode($docId);
    return kv_decode_firestore_doc_response(kv_http_get($url, 5));
}

function kv_build_stories_stats_query_json(string $fieldName, string $authorId): string
{
    $payload = [
        'structuredQuery' => [
            'from' => [['collectionId' => 'stories']],
            'where' => [
                'fieldFilter' => [
                    'field' => ['fieldPath' => $fieldName],
                    'op' => 'EQUAL',
                    'value' => ['stringValue' => $authorId],
                ],
            ],
            'select' => [
                'fields' => [
                    ['fieldPath' => 'status'],
                    ['fieldPath' => 'visibility'],
                    ['fieldPath' => 'deleted'],
                    ['fieldPath' => 'isHidden'],
                    ['fieldPath' => 'isDeleted'],
                    ['fieldPath' => 'isPrivate'],
                    ['fieldPath' => 'viewsCount'],
                    ['fieldPath' => 'viewCount'],
                ],
            ],
            'limit' => 250,
        ],
    ];
    return (string) json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function kv_decode_runquery_docs(array $res): array
{
    if (($res['status'] ?? 0) !== 200 || empty($res['body'])) {
        return [];
    }
    $rows = json_decode($res['body'], true);
    if (!is_array($rows)) {
        return [];
    }
    $docs = [];
    foreach ($rows as $row) {
        if (!is_array($row) || !isset($row['document']['fields']) || !is_array($row['document']['fields'])) {
            continue;
        }
        $docName = (string) ($row['document']['name'] ?? '');
        $parts = explode('/', $docName);
        $docId = end($parts) ?: uniqid('s_', true);
        $data = [];
        foreach ($row['document']['fields'] as $k => $v) {
            $data[$k] = kv_decode_firestore_value($v);
        }
        $docs[$docId] = $data;
    }
    return $docs;
}

/* --------------------------------------------------------------------------
 * Public Content Filtering & Text Sanitization
 * -------------------------------------------------------------------------- */

function kv_is_content_public(array $doc): bool
{
    $blockedStatuses = ['hidden', 'draft', 'deleted', 'archived', 'rejected', 'private', 'pending', 'unpublished'];
    $status = strtolower(trim((string) ($doc['status'] ?? '')));
    if ($status !== '' && in_array($status, $blockedStatuses, true)) {
        return false;
    }
    if (!empty($doc['deleted']) || !empty($doc['isHidden']) || !empty($doc['isDeleted']) || !empty($doc['isPrivate'])) {
        return false;
    }
    $visibility = strtolower(trim((string) ($doc['visibility'] ?? '')));
    if ($visibility === 'private' || $visibility === 'draft' || $visibility === 'hidden') {
        return false;
    }
    if ($status === 'scheduled') {
        $sched = (string) ($doc['scheduledPublishAt'] ?? $doc['scheduledAt'] ?? $doc['publishAt'] ?? '');
        if ($sched !== '') {
            $ts = strtotime($sched);
            if ($ts !== false && $ts > time()) {
                return false;
            }
        }
    }
    return true;
}

function kv_strip_text(string $raw): string
{
    $text = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = strip_tags($text);
    $text = preg_replace('/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/', '', $text) ?? $text;
    $text = preg_replace('/(?:\+?\d[\d\s\-()]{8,14}\d)/', '', $text) ?? $text;
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    return trim($text);
}

function kv_truncate(string $text, int $maxLen = 155): string
{
    $clean = kv_strip_text($text);
    if ($clean === '') {
        return '';
    }
    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($clean, 'UTF-8') <= $maxLen) {
            return $clean;
        }
        $slice = mb_substr($clean, 0, $maxLen - 1, 'UTF-8');
        $lastSpace = mb_strrpos($slice, ' ', 0, 'UTF-8');
        if ($lastSpace !== false && $lastSpace > (int) ($maxLen * 0.55)) {
            $slice = mb_substr($slice, 0, $lastSpace, 'UTF-8');
        }
        return rtrim($slice, " .,;:-—") . '…';
    }
    if (strlen($clean) <= $maxLen) {
        return $clean;
    }
    return rtrim(substr($clean, 0, $maxLen - 3)) . '...';
}

function kv_format_compact_count(int $num): string
{
    $n = max(0, $num);
    if ($n >= 1000000) {
        return rtrim(rtrim(number_format($n / 1000000, 1, '.', ''), '0'), '.') . 'M';
    }
    if ($n >= 1000) {
        return rtrim(rtrim(number_format($n / 1000, 1, '.', ''), '0'), '.') . 'K';
    }
    return (string) $n;
}

function kv_wrap_lines(string $text, int $maxChars, int $maxLines): array
{
    $clean = kv_strip_text($text);
    if ($clean === '') {
        return [];
    }
    $words = preg_split('/\s+/u', $clean, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $lines = [];
    $current = '';
    $lenFn = function_exists('mb_strlen') ? 'mb_strlen' : 'strlen';
    $subFn = function_exists('mb_substr') ? 'mb_substr' : 'substr';

    foreach ($words as $word) {
        $candidate = $current !== '' ? ($current . ' ' . $word) : $word;
        $candLen = $lenFn === 'mb_strlen' ? mb_strlen($candidate, 'UTF-8') : strlen($candidate);
        if ($candLen <= $maxChars) {
            $current = $candidate;
        } else {
            if ($current !== '') {
                $lines[] = $current;
                if (count($lines) >= $maxLines) {
                    $current = '';
                    break;
                }
            }
            $wordLen = $lenFn === 'mb_strlen' ? mb_strlen($word, 'UTF-8') : strlen($word);
            $current = $wordLen > $maxChars
                ? ($subFn === 'mb_substr' ? mb_substr($word, 0, $maxChars - 1, 'UTF-8') : substr($word, 0, $maxChars - 1))
                : $word;
        }
    }
    if ($current !== '' && count($lines) < $maxLines) {
        $lines[] = $current;
    }
    if (count($lines) === $maxLines) {
        $joined = implode(' ', $lines);
        $joinedLen = $lenFn === 'mb_strlen' ? mb_strlen($joined, 'UTF-8') : strlen($joined);
        $cleanLen = $lenFn === 'mb_strlen' ? mb_strlen($clean, 'UTF-8') : strlen($clean);
        if ($joinedLen < $cleanLen) {
            $last = rtrim($lines[$maxLines - 1], " .,;:-—");
            $trimmed = $subFn === 'mb_substr'
                ? mb_substr($last, 0, max(4, $maxChars - 1), 'UTF-8')
                : substr($last, 0, max(4, $maxChars - 1));
            $lines[$maxLines - 1] = $trimmed . '…';
        }
    }
    return $lines;
}

function kv_has_telugu(string $str): bool
{
    return (bool) preg_match('/[\x{0C00}-\x{0C7F}]/u', $str);
}

/* --------------------------------------------------------------------------
 * Media & Author Profile Extraction
 * -------------------------------------------------------------------------- */

function kv_extract_cover(array $doc): string
{
    foreach (['coverImage', 'coverImageUrl', 'coverImageURL', 'thumbnailUrl', 'thumbnail', 'image'] as $field) {
        if (isset($doc[$field]) && is_string($doc[$field]) && trim($doc[$field]) !== '') {
            $v = trim($doc[$field]);
            if (stripos($v, 'blob:') !== 0) {
                return $v;
            }
        }
    }
    return '';
}

function kv_is_custom_avatar(string $val): bool
{
    if ($val === '' || stripos($val, 'blob:') === 0) {
        return false;
    }
    if (stripos($val, 'data:image/') === 0) {
        return true;
    }
    if (stripos($val, 'https://') === 0 || stripos($val, 'http://') === 0) {
        $lower = strtolower($val);
        return strpos($lower, 'dicebear.com') === false
            && strpos($lower, 'ui-avatars.com') === false
            && substr($lower, -9) !== '/logo.png';
    }
    return false;
}

function kv_pick_author_avatar(?array $userDoc, ?array $writerDoc, ?array $authorDoc): string
{
    $candidates = [];
    foreach ([$userDoc, $writerDoc, $authorDoc] as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        foreach (['photoURL', 'profileImageURL', 'profileImage', 'avatar', 'photoUrl', 'profilePhoto', 'imageUrl', 'image'] as $field) {
            if (isset($doc[$field]) && is_string($doc[$field])) {
                $v = trim($doc[$field]);
                if ($v !== '' && stripos($v, 'blob:') !== 0) {
                    $candidates[] = $v;
                }
            }
        }
    }
    foreach ($candidates as $c) {
        if (kv_is_custom_avatar($c)) {
            return $c;
        }
    }
    return $candidates[0] ?? '';
}

function kv_pick_author_name(?array $userDoc, ?array $writerDoc, ?array $authorDoc): string
{
    foreach ([$writerDoc, $userDoc, $authorDoc] as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        foreach (['teluguName', 'penName', 'displayName', 'name', 'authorName'] as $field) {
            if (isset($doc[$field]) && is_string($doc[$field])) {
                $v = kv_strip_text($doc[$field]);
                if ($v !== '' && strpos($v, '@') === false) {
                    return $v;
                }
            }
        }
    }
    return 'Kathavahini Writer';
}

function kv_pick_author_bio(?array $userDoc, ?array $writerDoc, ?array $authorDoc): string
{
    foreach ([$userDoc, $writerDoc, $authorDoc] as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        foreach (['teluguBio', 'bio', 'about', 'description', 'tagline'] as $field) {
            if (isset($doc[$field]) && is_string($doc[$field])) {
                $v = kv_strip_text($doc[$field]);
                if ($v !== '') {
                    return $v;
                }
            }
        }
    }
    return '';
}

/**
 * Fetches writer profile + real published story count, total views & followers in ONE parallel round-trip.
 */
function kv_resolve_author_profile(string $id): ?array
{
    $encId = rawurlencode($id);
    $runQueryUrl = KATHAVAHINI_FIRESTORE_BASE . ':runQuery';

    $responses = kv_http_multi([
        'user' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/users/' . $encId, 'method' => 'GET'],
        'writer' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/writers/' . $encId, 'method' => 'GET'],
        'author' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/authors/' . $encId, 'method' => 'GET'],
        'storiesAuthor' => [
            'url' => $runQueryUrl,
            'method' => 'POST',
            'body' => kv_build_stories_stats_query_json('authorId', $id),
        ],
        'storiesWriter' => [
            'url' => $runQueryUrl,
            'method' => 'POST',
            'body' => kv_build_stories_stats_query_json('writerId', $id),
        ],
    ], 5);

    $userDoc = kv_decode_firestore_doc_response($responses['user'] ?? []);
    $writerDoc = kv_decode_firestore_doc_response($responses['writer'] ?? []);
    $authorDoc = kv_decode_firestore_doc_response($responses['author'] ?? []);

    if ($userDoc === null && $writerDoc === null && $authorDoc === null) {
        return null;
    }
    if (!empty($userDoc['deleted']) || !empty($writerDoc['deleted'])) {
        return null;
    }

    $name = kv_pick_author_name($userDoc, $writerDoc, $authorDoc);
    $bio = kv_pick_author_bio($userDoc, $writerDoc, $authorDoc);
    $avatarSrc = kv_pick_author_avatar($userDoc, $writerDoc, $authorDoc);

    $isVerified = (
        !empty($writerDoc['isVerified']) ||
        !empty($userDoc['isVerified']) ||
        !empty($authorDoc['isVerified']) ||
        !empty($writerDoc['verified'])
    );

    // Deduplicate published stories from authorId & writerId queries
    $storyMap = [];
    foreach (['storiesAuthor', 'storiesWriter'] as $key) {
        $docs = kv_decode_runquery_docs($responses[$key] ?? []);
        foreach ($docs as $docId => $sData) {
            if (!isset($storyMap[$docId]) && kv_is_content_public($sData)) {
                $storyMap[$docId] = $sData;
            }
        }
    }

    $totalViews = 0;
    foreach ($storyMap as $sData) {
        $v = (int) ($sData['viewsCount'] ?? $sData['viewCount'] ?? 0);
        if ($v > 0) {
            $totalViews += $v;
        }
    }

    $storiesCount = max(
        count($storyMap),
        (int) ($writerDoc['publishedStoriesCount'] ?? 0),
        (int) ($authorDoc['storiesCount'] ?? 0)
    );

    $followersCount = max(
        0,
        (int) ($writerDoc['followersCount'] ?? 0),
        (int) ($userDoc['followersCount'] ?? 0),
        (int) ($authorDoc['followersCount'] ?? 0)
    );

    $versionSeed = implode('|', [
        $name,
        substr($bio, 0, 48),
        substr($avatarSrc, 0, 64),
        (string) $storiesCount,
        (string) $followersCount,
        (string) $totalViews,
        $isVerified ? '1' : '0',
        (string) ($writerDoc['_updateTime'] ?? $userDoc['_updateTime'] ?? ''),
    ]);

    return [
        'id' => $id,
        'displayName' => $name,
        'bio' => $bio,
        'isVerified' => $isVerified,
        'avatarSource' => $avatarSrc,
        'storiesCount' => $storiesCount,
        'totalViews' => $totalViews,
        'followersCount' => $followersCount,
        'canonicalUrl' => KATHAVAHINI_SITE_URL . '/author/' . rawurlencode($id),
        'versionHash' => substr(md5($versionSeed), 0, 8),
    ];
}

function kv_is_allowed_image_url(string $url): bool
{
    $parts = parse_url($url);
    if (!is_array($parts)) {
        return false;
    }
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if ($scheme !== 'https' || $host === '') {
        return false;
    }
    return in_array($host, KATHAVAHINI_ALLOWED_IMAGE_HOSTS, true);
}

function kv_load_image_bytes(string $source): ?string
{
    if ($source === '') {
        return null;
    }
    if (stripos($source, 'data:image/') === 0) {
        $commaPos = strpos($source, ',');
        if ($commaPos === false) {
            return null;
        }
        $meta = substr($source, 0, $commaPos);
        $payload = substr($source, $commaPos + 1);
        if (stripos($meta, ';base64') !== false) {
            $decoded = base64_decode($payload, true);
            return is_string($decoded) && $decoded !== '' ? $decoded : null;
        }
        return rawurldecode($payload);
    }

    if (stripos($source, 'https://api.dicebear.com/') === 0 && stripos($source, '/svg') !== false) {
        $source = preg_replace('#/svg(\?|$)#i', '/png$1', $source, 1) ?? $source;
        $source .= (strpos($source, '?') === false ? '?' : '&') . 'size=512';
    }

    if (!kv_is_allowed_image_url($source)) {
        return null;
    }

    $res = kv_http_get($source, 6);
    if ($res['status'] >= 200 && $res['status'] < 300 && $res['body'] !== '') {
        return $res['body'];
    }
    return null;
}

/* --------------------------------------------------------------------------
 * Image Rendering Helpers (Covers, Avatars & 1200x630 Dynamic Writer Banner)
 * -------------------------------------------------------------------------- */

function kv_send_jpeg(string $jpeg, string $cacheStatus = 'MISS'): void
{
    header('HTTP/1.1 200 OK');
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . strlen($jpeg));
    header('Cache-Control: public, max-age=86400, s-maxage=86400');
    header('X-Cache: ' . $cacheStatus);
    header('X-Content-Type-Options: nosniff');
    header('Access-Control-Allow-Origin: *');
    echo $jpeg;
    exit;
}

function kv_build_fallback_logo_jpeg(int $targetW, int $targetH): ?string
{
    $logoPath = __DIR__ . '/logo.png';
    if (!function_exists('imagecreatetruecolor') || !is_readable($logoPath)) {
        return null;
    }
    $logoBytes = @file_get_contents($logoPath);
    if (!is_string($logoBytes) || $logoBytes === '') {
        return null;
    }
    $logoImg = @imagecreatefromstring($logoBytes);
    if ($logoImg === false) {
        return null;
    }
    $canvas = imagecreatetruecolor($targetW, $targetH);
    $bg = imagecolorallocate($canvas, 250, 247, 242);
    imagefilledrectangle($canvas, 0, 0, $targetW, $targetH, $bg);
    $lw = imagesx($logoImg);
    $lh = imagesy($logoImg);
    $maxLogoH = (int) round($targetH * 0.62);
    $maxLogoW = (int) round($targetW * 0.62);
    $scale = min($maxLogoW / max(1, $lw), $maxLogoH / max(1, $lh));
    $dw = max(1, (int) round($lw * $scale));
    $dh = max(1, (int) round($lh * $scale));
    $dx = (int) round(($targetW - $dw) / 2);
    $dy = (int) round(($targetH - $dh) / 2);
    imagealphablending($canvas, true);
    imagecopyresampled($canvas, $logoImg, $dx, $dy, 0, 0, $dw, $dh, $lw, $lh);
    ob_start();
    imagejpeg($canvas, null, 88);
    $jpeg = ob_get_clean();
    imagedestroy($logoImg);
    imagedestroy($canvas);
    return (is_string($jpeg) && $jpeg !== '') ? $jpeg : null;
}

function kv_serve_fallback_logo(int $targetW, int $targetH): void
{
    $jpeg = kv_build_fallback_logo_jpeg($targetW, $targetH);
    if ($jpeg !== null) {
        kv_send_jpeg($jpeg, 'FALLBACK');
    }
    $logoPath = __DIR__ . '/logo.png';
    if (is_readable($logoPath)) {
        $bytes = file_get_contents($logoPath);
        header('HTTP/1.1 200 OK');
        header('Content-Type: image/png');
        header('Content-Length: ' . strlen((string) $bytes));
        header('Cache-Control: public, max-age=86400');
        header('X-Content-Type-Options: nosniff');
        echo $bytes;
        exit;
    }
    http_response_code(404);
    exit;
}

function kv_build_resized_jpeg(?string $rawBytes, int $targetW, int $targetH): ?string
{
    if ($rawBytes === null || $rawBytes === '' || !function_exists('imagecreatefromstring')) {
        return kv_build_fallback_logo_jpeg($targetW, $targetH);
    }

    $src = @imagecreatefromstring($rawBytes);
    if ($src === false) {
        return kv_build_fallback_logo_jpeg($targetW, $targetH);
    }

    $srcW = imagesx($src);
    $srcH = imagesy($src);
    if ($srcW <= 0 || $srcH <= 0) {
        imagedestroy($src);
        return kv_build_fallback_logo_jpeg($targetW, $targetH);
    }

    $srcAspect = $srcW / $srcH;
    $dstAspect = $targetW / $targetH;

    if ($srcAspect > $dstAspect) {
        $cropH = $srcH;
        $cropW = (int) round($srcH * $dstAspect);
        $srcX = (int) round(($srcW - $cropW) / 2);
        $srcY = 0;
    } else {
        $cropW = $srcW;
        $cropH = (int) round($srcW / $dstAspect);
        $srcX = 0;
        $srcY = (int) round(($srcH - $cropH) * 0.35);
    }

    $dst = imagecreatetruecolor($targetW, $targetH);
    $bg = imagecolorallocate($dst, 250, 247, 242);
    imagefilledrectangle($dst, 0, 0, $targetW, $targetH, $bg);
    imagealphablending($dst, true);
    imagecopyresampled($dst, $src, 0, 0, $srcX, $srcY, $targetW, $targetH, $cropW, $cropH);

    ob_start();
    imagejpeg($dst, null, 85);
    $jpeg = ob_get_clean();

    imagedestroy($src);
    imagedestroy($dst);

    return (is_string($jpeg) && $jpeg !== '') ? $jpeg : kv_build_fallback_logo_jpeg($targetW, $targetH);
}

/**
 * Draws a filled rounded rectangle in PHP GD.
 */
function kv_gd_rounded_rect($img, int $x, int $y, int $w, int $h, int $r, int $color): void
{
    $r = max(0, min($r, (int) floor(min($w, $h) / 2)));
    imagefilledrectangle($img, $x + $r, $y, $x + $w - $r, $y + $h, $color);
    imagefilledrectangle($img, $x, $y + $r, $x + $w, $y + $h - $r, $color);
    if ($r > 0) {
        $d = $r * 2;
        imagefilledellipse($img, $x + $r, $y + $r, $d, $d, $color);
        imagefilledellipse($img, $x + $w - $r, $y + $r, $d, $d, $color);
        imagefilledellipse($img, $x + $r, $y + $h - $r, $d, $d, $color);
        imagefilledellipse($img, $x + $w - $r, $y + $h - $r, $d, $d, $color);
    }
}

/**
 * Draws a circular-masked photo onto a GD destination canvas.
 */
function kv_gd_draw_circular_photo($dst, string $rawAvatarBytes, int $cx, int $cy, int $diameter): bool
{
    $src = @imagecreatefromstring($rawAvatarBytes);
    if ($src === false) {
        return false;
    }
    $sw = imagesx($src);
    $sh = imagesy($src);
    if ($sw <= 0 || $sh <= 0) {
        imagedestroy($src);
        return false;
    }

    // Center-square crop biased slightly toward upper third for portraits
    $side = min($sw, $sh);
    $sx = (int) round(($sw - $side) / 2);
    $sy = (int) round(($sh - $side) * 0.25);

    $sq = imagecreatetruecolor($diameter, $diameter);
    imagealphablending($sq, true);
    imagecopyresampled($sq, $src, 0, 0, $sx, $sy, $diameter, $diameter, $side, $side);
    imagedestroy($src);

    $radius = $diameter / 2.0;
    $rSq = $radius * $radius;
    $destX0 = (int) round($cx - $radius);
    $destY0 = (int) round($cy - $radius);

    for ($py = 0; $py < $diameter; $py++) {
        $dy = ($py + 0.5) - $radius;
        $dySq = $dy * $dy;
        for ($px = 0; $px < $diameter; $px++) {
            $dx = ($px + 0.5) - $radius;
            if (($dx * $dx + $dySq) <= $rSq) {
                $rgb = imagecolorat($sq, $px, $py);
                imagesetpixel($dst, $destX0 + $px, $destY0 + $py, $rgb);
            }
        }
    }

    imagedestroy($sq);
    return true;
}

/**
 * Generates a 1200x630 editorial Writer Profile Banner JPEG using Imagick (when available) or PHP GD.
 */
function kv_render_author_banner_jpeg(array $profile): ?string
{
    $rawAvatar = !empty($profile['avatarSource']) ? kv_load_image_bytes((string) $profile['avatarSource']) : null;

    // Path A: Try Imagick SVG rendering (full HarfBuzz/Pango Telugu shaping if librsvg/Imagick is available)
    if (class_exists('Imagick')) {
        try {
            $jpeg = kv_render_author_banner_imagick($profile, $rawAvatar);
            if ($jpeg !== null && strlen($jpeg) > 5000) {
                return $jpeg;
            }
        } catch (\Throwable $e) {
            // Fall through seamlessly to PHP GD renderer
        }
    }

    // Path B: Guaranteed PHP GD editorial renderer using bundled Noto fonts + pre-rendered Telugu brand PNG
    return kv_render_author_banner_gd($profile, $rawAvatar);
}

function kv_render_author_banner_imagick(array $profile, ?string $rawAvatar): ?string
{
    $W = 1200;
    $H = 630;
    $AVATAR_SIZE = 264;
    $AVATAR_X = 82;
    $AVATAR_Y = 126;

    $displayName = (string) $profile['displayName'];
    $shortName = (function_exists('mb_strlen') && mb_strlen($displayName, 'UTF-8') > 28)
        ? mb_substr($displayName, 0, 27, 'UTF-8') . '…'
        : $displayName;
    $bioText = (string) ($profile['bio'] !== '' ? $profile['bio'] : 'తెలుగు కథలు, నవలలు మరియు సాహిత్య భావాలతో కూడిన రచనలు.');
    $bioLines = kv_wrap_lines($bioText, 42, 3);
    $displayUrl = preg_replace('#^https?://#i', '', (string) $profile['canonicalUrl']) ?? (string) $profile['canonicalUrl'];
    if (strlen($displayUrl) > 44) {
        $displayUrl = substr($displayUrl, 0, 41) . '…';
    }
    $initialChar = function_exists('mb_substr')
        ? mb_strtoupper(mb_substr(trim($displayName) ?: 'K', 0, 1, 'UTF-8'), 'UTF-8')
        : strtoupper(substr(trim($displayName) ?: 'K', 0, 1));

    $statItems = [
        ['label' => ((int) $profile['storiesCount']) . ' కథలు', 'icon' => 'book'],
    ];
    if ((int) $profile['totalViews'] > 0) {
        $statItems[] = ['label' => kv_format_compact_count((int) $profile['totalViews']) . ' వీక్షణలు', 'icon' => 'eye'];
    }
    $statItems[] = ['label' => kv_format_compact_count((int) $profile['followersCount']) . ' అనుచరులు', 'icon' => 'users'];

    $statX = 408;
    $statsSvg = '';
    foreach ($statItems as $item) {
        $charLen = function_exists('mb_strlen') ? mb_strlen($item['label'], 'UTF-8') : strlen($item['label']);
        $chipW = max(166, min(230, $charLen * 13 + 56));
        $icon = '';
        if ($item['icon'] === 'book') {
            $icon = '<g transform="translate(' . ($statX + 18) . ', 396)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H2z"/><path d="M20 4h-6a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h7z"/></g>';
        } elseif ($item['icon'] === 'eye') {
            $icon = '<g transform="translate(' . ($statX + 18) . ', 397)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="11" cy="10" r="3"/></g>';
        } else {
            $icon = '<g transform="translate(' . ($statX + 18) . ', 396)" fill="none" stroke="#7A284B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="3.5"/><path d="M21 19v-2a4 4 0 0 0-3-3.8"/><path d="M15 3.2a3.5 3.5 0 0 1 0 6.8"/></g>';
        }
        $statsSvg .= '<rect x="' . $statX . '" y="380" width="' . $chipW . '" height="52" rx="14" fill="#FAF7F2" stroke="#E5D9CA" stroke-width="1.5"/>'
            . $icon
            . '<text x="' . ($statX + 50) . '" y="413" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="20" font-weight="700" fill="#17151A">' . kv_esc($item['label']) . '</text>';
        $statX += $chipW + 16;
    }

    $verifiedSvg = !empty($profile['isVerified'])
        ? '<g transform="translate(658, 92)"><rect x="0" y="0" width="142" height="34" rx="17" fill="#7A284B"/><circle cx="20" cy="17" r="9" fill="#D99A3D"/><path d="M15.5 17.2l3 3 6-6.2" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><text x="38" y="23" font-family="Noto Sans, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">VERIFIED</text></g>'
        : '';

    $bioSvg = '';
    foreach ($bioLines as $idx => $line) {
        $bioSvg .= '<text x="408" y="' . (258 + $idx * 35) . '" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="22" font-weight="400" fill="#4E4752">' . kv_esc($line) . '</text>';
    }

    $monogramSvg = $rawAvatar === null
        ? '<circle cx="' . ($AVATAR_X + $AVATAR_SIZE / 2) . '" cy="' . ($AVATAR_Y + $AVATAR_SIZE / 2) . '" r="' . ($AVATAR_SIZE / 2) . '" fill="#7A284B"/><text x="' . ($AVATAR_X + $AVATAR_SIZE / 2) . '" y="' . ($AVATAR_Y + $AVATAR_SIZE / 2 + 34) . '" text-anchor="middle" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="96" font-weight="700" fill="#FAF7F2">' . kv_esc($initialChar) . '</text>'
        : '';

    $hasLogo = is_readable(__DIR__ . '/logo.png');
    $brandX = $hasLogo ? 132 : 76;

    $svg = '<?xml version="1.0" encoding="UTF-8"?>'
        . '<svg width="' . $W . '" height="' . $H . '" viewBox="0 0 ' . $W . ' ' . $H . '" xmlns="http://www.w3.org/2000/svg">'
        . '<defs>'
        . '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FBF8F3"/><stop offset="100%" stop-color="#EFE6D8"/></linearGradient>'
        . '<linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8B2F56"/><stop offset="100%" stop-color="#5E1C38"/></linearGradient>'
        . '</defs>'
        . '<rect width="' . $W . '" height="' . $H . '" fill="url(#bgGrad)"/>'
        . '<rect x="34" y="34" width="1132" height="562" rx="28" fill="#FFFFFF" stroke="#E5D9CA" stroke-width="2"/>'
        . '<path d="M62 34 H1138 A28 28 0 0 1 1166 62 V66 H34 V62 A28 28 0 0 1 62 34 Z" fill="url(#maroonGrad)"/>'
        . '<rect x="34" y="42" width="1132" height="5" fill="#D99A3D" opacity="0.85"/>'
        . '<circle cx="' . ($AVATAR_X + $AVATAR_SIZE / 2) . '" cy="' . ($AVATAR_Y + $AVATAR_SIZE / 2) . '" r="' . ($AVATAR_SIZE / 2 + 16) . '" fill="#FAF7F2" stroke="#E8DDD0" stroke-width="2"/>'
        . '<circle cx="' . ($AVATAR_X + $AVATAR_SIZE / 2) . '" cy="' . ($AVATAR_Y + $AVATAR_SIZE / 2) . '" r="' . ($AVATAR_SIZE / 2 + 7) . '" fill="#FFFFFF" stroke="#7A284B" stroke-width="5"/>'
        . $monogramSvg
        . '<rect x="112" y="420" width="204" height="34" rx="17" fill="#F4EAF0"/>'
        . '<text x="214" y="443" text-anchor="middle" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#7A284B">కథావాహిని రచయిత</text>'
        . '<rect x="408" y="92" width="236" height="34" rx="17" fill="#FAF4EC" stroke="#E5D6C3" stroke-width="1.2"/>'
        . '<text x="526" y="115" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="14" font-weight="700" fill="#7A284B">WRITER ON KATHAVAHINI</text>'
        . $verifiedSvg
        . '<text x="408" y="196" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="46" font-weight="700" fill="#17151A">' . kv_esc($shortName) . '</text>'
        . '<rect x="408" y="214" width="84" height="4" rx="2" fill="#D99A3D"/>'
        . $bioSvg
        . $statsSvg
        . '<line x1="72" y1="490" x2="1128" y2="490" stroke="#EAE1D6" stroke-width="1.5"/>'
        . '<rect x="36" y="492" width="1128" height="102" rx="26" fill="#FAF7F2"/>'
        . '<rect x="36" y="492" width="1128" height="24" fill="#FAF7F2"/>'
        . '<text x="' . $brandX . '" y="538" font-family="Noto Sans, sans-serif" font-size="25" font-weight="700" fill="#7A284B">Kathavahini</text>'
        . '<text x="' . ($brandX + 154) . '" y="538" font-family="Noto Sans Telugu, Noto Sans, sans-serif" font-size="22" font-weight="700" fill="#3D3540">— తెలుగు సాహిత్య ప్రపంచం</text>'
        . '<text x="' . $brandX . '" y="568" font-family="Noto Sans, sans-serif" font-size="16" font-weight="600" fill="#6F6970">Read stories, novels &amp; series on Kathavahini</text>'
        . '<rect x="706" y="518" width="424" height="48" rx="24" fill="#FFFFFF" stroke="#E2D5C5" stroke-width="1.5"/>'
        . '<text x="918" y="548" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#7A284B">' . kv_esc($displayUrl) . '</text>'
        . '</svg>';

    $canvas = new \Imagick();
    $canvas->setBackgroundColor(new \ImagickPixel('#FAF7F2'));
    $canvas->readImageBlob($svg);
    $canvas->setImageFormat('png32');

    if ($rawAvatar !== null) {
        $avatar = new \Imagick();
        $avatar->readImageBlob($rawAvatar);
        $avatar->cropThumbnailImage($AVATAR_SIZE, $AVATAR_SIZE);
        $avatar->setImageFormat('png32');

        $mask = new \Imagick();
        $mask->newImage($AVATAR_SIZE, $AVATAR_SIZE, new \ImagickPixel('transparent'));
        $draw = new \ImagickDraw();
        $draw->setFillColor(new \ImagickPixel('white'));
        $draw->circle($AVATAR_SIZE / 2, $AVATAR_SIZE / 2, $AVATAR_SIZE / 2, 0);
        $mask->drawImage($draw);
        $avatar->setImageMatte(true);
        $avatar->compositeImage($mask, \Imagick::COMPOSITE_DSTIN, 0, 0);
        $canvas->compositeImage($avatar, \Imagick::COMPOSITE_OVER, $AVATAR_X, $AVATAR_Y);
        $avatar->clear();
        $mask->clear();
    }

    if ($hasLogo) {
        $logo = new \Imagick(__DIR__ . '/logo.png');
        $logo->thumbnailImage(44, 44, true);
        $canvas->compositeImage($logo, \Imagick::COMPOSITE_OVER, 76, 520);
        $logo->clear();
    }

    $canvas->setImageBackgroundColor(new \ImagickPixel('#FAF7F2'));
    $canvas = $canvas->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
    $canvas->setImageFormat('jpeg');
    $canvas->setImageCompressionQuality(88);
    $blob = $canvas->getImageBlob();
    $canvas->clear();
    return is_string($blob) && $blob !== '' ? $blob : null;
}

/**
 * Pure PHP GD fallback for 1200x630 Writer Profile Banner (works on every Hostinger PHP plan).
 */
function kv_render_author_banner_gd(array $profile, ?string $rawAvatar): ?string
{
    if (!function_exists('imagecreatetruecolor')) {
        return kv_build_fallback_logo_jpeg(1200, 630);
    }

    $W = 1200;
    $H = 630;
    $img = imagecreatetruecolor($W, $H);
    imagealphablending($img, true);

    // Palette
    $creamBg = imagecolorallocate($img, 248, 243, 235);
    $white = imagecolorallocate($img, 255, 255, 255);
    $cardBorder = imagecolorallocate($img, 229, 217, 202);
    $maroon = imagecolorallocate($img, 122, 40, 75);
    $maroonSoft = imagecolorallocate($img, 244, 234, 240);
    $gold = imagecolorallocate($img, 217, 154, 61);
    $ink = imagecolorallocate($img, 23, 21, 26);
    $bodyText = imagecolorallocate($img, 78, 71, 82);
    $mutedText = imagecolorallocate($img, 111, 105, 112);
    $footerBg = imagecolorallocate($img, 250, 247, 242);
    $pillBg = imagecolorallocate($img, 250, 244, 236);

    // Warm cream background + card border + white card surface
    imagefilledrectangle($img, 0, 0, $W, $H, $creamBg);
    kv_gd_rounded_rect($img, 32, 32, 1136, 566, 30, $cardBorder);
    kv_gd_rounded_rect($img, 34, 34, 1132, 562, 28, $white);

    // Top maroon + gold editorial header bar
    kv_gd_rounded_rect($img, 34, 34, 1132, 32, 28, $maroon);
    imagefilledrectangle($img, 34, 52, 1166, 66, $maroon);
    imagefilledrectangle($img, 34, 42, 1166, 47, $gold);

    // Footer band
    kv_gd_rounded_rect($img, 36, 492, 1128, 102, 26, $footerBg);
    imagefilledrectangle($img, 36, 492, 1164, 518, $footerBg);
    imageline($img, 72, 490, 1128, 490, $cardBorder);

    // Left circular avatar frame
    $cx = 214;
    $cy = 258;
    $avatarD = 264;
    imagefilledellipse($img, $cx, $cy, $avatarD + 32, $avatarD + 32, $footerBg);
    imagefilledellipse($img, $cx, $cy, $avatarD + 16, $avatarD + 16, $maroon);
    imagefilledellipse($img, $cx, $cy, $avatarD + 6, $avatarD + 6, $white);

    $drewPhoto = false;
    if ($rawAvatar !== null) {
        $drewPhoto = kv_gd_draw_circular_photo($img, $rawAvatar, $cx, $cy, $avatarD);
    }

    $fontBold = __DIR__ . '/fonts/NotoSans-Bold.ttf';
    $fontReg = __DIR__ . '/fonts/NotoSans-Regular.ttf';
    $fontTe = __DIR__ . '/fonts/NotoSansTelugu-Bold.ttf';
    $hasTtf = function_exists('imagettftext') && is_readable($fontBold) && is_readable($fontReg);
    $hasTeTtf = $hasTtf && is_readable($fontTe);

    $displayName = (string) $profile['displayName'];
    $shortName = (function_exists('mb_strlen') && mb_strlen($displayName, 'UTF-8') > 26)
        ? mb_substr($displayName, 0, 25, 'UTF-8') . '…'
        : $displayName;

    if (!$drewPhoto) {
        imagefilledellipse($img, $cx, $cy, $avatarD, $avatarD, $maroon);
        $initial = function_exists('mb_substr')
            ? mb_strtoupper(mb_substr(trim($displayName) ?: 'K', 0, 1, 'UTF-8'), 'UTF-8')
            : strtoupper(substr(trim($displayName) ?: 'K', 0, 1));
        if ($hasTtf) {
            $initFont = (kv_has_telugu($initial) && $hasTeTtf) ? $fontTe : $fontBold;
            $bbox = @imagettfbbox(72, 0, $initFont, $initial);
            $tw = is_array($bbox) ? abs($bbox[2] - $bbox[0]) : 50;
            @imagettftext($img, 72, 0, (int) round($cx - $tw / 2), $cy + 28, $white, $initFont, $initial);
        }
    }

    // Label pill under avatar
    kv_gd_rounded_rect($img, 112, 420, 204, 34, 17, $maroonSoft);
    if ($hasTtf) {
        @imagettftext($img, 12, 0, 146, 442, $maroon, $fontBold, 'FEATURED WRITER');
    }

    // Right column eyebrow + conditional VERIFIED badge
    kv_gd_rounded_rect($img, 408, 92, 236, 34, 17, $pillBg);
    if ($hasTtf) {
        @imagettftext($img, 11, 0, 428, 114, $maroon, $fontBold, 'WRITER ON KATHAVAHINI');
    }

    if (!empty($profile['isVerified'])) {
        kv_gd_rounded_rect($img, 658, 92, 134, 34, 17, $maroon);
        imagefilledellipse($img, 678, 109, 18, 18, $gold);
        if ($hasTtf) {
            @imagettftext($img, 11, 0, 696, 114, $white, $fontBold, 'VERIFIED');
        }
    }

    // Writer Display Name
    if ($hasTtf) {
        $nameFont = (kv_has_telugu($shortName) && $hasTeTtf) ? $fontTe : $fontBold;
        @imagettftext($img, 34, 0, 408, 194, $ink, $nameFont, $shortName);
    }

    // Gold editorial underline
    kv_gd_rounded_rect($img, 408, 212, 84, 5, 2, $gold);

    // Writer Bio (up to 3 lines)
    $bioText = (string) ($profile['bio'] !== ''
        ? $profile['bio']
        : 'Original Telugu stories, serialized novels, and literature on Kathavahini.');
    $bioLines = kv_wrap_lines($bioText, 44, 3);
    if ($hasTtf) {
        foreach ($bioLines as $idx => $line) {
            $lineFont = (kv_has_telugu($line) && $hasTeTtf) ? $fontTe : $fontReg;
            @imagettftext($img, 16, 0, 408, 256 + $idx * 34, $bodyText, $lineFont, $line);
        }
    }

    // Real Stats Chips Row
    $stats = [
        ((int) $profile['storiesCount']) . ' Stories',
    ];
    if ((int) $profile['totalViews'] > 0) {
        $stats[] = kv_format_compact_count((int) $profile['totalViews']) . ' Views';
    }
    $stats[] = kv_format_compact_count((int) $profile['followersCount']) . ' Followers';

    $statX = 408;
    foreach ($stats as $statLabel) {
        $chipW = max(155, min(220, strlen($statLabel) * 12 + 44));
        kv_gd_rounded_rect($img, $statX - 1, 379, $chipW + 2, 54, 15, $cardBorder);
        kv_gd_rounded_rect($img, $statX, 380, $chipW, 52, 14, $footerBg);
        imagefilledellipse($img, $statX + 22, 406, 10, 10, $maroon);
        if ($hasTtf) {
            @imagettftext($img, 15, 0, $statX + 38, 412, $ink, $fontBold, $statLabel);
        }
        $statX += $chipW + 16;
    }

    // Kathavahini Logo Mark
    $brandX = 76;
    $logoPath = __DIR__ . '/logo.png';
    if (is_readable($logoPath)) {
        $lBytes = @file_get_contents($logoPath);
        $lImg = is_string($lBytes) ? @imagecreatefromstring($lBytes) : false;
        if ($lImg !== false) {
            imagecopyresampled($img, $lImg, 74, 518, 0, 0, 48, 48, imagesx($lImg), imagesy($lImg));
            imagedestroy($lImg);
            $brandX = 136;
        }
    }

    if ($hasTtf) {
        @imagettftext($img, 20, 0, $brandX, 538, $maroon, $fontBold, 'Kathavahini');
        @imagettftext($img, 12, 0, $brandX, 566, $mutedText, $fontReg, 'Read stories, novels & series on Kathavahini');
    }

    // Crisp HarfBuzz-shaped Telugu Tagline PNG ("తెలుగు సాహిత్య ప్రపంచం")
    $taglinePngPath = __DIR__ . '/assets/og/tagline-te.png';
    if (is_readable($taglinePngPath)) {
        $tBytes = @file_get_contents($taglinePngPath);
        $tImg = is_string($tBytes) ? @imagecreatefromstring($tBytes) : false;
        if ($tImg !== false) {
            $tw = imagesx($tImg);
            $th = imagesy($tImg);
            $targetH = 30;
            $targetW = (int) round($tw * ($targetH / max(1, $th)));
            imagecopyresampled($img, $tImg, $brandX + 166, 515, 0, 0, $targetW, $targetH, $tw, $th);
            imagedestroy($tImg);
        }
    }

    // Canonical Writer URL Pill Right
    $displayUrl = preg_replace('#^https?://#i', '', (string) $profile['canonicalUrl']) ?? (string) $profile['canonicalUrl'];
    if (strlen($displayUrl) > 42) {
        $displayUrl = substr($displayUrl, 0, 39) . '…';
    }
    kv_gd_rounded_rect($img, 705, 517, 426, 50, 25, $cardBorder);
    kv_gd_rounded_rect($img, 706, 518, 424, 48, 24, $white);
    if ($hasTtf) {
        $bbox = @imagettfbbox(12, 0, $fontBold, $displayUrl);
        $uw = is_array($bbox) ? abs($bbox[2] - $bbox[0]) : 280;
        $ux = max(722, (int) round(918 - $uw / 2));
        @imagettftext($img, 12, 0, $ux, 547, $maroon, $fontBold, $displayUrl);
    }

    ob_start();
    imagejpeg($img, null, 88);
    $jpeg = ob_get_clean();
    imagedestroy($img);

    return (is_string($jpeg) && $jpeg !== '') ? $jpeg : kv_build_fallback_logo_jpeg(1200, 630);
}

/* --------------------------------------------------------------------------
 * Proxy Endpoints: Cover, Avatar, Dynamic 1200x630 Writer Banner & Pre-Warm
 * -------------------------------------------------------------------------- */

function kv_fetch_story_or_novel_doc(string $id, array $collections = ['stories', 'novels', 'episodes']): ?array
{
    $requests = [];
    foreach ($collections as $col) {
        $requests[$col] = [
            'url' => KATHAVAHINI_FIRESTORE_BASE . '/' . rawurlencode($col) . '/' . rawurlencode($id),
            'method' => 'GET',
        ];
    }
    $responses = kv_http_multi($requests, 5);
    foreach ($collections as $col) {
        $doc = kv_decode_firestore_doc_response($responses[$col] ?? []);
        if ($doc !== null) {
            return $doc;
        }
    }
    return null;
}

function kv_resolve_cover_source_for_doc(array $doc): string
{
    $cover = kv_extract_cover($doc);
    if ($cover === '') {
        $parentId = (string) ($doc['novelId'] ?? $doc['storyId'] ?? '');
        if ($parentId !== '' && kv_sanitize_id($parentId) !== '') {
            $parent = kv_fetch_story_or_novel_doc($parentId, ['novels', 'stories']);
            if ($parent !== null && kv_is_content_public($parent)) {
                $cover = kv_extract_cover($parent);
            }
        }
    }
    return $cover;
}

function kv_handle_cover_proxy(string $rawId): void
{
    $id = kv_sanitize_id($rawId, true);
    if ($id === '') {
        kv_serve_fallback_logo(1200, 630);
    }

    $ver = preg_replace('/[^A-Za-z0-9_-]/', '', (string) ($_GET['v'] ?? '')) ?? '';
    $cacheKey = 'cover_' . $id . ($ver !== '' ? '_' . $ver : '');
    $cached = kv_cache_get('img', $cacheKey, KATHAVAHINI_IMG_CACHE_TTL);
    if ($cached !== null) {
        kv_send_jpeg($cached, 'HIT');
    }

    // Also check latest unversioned key generated during single-pass metadata resolution
    if ($ver === '') {
        $cachedLatest = kv_cache_get('img', 'cover_' . $id, KATHAVAHINI_IMG_CACHE_TTL);
        if ($cachedLatest !== null) {
            kv_send_jpeg($cachedLatest, 'HIT');
        }
    }

    $doc = kv_fetch_story_or_novel_doc($id);
    if ($doc === null || !kv_is_content_public($doc)) {
        kv_serve_fallback_logo(1200, 630);
    }

    $cover = kv_resolve_cover_source_for_doc($doc);
    $bytes = $cover !== '' ? kv_load_image_bytes($cover) : null;
    $jpeg = kv_build_resized_jpeg($bytes, 1200, 630);
    if ($jpeg !== null) {
        kv_cache_put('img', $cacheKey, $jpeg);
        kv_cache_put('img', 'cover_' . $id, $jpeg);
        kv_send_jpeg($jpeg, 'MISS');
    }

    kv_serve_fallback_logo(1200, 630);
}

function kv_handle_avatar_proxy(string $rawId): void
{
    $id = kv_sanitize_id($rawId, true);
    if ($id === '') {
        kv_serve_fallback_logo(512, 512);
    }

    $ver = preg_replace('/[^A-Za-z0-9_-]/', '', (string) ($_GET['v'] ?? '')) ?? '';
    $cacheKey = 'avatar_' . $id . ($ver !== '' ? '_' . $ver : '');
    $cached = kv_cache_get('img', $cacheKey, KATHAVAHINI_IMG_CACHE_TTL);
    if ($cached !== null) {
        kv_send_jpeg($cached, 'HIT');
    }

    $encId = rawurlencode($id);
    $responses = kv_http_multi([
        'user' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/users/' . $encId, 'method' => 'GET'],
        'writer' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/writers/' . $encId, 'method' => 'GET'],
        'author' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/authors/' . $encId, 'method' => 'GET'],
    ], 5);

    $userDoc = kv_decode_firestore_doc_response($responses['user'] ?? []);
    $writerDoc = kv_decode_firestore_doc_response($responses['writer'] ?? []);
    $authorDoc = kv_decode_firestore_doc_response($responses['author'] ?? []);

    if (!empty($userDoc['deleted']) || !empty($writerDoc['deleted'])) {
        kv_serve_fallback_logo(512, 512);
    }

    $avatar = kv_pick_author_avatar($userDoc, $writerDoc, $authorDoc);
    $bytes = $avatar !== '' ? kv_load_image_bytes($avatar) : null;
    $jpeg = kv_build_resized_jpeg($bytes, 512, 512);
    if ($jpeg !== null) {
        kv_cache_put('img', $cacheKey, $jpeg);
        kv_cache_put('img', 'avatar_' . $id, $jpeg);
        kv_send_jpeg($jpeg, 'MISS');
    }

    kv_serve_fallback_logo(512, 512);
}

function kv_handle_author_card_proxy(string $rawId): void
{
    $id = kv_sanitize_id($rawId, true);
    if ($id === '') {
        kv_serve_fallback_logo(1200, 630);
    }

    $ver = preg_replace('/[^A-Za-z0-9_-]/', '', (string) ($_GET['v'] ?? '')) ?? '';
    $cacheKey = 'author_card_' . $id . ($ver !== '' ? '_' . $ver : '');
    $cached = kv_cache_get('img', $cacheKey, KATHAVAHINI_IMG_CACHE_TTL);
    if ($cached !== null) {
        kv_send_jpeg($cached, 'HIT');
    }

    $profile = kv_resolve_author_profile($id);
    if ($profile === null) {
        kv_serve_fallback_logo(1200, 630);
    }

    $jpeg = kv_render_author_banner_jpeg($profile);
    if ($jpeg !== null) {
        kv_cache_put('img', $cacheKey, $jpeg);
        kv_cache_put('img', 'author_card_' . $id . '_' . $profile['versionHash'], $jpeg);
        kv_cache_put('img', 'author_card_' . $id, $jpeg);
        kv_send_jpeg($jpeg, 'MISS');
    }

    kv_serve_fallback_logo(1200, 630);
}

/* --------------------------------------------------------------------------
 * Open Graph HTML Renderer & Resolver
 * -------------------------------------------------------------------------- */

function kv_esc(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

function kv_build_og_html(array $meta, bool $isShareRedirect): string
{
    $siteName = $meta['siteName'] ?? KATHAVAHINI_STORY_SITE_NAME;
    $title = $meta['title'] ?? KATHAVAHINI_DEFAULT_TITLE;
    $pageTitle = $meta['pageTitle'] ?? ($title . ' | ' . $siteName);
    $description = $meta['description'] ?? KATHAVAHINI_DEFAULT_DESC;
    $image = $meta['image'] ?? (KATHAVAHINI_SITE_URL . '/logo.png');
    $imageType = $meta['imageType'] ?? 'image/jpeg';
    $imageWidth = (int) ($meta['imageWidth'] ?? 1200);
    $imageHeight = (int) ($meta['imageHeight'] ?? 630);
    $imageAlt = $meta['imageAlt'] ?? $title;
    $canonicalUrl = $meta['url'] ?? KATHAVAHINI_SITE_URL;
    $ogType = $meta['ogType'] ?? 'website';
    $authorName = $meta['authorName'] ?? '';

    $eTitle = kv_esc($title);
    $ePageTitle = kv_esc($pageTitle);
    $eDesc = kv_esc($description);
    $eImage = kv_esc($image);
    $eImageType = kv_esc($imageType);
    $eImageAlt = kv_esc($imageAlt);
    $eUrl = kv_esc($canonicalUrl);
    $eSite = kv_esc($siteName);
    $eOgType = kv_esc($ogType);
    $eAuthor = kv_esc($authorName);

    $out = "<!DOCTYPE html>\n";
    $out .= "<html lang=\"te\">\n";
    $out .= "<head>\n";
    $out .= "  <meta charset=\"UTF-8\" />\n";
    $out .= "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n";
    $out .= "  <title>{$ePageTitle}</title>\n";
    $out .= "  <meta name=\"description\" content=\"{$eDesc}\" />\n";
    $out .= "  <link rel=\"canonical\" href=\"{$eUrl}\" />\n";
    $out .= "  <meta property=\"og:site_name\" content=\"{$eSite}\" />\n";
    $out .= "  <meta property=\"og:locale\" content=\"te_IN\" />\n";
    $out .= "  <meta property=\"og:type\" content=\"{$eOgType}\" />\n";
    $out .= "  <meta property=\"og:title\" content=\"{$eTitle}\" />\n";
    $out .= "  <meta property=\"og:description\" content=\"{$eDesc}\" />\n";
    $out .= "  <meta property=\"og:url\" content=\"{$eUrl}\" />\n";
    $out .= "  <meta property=\"og:image\" content=\"{$eImage}\" />\n";
    $out .= "  <meta property=\"og:image:secure_url\" content=\"{$eImage}\" />\n";
    $out .= "  <meta property=\"og:image:type\" content=\"{$eImageType}\" />\n";
    $out .= "  <meta property=\"og:image:width\" content=\"{$imageWidth}\" />\n";
    $out .= "  <meta property=\"og:image:height\" content=\"{$imageHeight}\" />\n";
    $out .= "  <meta property=\"og:image:alt\" content=\"{$eImageAlt}\" />\n";
    if ($eAuthor !== '' && $ogType === 'article') {
        $out .= "  <meta property=\"article:author\" content=\"{$eAuthor}\" />\n";
    }
    $out .= "  <meta name=\"twitter:card\" content=\"summary_large_image\" />\n";
    $out .= "  <meta name=\"twitter:title\" content=\"{$eTitle}\" />\n";
    $out .= "  <meta name=\"twitter:description\" content=\"{$eDesc}\" />\n";
    $out .= "  <meta name=\"twitter:image\" content=\"{$eImage}\" />\n";
    $out .= "  <meta name=\"twitter:image:alt\" content=\"{$eImageAlt}\" />\n";
    if ($isShareRedirect) {
        $jsUrl = json_encode($canonicalUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $out .= "  <script>window.location.replace({$jsUrl});</script>\n";
    }
    $out .= "</head>\n";
    $out .= "<body style=\"font-family:system-ui,-apple-system,sans-serif;background:#FAF7F2;color:#17151A;padding:32px;max-width:680px;margin:0 auto;\">\n";
    $out .= "  <h1 style=\"font-size:24px;margin:0 0 12px;\">{$eTitle}</h1>\n";
    $out .= "  <p style=\"font-size:16px;line-height:1.6;color:#4B5563;\">{$eDesc}</p>\n";
    $out .= "  <p><a href=\"{$eUrl}\" style=\"color:#7A284B;font-weight:600;\">Read on Kathavahini &rarr;</a></p>\n";
    $out .= "</body>\n";
    $out .= "</html>\n";
    return $out;
}

function kv_send_og_html(string $html, string $cacheStatus = 'MISS'): void
{
    header('HTTP/1.1 200 OK');
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=300, s-maxage=600');
    header('Vary: User-Agent');
    header('X-Cache: ' . $cacheStatus);
    header('X-Content-Type-Options: nosniff');
    echo $html;
    exit;
}

function kv_resolve_route(): array
{
    $type = strtolower(trim((string) ($_GET['type'] ?? '')));
    $id = trim((string) ($_GET['id'] ?? ''));

    if ($type === '' || $id === '') {
        foreach (['story', 'novel', 'episode', 'author', 'profile'] as $param) {
            if (isset($_GET[$param]) && trim((string) $_GET[$param]) !== '') {
                $type = $param;
                $id = trim((string) $_GET[$param]);
                break;
            }
        }
    }

    if ($type === '' || $id === '') {
        $uriPath = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH);
        if (preg_match('#^/(?:share/)?(story|novel|episode|author|profile)/([^/?#]+)#i', $uriPath, $m)) {
            $type = strtolower($m[1]);
            $id = $m[2];
        }
    }

    return [$type, kv_sanitize_id($id, false)];
}

function kv_resolve_story_author_name(array $doc): string
{
    if (isset($doc['author']) && is_array($doc['author'])) {
        foreach (['teluguName', 'name', 'displayName', 'penName'] as $k) {
            if (isset($doc['author'][$k]) && is_string($doc['author'][$k])) {
                $v = kv_strip_text($doc['author'][$k]);
                if ($v !== '' && strpos($v, '@') === false) {
                    return $v;
                }
            }
        }
    }
    foreach (['authorTeluguName', 'authorName', 'writerName', 'teluguName'] as $field) {
        if (isset($doc[$field]) && is_string($doc[$field])) {
            $v = kv_strip_text($doc[$field]);
            if ($v !== '' && strpos($v, '@') === false) {
                return $v;
            }
        }
    }
    $authorId = trim((string) ($doc['authorId'] ?? $doc['writerId'] ?? (is_array($doc['author'] ?? null) ? ($doc['author']['id'] ?? '') : '')));
    if ($authorId !== '' && kv_sanitize_id($authorId) !== '') {
        $encId = rawurlencode($authorId);
        $res = kv_http_multi([
            'writer' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/writers/' . $encId, 'method' => 'GET'],
            'user' => ['url' => KATHAVAHINI_FIRESTORE_BASE . '/users/' . $encId, 'method' => 'GET'],
        ], 4);
        return kv_pick_author_name(
            kv_decode_firestore_doc_response($res['user'] ?? []),
            kv_decode_firestore_doc_response($res['writer'] ?? []),
            null
        );
    }
    return '';
}

function kv_extract_excerpt(array $doc): string
{
    foreach (['teluguExcerpt', 'excerpt', 'teluguDescription', 'description', 'summary'] as $field) {
        if (isset($doc[$field]) && is_string($doc[$field])) {
            $v = kv_strip_text($doc[$field]);
            if ($v !== '') {
                return $v;
            }
        }
    }
    if (isset($doc['content'])) {
        if (is_array($doc['content'])) {
            $joined = implode(' ', array_filter($doc['content'], 'is_string'));
            return kv_strip_text($joined);
        }
        if (is_string($doc['content'])) {
            return kv_strip_text($doc['content']);
        }
    }
    return '';
}

/**
 * Resolves metadata AND pre-generates the 1200x630 JPEG image to disk in a single pass.
 * Returns ['html' => string, 'imageUrl' => string]
 */
function kv_resolve_and_warm_entity(string $type, string $id, bool $isShareRedirect): array
{
    $htmlCacheKey = $type . '_' . $id . '_' . ($isShareRedirect ? 'r1' : 'r0');

    if ($type === 'author' || $type === 'profile') {
        $profile = kv_resolve_author_profile($id);
        if ($profile === null) {
            $fallbackHtml = kv_build_og_html([
                'siteName' => KATHAVAHINI_PROFILE_SITE_NAME,
                'title' => KATHAVAHINI_DEFAULT_TITLE,
                'description' => KATHAVAHINI_DEFAULT_DESC,
                'image' => KATHAVAHINI_SITE_URL . '/logo.png',
                'imageType' => 'image/png',
                'imageWidth' => 512,
                'imageHeight' => 512,
                'url' => KATHAVAHINI_SITE_URL . '/author/' . rawurlencode($id),
                'ogType' => 'profile',
            ], $isShareRedirect);
            return ['html' => $fallbackHtml, 'imageUrl' => KATHAVAHINI_SITE_URL . '/logo.png'];
        }

        $name = $profile['displayName'];
        $bio = $profile['bio'];
        $statParts = [$profile['storiesCount'] . ' కథలు'];
        if ($profile['totalViews'] > 0) {
            $statParts[] = kv_format_compact_count((int) $profile['totalViews']) . ' వీక్షణలు';
        }
        $statParts[] = kv_format_compact_count((int) $profile['followersCount']) . ' అనుచరులు';
        $statsStr = implode(' • ', $statParts);

        $desc = $bio !== ''
            ? kv_truncate($bio, 105) . ' | ' . $statsStr
            : "Writer on Kathavahini ({$statsStr}). Read original Telugu stories & novels by {$name}.";

        $vHash = $profile['versionHash'];
        $imageUrl = KATHAVAHINI_SITE_URL . '/api/author-card/' . rawurlencode($id) . '.jpg?v=' . $vHash;

        // Pre-render & cache 1200x630 writer banner JPEG so WhatsApp's og:image request hits disk in <50ms
        $imgCacheKey = 'author_card_' . $id . '_' . $vHash;
        if (kv_cache_get('img', $imgCacheKey, KATHAVAHINI_IMG_CACHE_TTL) === null) {
            $bannerJpeg = kv_render_author_banner_jpeg($profile);
            if ($bannerJpeg !== null) {
                kv_cache_put('img', $imgCacheKey, $bannerJpeg);
                kv_cache_put('img', 'author_card_' . $id, $bannerJpeg);
            }
        }

        $html = kv_build_og_html([
            'siteName' => KATHAVAHINI_PROFILE_SITE_NAME,
            'title' => $name,
            'pageTitle' => $name . ' | ' . KATHAVAHINI_PROFILE_SITE_NAME,
            'description' => $desc,
            'image' => $imageUrl,
            'imageType' => 'image/jpeg',
            'imageWidth' => 1200,
            'imageHeight' => 630,
            'imageAlt' => $name . ' — Writer on Kathavahini',
            'url' => $profile['canonicalUrl'],
            'ogType' => 'profile',
        ], $isShareRedirect);

        kv_cache_put('html', $htmlCacheKey, $html);
        return ['html' => $html, 'imageUrl' => $imageUrl];
    }

    // Story, Novel, or Episode
    $collections = ['stories', 'novels', 'episodes'];
    if ($type === 'novel') {
        $collections = ['novels', 'stories'];
    } elseif ($type === 'episode') {
        $collections = ['episodes', 'stories', 'novels'];
    }

    $doc = kv_fetch_story_or_novel_doc($id, $collections);
    $canonicalPath = ($type === 'novel' ? '/novel/' : ($type === 'episode' ? '/episode/' : '/story/')) . rawurlencode($id);
    $canonicalUrl = KATHAVAHINI_SITE_URL . $canonicalPath;

    if ($doc === null || !kv_is_content_public($doc)) {
        $fallbackHtml = kv_build_og_html([
            'siteName' => KATHAVAHINI_STORY_SITE_NAME,
            'title' => KATHAVAHINI_DEFAULT_TITLE,
            'pageTitle' => KATHAVAHINI_DEFAULT_TITLE,
            'description' => KATHAVAHINI_DEFAULT_DESC,
            'image' => KATHAVAHINI_SITE_URL . '/logo.png',
            'imageType' => 'image/png',
            'imageWidth' => 512,
            'imageHeight' => 512,
            'url' => $canonicalUrl,
            'ogType' => 'article',
        ], $isShareRedirect);
        return ['html' => $fallbackHtml, 'imageUrl' => KATHAVAHINI_SITE_URL . '/logo.png'];
    }

    $rawTitle = kv_strip_text((string) ($doc['teluguTitle'] ?? $doc['title'] ?? $doc['name'] ?? ''));
    if ($type === 'episode' && !empty($doc['novelTitle'])) {
        $epPart = $rawTitle !== '' ? $rawTitle : (($doc['episodeNumber'] ?? 1) . 'వ భాగం');
        $rawTitle = kv_strip_text((string) $doc['novelTitle']) . ' - ' . $epPart;
    }
    $title = $rawTitle !== '' ? $rawTitle : KATHAVAHINI_DEFAULT_TITLE;
    $authorName = kv_resolve_story_author_name($doc);

    $rawDesc = kv_extract_excerpt($doc);
    $cleanDesc = kv_truncate($rawDesc, $authorName !== '' ? 128 : 158);
    if ($cleanDesc === '') {
        $cleanDesc = $authorName !== ''
            ? "Read \"{$title}\" by {$authorName} on Kathavahini."
            : "Read \"{$title}\" on Kathavahini.";
    }
    if ($authorName !== '' && stripos($cleanDesc, $authorName) === false) {
        $cleanDesc .= ' — By: ' . $authorName;
    }

    $coverSrc = kv_resolve_cover_source_for_doc($doc);
    $versionHash = substr(md5($coverSrc . ($doc['_updateTime'] ?? '')), 0, 8);
    $imageUrl = KATHAVAHINI_SITE_URL . '/api/cover/' . rawurlencode($id) . '.jpg?v=' . $versionHash;

    // Single-pass cover pre-generation so WhatsApp's immediate og:image fetch hits disk in <50ms
    $imgCacheKey = 'cover_' . $id . '_' . $versionHash;
    if (kv_cache_get('img', $imgCacheKey, KATHAVAHINI_IMG_CACHE_TTL) === null) {
        $coverBytes = $coverSrc !== '' ? kv_load_image_bytes($coverSrc) : null;
        $coverJpeg = kv_build_resized_jpeg($coverBytes, 1200, 630);
        if ($coverJpeg !== null) {
            kv_cache_put('img', $imgCacheKey, $coverJpeg);
            kv_cache_put('img', 'cover_' . $id, $coverJpeg);
        }
    }

    $html = kv_build_og_html([
        'siteName' => KATHAVAHINI_STORY_SITE_NAME,
        'title' => $title,
        'pageTitle' => $title . ' | ' . KATHAVAHINI_STORY_SITE_NAME,
        'description' => $cleanDesc,
        'image' => $imageUrl,
        'imageType' => 'image/jpeg',
        'imageWidth' => 1200,
        'imageHeight' => 630,
        'imageAlt' => $title,
        'url' => $canonicalUrl,
        'ogType' => 'article',
        'authorName' => $authorName,
    ], $isShareRedirect);

    kv_cache_put('html', $htmlCacheKey, $html);
    return ['html' => $html, 'imageUrl' => $imageUrl];
}

function kv_handle_metadata(): void
{
    [$type, $id] = kv_resolve_route();
    $isShareRedirect = ((string) ($_GET['share'] ?? '')) === '1';

    if ($type === '' || $id === '') {
        $html = kv_build_og_html([
            'siteName' => KATHAVAHINI_STORY_SITE_NAME,
            'title' => KATHAVAHINI_DEFAULT_TITLE,
            'pageTitle' => KATHAVAHINI_DEFAULT_TITLE,
            'description' => KATHAVAHINI_DEFAULT_DESC,
            'image' => KATHAVAHINI_SITE_URL . '/logo.png',
            'imageType' => 'image/png',
            'imageWidth' => 512,
            'imageHeight' => 512,
            'url' => KATHAVAHINI_SITE_URL,
            'ogType' => 'website',
        ], false);
        kv_send_og_html($html, 'DEFAULT');
    }

    $htmlCacheKey = $type . '_' . $id . '_' . ($isShareRedirect ? 'r1' : 'r0');
    $cachedHtml = kv_cache_get('html', $htmlCacheKey, KATHAVAHINI_HTML_CACHE_TTL);
    if ($cachedHtml !== null) {
        kv_send_og_html($cachedHtml, 'HIT');
    }

    $resolved = kv_resolve_and_warm_entity($type, $id, $isShareRedirect);
    kv_send_og_html($resolved['html'], 'MISS');
}

function kv_handle_warm(): void
{
    $type = strtolower(trim((string) ($_GET['type'] ?? '')));
    $id = kv_sanitize_id((string) ($_GET['id'] ?? ''), false);

    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    header('Access-Control-Allow-Origin: *');

    if ($id === '' || !in_array($type, ['story', 'novel', 'episode', 'author', 'profile'], true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid type or id']);
        exit;
    }

    $htmlCacheKey = $type . '_' . $id . '_r0';
    $alreadyHot = kv_cache_get('html', $htmlCacheKey, KATHAVAHINI_HTML_CACHE_TTL) !== null;
    if ($alreadyHot) {
        echo json_encode(['ok' => true, 'cached' => true]);
        exit;
    }

    $resolved = kv_resolve_and_warm_entity($type, $id, false);
    echo json_encode([
        'ok' => true,
        'cached' => false,
        'imageUrl' => $resolved['imageUrl'],
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

// Entrypoint dispatcher
$mode = strtolower(trim((string) ($_GET['mode'] ?? '')));
if ($mode === 'cover') {
    kv_handle_cover_proxy((string) ($_GET['id'] ?? ''));
} elseif ($mode === 'avatar') {
    kv_handle_avatar_proxy((string) ($_GET['id'] ?? ''));
} elseif ($mode === 'author_card') {
    kv_handle_author_card_proxy((string) ($_GET['id'] ?? ''));
} elseif ($mode === 'warm') {
    kv_handle_warm();
} else {
    kv_handle_metadata();
}
