# Contribuer à GlobePath

Les améliorations doivent servir l’apprentissage : justesse des distances, explications compréhensibles, accessibilité, fonctionnement sans compte ni fournisseur externe obligatoire.

1. Créer une branche courte par sujet ; expliquer le problème et le résultat attendu dans la PR.
2. Conserver le HTML/CSS/JavaScript natif et le calcul indépendant du DOM.
3. Exécuter `npm test` et `node --check app.js`.
4. Pour l’interface, vérifier au moins un écran large et un téléphone de 390 px, les erreurs de saisie, le clavier, les exemples et les coordonnées aux limites.
5. Pour la géométrie, conserver les cas nuls, antipodaux, polaires et de passage à l’antiméridien.
6. Ne pas ajouter de jeton existant, donnée client, capture contenant des identifiants ou journal technique au dépôt.

Les captures/rapports de validation restent hors des sources. Distinguer tests simulés et vérification réelle des services externes. Un changement de source cartographique ou géographique doit documenter attribution, licence et conditions d’usage.

Pour signaler un problème, préciser le navigateur, les étapes de reproduction et le résultat attendu. Pour une proposition pédagogique, décrire le public concerné et l’usage envisagé.
