<?php
require_once '../../assets/core/php/mailer.php';
require_once '../../assets/core/php/utils.php';
require_once '../../assets/implementations/config/mail.php';

// FILE UPLOAD CONFIG
define('MAX_FILES_TOTAL', 5);
define('MAX_FILE_SIZE_MB', 2);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

try {
    // VALIDATION
    $validationResult = validateUploadedFiles(
        $_FILES['documents'] ?? [],
        [
            'max_files_total' => MAX_FILES_TOTAL,
            'max_file_size_mb' => MAX_FILE_SIZE_MB,
            'allowed_extensions' => ['jpg', 'jpeg']
        ]
    );

    if (!empty($validationResult['errors'])) {
        throw new Exception(implode("\n", $validationResult['errors']));
    }

    $validatedFiles = $validationResult['validated_files'];

    // PROCESS NUMBERED AUTHOR FIELDS
    $authors = getNumberedPostFields('abstract-author');
    $_POST['authors'] = implode('', array_map(
        fn($value, $index) => sprintf(
            '<p><strong>Author %d</strong><br>%s</p>',
            $index + 1,
            htmlspecialchars($value)
        ),
        $authors,
        array_keys($authors)
    ));

    // PROCESS FILE ATTACHMENTS INFO FOR TEMPLATE (optimized version)
    $_POST['documents'] = implode('', array_map(
        fn($file) => '<p>' . htmlspecialchars($file['name']) . '</p>',
        $validatedFiles
    ));

    // LOAD AND MODIFY TEMPLATES
    $autoresponderTemplate = file_get_contents(__DIR__ . '/template.html');
    $template = preg_replace('/<div class="message">.*?<\/div>\s*/s', '', $autoresponderTemplate) ?: '';

    // EMAIL CONFIG
    $config = [
        'host' => SMTP_HOST,
        'username' => SMTP_USER,
        'password' => SMTP_PASS,
        'setFrom' => SMTP_FROM,
        'setFromName' => 'ESC GENOMICS 2025',
        'replyTo' => $_POST['person-email'] ?? null,
        'recipients' => ['iabuscardini@gmail.com' => 'Luísa Buscardini', 'marianabernardo@medicina.ulisboa.pt' => 'Mariana Bernardo'],
        //'recipients' => ['trpsimoes@gmail.com' => 'Tiago Simões'],
        'subject' => 'ESC GENOMICS 2025 Submission: ' . 
                    htmlspecialchars($_POST['person-first-name'] ?? '') . ' ' . 
                    htmlspecialchars($_POST['person-last-name'] ?? ''),
        'template' => $template,
        'formData' => $_POST,
        'files' => $validatedFiles,
        'debug' => false,
        'autoresponder' => [
            'subject' => 'Thank you for your ESC GENOMICS 2025 submission',
            'template' => $autoresponderTemplate,
            'includeOriginal' => false
        ],
        'htmlFields' => ['authors', 'documents']
    ];

    // SEND EMAIL
    $result = sendFormEmail($config);
    
    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}