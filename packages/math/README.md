# @vincentvfr/globepath-math

Calculs pédagogiques de GlobePath, sans DOM, réseau ni dépendances : distances de grand cercle et modèle planétaire circulaire coplanaire.

## Installer

Depuis l’archive de la release :

```sh
npm install ./vincentvfr-globepath-math-0.1.0-alpha.1.tgz
```

Depuis GitHub Packages, après authentification autorisée et configuration du scope `@vincentvfr` vers `https://npm.pkg.github.com` :

```sh
npm install @vincentvfr/globepath-math@0.1.0-alpha.1
```

Le dist-tag `alpha` suit les préversions ; le paquet est actuellement public sur GitHub Packages. Ce registre demande une authentification GitHub pour l’installation, y compris pour un paquet public.

```js
const { geometry, solar } = require('@vincentvfr/globepath-math');
const parisTokyoKm = geometry.distance([2.35, 48.86], [139.69, 35.68]);
const earthMars = solar.compare('earth', 'mars', 90);
console.log(parisTokyoKm, earthMars.au, earthMars.lightSeconds);
```

`geometry` expose `R`, `validate`, `distance`, `greatCircle`, `unwrap`, `bounds` et `midpoint`. Les points sont `[longitude, latitude]` en degrés ; les distances sont en kilomètres. `solar` expose `planets`, `compare`, `AU_KM` et `C_KM_S` ; les angles acceptés vont de 0° à 180°.

Les fonctions sont celles de l’application. La Terre est une sphère de rayon 6 371,0088 km. Les orbites planétaires sont circulaires, coplanaires et de rayon constant, adapté des demi-grands axes [JPL à J2000](https://ssd.jpl.nasa.gov/planets/approx_pos.html). Ce modèle ne calcule ni itinéraires, ni positions actuelles, ni éphémérides.

1 UA = 149 597 870,7 km ([IAU 2012 B2](https://www.iau.org/static/resolutions/IAU2012_English.pdf)) ; c = 299 792,458 km/s ([BIPM](https://www.bipm.org/en/si-base-units/metre)). Le temps lumière décrit un trajet simple dans le vide. Préversion : l’API peut évoluer. Licence MIT, incluse dans le paquet.
