<?php
declare(strict_types=1);
require __DIR__.'/../backend/security.php';
require __DIR__.'/../backend/config.php';
require __DIR__.'/../backend/admin.php';
require __DIR__.'/../backend/policy.php';
function check(bool $value,string $name): void {if(!$value)throw new RuntimeException($name);}
check(normalise_admin_path('/admin')==='/admin','default admin path validation');check(normalise_admin_path('/custom-panel')==='/custom-panel','custom admin path validation');check(normalise_admin_path('/api')===null&&normalise_admin_path('/bg')===null&&normalise_admin_path('/bad/path')===null&&normalise_admin_path('/bad?path')===null,'reserved and malformed admin paths rejected');
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
$renderedPolicy=policy_article($policy+['updatedAt'=>'2026-11-05'],'en');
$policyTopics=policy_topics($policy,'en');
check(str_contains($renderedPolicy,'id="policy-content" class="max-w-3xl min-w-0 text-ink'),'policy article hydration structure');
check(str_contains($renderedPolicy,'id="policy-section-0"'),'policy section anchor');
check(str_contains($renderedPolicy,'data-fullscreen-control="true"'),'privacy settings button in rendered policy');
check(str_contains($policyTopics,'href="#policy-section-0"'),'policy contents match rendered section anchors');
$topicComponent=file_get_contents(__DIR__.'/../src/components/content/topic-navigation.tsx');
preg_match_all('/class="([^"]*)"/u',$policyTopics,$topicClasses);
foreach($topicClasses[1] as $classes){
    check(str_contains($topicComponent,'className="'.$classes.'"'),'server policy navigation classes match the hydrated component');
}
check(substr_count($policyTopics,'print:hidden')===2,'policy navigation is hidden in print');
$adjacentBlocks=policy_blocks("First line.\r\nSecond line.\r\n## Heading\r\nBody.\r\n## Next");
check($adjacentBlocks===[['heading'=>false,'text'=>"First line.\nSecond line."],['heading'=>true,'text'=>'Heading'],['heading'=>false,'text'=>'Body.'],['heading'=>true,'text'=>'Next']],'standalone headings with CRLF split without blank lines');
foreach(['en','bg','tr'] as $lang){
    $source=file_get_contents(__DIR__.'/../src/lib/privacy/'.$lang.'.md');
    $headings=array_values(array_filter(policy_blocks($source),static fn($block)=>$block['heading']));
    check(count($headings)===14,'all fourteen translated policy sections are recognized: '.$lang);
    foreach($headings as $index=>$heading){
        check(str_starts_with($heading['text'],($index+1).'.'),'policy section order includes section 10: '.$lang);
    }
    $topics=policy_topics(['content'=>$source],$lang);
    check(substr_count($topics,'href="#policy-section-')===28,'both contents menus include every translated section');
}
$adjacentPolicy=['title'=>'Policy','updatedAt'=>'2026-11-09','content'=>"Text ## inline.\n\n## Same <title>\n## Same <title>\nEnd."];
$adjacentTopics=policy_topics($adjacentPolicy,'en');
$adjacentArticle=policy_article($adjacentPolicy,'en');
foreach([1,2] as $index){
    check(substr_count($adjacentTopics,'href="#policy-section-'.$index.'"')===2&&str_contains($adjacentArticle,'id="policy-section-'.$index.'"'),'adjacent repeated headings retain matching unique anchors');
}
check(!str_contains($adjacentArticle,'<title>')&&str_contains($adjacentArticle,'Same &lt;title&gt;'),'adjacent headings remain escaped');
$repeatedPolicy=['content'=>"Introduction.\n\n## Same <title>\n\nBody.\n\n## Same <title>"];
foreach(['en'=>'On this page','bg'=>'На тази страница','tr'=>'Bu sayfada'] as $lang=>$label){
    $topics=policy_topics($repeatedPolicy,$lang);
    check(substr_count($topics,'aria-label="'.$label.'"')===2,'localized policy navigation labels');
    check(substr_count($topics,'href="#policy-section-1"')===2&&substr_count($topics,'href="#policy-section-3"')===2,'repeated policy headings retain distinct matching anchors');
    check(!str_contains($topics,'Same <title>')&&str_contains($topics,'Same &lt;title&gt;'),'navigation titles are escaped');
}
$metadata=policy_metadata_html('<title>Old title</title><meta name="description" content="Old description"><meta property="og:title" content="Old social title"><meta property="og:description" content="Old social description"><meta name="twitter:title" content="Old card title"><meta name="twitter:description" content="Old card description">',$policy);
check(str_contains($metadata,'<title>Privacy &amp; &lt;notice&gt; | Baran&#39;s Scoreboard</title>'),'policy title escaped in metadata');
check(str_contains($metadata,'name="description" content="Updated policy text. Contact"'),'policy description updated');
check(str_contains($metadata,'property="og:title" content="Privacy &amp; &lt;notice&gt;"'),'social title escaped in metadata');
check(str_contains($metadata,'name="twitter:description" content="Updated policy text. Contact"'),'social description updated');
$_SERVER['DOCUMENT_ROOT']=sys_get_temp_dir();
try{private_directory(sys_get_temp_dir().'/exposed-sessions');throw new LogicException('public storage accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'public storage denied');}
$root=sys_get_temp_dir().'/scoreboard-security-'.bin2hex(random_bytes(8));$public=$root.'/public';$private=$root.'/private';mkdir($public,0700,true);mkdir($private,0700,true);
$env=$private.'/test.env';file_put_contents($env,"APP_ORIGIN=https://secure.example\nAPP_ALLOW_HTTP=true\nSESSION_PATH=$private/sessions\nPOLICY_PATH=$private/policies\nADMIN_PATH=/custom-panel\n");chmod($env,0600);
$environmentNames=['SCOREBOARD_ENV_FILE','APP_ORIGIN','APP_ALLOW_HTTP','SESSION_PATH','POLICY_PATH','ADMIN_PATH'];$oldEnvironment=[];foreach($environmentNames as $name){$oldEnvironment[$name]=getenv($name);putenv($name);}
$oldServerFile=$_SERVER['SCOREBOARD_ENV_FILE']??null;$oldRoot=$_SERVER['DOCUMENT_ROOT']??null;
$_SERVER['DOCUMENT_ROOT']=$public;$_SERVER['SCOREBOARD_ENV_FILE']=$env;putenv('SCOREBOARD_ENV_FILE='.$env);
$secure=configuration();check(!$secure['http']&&$secure['secure_cookies'],'HTTP development override cannot weaken HTTPS cookies');check($secure['admin_path']==='/custom-panel','custom admin path loaded from private configuration');
chmod($env,0644);try{configuration();throw new LogicException('readable private config accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'group/world-readable private config denied');}chmod($env,0600);
file_put_contents($env,"APP_ORIGIN=http://localhost:8080\nAPP_ALLOW_HTTP=true\nSESSION_PATH=$private/sessions\nPOLICY_PATH=$private/policies\n");chmod($env,0600);$local=configuration();check($local['http']&&!$local['secure_cookies'],'local HTTP cookie mode follows the configured origin');check($local['admin_path']==='/admin','admin path defaults to /admin');
if(symlink($private,$public.'/private-link')){try{private_directory($public.'/private-link/sessions');throw new LogicException('symlinked public storage accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'document-root symlink storage denied');}unlink($public.'/private-link');}
if(symlink($env,$public.'/runtime.ini')){putenv('SCOREBOARD_ENV_FILE='.$public.'/runtime.ini');$_SERVER['SCOREBOARD_ENV_FILE']=$public.'/runtime.ini';try{configuration();throw new LogicException('symlinked public config accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'document-root symlink config denied');}unlink($public.'/runtime.ini');}
// A cPanel deployment can discover the account-level file without Apache SetEnv.
$accountPrivate=$root.'/scoreboard-private';$webRoot=$root.'/public_html/site';mkdir($accountPrivate,0700);mkdir($webRoot,0700,true);
$accountEnv=$accountPrivate.'/.env';file_put_contents($accountEnv,"APP_ORIGIN=https://secure.example\nADMIN_PATH= /baranhq_admin \n");chmod($accountEnv,0600);
putenv('SCOREBOARD_ENV_FILE');unset($_SERVER['SCOREBOARD_ENV_FILE'],$_SERVER['REDIRECT_SCOREBOARD_ENV_FILE']);$_SERVER['DOCUMENT_ROOT']=$webRoot;
check(discover_environment_file()===$accountEnv,'account private environment discovered above public_html');
check(configuration()['admin_path']==='/baranhq_admin','runtime administrator path loaded and trimmed without SetEnv');
function admin_route_response(string $path, string $documentRoot): array {
    $server=var_export(['DOCUMENT_ROOT'=>$documentRoot,'REQUEST_URI'=>$path,'REQUEST_METHOD'=>'GET'],true);
    $entry=var_export(dirname(__DIR__).'/public/api/index.php',true);
    $code='$_SERVER='.$server.';register_shutdown_function(function(){fwrite(STDERR,(string)http_response_code());});require '.$entry.';';
    $process=proc_open([PHP_BINARY,'-r',$code],[1=>['pipe','w'],2=>['pipe','w']],$pipes);
    if(!is_resource($process))throw new RuntimeException('Cannot start routing regression test');
    $body=stream_get_contents($pipes[1]);$status=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);
    check(proc_close($process)===0,'routing request completed');
    return [$body,$status];
}
[$body,$status]=admin_route_response('/admin',$webRoot);check($status==='404'&&!str_contains($body,'/baranhq_admin'),'default admin entry does not reveal custom private path');
[$body,$status]=admin_route_response('/admin/',$webRoot);check($status==='404','default admin trailing slash is also not found');
[$body,$status]=admin_route_response('/baranhq_admin',$webRoot);check(str_ends_with($status,'503')&&str_contains($body,'Administration is temporarily unavailable')&&!str_contains($body,'Request unavailable'),'admin configuration failure renders safe HTML');
[$body,$status]=admin_route_response('/unknown-page',$webRoot);check($status==='404','unknown single-segment routes remain not found');
file_put_contents($accountEnv,"ADMIN_PATH=\n");
[$body,$status]=admin_route_response('/admin',$webRoot);check(str_ends_with($status,'503')&&str_contains($body,'Administration is temporarily unavailable'),'empty admin path defaults to admin');
chmod($accountEnv,0644);try{configuration();throw new LogicException('insecure discovered config accepted');}catch(RuntimeException $e){check(!$e instanceof LogicException,'discovered private config requires restrictive permissions');}
unlink($accountEnv);rmdir($accountPrivate);rmdir($webRoot);rmdir($root.'/public_html');
foreach($oldEnvironment as $name=>$value){if($value===false)putenv($name);else putenv($name.'='.$value);}
if($oldServerFile===null)unset($_SERVER['SCOREBOARD_ENV_FILE']);else $_SERVER['SCOREBOARD_ENV_FILE']=$oldServerFile;if($oldRoot===null)unset($_SERVER['DOCUMENT_ROOT']);else $_SERVER['DOCUMENT_ROOT']=$oldRoot;
unlink($env);rmdir($private);rmdir($public);rmdir($root);
echo "PHP security regression checks passed.\n";
