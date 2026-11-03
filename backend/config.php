<?php
declare(strict_types=1);
function normalise_absolute_path(string $path): ?string {
    if ($path === '' || $path[0] !== '/') return null;
    $parts = [];
    foreach (explode('/', $path) as $part) {
        if ($part === '' || $part === '.') continue;
        if ($part === '..') return null;
        $parts[] = $part;
    }
    return '/'.implode('/', $parts);
}
function normalise_admin_path(string $path): ?string {
    if (!preg_match('~^/[a-z0-9][a-z0-9_-]{0,63}$~D', $path)) return null;
    if (in_array($path, ['/api', '/bg', '/en', '/tr'], true)) return null;
    return $path;
}
function path_is_within(string $path, string $directory): bool {
    $path = normalise_absolute_path($path); $directory = normalise_absolute_path($directory);
    if ($path === null || $directory === null) return false;
    return $path === $directory || str_starts_with($path, rtrim($directory, '/').'/');
}
function public_path(string $path): bool {
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($documentRoot === '') return false;
    $realRoot = realpath($documentRoot);
    return path_is_within($path, $documentRoot) || ($realRoot !== false && path_is_within($path, $realRoot));
}
function private_directory(string $path): string {
    if ($path === '' || $path[0] !== '/') throw new RuntimeException('Private storage requires an absolute path');
    if (normalise_absolute_path($path) === null) throw new RuntimeException('Invalid private storage path');
    if (public_path($path)) throw new RuntimeException('Private storage must be outside the document root');
    $probe=$path;
    while(!file_exists($probe) && dirname($probe)!==$probe)$probe=dirname($probe);
    $resolved=realpath($probe);
    if($resolved && public_path($resolved))throw new RuntimeException('Private storage must be outside the document root');
    return $path;
}
function discover_environment_file(): string {
    $candidates = [];
    $directory = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
    while ($directory !== '' && $directory !== '/' && $directory !== '.') {
        if (in_array(basename($directory), ['public_html', 'htdocs', 'www'], true)) {
            $candidates[] = dirname($directory).'/scoreboard-private/.env';
            break;
        }
        $directory = dirname($directory);
    }
    if (function_exists('posix_getpwuid') && function_exists('posix_geteuid')) {
        $user = posix_getpwuid(posix_geteuid());
        if ($user && !empty($user['dir'])) $candidates[] = $user['dir'].'/scoreboard-private/.env';
    }
    foreach (array_unique($candidates) as $candidate) if (is_file($candidate)) return $candidate;
    return '';
}
function configuration(): array {
    $file = getenv('SCOREBOARD_ENV_FILE') ?: ($_SERVER['SCOREBOARD_ENV_FILE'] ?? $_SERVER['REDIRECT_SCOREBOARD_ENV_FILE'] ?? '');
    if ($file === '') $file = discover_environment_file();
    $settings = [];
    if ($file !== '') {
        $resolved = realpath($file);
        if (normalise_absolute_path($file) === null || $resolved === false || !is_file($resolved) || !is_readable($resolved)) throw new RuntimeException('Private configuration unavailable');
        if (public_path($file) || public_path($resolved)) throw new RuntimeException('Private configuration must be outside the document root');
        $permissions = fileperms($resolved);
        if ($permissions === false || ($permissions & 0077) !== 0) throw new RuntimeException('Private configuration permissions must exclude group and other users');
        $settings = parse_ini_file($resolved, false, INI_SCANNER_RAW);
    }
    if ($settings === false) throw new RuntimeException('Configuration unavailable');
    $get = static function(string $key, string $default = '') use ($settings): string {
        $v = getenv($key); $value = $v !== false ? $v : (string)($settings[$key] ?? $default);
        if (strlen($value)>=2 && (($value[0]==="'" && $value[-1]==="'") || ($value[0]==='"' && $value[-1]==='"'))) $value=substr($value,1,-1);
        return $value;
    };
    $bool = static fn(string $key): bool => filter_var($get($key, 'false'), FILTER_VALIDATE_BOOLEAN);
    $origin = rtrim($get('APP_ORIGIN'), '/');
    if ($origin && !preg_match('~^https?://[a-zA-Z0-9.:-]+$~D', $origin)) throw new RuntimeException('Invalid origin');
    if ($origin && !str_starts_with($origin, 'https://') && !$bool('APP_ALLOW_HTTP')) throw new RuntimeException('HTTPS required');
    $adminPath = normalise_admin_path(trim($get('ADMIN_PATH', '/admin')) ?: '/admin');
    if ($adminPath === null) throw new RuntimeException('Invalid administrator path');
    return [
        'admin_path' => $adminPath,
        'origin' => $origin, 'http' => str_starts_with($origin, 'http://'), 'secure_cookies' => str_starts_with($origin, 'https://'), 'key' => $get('APP_KEY'),
        'db_host' => $get('DB_HOST', 'localhost'), 'db_port' => $get('DB_PORT', '3306'),
        'db_name' => $get('DB_NAME'), 'db_user' => $get('DB_USER'), 'db_password' => $get('DB_PASSWORD'),
        'admin_hash' => $get('ADMIN_PASSWORD_HASH'), 'admin_username' => $get('ADMIN_USERNAME'),
        'policy_path' => private_directory($get('POLICY_PATH') ?: ($file ? dirname($file) : sys_get_temp_dir().'/scoreboard-'.substr(hash('sha256',$origin),0,12)).'/policies'), 'analytics' => $bool('ANALYTICS_ENABLED'),
        'cloud_token' => $bool('CLOUDFLARE_MANUAL_CONFIRMED') ? $get('CLOUDFLARE_ANALYTICS_TOKEN') : '',
        'proxies' => array_filter(array_map('trim', explode(',', $get('TRUSTED_PROXY_CIDRS')))),
        'session_path' => private_directory($get('SESSION_PATH') ?: ($file ? dirname($file) : sys_get_temp_dir().'/scoreboard-'.substr(hash('sha256',$origin),0,12)).'/sessions'),
    ];
}
function database(array $c): PDO {
    $db = new PDO("mysql:host={$c['db_host']};port={$c['db_port']};dbname={$c['db_name']};charset=utf8mb4", $c['db_user'], $c['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]);
    $db->exec("SET time_zone = '+00:00'"); return $db;
}
