<?php
include 'common_lib.inc';
$response = array('status' => 404);
$_REQUEST['pretty'] = 1;
if (array_key_exists('run', $_REQUEST) && strlen($_REQUEST['run']) == 8) {
  list($century, $year, $month, $day) = str_split($_REQUEST['run'], 2);
  $run_dir = "./results/$year/$month/$day";
  if (is_dir($run_dir)) {
    $files = scandir($run_dir);
    if (count($files) > 2) {
      $response['status'] = 200;
      $response['statusText'] = "Complete";
      $response['archives'] = array();
      foreach ($files as $group) {
        $group_dir = "$run_dir/$group";
        if (is_dir($group_dir) && $group !== '.' && $group != '..') {
          $archived = false;
          if (is_file("$group_dir/archive.dat")) {
            $url = trim(file_get_contents("$group_dir/archive.dat"));
            if (strlen($url) && preg_match('/(?<base>http.*)\/(?<bucket>.+)\/(.+).zip$/', $url, $matches)) {
              $archived = true;
              $response['archives'][$group] = "{$matches['base']}/har_{$matches['bucket']}/bodies.zip";
            }
          }
          
          if (!$archived) {
            $response['archives'][$group] = '';
            $response['status'] = 100;
            $response['statusText'] = "Not all tests have been archived yet";
          }
        }
      }
    } else {
      $response['error'] = "HTTP Archive Run {$_REQUEST['run']} contains no tests";
    }
  } else {
    $response['error'] = "HTTP Archive Run {$_REQUEST['run']} not found";
  }
} else {
  $response['error'] = 'HTTP Archive Run not specified';
  $response['usage'] = 'habodies.php?run=YYYYMMDD';
  $response['example'] = 'habodies.php?run=20140115';
}
json_response($response);
?>
