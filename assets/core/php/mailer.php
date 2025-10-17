<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

/**
 * Sends form data via email with attachments and optional autoresponder
 * 
 * @param array $config Configuration including:
 *   - host (string): SMTP server
 *   - username (string): SMTP username
 *   - password (string): SMTP password
 *   - setFrom (string): Sender email
 *   - setFromName (string): Optional sender name
 *   - replyTo (string|array): Reply-to address(es)
 *   - recipients (array): List of recipient emails
 *   - subject (string): Email subject
 *   - formData (array): Form fields for template
 *   - template (string)|templatePath (string): HTML template
 *   - files (array): Pre-validated files array
 *   - autoresponder (array): Optional autoresponder config containing:
 *       - subject (string): Autoresponder subject
 *       - template (string)|templatePath (string): Autoresponder template
 *       - includeOriginal (bool): Whether to include original message (default: false)
 *   - port (int): SMTP port (default: 587)
 *   - encryption (string): SMTP encryption (default: 'tls')
 *   - allowedExtensions (array): Permitted file extensions
 * 
 * @return array [
 *   'success' => bool, 
 *   'message' => string, 
 *   'autoresponderSent' => bool
 * ]
 */
function sendFormEmail(array $config): array
{
    // Default configuration (security-focused)
    $defaults = [
        'port' => 587,
        'encryption' => 'tls',
        'allowedExtensions' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        'autoresponder' => null,
        'htmlFields' => [] // Fields that can contain raw HTML
    ];
    $config = array_merge($defaults, $config);

    try {
        // 1. Send main email to administrators
        $mainResult = sendSingleEmail($config, false);
        
        // 2. Conditionally send autoresponder to submitter
        $arResult = ['success' => false, 'message' => 'No autoresponder configured'];
        if ($mainResult['success'] && !empty($config['replyTo']) && !empty($config['autoresponder'])) {
            $arConfig = prepareAutoresponderConfig($config);
            $arResult = sendSingleEmail($arConfig, true);
        }

        return [
            'success' => $mainResult['success'],
            'message' => $mainResult['message'] . ($arResult['message'] ? ' | ' . $arResult['message'] : ''),
            'autoresponderSent' => $arResult['success']
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Mailer Error: ' . $e->getMessage(),
            'autoresponderSent' => false
        ];
    }
}

/**
 * Prepares autoresponder-specific configuration by transforming the main config
 * 
 * @param array $config Main email configuration
 * @return array Autoresponder-specific configuration
 */
function prepareAutoresponderConfig(array $config): array
{
    $arConfig = $config['autoresponder'];
    
    return [
        'host' => $config['host'],
        'username' => $config['username'],
        'password' => $config['password'],
        'setFrom' => $config['setFrom'],
        'setFromName' => $config['setFromName'] ?? null,
        // Send to the replyTo address(es) instead of original recipients
        'recipients' => is_array($config['replyTo']) 
            ? $config['replyTo'] 
            : [$config['replyTo'] => ''],
        // Use custom subject or fallback
        'subject' => $arConfig['subject'] ?? 'Thank you for your submission',
        // Maintain same form data for placeholders
        'formData' => $config['formData'],
        // Autoresponders typically don't need attachments
        'files' => [],
        // Preserve HTML fields whitelist from main config
        'htmlFields' => $config['htmlFields'],
        // Template selection priority:
        // 1. Direct template content
        // 2. Template from file path
        // 3. Original message (if includeOriginal enabled)
        'template' => $arConfig['template'] ?? 
            (isset($arConfig['templatePath']) 
                ? file_get_contents($arConfig['templatePath']) 
                : ($arConfig['includeOriginal'] ?? false ? $config['template'] : null)),
        // Debug mode setting
        'debug' => $config['debug'] ?? false
    ];
}

/**
 * Core email sending logic (used for both main emails and autoresponders)
 * 
 * @param array $config Email configuration
 * @param bool $isAutoresponder Flag to handle autoresponder-specific logic
 * @return array ['success' => bool, 'message' => string]
 * @throws Exception If template is missing or security checks fail
 */
