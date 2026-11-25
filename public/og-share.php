<?php
/**
 * Kathavahini — Production Server-Side Open Graph & Social Image Proxy
 *
 * Runs natively on Hostinger / LiteSpeed (PHP 7.4+ / 8.x) without requiring Node.js.
 * - Serves rich HTML Open Graph + Twitter Card metadata to social crawlers
 *   (WhatsApp, Facebook, Telegram, X/Twitter, LinkedIn, Discord, iMessage, etc.)
 *   on /story/:id, /novel/:id, /episode/:id, /author/:id, /profile/:id, and /share/...
 * - Serves WhatsApp-compatible 1200x630 JPEG cover thumbnails (/api/cover/:id.jpg)
 *   and 512x512 JPEG writer avatars (/api/avatar/:id.jpg), converting Firestore
 *   base64/WebP/PNG/SVG images via PHP GD so every crawler displays the real image.
 */

declare(strict_types=1);

const KATHAVAHINI_SITE_URL = 'https://kathavahini.in';
const KATHAVAHINI_SITE_NAME = 'Kathavahini — Telugu Stories';
const KATHAVAHINI_DEFAULT_TITLE = 'Kathavahini — Telugu Stories & Novels';
const KATHAVAHINI_DEFAULT_DESC = 'Read original Telugu stories, novels, episodes, Balavinodhini, and timeless literature on Kathavahini.';
const KATHAVAHINI_FIREBASE_PROJECT = 'kathavahini-9a9c1';
const KATHAVAHINI_FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/' . KATHAVAHINI_FIREBASE_PROJECT . '/databases/(default)/documents';

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

function kv_http_get(string $url, int $timeout = 5): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            return ['status' => 0, 'body' => '', 'contentType' => ''];
        }
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_USERAGENT => 'KathavahiniOGBot/1.0 (+https://kathavahini.in)',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
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

    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => $timeout,
            'follow_location' => 0,
            'ignore_errors' => true,
            'header' => "User-Agent: KathavahiniOGBot/1.0 (+https://kathavahini.in)\r\n",
        ],
    ]);
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

