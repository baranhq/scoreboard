<?php
declare(strict_types=1);
const ALLOWED_EVENTS = ['create_scoreboard', 'enter_fullscreen', 'export_backup', 'import_backup'];
function capabilities(array $c): array {return ['usage' => $c['analytics'], 'cloud' => (bool)preg_match('/^[a-f0-9]{32}$/D', $c['cloud_token'])];}
function preferences(PDO $db): ?array {
    $hash = cookie_hash(); if (!$hash) return null;
    $q = $db->prepare('SELECT * FROM preferences WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP()'); $q->execute([$hash]); return $q->fetch(PDO::FETCH_ASSOC) ?: null;
}
function consent_state(array $c, ?array $p): array {
    $caps = capabilities($c);
    return ['saved' => $p !== null, 'usage' => $caps['usage'] && (bool)($p['usage_allowed'] ?? false), 'cloud' => $caps['cloud'] && (bool)($p['cloud_allowed'] ?? false), 'capabilities' => $caps, 'cloudToken' => $caps['cloud'] && (bool)($p['cloud_allowed'] ?? false) ? $c['cloud_token'] : null];
}
function save_consent(PDO $db, array $c, array $data): never {
    if (array_diff(array_keys($data), ['usage','cloud'])) fail(400);
    foreach (['usage','cloud'] as $key) if (!array_key_exists($key,$data) || !is_bool($data[$key])) fail(400);
    $caps = capabilities($c); $usage = $caps['usage'] && $data['usage']; $cloud = $caps['cloud'] && $data['cloud'];
    $token = cookie_token() ?? bin2hex(random_bytes(32)); $hash = hash('sha256', $token);
    $db->beginTransaction();
    $q = $db->prepare('INSERT IGNORE INTO preferences (token_hash,expires_at,updated_at) VALUES (?,UTC_TIMESTAMP() + INTERVAL 180 DAY,UTC_TIMESTAMP())'); $q->execute([$hash]);
    $q = $db->prepare('SELECT token_hash FROM preferences WHERE token_hash = ? FOR UPDATE'); $q->execute([$hash]); $q->fetch();
    if (!$usage) { $q = $db->prepare('DELETE FROM visits WHERE token_hash = ?'); $q->execute([$hash]); }
    $q = $db->prepare('UPDATE preferences SET usage_allowed = ?, cloud_allowed = ?, expires_at = UTC_TIMESTAMP() + INTERVAL 180 DAY, updated_at = UTC_TIMESTAMP() WHERE token_hash = ?');
    $q->execute([(int)$usage, (int)$cloud, $hash]); $db->commit();
    setcookie('score_preferences', $token, ['expires'=>time()+180*86400,'path'=>'/','secure'=>$c['secure_cookies'],'httponly'=>true,'samesite'=>'Lax']);
    json_response(consent_state($c, ['usage_allowed'=>$usage,'cloud_allowed'=>$cloud]));
}
function record_event(PDO $db, array $c, array $data): never {
    if (!$c['analytics'] || !cookie_hash()) fail(403);
    if (array_diff(array_keys($data), ['type','path','label'])) fail(400);
    $type = $data['type'] ?? ''; $path = $data['path'] ?? '';
    if (!is_string($path) || !in_array($path, ['/bg/','/tr/','/en/','/bg/poveritelnost/','/tr/gizlilik/','/en/privacy/','/bg/pomosht/','/tr/yardim/','/en/help/','/bg/licenzi/','/tr/lisanslar/','/en/licenses/'], true) || !in_array($type, ['view','click','active'], true)) fail(400);
    if ($type === 'click' && !in_array($data['label'] ?? null, ALLOWED_EVENTS, true)) fail(400);
    if ($type !== 'click' && isset($data['label'])) fail(400);
    if (isset($_COOKIE['score_admin'])) {
        start_admin_session($c);$admin=authorized();session_write_close();
        if($admin)json_response(['ok'=>true]);
    }
    $db->beginTransaction();
    $q = $db->prepare('SELECT * FROM preferences WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE'); $q->execute([cookie_hash()]); $p = $q->fetch(PDO::FETCH_ASSOC);
    if (!$p || !$p['usage_allowed']) { $db->rollBack(); fail(403); }
    $q = $db->prepare('SELECT *, TIMESTAMPDIFF(SECOND,last_seen,UTC_TIMESTAMP()) AS elapsed FROM visits WHERE token_hash = ? AND started_at > UTC_TIMESTAMP() - INTERVAL 365 DAY AND last_seen > UTC_TIMESTAMP() - INTERVAL 30 MINUTE ORDER BY id DESC LIMIT 1');
    $q->execute([cookie_hash()]); $visit = $q->fetch(PDO::FETCH_ASSOC);
    if (!$visit) {
        $q = $db->prepare('INSERT INTO visits (token_hash,started_at,last_seen) VALUES (?,UTC_TIMESTAMP(),UTC_TIMESTAMP())');
        $q->execute([cookie_hash()]); $visitId = (int)$db->lastInsertId(); $elapsed = 0;
    } else { $visitId = (int)$visit['id']; $elapsed = (int)$visit['elapsed']; if ($elapsed < 1) {$db->commit(); json_response(['ok'=>true]);} }
    // Clamp client activity using server elapsed time; never accept a duration from the browser.
    $seconds = $type === 'active' ? min(15, max(0,$elapsed)) : 0;
    $q = $db->prepare('UPDATE visits SET active_seconds = active_seconds + ?, last_seen = UTC_TIMESTAMP() WHERE id = ?'); $q->execute([$seconds,$visitId]);
    if ($type === 'view') { $q = $db->prepare('INSERT INTO pageviews (visit_id,path,occurred_at) VALUES (?,?,UTC_TIMESTAMP())'); $q->execute([$visitId,$path]); }
    if ($type === 'click') { $q = $db->prepare('INSERT INTO events (visit_id,label,occurred_at) VALUES (?,?,UTC_TIMESTAMP())'); $q->execute([$visitId,$data['label']]); }
    $db->commit(); json_response(['ok'=>true]);
}
