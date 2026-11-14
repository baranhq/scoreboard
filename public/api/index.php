<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Cache-Control: no-store, private'); header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');
$library = __DIR__.'/_lib';
if (!is_file($library.'/config.php')) $library = dirname(__DIR__,2).'/backend';
require_once $library.'/config.php'; require_once $library.'/security.php'; require_once $library.'/analytics.php'; require_once $library.'/admin.php'; require_once $library.'/policy.php';
$stage = 'configuration';
try {
    $c = configuration();
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $admin = in_array($path,[$c['admin_path'],$c['admin_path'].'/'],true);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $policyPath=is_string($path)?rtrim($path,'/').'/':'';
    $publicPolicy=array_search($policyPath,policy_paths(),true);
    if($publicPolicy!==false&&$method==='GET'){$stage='policy';serve_policy($c,$publicPolicy);}
    if (!$admin && $path !== '/api/index.php') {
        if (is_string($path) && preg_match('~^/[a-z0-9][a-z0-9_-]{0,63}/?$~D', $path)) {
            http_response_code(404);header('Content-Type: text/html; charset=UTF-8');
            $notFound = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/').'/404.html';
            if (is_file($notFound)) readfile($notFound);else echo 'Page not found';
            exit;
        }
        fail(404);
    }
    if (!in_array($method,['GET','POST'],true)) fail(405);
    $action = $_GET['action'] ?? 'state';if(!is_string($action))$action='';
    if(!$admin&&$method==='GET'&&$action==='policy'){$language=$_GET['lang']??'';if(!is_string($language))fail(400);$stage='policy';json_response(policy_document($c,$language));}
    if (!$admin && $method === 'GET' && $action === 'state' && (!$c['origin'] || strlen($c['key']) < 32 || !$c['db_name'])) json_response(consent_state(['analytics'=>false,'cloud_token'=>''],null));
    if (!$c['origin'] || strlen($c['key']) < 32 || !$c['db_name']) throw new RuntimeException('Incomplete configuration');
    if ($method === 'POST') same_origin($c);
    $stage = 'database';
    $db = database($c);
    $stage = 'request';
    if ($admin) admin_page($db,$c);
    if(!request_rate_limit($db,$c,'public-api',2400))fail(429,'Too many requests. Try again later.');
    if ($method === 'GET' && $action === 'state') json_response(consent_state($c, preferences($db)));
    if ($method !== 'POST') fail(405);
    if($action==='consent'&&!request_rate_limit($db,$c,'api-consent',300))fail(429,'Too many requests. Try again later.');
    $data = input();
    if ($action === 'consent') save_consent($db,$c,$data);
    if ($action === 'event') record_event($db,$c,$data);
    // There is no public analytics-read API. All reads are inside the authenticated administrator page.
    fail(404);
} catch (JsonException) {
    if(serve_static_policy_fallback())exit;
    if($stage==='policy')fail(503);
    fail(400);
} catch (Throwable) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    // Log an error category only; never request bodies, IPs, credentials, or DB connection strings.
    error_log('Scoreboard backend request failed ('.$stage.')');
    if(serve_static_policy_fallback())exit;
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET' && ((isset($admin) && $admin) || in_array(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), ['/admin', '/admin/'], true))) admin_unavailable();
    fail(503);
}
