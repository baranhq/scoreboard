<?php
$ok=true;
foreach(['backend','public/api','tests'] as $dir){foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir,FilesystemIterator::SKIP_DOTS)) as $file){if($file->getExtension()!=='php')continue;passthru(PHP_BINARY.' -l '.escapeshellarg($file->getPathname()),$code);if($code)$ok=false;}}
exit($ok?0:1);
