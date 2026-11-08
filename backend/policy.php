<?php
declare(strict_types=1);
function policy_paths(): array {return ['bg'=>'/bg/poveritelnost/','tr'=>'/tr/gizlilik/','en'=>'/en/privacy/'];}
function policy_document(array $c,string $lang): array {
    if(!isset(policy_paths()[$lang]))fail(404);
    $file=$c['policy_path'].'/'.$lang.'.json';
    if(!is_file($file))$file=rtrim($_SERVER['DOCUMENT_ROOT'],'/').'/policies/'.$lang.'.json';
    $p=json_decode(file_get_contents($file),true,16,JSON_THROW_ON_ERROR);
    if(!is_array($p)||!is_string($p['title']??null)||!is_string($p['content']??null))throw new RuntimeException('Policy unavailable');
    return $p;
}
function policy_inline(string $text): string {
    $html='';$end=0;preg_match_all('~\[([^\]\n]+)\]\((https://[^\s)]+|mailto:[^\s)]+)\)|\*\*([^*\n]+)\*\*~u',$text,$matches,PREG_OFFSET_CAPTURE);
    foreach($matches[0] as $index=>$match){$html.=h(substr($text,$end,$match[1]-$end));if($matches[1][$index][1]>=0){$href=$matches[2][$index][0];$label=$matches[1][$index][0];$external=str_starts_with($href,'https://');$html.='<a href="'.h($href).'"'.($external?' target="_blank" rel="noopener noreferrer"':'').' class="underline underline-offset-4">'.h($label).'</a>';}else $html.='<strong>'.h($matches[3][$index][0]).'</strong>';$end=$match[1]+strlen($match[0]);}
    return $html.h(substr($text,$end));
}
function policy_blocks(string $content): array {
    $normalised=str_replace("\r\n","\n",$content);
    $normalised=preg_replace('/^(## [^\n]*)$/mu',"\n\n$1\n\n",$normalised);
    $parts=preg_split('/\n\s*\n/u',$normalised);
    $blocks=[];

    foreach($parts as $part){
        if($part==='')continue;
        $heading=str_starts_with($part,'## ');
        $blocks[]=[
            'heading'=>$heading,
            'text'=>$heading?trim(substr($part,3)):trim($part),
        ];
    }

    return $blocks;
}
function policy_topic_list(array $topics): string {
    $html='<ul class="mt-2 space-y-1">';

    foreach($topics as $topic){
        $href=h($topic['href']);
        $title=h($topic['title']);
        $html.='<li><a href="#'.$href.'" class="flex min-h-11 items-center rounded-lg px-3 py-2 font-sans text-base leading-6 font-medium text-forest transition-colors duration-150 hover:bg-forest/8 focus-visible:bg-forest/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none dark:text-[#8bd69a] dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:bg-white/5">'.$title.'</a></li>';
    }

    return $html.'</ul>';
}
function policy_article(array $p,string $lang='en'): string {
    $labels=['en'=>'Updated','bg'=>'Актуализирана на','tr'=>'Güncelleme:'];
    $choices=['en'=>'Privacy choices','bg'=>'Настройки за поверителност','tr'=>'Gizlilik tercihleri'];
    $date=european_date(substr($p['updatedAt'],0,10));
    $html='<article id="policy-content" class="max-w-3xl min-w-0 text-ink transition-colors duration-150 motion-reduce:transition-none"><p class="mb-2 text-base font-medium text-forest"><time datetime="'.h($p['updatedAt']).'">'.h($labels[$lang]).'<!-- --> <!-- -->'.h($date).'</time></p><h1 class="font-display text-3xl font-bold tracking-tight">'.h($p['title']).'</h1>';
    foreach(policy_blocks($p['content']) as $index=>$block){
        if($block['heading']){
            $html.='<h2 id="policy-section-'.$index.'" class="mt-7 scroll-mt-24 border-t border-forest/20 pt-5 font-display text-2xl font-bold">'.h($block['text']).'</h2>';
        }else{
            $html.='<p class="mt-3 text-lg leading-8 whitespace-pre-line">'.policy_inline($block['text']).'</p>';
        }
    }

    $button='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-base font-medium transition-[color,background-color,border-color,opacity,filter,transform] duration-150 ease-out active:scale-[.98] active:brightness-95 disabled:opacity-50 motion-reduce:transition-none motion-reduce:transform-none border-forest/25 bg-transparent text-forest hover:border-forest/45 hover:bg-forest/10 mt-4';
    return $html.'<button data-fullscreen-control="true" class="'.$button.'">'.h($choices[$lang]).'</button></article>';
}
function policy_topics(array $p,string $lang): string {
    $labels=['en'=>'On this page','bg'=>'На тази страница','tr'=>'Bu sayfada'];
    $topics=[];
    foreach(policy_blocks($p['content']) as $index=>$block){
        if($block['heading'])$topics[]=['href'=>'policy-section-'.$index,'title'=>$block['text']];
    }

    $label=h($labels[$lang]);
    $mobile='<details class="group mb-6 rounded-xl border border-forest/15 bg-surface p-3 lg:hidden print:hidden">'
        .'<summary class="cursor-pointer border-b border-transparent px-3 pb-2 font-sans text-base font-semibold text-forest transition-[color,border-color] duration-150 group-open:border-forest/15 group-open:pb-3 hover:text-forest/80 motion-reduce:transition-none dark:text-[#8bd69a] dark:hover:text-white">'.$label.'</summary>'
        .'<nav aria-label="'.$label.'" class="pt-1">'.policy_topic_list($topics).'</nav>'
        .'</details>';
    $desktop='<aside class="hidden h-fit overscroll-contain rounded-xl border border-forest/15 bg-surface p-3 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto print:hidden">'
        .'<nav aria-label="'.$label.'">'
        .'<p class="mb-2 border-b border-forest/15 px-3 pb-3 font-sans text-base font-semibold text-forest dark:text-[#8bd69a]">'.$label.'</p>'
        .policy_topic_list($topics)
        .'</nav>'
        .'</aside>';

    return $mobile.$desktop;
}
function policy_summary(array $p): string {
    foreach(preg_split('/\n\s*\n/u',str_replace("\r\n","\n",$p['content'])) as $block){
        $block=trim($block);if($block===''||str_starts_with($block,'## '))continue;
        $summary=preg_replace_callback('~\[([^\]]+)\]\((?:https://[^\s)]+|mailto:[^\s)]+)\)~u',static fn($m)=>$m[1],$block)??$block;
        $summary=trim(preg_replace('/\s+/u',' ',$summary)??$summary);
        if(mb_strlen($summary)>155)$summary=mb_substr($summary,0,152).'…';
        return $summary;
    }
    return '';
}
function policy_metadata_html(string $html,array $p): string {
    $html=preg_replace_callback('~<title>.*?</title>~s',static fn()=>'<title>'.h($p['title']).' | Baran&#39;s Scoreboard</title>',$html,1)??$html;
    $summary=policy_summary($p);
    $metadata=[['property','og:title',$p['title']],['name','twitter:title',$p['title']]];
    if($summary!=='')array_push($metadata,['name','description',$summary],['property','og:description',$summary],['name','twitter:description',$summary]);
    foreach($metadata as [$attribute,$name,$value]){
        $pattern='~<meta(?=[^>]*\b'.preg_quote($attribute,'~').'="'.preg_quote($name,'~').'")[^>]*>~';
        $html=preg_replace_callback($pattern,static fn($m)=>preg_replace_callback('~content="[^"]*"~',static fn()=> 'content="'.h($value).'"',$m[0],1)??$m[0],$html,1)??$html;
    }
    return $html;
}
function save_policy(array $c,string $lang,string $title,string $content,int $revision): void {
    if(!isset(policy_paths()[$lang])||strlen($title)<1||mb_strlen($title)>200||strlen($content)<50||mb_strlen($content)>100000)fail(400);
    $directory=$c['policy_path'];if(!is_dir($directory)&&!mkdir($directory,0700,true)&&!is_dir($directory))throw new RuntimeException('Policy storage unavailable');
    if(!is_dir($directory)||!is_writable($directory)||!chmod($directory,0700))throw new RuntimeException('Policy storage unavailable');
    $lock=fopen($directory.'/publish.lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Policy lock unavailable');if(!chmod($directory.'/publish.lock',0600))throw new RuntimeException('Policy lock unavailable');
    try{
        $old=policy_document($c,$lang);if((int)$old['revision']!==$revision)fail(409,'The policy changed in another window. Reload before saving.');
        $p=['title'=>$title,'content'=>$content,'revision'=>$revision+1,'updatedAt'=>gmdate('c')];
        $history=$directory.'/history';if(!is_dir($history)&&!mkdir($history,0700)&&!is_dir($history))throw new RuntimeException('Policy history unavailable');if(!is_writable($history)||!chmod($history,0700))throw new RuntimeException('Policy history unavailable');
        $previous=$history.'/'.$lang.'-'.str_pad((string)$revision,8,'0',STR_PAD_LEFT).'.json';if(file_put_contents($previous,json_encode($old,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR))===false||!chmod($previous,0600))throw new RuntimeException('Policy history unavailable');
        $temp=tempnam($directory,'policy-');if(!$temp)throw new RuntimeException('Policy write unavailable');
        try{if(file_put_contents($temp,json_encode($p,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR))===false)throw new RuntimeException('Policy write unavailable');chmod($temp,0600);if(!rename($temp,$directory.'/'.$lang.'.json'))throw new RuntimeException('Policy publication unavailable');}finally{if(is_file($temp))unlink($temp);}
        $files=glob($history.'/'.$lang.'-*.json');sort($files);while(count($files)>20)unlink(array_shift($files));
    }finally{flock($lock,LOCK_UN);fclose($lock);}
}
function serve_policy(array $c,string $lang): never {
    $p=policy_document($c,$lang);$file=rtrim($_SERVER['DOCUMENT_ROOT'],'/').policy_paths()[$lang].'index.html';$html=file_get_contents($file);
    $article=policy_article($p,$lang);$json=json_encode($p,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
    $html=preg_replace_callback('~<article\b[^>]*\bid="policy-content"[^>]*>.*?</article>~s',static fn()=>$article,$html,1,$count);if($count!==1)throw new RuntimeException('Policy template unavailable');
    $topics=policy_topics($p,$lang);
    $html=preg_replace_callback('~<details\b[^>]*>.*?</details>\s*<aside\b[^>]*>.*?</aside>~s',static fn()=>$topics,$html,1,$count);if($count!==1)throw new RuntimeException('Policy topics unavailable');
    $html=preg_replace_callback('~<script\b[^>]*\bid="policy-document"[^>]*>.*?</script>~s',static fn()=>'<script id="policy-document" type="application/json">'.$json.'</script>',$html,1,$count);if($count!==1)throw new RuntimeException('Policy data unavailable');
    $html=policy_metadata_html($html,$p);
    header_remove('X-Robots-Tag');header('Content-Type: text/html; charset=UTF-8');header('Cache-Control: no-cache');echo $html;exit;
}
