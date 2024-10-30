// Importer PDF.js en tant que module ES6
import * as pdfjsLib from './pdfjs/build/pdf.mjs';

// Spécifier l'emplacement du worker en utilisant le système de modules ES6
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdfjs/build/pdf.worker.mjs';

let pdfDoc = null,
    scale = 1.5,  // Facteur de zoom
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    adminLoggedIn = false; // Track if admin is logged in

// Charger le PDF à l'initialisation
const url = './pdfjs/web/test.pdf';  // Le chemin vers ton fichier PDF

let currentPage = 1;
const pageSize = 10;  // Number of pages to process per request

// Charger le document PDF avec PDF.js
pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    openPDFPageRange(1, 2);  // Charger une plage de pages par défaut
});

// Hamburger menu functionality
document.getElementById('hamburgerMenu').onclick = function() {
    document.getElementById('menuOverlay').style.display = 'block'; // Open the menu
};

// Close the menu when the close button is clicked
document.getElementById('closeMenu').onclick = function() {
    document.getElementById('menuOverlay').style.display = 'none'; // Close the menu
};

// Add event listener to trigger search on "Enter" key press
document.getElementById('searchQuery').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission if it's inside a form
        searchPDF();  // Call the search function
    }
});

// Gestion du bouton Admin
document.getElementById('adminButton').onclick = function() {
    if (!adminLoggedIn) {
        // Afficher une boîte de dialogue pour la connexion
        const username = prompt("Entrez le nom d'utilisateur :");
        const password = prompt("Entrez le mot de passe :");

        // Vérifier les informations de connexion
        if (username === 'admin' && password === 'pw') {
            // Connexion réussie
            alert("Connexion réussie ! Vous êtes maintenant en mode administrateur.");
            adminLoggedIn = true; // Marquer comme admin connecté
            loadCategories(); // Charger les catégories pour admin
            document.getElementById('adminModal').style.display = 'block'; // Ouvrir le modal
        } else {
            alert("Nom d'utilisateur ou mot de passe incorrect.");
        }
    } else {
        // Déconnexion
        adminLoggedIn = false; // Déconnecter l'administrateur
        document.getElementById('adminModal').style.display = 'none'; // Fermer le modal
    }
};

// Fermer le modal quand l'utilisateur clique sur <span> (x)
document.getElementById('closeModal').onclick = function() {
    adminLoggedIn = false; // Déconnecter l'administrateur
    document.getElementById('adminModal').style.display = 'none'; // Fermer le modal
};

// Fonction pour afficher une plage de pages spécifique
function openPDFPageRange(startPage, endPage) {
    const pdfContainer = document.getElementById('pdfContainer');

    // Clear previous content
    pdfContainer.innerHTML = '';
    pdfContainer.style.display = 'block'; // show display

    // Create an iframe to load the PDF viewer
    const iframe = document.createElement('iframe');
    iframe.src = `pdfjs/web/viewer.html?file=test.pdf#page=${startPage}`; // Ensure the path is correct
    iframe.style.width = '100%';
    iframe.style.height = '100%'; // Adjust height as needed
    iframe.style.border = 'none'; // Remove border if needed
    pdfContainer.appendChild(iframe); // Add iframe to the container

    // Clear search results and close the menu
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('menuOverlay').style.display = 'none'; // Close the menu
}

// Fonction pour afficher une plage de pages spécifique
function openPDFPageRangeNoViewer(startPage, endPage) {
    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = ''; // Effacer le contenu précédent
    pdfContainer.style.display = 'block'; // show display
    let currentPage = startPage;

    const renderNextPage = () => {
        if (currentPage > endPage) return; // Arrêter si toutes les pages sont rendues

        // Obtenir la page à rendre
        pdfDoc.getPage(currentPage).then(page => {
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas'); // Créer un nouveau canvas pour chaque page
            pdfContainer.appendChild(canvas); // Ajouter le canvas au conteneur
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            page.render(renderContext).promise.then(() => {
                currentPage++; // Passer à la page suivante
                renderNextPage(); // Rendre la page suivante
            });
        });
    };

    renderNextPage();

    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('menuOverlay').style.display = 'none'; // Close the menu
}

function searchPDF() {
    const query = document.getElementById('searchQuery').value;
    
    if (!query) {
        alert("Veuillez entrer un mot-clé pour la recherche.");
        return;
    }

    // Reset the current page to 1 for a new search
    currentPage = 1;

    // Clear previous search results
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';  // Clear previous results

    // Start the paginated search
    searchPDFPaginated(query, currentPage);
}

