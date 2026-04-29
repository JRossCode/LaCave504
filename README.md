# La Cave 504

Site associatif de La Cave 504, construit avec [React](https://react.dev/) et [Vite](https://vitejs.dev/).

## Scripts

Dans le dossier du projet, vous pouvez exécuter :

### `npm run dev`

Lance l'application en mode développement.\
Ouvrez [http://localhost:3000](http://localhost:3000) pour la consulter dans votre navigateur.

La page se recharge automatiquement à chaque modification (HMR).

### `npm run build`

Construit l'application pour la production dans le dossier `dist/`.\
Les fichiers sont minifiés et leurs noms incluent un hash pour le cache busting.

### `npm run preview`

Sert localement le contenu de `build/` pour valider le bundle de production.

## Variables d'environnement

Vite n'expose au client que les variables préfixées par `VITE_`. Voir `.env`.\
Lecture côté code via `import.meta.env.VITE_NOM_DE_LA_VARIABLE`.

## Ressources

- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)
