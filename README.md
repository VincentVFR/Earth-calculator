# GlobePath — apprendre les distances

Un outil pédagogique pour enseigner la géographie : comparer deux lieux, calculer leur distance à vol d’oiseau et observer l’arc de grand cercle sur un globe.

## Démarrer

Prérequis : Node.js 20+ pour les tests, Python 3 pour le serveur local.

```sh
npm test
python -m http.server 8080 --bind 127.0.0.1
```

Ouvrir http://127.0.0.1:8080. Aucun `npm install`, framework ou compilation n’est nécessaire. Un hébergement statique suffit.

- Choisir une ville locale proposée, ou saisir **latitude, longitude**, en degrés décimaux avec un point : `48.86, 2.35`.
- Cliquer sur la flèche pour afficher les résultats de recherche, puis choisir un résultat.
- Calculer, inverser les deux lieux ou charger un exemple.
- Les coordonnées sont validées : latitude −90…90, longitude −180…180.
- Sans service externe, les villes locales, les coordonnées libres, les calculs et le globe schématique fonctionnent. Le schéma montre méridiens et parallèles ; il ne représente pas les continents.

## Modèle et limites pédagogiques

Le rayon moyen terrestre utilisé est 6 371,0088 km. La distance est celle d’un arc minimal **sur une sphère**, pas une route, un plan de vol ou une mesure ellipsoïdale de précision.

La projection orthographique permet de voir le globe. Un arc de grand cercle peut y apparaître droit lorsqu’il passe par le centre de la projection. Une portion située derrière le globe est tracée en pointillé. Pour des points antipodaux, plusieurs arcs minimaux existent ; un arc est choisi de façon déterministe.

## Carte détaillée optionnelle

Dans `config.js`, définir `mapboxToken` avec **votre jeton public navigateur** Mapbox (`pk.`). Le site fonctionne aussi si ce champ est vide. La carte détaillée utilise Mapbox GL JS 3.0.1, déjà employé par la version initiale ; elle charge le SDK et les tuiles à la demande. En cas d’indisponibilité, le globe schématique reste utilisable.

Un jeton public navigateur est visible par conception ; ne jamais placer un jeton privé `sk.`, des identifiants ou un secret dans ce fichier. Configurer les domaines autorisés et les droits minimaux dans le compte Mapbox, vérifier les conditions de service et l’usage du compte avant de publier une version configurée.

La valeur initiale a été retirée des nouveaux fichiers ; elle reste dans le commit initial. Cette préparation ne révoque aucun jeton et ne certifie pas ses restrictions. Ne pas ouvrir l’historique sans sa propre revue.

Documentation : https://docs.mapbox.com/mapbox-gl-js/guides/

## Recherche de villes optionnelle

Le champ `geocodingEndpoint` est vide par défaut. Il accepte l’URL HTTPS d’un service de recherche compatible Nominatim, idéalement un service maîtrisé ou un proxy. L’API reçoit `q`, `format=json`, `limit=5`, `addressdetails=1` et renvoie un tableau avec `lon`, `lat`, `display_name`, `address.country`. Le service doit autoriser les requêtes navigateur (CORS).

La recherche distante se déclenche uniquement par un clic explicite, jamais à chaque frappe. Cache en mémoire, annulation des requêtes périmées, délai maximal de huit secondes et espacement local d’au moins 1,1 seconde.

**Le service public Nominatim n’est pas configuré par défaut.** Sa politique interdit l’autocomplétion, impose une identification et attribution adaptées, limite l’usage total de l’application à une requête par seconde et exige de pouvoir changer de service. La limitation locale ne garantit pas le plafond global lorsque plusieurs visiteurs utilisent le site. Avant de choisir ce service, lire https://operations.osmfoundation.org/policies/nominatim/ ; prévoir un proxy/cache global et afficher l’attribution OpenStreetMap/ODbL requise. Pour une audience plus large, utiliser un fournisseur adapté ou sa propre instance.

## Données et confidentialité

Aucun compte, analytics, historique de trajet ou stockage persistant dans cette application. Les calculs sont locaux. Sans configuration externe, elle ne contacte ni Mapbox ni un géocodeur.

Avec Mapbox, le navigateur transmet les données techniques nécessaires au chargement des cartes au fournisseur. Avec un géocodeur, la recherche saisie est transmise à l’endpoint configuré ; ne pas y saisir de données confidentielles. L’hébergeur et les fournisseurs conservent éventuellement leurs propres journaux.

## Structure et contribution

- `geometry.js` : calcul sphérique autonome, chemins et longitudes continues.
- `app.js` : formulaire, globe SVG, sélection et recherche, carte optionnelle.
- `index.html`, `styles.css`, `favicon.svg` : interface responsive.
- `config.js` : configuration publique optionnelle.
- `tests/` : tests Node exécutables sans dépendance.

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Code sous [licence MIT](LICENSE). Les services et leurs données gardent leurs propres conditions/licences.

Cette préparation et les PRs ne constituent ni un déploiement ni une modification de la visibilité du dépôt.