function searchPDFPaginated(query, page) {
    const url = `search.php?query=${encodeURIComponent(query)}&startPage=${page}&endPage=${page + pageSize - 1}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Append the results to the search container
            showSearchResults(data, query);

            // Continue pagination if there are results
            if (data.length > 0) {
                currentPage += pageSize;  // Move to the next batch of pages
                searchPDFPaginated(query, currentPage);  // Continue fetching
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function showSearchResults(results, query) {
    const searchResultsContainer = document.getElementById('searchResults');

    // Only clear previous results if it's the first batch of pages
    if (currentPage === 1) {
        searchResultsContainer.innerHTML = ''; // Clear previous results on the first batch
    }

    // Handle case where no results are found
    if (results.length === 0 && searchResultsContainer.innerHTML === '') {
        searchResultsContainer.innerHTML = 'Aucun résultat trouvé.';
    } else {
        results.forEach(result => {
            // Highlight the query in the sentence
            const highlightedText = result.text.replace(
                new RegExp(query, 'gi'), 
                match => `<mark>${match}</mark>`
            );

            const resultItem = document.createElement('div');
            resultItem.innerHTML = `
                <a href="#" onclick="openPDFPageRange(${result.page}, ${result.page}); return false;">
                    ${highlightedText}
                </a>
            `;
            searchResultsContainer.appendChild(resultItem);
        });
    }

    // Clear the PDF viewer when displaying search results
    document.getElementById('pdfContainer').innerHTML = ''; // Clear canvas
    document.getElementById('pdfContainer').style.display = 'none'; // Clear display
}


// Fonction pour uploader un nouveau PDF
function uploadPDF() {
    // Ici, tu peux envoyer le fichier au serveur avec AJAX
    alert("Fonction de téléchargement non implémentée.");
}

// Fonction pour ajouter une catégorie
function addCategory() {
    const categoryName = document.querySelector('input[name="category_name"]').value;
    const pageStart = parseInt(document.querySelector('input[name="page_start"]').value);
    const pageEnd = parseInt(document.querySelector('input[name="page_end"]').value);

    if (!categoryName || isNaN(pageStart) || isNaN(pageEnd)) {
        alert("Veuillez entrer un nom de catégorie et une plage de pages valide.");
        return;
    }

    // Envoyer la requête au serveur pour ajouter la catégorie
    fetch('add_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName, start: pageStart, end: pageEnd })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Afficher le message de succès ou d'erreur
        document.querySelector('input[name="category_name"]').value = ''; // Réinitialiser le champ
        document.querySelector('input[name="page_start"]').value = '';
        document.querySelector('input[name="page_end"]').value = '';
        loadCategories(); // Recharge les catégories
    })
    .catch(error => console.error('Erreur:', error));
}

// Fonction pour charger les catégories existantes
function loadCategories() {
    fetch('categories.json')
        .then(response => response.json())
        .then(categories => {
            const categoriesContainerAdmin = document.getElementById('existingCategories');
            const categoriesContainer = document.getElementById('categoriesContainer');
            const menuCategories = document.getElementById('menuCategories');
            
            categoriesContainer.innerHTML = ''; // Effacer les anciennes catégories
            menuCategories.innerHTML = ''; // Clear old menu categories

                categories.forEach(category => {
                    const categoryItem = document.createElement('div');
                    categoryItem.innerHTML = `
                        <button onclick="openPDFPageRangeNoViewer(${category.start}, ${category.end});">${category.name}</button>
                    `;
                    categoriesContainer.appendChild(categoryItem);
                    menuCategories.appendChild(categoryItem.cloneNode(true));
                });

            if (categoriesContainerAdmin != null){
                categoriesContainerAdmin.innerHTML = ''; // Effacer les anciennes catégories

                categories.forEach(category => {
                    const categoryItem = document.createElement('div');
                    categoryItem.innerHTML = `
                        ${category.name} (Pages ${category.start}-${category.end})
                        <button onclick="openPDFPageRangeNoViewer(${category.start}, ${category.end})">Ouvrir</button>
                        <button onclick="removeCategory('${category.name}')">Supprimer</button>
                    `;
                    categoriesContainerAdmin.appendChild(categoryItem);
                });
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// Fonction pour supprimer une catégorie
function removeCategory(categoryName) {
    fetch('remove_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Afficher le message de succès ou d'erreur
        loadCategories(); // Recharge les catégories
    })
    .catch(error => console.error('Erreur:', error));
}

// Charger les catégories à l'initialisation
loadCategories();


// Attacher les fonctions à l'objet global window pour qu'elles soient accessibles dans le HTML
window.openPDFPageRange = openPDFPageRange;
window.openPDFPageRangeNoViewer = openPDFPageRangeNoViewer;
window.searchPDF = searchPDF;
window.uploadPDF = uploadPDF;
window.addCategory = addCategory;
window.removeCategory = removeCategory;