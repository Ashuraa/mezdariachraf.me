<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['name'])) {
        $categoryName = $data['name'];

        // Lire le fichier JSON existant
        $filePath = 'categories.json';
        $categories = json_decode(file_get_contents($filePath), true);
        
        // Filtrer les catégories pour supprimer celle correspondante
        $categories = array_filter($categories, function($category) use ($categoryName) {
            return $category['name'] !== $categoryName;
        });

        // Écrire les nouvelles catégories dans le fichier
        file_put_contents($filePath, json_encode(array_values($categories), JSON_PRETTY_PRINT));

        echo json_encode(['message' => 'Catégorie supprimée avec succès.']);
    } else {
        echo json_encode(['message' => 'Erreur : nom de catégorie manquant.']);
    }
} else {
    echo json_encode(['message' => 'Méthode non autorisée.']);
}
?>