function sendSingleEmail(array $config, bool $isAutoresponder): array
{
    // 1. TEMPLATE HANDLING
    $template = $config['template'] ?? 
        (isset($config['templatePath']) ? file_get_contents($config['templatePath']) : false);

    if (!$template) {
        throw new Exception($isAutoresponder ? "No autoresponder template provided" : "No template provided");
    }

    // 2. PLACEHOLDER REPLACEMENT
    $body = preg_replace_callback(
        '/%([\w-]+)%/',
        function($match) use ($config) {
            $fieldKey = str_replace('-', '_', $match[1]);
            
            $value = $config['formData'][$match[1]] ?? 
                    $config['formData'][$fieldKey] ?? 
                    '[Not Provided]';

            // Handle HTML-safe fields
            if (in_array($match[1], $config['htmlFields'])) {
                return $value; // Return raw HTML as-is
            }
            
            // Default security treatment for all other fields
            return is_string($value) 
                ? nl2br(htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'))
                : $value;
        },
        $template
    );

    // 3. EMAIL SETUP
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->Host = $config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['username'];
    $mail->Password = $config['password'];
    $mail->SMTPSecure = $config['encryption'];
    $mail->Port = $config['port'];

    // Sender information
    $mail->setFrom($config['setFrom'], $config['setFromName'] ?? '');

    // 4. RECIPIENT MANAGEMENT
    foreach ($config['recipients'] as $email => $name) {
        is_numeric($email) 
            ? $mail->addAddress($name) 
            : $mail->addAddress($email, $name);
    }

    // 5. ATTACHMENTS (only for main emails)
    if (!$isAutoresponder && !empty($config['files'])) {
        foreach ($config['files'] as $file) {
            if (!is_uploaded_file($file['tmp_name'])) {
                throw new Exception("Invalid file upload detected");
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, $config['allowedExtensions'])) {
                throw new Exception("Invalid file type: .$ext");
            }

            $mail->addAttachment($file['tmp_name'], $file['name']);
        }
    }

    // 6. EMAIL CONTENT
    $mail->isHTML(true);
    $mail->Subject = $config['subject'];
    $mail->Body = $body;
    $mail->AltBody = strip_tags($body);

    // 7. SEND AND RETURN RESULTS
    return [
        'success' => $mail->send(),
        'message' => $mail->ErrorInfo ?? ($isAutoresponder ? 'Autoresponder sent' : 'Email sent successfully')
    ];
}


/**
 * Validates uploaded files with configurable rules
 * 
 * @param array $files $_FILES array or equivalent
 * @param array $options Validation options including:
 *   - max_files_total (int): Maximum number of files allowed
 *   - max_file_size_mb (int): Maximum size per file in MB
 *   - allowed_extensions (array): Permitted file extensions
 * @return array [
 *   'validated_files' => array, // Cleaned files array
 *   'errors' => array           // Validation errors if any
 * ]
 */
function validateUploadedFiles(array $files, array $options = []): array
{
    // Set default options
    $defaults = [
        'max_files_total' => 5,
        'max_file_size_mb' => 2,
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
    ];
    $options = array_merge($defaults, $options);
    
    $validatedFiles = [];
    $errors = [];
    
    // Skip validation if no files were uploaded
    if (empty($files) || empty($files['name'][0])) {
        return ['validated_files' => [], 'errors' => []];
    }
    
    $fileCount = count(array_filter($files['name']));
    
    // Validate file count
    if ($fileCount > $options['max_files_total']) {
        $errors[] = sprintf(
            'Maximum %d files allowed (you uploaded %d)',
            $options['max_files_total'],
            $fileCount
        );
        return ['validated_files' => [], 'errors' => $errors];
    }
    
    // Validate individual files
    for ($i = 0; $i < $fileCount; $i++) {
        // Skip empty file slots
        if (empty($files['name'][$i])) continue;
        
        $fileName = $files['name'][$i];
        $fileSize = $files['size'][$i];
        $fileError = $files['error'][$i];
        
        // Check for upload errors
        if ($fileError !== UPLOAD_ERR_OK) {
            $errors[] = sprintf('File "%s" upload error: %s', 
                $fileName,
                getUploadErrorMessage($fileError)
            );
            continue;
        }
        
        // Validate file size
        if ($fileSize > $options['max_file_size_mb'] * 1024 * 1024) {
            $errors[] = sprintf(
                'File "%s" exceeds %.1fMB limit',
                $fileName,
                $options['max_file_size_mb']
            );
            continue;
        }
        
        if ($fileSize <= 0) {
            $errors[] = sprintf('File "%s" is empty', $fileName);
            continue;
        }
        
        // Validate file extension
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (!in_array($ext, $options['allowed_extensions'])) {
            $errors[] = sprintf(
                'File "%s" has invalid extension (.%s). Allowed: %s',
                $fileName,
                $ext,
                implode(', ', $options['allowed_extensions'])
            );
            continue;
        }
        
        // Add to validated files if all checks pass
        $validatedFiles[] = [
            'name' => $fileName,
            'type' => $files['type'][$i],
            'tmp_name' => $files['tmp_name'][$i],
            'error' => $fileError,
            'size' => $fileSize
        ];
    }
    
    return [
        'validated_files' => $validatedFiles,
        'errors' => $errors
    ];
}

/**
 * Helper function to get human-readable upload error messages
 */
function getUploadErrorMessage(int $errorCode): string
{
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
    ];
    
    return $errors[$errorCode] ?? 'Unknown upload error';
}