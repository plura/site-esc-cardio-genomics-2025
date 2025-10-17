<?php
/**
 * Core Utility Functions
 * 
 * @package Core
 */


/**
 * Extracts sequentially numbered fields from POST data
 * 
 * @param string $baseName The base field name (e.g. 'abstract-author')
 * @param bool $asHtml Return as HTML string? Default: false (returns array)
 * @param string $format Format pattern using %n% (number) and %value% placeholders
 * @return array|string Array of values or formatted HTML string
 * 
 * @example getNumberedPostFields('abstract-author') → ['John', 'Jane']
 * @example getNumberedPostFields('abstract-author', true, '<li>%n%. %value%</li>')
 */
function getNumberedPostFields(string $baseName, bool $asHtml = false, string $format = '%value%'): array|string {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        trigger_error('Function requires POST data', E_USER_WARNING);
        return $asHtml ? '' : [];
    }

    $results = [];
    $pattern = '/^' . preg_quote($baseName, '/') . '([0-9]+)$/';

    foreach ($_POST as $key => $value) {
        if (preg_match($pattern, $key, $matches)) {
            $index = (int)$matches[1];
            $results[$index] = [
                'number' => $index,
                'value' => is_array($value) ? 
                    array_map('htmlspecialchars', $value) : 
                    htmlspecialchars($value, ENT_QUOTES, 'UTF-8')
            ];
        }
    }

    ksort($results, SORT_NUMERIC);

    if (!$asHtml) {
        return array_column($results, 'value');
    }

    $output = [];
    foreach ($results as $field) {
        $output[] = str_replace(
            ['%n%', '%value%'],
            [
                $field['number'],
                is_array($field['value']) ? 
                    implode(', ', $field['value']) : 
                    $field['value']
            ],
            $format
        );
    }

    return implode("\n", $output);
}

