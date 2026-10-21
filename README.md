# GlobePath

**Explorer les distances sur Terre et dans le système solaire.** GlobePath est un outil pédagogique interactif pour relier géographie, géométrie et astronomie : comparer deux lieux, observer leur trajet sur un globe, puis changer d’échelle avec les huit planètes.

L’application fonctionne dans le navigateur, sans compte ni installation de dépendances. Les calculs et les exemples intégrés sont utilisables sans service externe.

## Ce que l’on peut explorer

- **Sur Terre** : choisir deux villes ou saisir leurs coordonnées, calculer la distance de grand cercle et visualiser l’arc sur un globe schématique. Inverser les lieux ou charger un exemple pour comparer les résultats.
- **Dans le système solaire** : choisir deux planètes parmi Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus et Neptune, puis faire varier leur angle relatif autour du Soleil. Comparer la distance en millions de kilomètres et en unités astronomiques, ainsi que le temps de parcours de la lumière.
- **Changer de point de vue** : consulter les distances orbitales du modèle et les séparations minimale et maximale entre deux planètes.

L’interface s’adapte au téléphone et à l’ordinateur. Les formulaires proposent des libellés, une validation des coordonnées et des messages de résultat accessibles au clavier.

## Démarrer en local

Prérequis : Python 3 pour servir les fichiers ; Node.js 20 ou plus pour exécuter les tests.

```sh
git clone --branch codex/earth-solar-classroom https://github.com/VincentVFR/Earth-calculator.git
cd Earth-calculator
python -m http.server 8080 --bind 127.0.0.1
```

