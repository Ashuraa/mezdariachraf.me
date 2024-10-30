<?php
ini_set('memory_limit', '512M');  // Increase memory limit to 512MB
ini_set('max_execution_time', '300');  // Increase execution time
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php-error.log'); // Adjust path for your server

require 'vendor/autoload.php';

use Smalot\PdfParser\Parser;

function searchPDF($query, $startPage = 1, $endPage = null) {
    $parser = new Parser();
    $pdf = $parser->parseFile('./pdfjs/web/test.pdf');

    $results = [];
    $pages = $pdf->getPages();
    $totalPages = count($pages);

    // Set endPage to the total number of pages if not provided
    if ($endPage === null || $endPage > $totalPages) {
        $endPage = $totalPages;
    }

    // Loop through the specified range of pages
    for ($pageNumber = $startPage - 1; $pageNumber < $endPage; $pageNumber++) {
        $page = $pages[$pageNumber];
        $pageText = $page->getText();

        if (stripos($pageText, $query) !== false) {
            $sentences = preg_split('/(\.|\!|\?)(\s)/', $pageText, -1, PREG_SPLIT_DELIM_CAPTURE);

            foreach ($sentences as $sentence) {
                if (stripos($sentence, $query) !== false) {
                    $results[] = [
                        'page' => $pageNumber + 1,
                        'text' => $sentence,
                    ];
                }
            }
        }
    }

    ob_clean();

    header('Content-Type: application/json');
    echo json_encode($results);
    exit();
}

if (isset($_GET['query'])) {
    $query = $_GET['query'];
    $startPage = isset($_GET['startPage']) ? (int)$_GET['startPage'] : 1;
    $endPage = isset($_GET['endPage']) ? (int)$_GET['endPage'] : null;
    searchPDF($query, $startPage, $endPage);
}
?>
