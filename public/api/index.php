<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Cache-Control: no-store, private'); header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');
$library = __DIR__.'/_lib';
if (!is_file($library.'/config.php')) $library = dirname(__DIR__,2).'/backend';
require $library.'/config.php'; require $library.'/security.php'; require $library.'/analytics.php'; require $library.'/admin.php'; require $library.'/policy.php';
try {
    $c = configuration();
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $admin = in_array($path,['/admin','/admin/'],true);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $publicPolicy=array_search($path,policy_paths(),true);
    if($publicPolicy!==false&&$method==='GET')serve_policy($c,$publicPolicy);
    if (!$admin && $path !== '/api/index.php') fail(404);
    if (!in_array($method,['GET','POST'],true)) fail(405);
    $action = $_GET['action'] ?? 'state';
    if(!$admin&&$method==='GET'&&$action==='policy')json_response(policy_document($c,(string)($_GET['lang']??'')));
    if (!$admin && $method === 'GET' && $action === 'state' && (!$c['origin'] || strlen($c['key']) < 32 || !$c['db_name'])) json_response(consent_state(['analytics'=>false,'cloud_token'=>''],null));
    if (!$c['origin'] || strlen($c['key']) < 32 || !$c['db_name']) fail(503);
    if ($method === 'POST') same_origin($c);
    $db = database($c);
    if ($admin) admin_page($db,$c);
    if ($method === 'GET' && $action === 'state') json_response(consent_state($c, preferences($db)));
    if ($method !== 'POST') fail(405);
    $data = input();
    if ($action === 'consent') save_consent($db,$c,$data);
    if ($action === 'event') record_event($db,$c,$data);
    // There is no public analytics-read API. All reads are inside authenticated /admin.
    fail(404);
} catch (JsonException) {fail(400);} catch (Throwable) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    // Log an error category only; never request bodies, IPs, credentials, or DB connection strings.
    error_log('Scoreboard backend request failed'); fail(503);
}
