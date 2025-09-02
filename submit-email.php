<?php
/**
 * Email Subscription Handler with Anti-Spam Protection
 * Genius In Pocket - Coming Soon Page
 * Author: Lubos Winkler
 */

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers for frontend requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$ADMIN_EMAIL = 'lubos.winkler@gmail.com';
$SITE_NAME = 'Genius In Pocket';
$SITE_URL = 'https://geniusinpocket.com';

// Anti-spam configuration
$MAX_SUBMISSIONS_PER_IP = 3; // Max submissions per IP per hour
$MIN_TIME_BETWEEN_SUBMISSIONS = 60; // Seconds between submissions from same IP
$HONEYPOT_FIELD = 'website'; // Hidden field name for honeypot

// Rate limiting storage (in production, use database or Redis)
$RATE_LIMIT_FILE = 'rate_limits.json';
$SUBMISSIONS_FILE = 'submissions.json';

/**
 * Anti-spam protection functions
 */
function getRateLimits() {
    global $RATE_LIMIT_FILE;
    if (!file_exists($RATE_LIMIT_FILE)) {
        return [];
    }
    $data = file_get_contents($RATE_LIMIT_FILE);
    return json_decode($data, true) ?: [];
}

function saveRateLimits($limits) {
    global $RATE_LIMIT_FILE;
    file_put_contents($RATE_LIMIT_FILE, json_encode($limits));
}

function cleanOldRateLimits($limits) {
    $oneHourAgo = time() - 3600;
    foreach ($limits as $ip => $data) {
        $limits[$ip]['submissions'] = array_filter($data['submissions'], function($timestamp) use ($oneHourAgo) {
            return $timestamp > $oneHourAgo;
        });
        if (empty($limits[$ip]['submissions'])) {
            unset($limits[$ip]);
        }
    }
    return $limits;
}

function isRateLimited($ip) {
    global $MAX_SUBMISSIONS_PER_IP, $MIN_TIME_BETWEEN_SUBMISSIONS;
    
    $limits = getRateLimits();
    $limits = cleanOldRateLimits($limits);
    
    if (!isset($limits[$ip])) {
        return false;
    }
    
    $ipData = $limits[$ip];
    
    // Check max submissions per hour
    if (count($ipData['submissions']) >= $MAX_SUBMISSIONS_PER_IP) {
        return true;
    }
    
    // Check minimum time between submissions
    if (!empty($ipData['submissions'])) {
        $lastSubmission = max($ipData['submissions']);
        if (time() - $lastSubmission < $MIN_TIME_BETWEEN_SUBMISSIONS) {
            return true;
        }
    }
    
    return false;
}

function recordSubmission($ip) {
    $limits = getRateLimits();
    $limits = cleanOldRateLimits($limits);
    
    if (!isset($limits[$ip])) {
        $limits[$ip] = ['submissions' => []];
    }
    
    $limits[$ip]['submissions'][] = time();
    saveRateLimits($limits);
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function isDisposableEmail($email) {
    $disposableDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ];
    
    $domain = strtolower(substr(strrchr($email, "@"), 1));
    return in_array($domain, $disposableDomains);
}

function saveSubmission($email, $ip) {
    global $SUBMISSIONS_FILE;
    
    $submissions = [];
    if (file_exists($SUBMISSIONS_FILE)) {
        $data = file_get_contents($SUBMISSIONS_FILE);
        $submissions = json_decode($data, true) ?: [];
    }
    
    $submissions[] = [
        'email' => $email,
        'ip' => $ip,
        'timestamp' => time(),
        'date' => date('Y-m-d H:i:s'),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ];
    
    file_put_contents($SUBMISSIONS_FILE, json_encode($submissions, JSON_PRETTY_PRINT));
}

function sendConfirmationEmail($email) {
    global $ADMIN_EMAIL, $SITE_NAME, $SITE_URL;
    
    $subject = "New Subscription - $SITE_NAME";
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $timestamp = date('Y-m-d H:i:s');
    
    $message = "
    <html>
    <head>
        <title>New Subscription Notification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
            .highlight { background: #e7f3ff; padding: 10px; border-left: 4px solid #667eea; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🚀 New Subscription Alert</h1>
                <p>$SITE_NAME - Coming Soon Page</p>
            </div>
            <div class='content'>
                <h2>New Email Subscription</h2>
                <div class='highlight'>
                    <strong>Email:</strong> $email
                </div>
                <p><strong>Submission Details:</strong></p>
                <ul>
                    <li><strong>Date & Time:</strong> $timestamp</li>
                    <li><strong>IP Address:</strong> $ip</li>
                    <li><strong>User Agent:</strong> $userAgent</li>
                    <li><strong>Website:</strong> <a href='$SITE_URL'>$SITE_URL</a></li>
                </ul>
                <p>This email was automatically generated from your coming soon landing page.</p>
            </div>
            <div class='footer'>
                <p>&copy; 2024 $SITE_NAME. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: noreply@geniusinpocket.com',
        'Reply-To: noreply@geniusinpocket.com',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($ADMIN_EMAIL, $subject, $message, implode("\r\n", $headers));
}

/**
 * Main processing
 */
try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    // Get client IP
    $clientIP = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (strpos($clientIP, ',') !== false) {
        $clientIP = trim(explode(',', $clientIP)[0]);
    }
    
    // Check rate limiting
    if (isRateLimited($clientIP)) {
        throw new Exception('Too many requests. Please try again later.', 429);
    }
    
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data', 400);
    }
    
    $email = trim($input['email'] ?? '');
    $honeypot = trim($input[$HONEYPOT_FIELD] ?? '');
    
    // Honeypot check (should be empty)
    if (!empty($honeypot)) {
        throw new Exception('Spam detected', 400);
    }
    
    // Validate email
    if (empty($email)) {
        throw new Exception('Email is required', 400);
    }
    
    if (!validateEmail($email)) {
        throw new Exception('Invalid email format', 400);
    }
    
    if (isDisposableEmail($email)) {
        throw new Exception('Disposable email addresses are not allowed', 400);
    }
    
    // Record submission for rate limiting
    recordSubmission($clientIP);
    
    // Save submission
    saveSubmission($email, $clientIP);
    
    // Send confirmation email
    $emailSent = sendConfirmationEmail($email);
    
    if (!$emailSent) {
        error_log("Failed to send confirmation email for: $email");
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for subscribing! You\'ll be the first to know when we launch.',
        'email_sent' => $emailSent
    ]);
    
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
