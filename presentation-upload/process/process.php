<?php
require_once '../../assets/core/php/mailer.php';
require_once '../../assets/core/php/utils.php';
require_once '../../assets/implementations/config/mail.php';

// FILE UPLOAD CONFIG
define('MAX_FILES_TOTAL', 1);
define('MAX_FILE_SIZE_MB', 50);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

try {
	// VALIDATION (single file field: "file")
	$validationResult = validateUploadedFiles(
		$_FILES['documents'] ?? [],
		[
			'max_files_total'   => MAX_FILES_TOTAL,
			'max_file_size_mb'  => MAX_FILE_SIZE_MB,
			'allowed_extensions' => ['ppt', 'pptx', 'pdf']
		]
	);

	if (!empty($validationResult['errors'])) {
		throw new Exception(implode("\n", $validationResult['errors']));
	}

	$validatedFiles = $validationResult['validated_files'];

	// PROCESS FILE INFO FOR TEMPLATE
	$_POST['filename']  = $validatedFiles[0]['name'] ?? '';
	$_POST['filesize']  = isset($validatedFiles[0]['size'])
		? sprintf('%.2f MB', ($validatedFiles[0]['size'] / (1024 * 1024)))
		: '';
	$_POST['filetype']  = pathinfo($_POST['filename'], PATHINFO_EXTENSION) ?: '';

	// LOAD AND MODIFY TEMPLATES
	$autoresponderTemplate = file_get_contents(__DIR__ . '/template.html');
	$template = preg_replace('/<div class="message">.*?<\/div>\s*/s', '', $autoresponderTemplate) ?: '';

	// EMAIL CONFIG
	$config = [
		'host'        => SMTP_HOST,
		'username'    => SMTP_USER,
		'password'    => SMTP_PASS,
		'setFrom'     => SMTP_FROM,
		'setFromName' => 'ESC GENOMICS 2025',
		'replyTo'     => $_POST['presenter-email'] ?? null,
		'recipients'  => [
			//'iabuscardini@gmail.com' => 'Luísa Buscardini',
			//'marianabernardo@medicina.ulisboa.pt' => 'Mariana Bernardo'
			'trpsimoes@gmail.com' => 'Tiago Simões'
		],
		'subject'     => 'ESC GENOMICS 2025 Presentation Upload: ' .
			htmlspecialchars($_POST['abstract-title'] ?? '') . ' — ' .
			'ESC ID: ' . htmlspecialchars($_POST['esc-id'] ?? ''),
		'template'    => $template,
		'formData'    => $_POST,
		'files'       => $validatedFiles,
		'debug'       => false,
		'autoresponder' => [
			'subject'  => 'Thank you — ESC GENOMICS 2025 Presentation Upload',
			'template' => $autoresponderTemplate,
			'includeOriginal' => false
		],
		'htmlFields'  => ['authors', 'documents'] // kept for compatibility; not used in this form
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
