<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {http_response_code(404);exit;}
require __DIR__.'/config.php'; require __DIR__.'/security.php';
try {
    $action=$argv[1]??'';
    if($action==='secret'){echo bin2hex(random_bytes(32)).PHP_EOL;exit;}
    if($action==='password'){
        if(!function_exists('posix_isatty') || !posix_isatty(STDIN)) throw new RuntimeException('Use an interactive SSH terminal for password setup.');
        fwrite(STDERR,'Administrator password (at least 14 characters; input hidden): ');
        system('stty -echo');
        try{$password=rtrim(fgets(STDIN)?:'',"\r\n");fwrite(STDERR,PHP_EOL.'Repeat: ');$repeat=rtrim(fgets(STDIN)?:'',"\r\n");}
        finally{system('stty echo');fwrite(STDERR,PHP_EOL);}
        if(strlen($password)<14 || $password!==$repeat)throw new RuntimeException('Passwords must match and contain at least 14 characters.');
        echo password_hash($password,defined('PASSWORD_ARGON2ID')?PASSWORD_ARGON2ID:PASSWORD_DEFAULT).PHP_EOL;exit;
    }
    $c=configuration();if(strlen($c['key'])<32||!$c['db_name'])throw new RuntimeException('Configure private environment settings first.');$db=database($c);
    if($action==='check'){if(!$c['origin'] || !$c['admin_username'] || !password_get_info($c['admin_hash'])['algo'])throw new RuntimeException('Configure the origin and a real administrator password hash.');echo 'Configuration is ready.'.PHP_EOL;}elseif($action==='migrate'){
        $db->exec('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY,applied_at DATETIME NOT NULL) ENGINE=InnoDB');
        $lock=$db->query("SELECT GET_LOCK('scoreboard_migrations',30)")->fetchColumn();if((int)$lock!==1)throw new RuntimeException('Another migration is running.');
        foreach(glob(__DIR__.'/migrations/*.sql') as $file){
            $version=basename($file);$q=$db->prepare('SELECT 1 FROM schema_migrations WHERE version=?');$q->execute([$version]);if($q->fetchColumn())continue;
            foreach(explode(';',file_get_contents($file)) as $sql)if(trim($sql))$db->exec($sql);
            $q=$db->prepare('INSERT INTO schema_migrations VALUES (?,UTC_TIMESTAMP())');$q->execute([$version]);echo 'Applied '.$version.PHP_EOL;
        }
        $db->query("SELECT RELEASE_LOCK('scoreboard_migrations')");echo 'Database is up to date.'.PHP_EOL;
    }elseif($action==='cleanup'){
        cleanup($db);foreach(glob($c['session_path'].'/sess_*') as $file)if(is_file($file)&&filemtime($file)<time()-3600)unlink($file);echo 'Cleanup complete.'.PHP_EOL;
    }elseif($action==='disable-consents'){
        $db->beginTransaction();$db->exec('DELETE FROM visits');$db->exec('UPDATE preferences SET usage_allowed=0,cloud_allowed=0');$db->commit();echo 'Optional collection permissions and restored analytics removed.'.PHP_EOL;
    }else{fwrite(STDERR,"Usage: php backend/manage.php secret|password|migrate|cleanup|disable-consents\n");exit(1);}
}catch(Throwable){fwrite(STDERR,"Operation failed. Check the private configuration, PHP extensions, database grants and command. No secrets were logged.\n");exit(1);}
