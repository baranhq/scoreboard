<?php
declare(strict_types=1);
function in_cidr(string $ip, string $cidr): bool {
    $parts = explode('/', $cidr, 2); $a = @inet_pton($ip); $b = @inet_pton($parts[0]);
    if ($a === false || $b === false || strlen($a) !== strlen($b)) return false;
    $bits = isset($parts[1]) ? filter_var($parts[1], FILTER_VALIDATE_INT) : strlen($a) * 8;
    if ($bits === false || $bits < 0 || $bits > strlen($a) * 8) return false;
    $bytes = intdiv($bits, 8); $rest = $bits % 8;
    return substr($a, 0, $bytes) === substr($b, 0, $bytes) && (!$rest || ((ord($a[$bytes]) ^ ord($b[$bytes])) & (255 << (8 - $rest))) === 0);
}
function incoming_ip(array $c): string {
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    foreach ($c['proxies'] as $cidr) if (in_cidr($remote, $cidr)) {
        $forwarded = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
        if (filter_var($forwarded, FILTER_VALIDATE_IP)) return inet_ntop(inet_pton($forwarded));
    }
    return filter_var($remote, FILTER_VALIDATE_IP) ? inet_ntop(inet_pton($remote)) : '';
}
function same_origin(array $c): void {
    if (!$c['origin'] || ($_SERVER['HTTP_ORIGIN'] ?? '') !== $c['origin']) fail(403);
    if (isset($_SERVER['HTTP_SEC_FETCH_SITE']) && $_SERVER['HTTP_SEC_FETCH_SITE'] === 'cross-site') fail(403);
}
function fail(int $status, string $message = 'Request unavailable'): never {http_response_code($status); header('Content-Type: application/json'); echo json_encode(['error' => $message]); exit;}
function json_response(array $data): never {header('Content-Type: application/json'); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR); exit;}
function rate_limit_bucket(PDO $db, string $bucket, int $limit): bool {
    $q=$db->prepare('INSERT INTO login_limits (bucket,attempts,expires_at) VALUES (?,1,UTC_TIMESTAMP() + INTERVAL 15 MINUTE) ON DUPLICATE KEY UPDATE attempts = IF(expires_at <= UTC_TIMESTAMP(),1,LEAST(attempts+1,4294967295)), expires_at = IF(expires_at <= UTC_TIMESTAMP(),UTC_TIMESTAMP() + INTERVAL 15 MINUTE,expires_at)');
    $q->execute([$bucket]);$q=$db->prepare('SELECT attempts FROM login_limits WHERE bucket = ?');$q->execute([$bucket]);
    return (int)$q->fetchColumn() <= $limit;
}
function request_rate_limit(PDO $db, array $c, string $purpose, int $limit): bool {
    $ip=incoming_ip($c);
    // If the server cannot establish a client address, fail open instead of creating a global lockout.
    if ($ip === '') return true;
    $bucket=hash_hmac('sha256','request:'.$purpose.':'.inet_pton($ip),$c['key']);
    return rate_limit_bucket($db,$bucket,$limit);
}
function input(): array {
    if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) fail(415);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) fail(413);
    $raw = file_get_contents('php://input', false, null, 0, 4097);
    if (strlen($raw) > 4096) fail(413);
    $value = json_decode($raw, true, 8, JSON_THROW_ON_ERROR);
    if (!is_array($value) || array_is_list($value)) fail(400);
    return $value;
}
function start_admin_session(array $c): void {
    if (!is_dir($c['session_path']) && !mkdir($c['session_path'], 0700, true) && !is_dir($c['session_path'])) throw new RuntimeException('Session storage unavailable');
    if (!is_dir($c['session_path']) || !is_writable($c['session_path']) || !chmod($c['session_path'],0700)) throw new RuntimeException('Session storage unavailable');
    if (session_status() === PHP_SESSION_ACTIVE) throw new RuntimeException('Session was already started');
    if (session_save_path($c['session_path']) === false) throw new RuntimeException('Session storage unavailable');
    session_name('score_admin');
    foreach (['session.use_cookies'=>'1','session.use_strict_mode'=>'1','session.use_only_cookies'=>'1','session.use_trans_sid'=>'0','session.cookie_httponly'=>'1','session.cookie_secure'=>$c['secure_cookies']?'1':'0','session.cookie_samesite'=>'Strict','session.gc_maxlifetime'=>'3600'] as $setting=>$value) {
        if (ini_set($setting,$value) === false) throw new RuntimeException('Secure sessions are unavailable');
    }
    if (!session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $c['secure_cookies'], 'httponly' => true, 'samesite' => 'Strict']) || !session_start()) throw new RuntimeException('Session storage unavailable');
    if (($_SESSION['expires'] ?? PHP_INT_MAX) <= time()) {$_SESSION = []; session_regenerate_id(true);}
    $version=hash_hmac('sha256',$c['admin_username']."\0".$c['admin_hash'],$c['key']);
    if(isset($_SESSION['admin'])&&(!isset($_SESSION['auth_version'])||!hash_equals($version,$_SESSION['auth_version']))) {$_SESSION=[];session_regenerate_id(true);}
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function csrf(): void { $token=$_POST['csrf']??null; if(!is_string($token)||!isset($_SESSION['csrf'])||!hash_equals($_SESSION['csrf'],$token))fail(403); }
function authorized(): bool {return ($_SESSION['admin'] ?? false) === true && ($_SESSION['expires'] ?? 0) > time();}
function cookie_token(): ?string { $v = $_COOKIE['score_preferences'] ?? ''; return is_string($v) && preg_match('/^[a-f0-9]{64}$/D', $v) ? $v : null; }
function cookie_hash(): ?string {$token = cookie_token(); return $token === null ? null : hash('sha256', $token);}
function cleanup(PDO $db): void {
    // Keep expiring action-event rows collected by older versions without writing new ones.
    $db->exec('DELETE FROM events WHERE occurred_at <= UTC_TIMESTAMP() - INTERVAL 365 DAY');
    $db->exec('DELETE FROM pageviews WHERE occurred_at <= UTC_TIMESTAMP() - INTERVAL 365 DAY');
    $db->exec('DELETE FROM visits WHERE started_at <= UTC_TIMESTAMP() - INTERVAL 365 DAY');
    $db->exec('DELETE FROM preferences WHERE updated_at <= UTC_TIMESTAMP() - INTERVAL 365 DAY');
    $db->exec('DELETE FROM login_limits WHERE expires_at <= UTC_TIMESTAMP()');
}

function european_date(string $value): string {
    return preg_replace('/^(\d{4})-(\d{2})-(\d{2})/', '$3.$2.$1', $value);
}
function normalise_date(mixed $value): string {
    if(!is_string($value))fail(400);
    if(preg_match('/^(\d{2})\.(\d{2})\.(\d{4})$/D',$value,$m))$value=$m[3].'-'.$m[2].'-'.$m[1];
    if(!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$value))fail(400);
    $date=DateTimeImmutable::createFromFormat('!Y-m-d',$value);
    if(!$date||$date->format('Y-m-d')!==$value)fail(400);
    return $value;
}
