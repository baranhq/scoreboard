<?php
declare(strict_types=1);
function private_directory(string $path): string {
    if ($path === '' || $path[0] !== '/') throw new RuntimeException('Private storage requires an absolute path');
    $probe=$path;
    while(!file_exists($probe) && dirname($probe)!==$probe)$probe=dirname($probe);
    $resolved=realpath($probe);$root=realpath($_SERVER['DOCUMENT_ROOT']??'');
    if($root && $resolved && ($resolved===$root || str_starts_with($resolved,$root.'/')))throw new RuntimeException('Private storage must be outside the document root');
    if(in_array('..',explode('/',$path),true))throw new RuntimeException('Invalid private storage path');
    return $path;
}
function configuration(): array {
    $file = getenv('SCOREBOARD_ENV_FILE') ?: ($_SERVER['SCOREBOARD_ENV_FILE'] ?? $_SERVER['REDIRECT_SCOREBOARD_ENV_FILE'] ?? '');
    if ($file && isset($_SERVER['DOCUMENT_ROOT']) && realpath($file) && str_starts_with(realpath($file),rtrim(realpath($_SERVER['DOCUMENT_ROOT']) ?: $_SERVER['DOCUMENT_ROOT'],'/').'/')) throw new RuntimeException('Private configuration must be outside the document root');
    $settings = $file && is_file($file) ? parse_ini_file($file, false, INI_SCANNER_RAW) : [];
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
    return [
        'origin' => $origin, 'http' => $bool('APP_ALLOW_HTTP'), 'key' => $get('APP_KEY'),
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