function kv_fetch_firestore_doc(string $collection, string $docId): ?array
{
    if ($docId === '') {
        return null;
    }
    $url = KATHAVAHINI_FIRESTORE_BASE . '/' . rawurlencode($collection) . '/' . rawurlencode($docId);
    $res = kv_http_get($url, 5);
    if ($res['status'] !== 200 || $res['body'] === '') {
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
    return $data;
}

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
    // Strip accidental PII (email addresses / long phone numbers)
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
    // Prefer real uploaded photo over generated Dicebear avatars
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

    // Rewrite Dicebear SVG URLs to PNG so GD can convert them cleanly to JPEG
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

function kv_serve_fallback_logo(int $targetW, int $targetH): void
{
    $logoPath = __DIR__ . '/logo.png';
    if (function_exists('imagecreatetruecolor') && is_readable($logoPath)) {
        $logoBytes = @file_get_contents($logoPath);
        if (is_string($logoBytes) && $logoBytes !== '') {
            $logoImg = @imagecreatefromstring($logoBytes);
            if ($logoImg !== false) {
                $canvas = imagecreatetruecolor($targetW, $targetH);
                $bg = imagecolorallocate($canvas, 250, 247, 242); // #FAF7F2
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
                if (is_string($jpeg) && $jpeg !== '') {
                    header('HTTP/1.1 200 OK');
                    header('Content-Type: image/jpeg');
                    header('Content-Length: ' . strlen($jpeg));
                    header('Cache-Control: public, max-age=86400, s-maxage=86400');
                    header('X-Content-Type-Options: nosniff');
                    header('Access-Control-Allow-Origin: *');
                    echo $jpeg;
                    exit;
                }
            }
        }
    }

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

function kv_output_resized_jpeg(?string $rawBytes, int $targetW, int $targetH): void
{
    if ($rawBytes === null || $rawBytes === '' || !function_exists('imagecreatefromstring')) {
        kv_serve_fallback_logo($targetW, $targetH);
    }

    $src = @imagecreatefromstring($rawBytes);
    if ($src === false) {
        kv_serve_fallback_logo($targetW, $targetH);
    }

    $srcW = imagesx($src);
    $srcH = imagesy($src);
    if ($srcW <= 0 || $srcH <= 0) {
        imagedestroy($src);
        kv_serve_fallback_logo($targetW, $targetH);
    }

    // Center-crop cover fit so WhatsApp/Facebook cards look crisp at 1200x630 or 512x512
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

    if (!is_string($jpeg) || $jpeg === '') {
        kv_serve_fallback_logo($targetW, $targetH);
    }

    header('HTTP/1.1 200 OK');
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . strlen($jpeg));
    header('Cache-Control: public, max-age=86400, s-maxage=86400');
    header('X-Content-Type-Options: nosniff');
    header('Access-Control-Allow-Origin: *');
    echo $jpeg;
    exit;
}

function kv_handle_cover_proxy(string $rawId): void
{
    $id = kv_sanitize_id($rawId, true);
    if ($id === '') {
        kv_serve_fallback_logo(1200, 630);
    }

    $doc = kv_fetch_firestore_doc('stories', $id);
    if ($doc === null) {
        $doc = kv_fetch_firestore_doc('novels', $id);
    }
    if ($doc === null) {
        $doc = kv_fetch_firestore_doc('episodes', $id);
    }

    if ($doc === null || !kv_is_content_public($doc)) {
        kv_serve_fallback_logo(1200, 630);
    }

    $cover = kv_extract_cover($doc);
    if ($cover === '') {
        $parentId = (string) ($doc['novelId'] ?? $doc['storyId'] ?? '');
        if ($parentId !== '') {
            $parent = kv_fetch_firestore_doc('novels', $parentId) ?? kv_fetch_firestore_doc('stories', $parentId);
            if ($parent !== null && kv_is_content_public($parent)) {
                $cover = kv_extract_cover($parent);
            }
        }
    }

    $bytes = $cover !== '' ? kv_load_image_bytes($cover) : null;
    kv_output_resized_jpeg($bytes, 1200, 630);
}

function kv_handle_avatar_proxy(string $rawId): void
{
    $id = kv_sanitize_id($rawId, true);
    if ($id === '') {
        kv_serve_fallback_logo(512, 512);
    }

    $userDoc = kv_fetch_firestore_doc('users', $id);
    $writerDoc = kv_fetch_firestore_doc('writers', $id);
    $authorDoc = kv_fetch_firestore_doc('authors', $id);

    if (!empty($userDoc['deleted']) || !empty($writerDoc['deleted'])) {
        kv_serve_fallback_logo(512, 512);
    }

    $avatar = kv_pick_author_avatar($userDoc, $writerDoc, $authorDoc);
    $bytes = $avatar !== '' ? kv_load_image_bytes($avatar) : null;
    kv_output_resized_jpeg($bytes, 512, 512);
}

function kv_esc(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

function kv_render_og_html(array $meta, bool $isShareRedirect): void
{
    $title = $meta['title'] ?? KATHAVAHINI_DEFAULT_TITLE;
    $pageTitle = $meta['pageTitle'] ?? ($title . ' | ' . KATHAVAHINI_SITE_NAME);
    $description = $meta['description'] ?? KATHAVAHINI_DEFAULT_DESC;
    $image = $meta['image'] ?? (KATHAVAHINI_SITE_URL . '/logo.png');
    $imageType = $meta['imageType'] ?? 'image/jpeg';
    $imageWidth = (int) ($meta['imageWidth'] ?? 1200);
    $imageHeight = (int) ($meta['imageHeight'] ?? 630);
    $imageAlt = $meta['imageAlt'] ?? $title;
    $canonicalUrl = $meta['url'] ?? KATHAVAHINI_SITE_URL;
    $ogType = $meta['ogType'] ?? 'website';
    $authorName = $meta['authorName'] ?? '';

    header('HTTP/1.1 200 OK');
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=300, s-maxage=600');
    header('Vary: User-Agent');
    header('X-Content-Type-Options: nosniff');

    $eTitle = kv_esc($title);
    $ePageTitle = kv_esc($pageTitle);
    $eDesc = kv_esc($description);
    $eImage = kv_esc($image);
    $eImageType = kv_esc($imageType);
    $eImageAlt = kv_esc($imageAlt);
    $eUrl = kv_esc($canonicalUrl);
    $eSite = kv_esc(KATHAVAHINI_SITE_NAME);
    $eOgType = kv_esc($ogType);
    $eAuthor = kv_esc($authorName);

    echo "<!DOCTYPE html>\n";
    echo "<html lang=\"te\">\n";
    echo "<head>\n";
    echo "  <meta charset=\"UTF-8\" />\n";
    echo "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n";
    echo "  <title>{$ePageTitle}</title>\n";
    echo "  <meta name=\"description\" content=\"{$eDesc}\" />\n";
    echo "  <link rel=\"canonical\" href=\"{$eUrl}\" />\n";
    echo "  <meta property=\"og:site_name\" content=\"{$eSite}\" />\n";
    echo "  <meta property=\"og:locale\" content=\"te_IN\" />\n";
    echo "  <meta property=\"og:type\" content=\"{$eOgType}\" />\n";
    echo "  <meta property=\"og:title\" content=\"{$eTitle}\" />\n";
    echo "  <meta property=\"og:description\" content=\"{$eDesc}\" />\n";
    echo "  <meta property=\"og:url\" content=\"{$eUrl}\" />\n";
    echo "  <meta property=\"og:image\" content=\"{$eImage}\" />\n";
    echo "  <meta property=\"og:image:secure_url\" content=\"{$eImage}\" />\n";
    echo "  <meta property=\"og:image:type\" content=\"{$eImageType}\" />\n";
    echo "  <meta property=\"og:image:width\" content=\"{$imageWidth}\" />\n";
    echo "  <meta property=\"og:image:height\" content=\"{$imageHeight}\" />\n";
    echo "  <meta property=\"og:image:alt\" content=\"{$eImageAlt}\" />\n";
    if ($eAuthor !== '' && $ogType === 'article') {
        echo "  <meta property=\"article:author\" content=\"{$eAuthor}\" />\n";
    }
    echo "  <meta name=\"twitter:card\" content=\"summary_large_image\" />\n";
    echo "  <meta name=\"twitter:title\" content=\"{$eTitle}\" />\n";
    echo "  <meta name=\"twitter:description\" content=\"{$eDesc}\" />\n";
    echo "  <meta name=\"twitter:image\" content=\"{$eImage}\" />\n";
    echo "  <meta name=\"twitter:image:alt\" content=\"{$eImageAlt}\" />\n";
    if ($isShareRedirect) {
        $jsUrl = json_encode($canonicalUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        echo "  <script>window.location.replace({$jsUrl});</script>\n";
    }
    echo "</head>\n";
    echo "<body style=\"font-family:system-ui,-apple-system,sans-serif;background:#FAF7F2;color:#17151A;padding:32px;max-width:680px;margin:0 auto;\">\n";
    echo "  <h1 style=\"font-size:24px;margin:0 0 12px;\">{$eTitle}</h1>\n";
    echo "  <p style=\"font-size:16px;line-height:1.6;color:#4B5563;\">{$eDesc}</p>\n";
    echo "  <p><a href=\"{$eUrl}\" style=\"color:#7A284B;font-weight:600;\">Read on Kathavahini &rarr;</a></p>\n";
    echo "</body>\n";
    echo "</html>\n";
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
        $writerDoc = kv_fetch_firestore_doc('writers', $authorId);
        $userDoc = $writerDoc === null ? kv_fetch_firestore_doc('users', $authorId) : null;
        return kv_pick_author_name($userDoc, $writerDoc, null);
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

function kv_handle_metadata(): void
{
    [$type, $id] = kv_resolve_route();
    $isShareRedirect = ((string) ($_GET['share'] ?? '')) === '1';

    if ($type === '' || $id === '') {
        kv_render_og_html([
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
    }

    if ($type === 'author' || $type === 'profile') {
        $userDoc = kv_fetch_firestore_doc('users', $id);
        $writerDoc = kv_fetch_firestore_doc('writers', $id);
        $authorDoc = kv_fetch_firestore_doc('authors', $id);

        if (
            ($userDoc === null && $writerDoc === null && $authorDoc === null) ||
            !empty($userDoc['deleted']) ||
            !empty($writerDoc['deleted'])
        ) {
            kv_render_og_html([
                'title' => KATHAVAHINI_DEFAULT_TITLE,
                'description' => KATHAVAHINI_DEFAULT_DESC,
                'image' => KATHAVAHINI_SITE_URL . '/logo.png',
                'imageType' => 'image/png',
                'imageWidth' => 512,
                'imageHeight' => 512,
                'url' => KATHAVAHINI_SITE_URL . '/author/' . rawurlencode($id),
                'ogType' => 'profile',
            ], $isShareRedirect);
        }

        $name = kv_pick_author_name($userDoc, $writerDoc, $authorDoc);
        $bio = kv_pick_author_bio($userDoc, $writerDoc, $authorDoc);
        $desc = $bio !== ''
            ? kv_truncate($bio, 125) . ' • Writer on Kathavahini.'
            : "Writer on Kathavahini. Read original Telugu stories, novels, and series by {$name}.";

        $avatarSrc = kv_pick_author_avatar($userDoc, $writerDoc, $authorDoc);
        $versionHash = substr(md5($avatarSrc . ($writerDoc['_updateTime'] ?? $userDoc['_updateTime'] ?? '')), 0, 8);
        $imageUrl = KATHAVAHINI_SITE_URL . '/api/avatar/' . rawurlencode($id) . '.jpg?v=' . $versionHash;

        kv_render_og_html([
            'title' => $name,
            'pageTitle' => $name . ' | ' . KATHAVAHINI_SITE_NAME,
            'description' => $desc,
            'image' => $imageUrl,
            'imageType' => 'image/jpeg',
            'imageWidth' => 512,
            'imageHeight' => 512,
            'imageAlt' => $name . ' — Writer on Kathavahini',
            'url' => KATHAVAHINI_SITE_URL . '/author/' . rawurlencode($id),
            'ogType' => 'profile',
        ], $isShareRedirect);
    }

    // Story, Novel, or Episode
    $collections = ['stories', 'novels', 'episodes'];
    if ($type === 'novel') {
        $collections = ['novels', 'stories'];
    } elseif ($type === 'episode') {
        $collections = ['episodes', 'stories', 'novels'];
    }

    $doc = null;
    foreach ($collections as $col) {
        $found = kv_fetch_firestore_doc($col, $id);
        if ($found !== null) {
            $doc = $found;
            break;
        }
    }

    $canonicalPath = ($type === 'novel' ? '/novel/' : ($type === 'episode' ? '/episode/' : '/story/')) . rawurlencode($id);
    $canonicalUrl = KATHAVAHINI_SITE_URL . $canonicalPath;

    if ($doc === null || !kv_is_content_public($doc)) {
        kv_render_og_html([
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

    $coverSrc = kv_extract_cover($doc);
    $versionHash = substr(md5($coverSrc . ($doc['_updateTime'] ?? '')), 0, 8);
    $imageUrl = KATHAVAHINI_SITE_URL . '/api/cover/' . rawurlencode($id) . '.jpg?v=' . $versionHash;

    kv_render_og_html([
        'title' => $title,
        'pageTitle' => $title . ' | ' . KATHAVAHINI_SITE_NAME,
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
}

// Entrypoint dispatcher
$mode = strtolower(trim((string) ($_GET['mode'] ?? '')));
if ($mode === 'cover') {
    kv_handle_cover_proxy((string) ($_GET['id'] ?? ''));
} elseif ($mode === 'avatar') {
    kv_handle_avatar_proxy((string) ($_GET['id'] ?? ''));
} else {
    kv_handle_metadata();
}
