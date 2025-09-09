<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Disable SSL certificate validation
stream_context_set_default([
  'ssl' => [
    'verify_peer' => false,
    'verify_peer_name' => false,
  ],
]);

/**
 * Returns a hue color based on the progress percentage, from red to green
 * @param int $percent the progress percentage
 * @return int the hue color between 0 (red) and 20000 (green)
 */
function getHueColor($percent = 0)
{
  return round($percent * 20000 / 100);
}

/**
 * Returns the body to emit a hue color based on the progress percentage
 * @param int $percent the progress percentage
 * @return string the body to emit a hue color based on the progress percentage
 */
function getHueColorBody($percent = 0)
{
  $isEveryThingDone = $percent === 100;
  $body = [
    'bri' => 255,
    'hue' => getHueColor($percent),
    'on' => !$isEveryThingDone,
    'sat' => 255
  ];
  // echo "with a $percent% progress will emit hue color", json_encode($body), "<br>";
  return json_encode($body);
}

function jsonResponse($ok, $message, $progress, $response = null, $data = null)
{
  return json_encode(['ok' => $ok, 'message' => $message, 'progress' => $progress, 'response' => $response, 'data' => $data, 'version' => '2025-09-09.1']);
}

/**
 * Emit a hue color based on the progress percentage
 * @param string $progressString the progress percentage
 * @return void
 */
function setProgress($progressString = "")
{
  if (empty($progressString)) {
    echo jsonResponse(false, "Progress value is empty", $progressString);
    return;
  }
  $progress = intval($progressString);
  if (!is_int($progress)) {
    echo jsonResponse(false, "Invalid progress value. It must be an integer.", $progress);
    return;
  }
  $data = getHueColorBody($progress);
  // Load HUE_ENDPOINT from olivo-hue-status.env
  $envPath = __DIR__ . '/olivo-hue-status.env';
  $hueEndpoint = '';
  if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (strpos($line, 'HUE_ENDPOINT=') === 0) {
        $hueEndpoint = substr($line, strlen('HUE_ENDPOINT='));
        break;
      }
    }
  }
  if (empty($hueEndpoint)) {
    echo jsonResponse(false, "HUE_ENDPOINT not set in local.env", $progress);
    return;
  }

  $ch = curl_init($hueEndpoint);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
  ]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification for testing purposes
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Disable host verification

  $result = curl_exec($ch);
  if ($result === false) {
    $error = curl_error($ch);
    echo jsonResponse(false, "Error emitting hue color", $progress, $error, json_decode($data));
  } else {
    echo jsonResponse(true, "Emitted hue color successfully", $progress, json_decode($result), json_decode($data));
  }
  curl_close($ch);
}
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $progress = htmlspecialchars($_POST['progress'] ?? '');
  setProgress($progress);
} else {
  ?>
  <form method="POST">
    <label for="nom">Your progress :</label>
    <input type="text" id="progress" name="progress" placeholder="50">
    <button type="submit">Send</button>
  </form>
  <?php
}
?>
