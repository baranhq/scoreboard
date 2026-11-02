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
$policy=['title'=>'Privacy & <notice>','content'=>"## Overview\n\nUpdated policy text. [Contact](mailto:owner@example.org)"];
check(policy_summary($policy)==='Updated policy text. Contact','policy description summary');
$metadata=policy_metadata_html('<title>Old title</title><meta name="description" content="Old description"><meta property="og:title" content="Old social title"><meta property="og:description" content="Old social description"><meta name="twitter:title" content="Old card title"><meta name="twitter:description" content="Old card description">',$policy);
check(str_contains($metadata,'<title>Privacy &amp; &lt;notice&gt; | Baran&#39;s Scoreboard</title>'),'policy title escaped in metadata');
check(str_contains($metadata,'name="description" content="Updated policy text. Contact"'),'policy description updated');
check(str_contains($metadata,'property="og:title" content="Privacy &amp; &lt;notice&gt;"'),'social title escaped in metadata');
check(str_contains($metadata,'name="twitter:description" content="Updated policy text. Contact"'),'social description updated');
$_SERVER['DOCUMENT_ROOT']=sys_get_temp_dir();
try{private_directory(sys_get_temp_dir().'/exposed-sessions');throw new LogicException('public storage accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'public storage denied');}
echo "PHP security regression checks passed.\n";
