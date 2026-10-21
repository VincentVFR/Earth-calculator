# GlobePath

**Explorer les distances sur Terre et dans le système solaire.** GlobePath est un outil pédagogique interactif pour relier géographie, géométrie et astronomie : comparer deux lieux sur un globe, puis changer d’échelle avec les huit planètes.

La [version pédagogique complète](https://github.com/VincentVFR/Earth-calculator/tree/codex/earth-solar-classroom) réunit les explorations terrestres et planétaires. La branche `main` conserve la version terrestre initiale.

## Explorer et apprendre

- **Sur Terre** : choisir deux villes ou saisir leurs coordonnées, calculer une distance de grand cercle et observer le trajet sur le globe.
- **Entre les planètes** : comparer deux des huit planètes, faire varier leur angle relatif autour du Soleil et lire la distance en kilomètres, en unités astronomiques et en temps lumière.
- **En classe** : comparer plusieurs trajets, comprendre les coordonnées géographiques ou expliquer pourquoi la distance Terre–Mars varie.

La version complète fonctionne sans compte, sans installation de dépendances et sans service externe obligatoire. Un globe schématique, des villes et les données du modèle sont intégrés ; carte détaillée et recherche distante sont optionnelles.

## Démarrer la version complète

Prérequis : Python 3 pour servir les fichiers ; Node.js 20 ou plus pour les tests.

```sh
git clone --branch codex/earth-solar-classroom https://github.com/VincentVFR/Earth-calculator.git
cd Earth-calculator
python -m http.server 8080 --bind 127.0.0.1
```

Ouvrir [localhost:8080](http://127.0.0.1:8080). Aucun `npm install` ni compilation n’est nécessaire. Pour vérifier les calculs :

```sh
npm test
```

Le [guide complet](https://github.com/VincentVFR/Earth-calculator/blob/codex/earth-solar-classroom/README.md) décrit la saisie des coordonnées, les services optionnels et les exemples d’utilisation.

## Un modèle pour comprendre les distances

Sur Terre, le calcul suit l’arc minimal sur une sphère de rayon moyen 6 371,0088 km. Il ne représente pas un itinéraire routier ou une mesure sur un ellipsoïde.

Dans le système solaire, les orbites sont circulaires et coplanaires, avec des rayons constants adaptés des demi-grands axes JPL. L’angle est choisi par l’utilisateur : le modèle ne donne pas les positions actuelles des planètes. Le temps lumière correspond à un trajet simple dans le vide.

Pour une activité, comparer Terre–Mars à 0°, 90° et 180°, puis discuter des limites du modèle et des différences avec les orbites réelles.

Références : [JPL — éléments orbitaux](https://ssd.jpl.nasa.gov/planets/approx_pos.html), [NASA — orbites et lois de Kepler](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/), [IAU — unité astronomique](https://www.iau.org/static/resolutions/IAU2012_English.pdf), [BIPM — vitesse de la lumière](https://www.bipm.org/en/si-base-units/metre).

## Contribuer

Le projet utilise HTML, CSS et JavaScript natifs. Le [guide de contribution](https://github.com/VincentVFR/Earth-calculator/blob/codex/earth-solar-classroom/CONTRIBUTING.md) présente les vérifications attendues et la manière de proposer une amélioration.

La version pédagogique complète inclut une [licence MIT](https://github.com/VincentVFR/Earth-calculator/blob/codex/earth-solar-classroom/LICENSE). Les services externes et leurs données conservent leurs propres conditions et licences.
