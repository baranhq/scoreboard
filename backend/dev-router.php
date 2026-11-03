<?php
// Local development only; PHP's built-in web server is not a production server.
declare(strict_types=1);
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if($path==='/api/index.php')return false;
require_once __DIR__.'/config.php';
$adminPath=configuration()['admin_path'];
if(in_array($path,[$adminPath,$adminPath.'/','/admin','/admin/','/bg/poveritelnost/','/tr/gizlilik/','/en/privacy/'],true)){require dirname(__DIR__).'/public/api/index.php';return true;}
if(str_starts_with($path,'/api/_lib/') || str_starts_with($path,'/.')){http_response_code(404);return true;}
$file=rtrim($_SERVER['DOCUMENT_ROOT'],'/').rawurldecode($path);
$root=realpath($_SERVER['DOCUMENT_ROOT']);$real=realpath($file);
if($real!==false&&str_starts_with($real,$root.'/')&&is_file($real))return false;
if($path==='/'){header('Location: /bg/',true,302);return true;}
if($real!==false&&str_starts_with($real,$root.'/')&&is_dir($real)&&is_file($real.'/index.html')){header('Content-Type: text/html; charset=UTF-8');readfile($real.'/index.html');return true;}
http_response_code(404);header('Content-Type: text/html; charset=UTF-8');if(is_file($root.'/404.html'))readfile($root.'/404.html');else echo 'Not found';return true;
