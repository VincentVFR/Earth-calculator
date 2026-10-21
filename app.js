// ====================================
// CONFIGURATION
// ====================================

// ⚠️ IMPORTANT: Insérez votre token Mapbox ici
const MAPBOX_TOKEN = window.GlobeConfig?.mapboxToken || '';

// API Nominatim pour le géocodage (OpenStreetMap - gratuit)
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

// ====================================
// INITIALISATION DE LA CARTE
// ====================================

if (!MAPBOX_TOKEN) {
 document.getElementById('map').textContent = 'Carte détaillée non configurée. Ajoutez votre jeton public Mapbox dans config.js.';
} else {
mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    projection: 'globe', // 🌍 Projection Globe 3D
    center: [0, 20],
    zoom: 1.5,
    pitch: 0
});

// Ajouter l'atmosphère réaliste
map.on('style.load', () => {
    map.setFog({
        color: 'rgb(186, 210, 235)', // Couleur du ciel
        'high-color': 'rgb(36, 92, 223)', // Couleur de l'atmosphère haute
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)', // Couleur de l'espace
        'star-intensity': 0.6
    });
});

// ====================================
// ÉTAT DE L'APPLICATION
// ====================================

let departureCoords = null;
let destinationCoords = null;
let searchTimeout = null;

// ====================================
// FONCTION DE RECHERCHE NOMINATIM
// ====================================

async function searchCity(query) {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(
            `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'GlobePath App'
                }
            }
        );

        if (!response.ok) throw new Error('Erreur de recherche');

        const results = await response.json();
        return results.map(result => ({
            name: result.display_name,
            lon: parseFloat(result.lon),
            lat: parseFloat(result.lat)
        }));
    } catch (error) {
        console.error('Erreur de géocodage:', error);
        return [];
    }
}

// ====================================
// GESTION DES INPUTS AVEC AUTOCOMPLÉTION
// ====================================

function setupAutocomplete(inputId, resultsId, callback) {
    const input = document.getElementById(inputId);
    const resultsDiv = document.getElementById(resultsId);

    input.addEventListener('input', async (e) => {
        const query = e.target.value;

        // Annuler la recherche précédente
        if (searchTimeout) clearTimeout(searchTimeout);

        if (query.length < 3) {
            resultsDiv.classList.add('hidden');
            return;
        }

        // Debounce de 300ms
        searchTimeout = setTimeout(async () => {
            const results = await searchCity(query);

            if (results.length === 0) {
                resultsDiv.classList.add('hidden');
                return;
            }

            // Afficher les résultats
            resultsDiv.innerHTML = results
                .map(
                    (result) => `
                <div class="autocomplete-item text-gray-800" data-lon="${result.lon}" data-lat="${result.lat}" data-name="${result.name}">
                    <div class="font-semibold text-sm">${result.name.split(',')[0]}</div>
                    <div class="text-xs text-gray-600">${result.name}</div>
                </div>
            `
                )
                .join('');

            resultsDiv.classList.remove('hidden');

            // Gérer le clic sur un résultat
            resultsDiv.querySelectorAll('.autocomplete-item').forEach((item) => {
                item.addEventListener('click', () => {
                    const lon = parseFloat(item.dataset.lon);
                    const lat = parseFloat(item.dataset.lat);
                    const name = item.dataset.name;

                    input.value = name.split(',')[0];
                    resultsDiv.classList.add('hidden');

                    callback({ lon, lat, name });
                });
            });
        }, 300);
    });

    // Fermer les résultats au clic extérieur
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.classList.add('hidden');
        }
    });
}

// Configuration des deux inputs
setupAutocomplete('departure', 'departure-results', (coords) => {
    departureCoords = coords;
    updateMarker('departure', coords);
});

setupAutocomplete('destination', 'destination-results', (coords) => {
    destinationCoords = coords;
    updateMarker('destination', coords);
});

// ====================================
// GESTION DES MARQUEURS
// ====================================

let departureMarker = null;
let destinationMarker = null;

function updateMarker(type, coords) {
    // Supprimer l'ancien marqueur
    if (type === 'departure' && departureMarker) {
        departureMarker.remove();
    }
    if (type === 'destination' && destinationMarker) {
        destinationMarker.remove();
    }

    // Créer le nouveau marqueur
    const marker = new mapboxgl.Marker({
        color: type === 'departure' ? '#3b82f6' : '#ef4444'
    })
        .setLngLat([coords.lon, coords.lat])
        .addTo(map);

    if (type === 'departure') {
        departureMarker = marker;
    } else {
        destinationMarker = marker;
    }
}

// ====================================
// CALCUL DU TRAJET ORTHODROMIQUE
// ====================================

document.getElementById('calculate-btn').addEventListener('click', calculateRoute);

function calculateRoute() {
    if (!departureCoords || !destinationCoords) {
        alert('⚠️ Veuillez sélectionner un point de départ et une destination.');
        return;
    }

    showLoading(true);

    // Créer les points de départ et d'arrivée
    const start = [departureCoords.lon, departureCoords.lat];
    const end = [destinationCoords.lon, destinationCoords.lat];

    // Calcul de l'arc de grand cercle (Great Circle)
    const options = { npoints: 100 };
    const arc = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: GlobeMath.unwrap(GlobeMath.greatCircle(start, end)) } };

    // Calcul de la distance en kilomètres
    const distance = GlobeMath.distance(start, end);

    // Afficher la distance
    document.getElementById('distance-text').textContent = `${Math.round(distance)} km`;
    document.getElementById('distance-badge').classList.remove('hidden');

    // Supprimer l'ancienne couche si elle existe
    if (map.getLayer('route')) {
        map.removeLayer('route');
    }
    if (map.getSource('route')) {
        map.removeSource('route');
    }

    // Ajouter la nouvelle couche de trajet
    map.addSource('route', {
        type: 'geojson',
        data: arc
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
            'line-color': '#facc15', // Jaune vif
            'line-width': 3,
            'line-opacity': 0.9
        }
    });

    // Animation de la caméra pour englober le trajet
    animateCamera(start, end);

    showLoading(false);
}

// ====================================
// ANIMATION DE LA CAMÉRA
// ====================================

function animateCamera(start, end) {
    // Calculer le centre du trajet
    const centerLon = (start[0] + end[0]) / 2;
    const centerLat = (start[1] + end[1]) / 2;

    // Calculer la distance pour ajuster le zoom
    const distance = GlobeMath.distance(start, end);

    // Formule pour calculer le zoom approprié
    let zoom = 1;
    if (distance < 500) zoom = 5;
    else if (distance < 1000) zoom = 4;
    else if (distance < 2500) zoom = 3;
    else if (distance < 5000) zoom = 2.5;
    else zoom = 2;

    // Animation fluide de la caméra
    map.flyTo({
        center: [centerLon, centerLat],
        zoom: zoom,
        pitch: 45, // Vue légèrement inclinée
        bearing: 0,
        duration: 3000, // 3 secondes
        essential: true
    });
}

// ====================================
// UTILITAIRES
// ====================================

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// ====================================
// GESTION DU REDIMENSIONNEMENT
// ====================================

window.addEventListener('resize', () => {
    map.resize();
});

console.log('🌍 GlobePath initialisé avec succès!');
console.log('⚠️ N\'oubliez pas de remplacer MAPBOX_TOKEN par votre vrai token.');

}