Ouvrir [localhost:8080](http://127.0.0.1:8080). Aucun `npm install` ni étape de compilation n’est nécessaire. Un hébergement statique suffit pour déployer l’application.

Pour vérifier les calculs :

```sh
npm test
```

Choisir une ville proposée ou saisir une latitude et une longitude en degrés décimaux, séparées par une virgule : `48.86, 2.35`. Utiliser un point comme séparateur décimal. Les plages acceptées sont −90 à 90 pour la latitude et −180 à 180 pour la longitude.

## Quelques pistes pour la classe

1. **Lire un globe** : comparer Paris–Tokyo et Paris–New York, puis expliquer la différence entre un trajet sur la sphère et son dessin sur une projection.
2. **Comprendre les coordonnées** : changer uniquement la latitude ou la longitude ; observer un passage près d’un pôle ou de l’antiméridien.
3. **Mesurer entre les planètes** : choisir Terre–Mars et comparer les angles 0°, 90° et 180°. Expliquer pourquoi leur distance n’est pas constante.
4. **Relier distance et lumière** : comparer le temps lumière entre des planètes proches et lointaines, puis distinguer ce temps d’un trajet de sonde spatiale.

## Modèles et sources

### Terre

La distance correspond à l’arc minimal sur une sphère de rayon moyen **6 371,0088 km**. Elle ne décrit pas un itinéraire routier, un plan de vol ou une mesure géodésique sur un ellipsoïde.

Le globe schématique utilise une projection orthographique avec méridiens et parallèles. Il ne représente pas les continents. Les portions d’arc derrière le globe apparaissent en pointillé. Pour deux points antipodaux, plusieurs arcs minimaux existent ; l’application en choisit un de façon déterministe.

### Système solaire

Les orbites sont **circulaires, coplanaires et de rayon constant**. Le curseur représente un angle relatif choisi par l’utilisateur : il ne donne pas les positions actuelles des planètes ni des éphémérides.

Les rayons utilisés, adaptés des demi-grands axes JPL à J2000, sont : 0,387 ; 0,723 ; 1 ; 1,524 ; 5,203 ; 9,537 ; 19,189 ; 30,070 UA. La Terre est simplifiée à 1 UA. Les deux orbites dessinées partagent la même échelle.

Pour les rayons r₁ et r₂ et l’angle θ, la séparation suit la loi des cosinus : √(r₁² + r₂² − 2r₁r₂ cos θ). Ses bornes sont |r₁ − r₂| et r₁ + r₂. Choisir deux fois la même planète donne une distance nulle.

L’application utilise **1 UA = 149 597 870,7 km** et **c = 299 792,458 km/s**. Le temps lumière est celui d’un trajet simple dans le vide : distance divisée par c.

Références :

- [JPL — éléments orbitaux approximatifs](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [NASA — orbites et lois de Kepler](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/)
- [IAU — résolution 2012 B2 sur l’unité astronomique](https://www.iau.org/static/resolutions/IAU2012_English.pdf)
- [BIPM — définition du mètre et vitesse de la lumière](https://www.bipm.org/en/si-base-units/metre)

## Services optionnels

La configuration publique se trouve dans `config.js`. Les deux champs restent vides par défaut ; les villes intégrées, les coordonnées libres, les calculs et le globe schématique restent disponibles.

### Carte détaillée avec Mapbox

Renseigner `mapboxToken` avec un jeton public navigateur Mapbox (`pk.`). Le SDK Mapbox GL JS et les tuiles se chargent à la demande. Le globe schématique prend le relais si la carte est indisponible.

Un jeton navigateur est visible par les visiteurs : utiliser des droits minimaux et des domaines autorisés dans le compte Mapbox. Ne jamais placer de jeton privé ni de secret dans ce fichier. Consulter le [guide Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) pour les conditions d’utilisation et la configuration.

### Recherche de villes distante

Renseigner `geocodingEndpoint` avec l’URL HTTPS d’un service compatible Nominatim qui autorise les requêtes navigateur (CORS). Il reçoit `q`, `format=json`, `limit=5` et `addressdetails=1`, puis renvoie un tableau contenant `lon`, `lat`, `display_name` et `address.country`.

La recherche se lance par un clic explicite. L’application utilise un cache en mémoire, annule les requêtes périmées et applique un délai maximal de huit secondes ainsi qu’un espacement local d’au moins 1,1 seconde.

Le service public Nominatim n’est pas configuré par défaut. Sa [politique d’utilisation](https://operations.osmfoundation.org/policies/nominatim/) impose notamment un plafond global d’une requête par seconde, une identification et une attribution adaptées, et interdit l’autocomplétion. La limitation par navigateur ne garantit pas ce plafond entre plusieurs visiteurs : prévoir un fournisseur adapté ou un proxy/cache global et l’attribution OpenStreetMap/ODbL requise.

## Données et confidentialité

L’application n’intègre ni compte, ni analytics, ni historique de trajet, ni stockage persistant. Les calculs s’effectuent localement. Sans configuration externe, elle ne contacte ni Mapbox ni un géocodeur.

Avec une carte ou une recherche distante activée, le navigateur contacte le fournisseur concerné. Le géocodeur reçoit le texte recherché ; l’hébergeur et les fournisseurs peuvent conserver leurs propres journaux.

## Contribuer

Le projet utilise HTML, CSS et JavaScript natifs, avec des tests Node sans dépendances.

| Fichiers | Rôle |
| --- | --- |
| `geometry.js` | Calculs sphériques et chemins sur le globe |
| `solar.js`, `solar-ui.js` | Modèle du système solaire et contrôles |
| `app.js` | Sélection des lieux, recherche et affichage terrestre |
| `index.html`, `styles.css`, `favicon.svg` | Interface et présentation |
| `config.js` | Services externes optionnels |
| `tests/` | Tests des modèles géométriques |

Consulter le [guide de contribution](CONTRIBUTING.md) pour proposer une amélioration ou corriger un problème. Le code est distribué sous [licence MIT](LICENSE) ; les services externes et leurs données conservent leurs propres conditions et licences.

## Réutiliser les calculs et préparer une archive

Le module [@vincentvfr/globepath-math](packages/math/README.md) expose les calculs terrestres et planétaires en CommonJS, sans dépendances ni accès réseau.

```sh
npm run build:package
npm pack ./build/math --pack-destination artifacts --ignore-scripts
python scripts/build-release.py --output-dir artifacts
```

Créer le dossier `artifacts` avant la commande `npm pack`. L’archive du site inclut ses instructions de démarrage, sa licence et le commit source ; elle ne contient aucun historique Git. La publication du module sur GitHub Packages est manuelle, avec le dist-tag `alpha`. Son installation depuis ce registre nécessite une authentification GitHub autorisée ; une archive `.tgz` téléchargée peut aussi être installée localement.
