<?php
declare(strict_types=1);
require __DIR__.'/../backend/security.php';
require __DIR__.'/../backend/config.php';
require __DIR__.'/../backend/admin.php';
require __DIR__.'/../backend/policy.php';
function check(bool $value,string $name): void {if(!$value)throw new RuntimeException($name);}
check(in_cidr('192.0.2.4','192.0.2.0/24'),'IPv4 CIDR');
check(!in_cidr('192.0.3.4','192.0.2.0/24'),'outside CIDR');
check(in_cidr('2001:db8::1','2001:db8::/32'),'IPv6 CIDR');
check(!in_cidr('192.0.2.4','0.0.0.0/99'),'invalid prefix');
$_SERVER['REMOTE_ADDR']='192.0.2.4';$_SERVER['HTTP_CF_CONNECTING_IP']='198.51.100.1';
check(incoming_ip(['proxies'=>[]])==='192.0.2.4','untrusted forwarded address ignored');
check(incoming_ip(['proxies'=>['192.0.2.0/24']])==='198.51.100.1','trusted proxy address');
$_SESSION=[];check(!authorized(),'anonymous denied');
$_SESSION=['admin'=>true,'expires'=>time()-1];check(!authorized(),'expired denied');
$_SESSION=['admin'=>'true','expires'=>time()+60];check(!authorized(),'strict authentication flag');
check(!str_contains(policy_inline('<script>alert(1)</script>'),' script>'),'rendering');
$html=policy_inline('<img src=x onerror=alert(1)> [bad](javascript:alert(1)) [link](https://example.org/"onmouseover="x)');
check(!str_contains($html,'<img'),'markup escaped');check(!str_contains($html,'href="javascript:'),'unsafe scheme rejected');check(str_contains($html,'&quot;'),'attribute quotes escaped');
$_SERVER['DOCUMENT_ROOT']=sys_get_temp_dir();
try{private_directory(sys_get_temp_dir().'/exposed-sessions');throw new LogicException('public storage accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'public storage denied');}
echo "PHP security regression checks passed.\n";
