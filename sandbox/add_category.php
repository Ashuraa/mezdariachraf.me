<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lire le contenu de la requête
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['name']) && isset($data['start']) && isset($data['end'])) {
        $categoryName = $data['name'];
        $start = intval($data['start']);
        $end = intval($data['end']);

        // Lire le fichier JSON existant
        $filePath = 'categories.json';
        $categories = json_decode(file_get_contents($filePath), true);
        
        // Ajouter la nouvelle catégorie avec plage de pages
        $categories[] = ['name' => $categoryName, 'start' => $start, 'end' => $end];

        // Écrire les nouvelles catégories dans le fichier
        file_put_contents($filePath, json_encode($categories, JSON_PRETTY_PRINT));

        // Retourner une réponse
        echo json_encode(['message' => 'Catégorie ajoutée avec succès.']);
    } else {
        echo json_encode(['message' => 'Erreur : nom de catégorie ou plage de pages manquante.']);
    }
} else {
    echo json_encode(['message' => 'Méthode non autorisée.']);
}
?>
