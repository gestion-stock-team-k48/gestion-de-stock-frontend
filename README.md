# Gestion de Stock Frontend

Application frontend React + TypeScript + Vite pour un système de gestion de stock.

Le projet est organisé avec une architecture **Feature-First Architecture** : le code est rangé par fonctionnalité métier plutôt que par type technique uniquement. Cette approche facilite la maintenance quand l'application grandit, car chaque domaine métier garde ses vues, composants, hooks, types et appels API au même endroit.

## Technologies utilisées

- **React** : bibliothèque utilisée pour construire l'interface utilisateur avec des composants réutilisables.
- **TypeScript** : surcouche de JavaScript qui ajoute le typage statique pour réduire les erreurs et rendre le code plus maintenable.
- **Vite** : outil de développement et de build rapide pour les projets frontend modernes.
- **React Router DOM** : gestion de la navigation entre les pages et protection des routes privées.
- **Axios** : client HTTP utilisé pour communiquer avec l'API backend.
- **i18next + react-i18next** : système de traduction pour gérer plusieurs langues, ici le français et l'anglais.
- **TanStack React Query** : gestion des requêtes serveur, du cache, du rafraîchissement et des états de chargement.
- **ESLint** : outil de vérification du code pour garder un style propre et détecter les erreurs courantes.

## Architecture du dossier `src`

```text
src/
├── app/                     # Providers, router, QueryClient, configuration globale
├── assets/                  # Images, icônes, styles globaux
├── components/ui/           # Composants UI génériques réutilisables
├── config/                  # Constantes globales et endpoints API
├── core/                    # Services techniques partagés
│   └── api/
│       └── axiosInstance.ts # Client Axios configuré
├── features/                # Modules métiers isolés
│   ├── auth/
│   ├── articles/
│   ├── categories/
│   ├── clients/
│   ├── fournisseurs/
│   ├── commandes-clients/
│   ├── commandes-fournisseurs/
│   ├── ventes/
│   ├── stock-mouvements/
│   └── entreprise/
├── hooks/                   # Hooks React transversaux
├── i18n/                    # Configuration des traductions
├── routes/                  # Routes et guards RBAC
└── types/                   # Types TypeScript globaux
```

Chaque dossier dans `features/` suit la même structure :

```text
feature/
├── api/         # Fonctions d'appel API liées à la feature
├── components/  # Composants spécifiques à la feature
├── hooks/       # Hooks spécifiques à la feature
├── types/       # Types et DTOs de la feature
└── views/       # Pages ou écrans de la feature
```

## Concepts importants

### Feature-First Architecture

Au lieu de mettre tous les composants dans un seul dossier, toutes les pages dans un autre et toutes les API ailleurs, chaque fonctionnalité métier possède son propre espace.

Exemple : tout ce qui concerne les articles sera placé dans `src/features/articles/`. Cela rend le projet plus lisible, surtout quand plusieurs développeurs travaillent sur des modules différents.

### Client Axios centralisé

Le fichier `src/core/api/axiosInstance.ts` crée une instance Axios partagée par toute l'application.

Elle configure :

- l'URL de base de l'API avec `VITE_API_BASE_URL` ;
- le header `Content-Type: application/json` ;
- le header `Authorization: Bearer <token>` si un token JWT existe dans `localStorage` ;
- le header `Accept-Language` selon la langue active de i18next.

Cela évite de répéter la même configuration dans chaque appel API.

### Authentification JWT

Le projet prévoit une authentification par token JWT.

Par convention actuelle :

- le token est stocké dans `localStorage` avec la clé `accessToken` ;
- l'utilisateur connecté est stocké dans `localStorage` avec la clé `authUser` ;
- `authUser` doit contenir au minimum `id`, `email` et `roles`.

Exemple de structure :

```json
{
  "id": "1",
  "email": "admin@example.com",
  "roles": ["ADMIN"]
}
```

### Protection des routes et RBAC

Le fichier `src/routes/ProtectedRoute.tsx` protège les pages privées.

Il vérifie :

- si l'utilisateur possède un token ;
- si les informations utilisateur existent ;
- si l'utilisateur possède au moins un rôle autorisé.

Les rôles prévus sont :

- `ADMIN`
- `MANAGER`
- `USER`

Exemple d'utilisation :

```tsx
<Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
  <Route path="/articles" element={<ArticlesPage />} />
</Route>
```

### Internationalisation

Le fichier `src/i18n/i18n.ts` initialise i18next avec :

- le français comme langue par défaut ;
- le français comme langue de fallback ;
- un fichier commun français : `src/i18n/locales/fr/common.json` ;
- un fichier commun anglais : `src/i18n/locales/en/common.json`.

Les traductions sont organisées par sections : `navigation`, `buttons`, `errors`.

## Prérequis

Installer Node.js et npm sur la machine.

Pour vérifier :

```bash
node --version
npm --version
```

## Installation du projet

Installer toutes les dépendances :

```bash
npm install
```

Si les dépendances métier ne sont pas encore présentes, les installer avec :

```bash
npm install axios i18next react-i18next react-router-dom @tanstack/react-query
```

## Variables d'environnement

Créer un fichier `.env` à la racine du projet si nécessaire :

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Si cette variable n'existe pas, le projet utilise par défaut :

```text
http://localhost:8080/api
```

## Lancer le projet en développement

```bash
npm run dev
```

Vite affichera ensuite une URL locale, généralement :

```text
http://localhost:5173/
```

## Compiler le projet

```bash
npm run build
```

Cette commande vérifie TypeScript puis génère une version optimisée dans le dossier `dist/`.

## Prévisualiser la version compilée

Après un build :

```bash
npm run preview
```

## Vérifier le code avec ESLint

```bash
npm run lint
```

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Compile TypeScript et génère le build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Analyse le code avec ESLint |

## Résumé pour présenter le projet

Ce frontend est une application React + TypeScript construite avec Vite. Il utilise une architecture Feature-First pour séparer clairement les modules métiers comme les articles, clients, fournisseurs, ventes et mouvements de stock. Les appels backend passent par une instance Axios centralisée qui ajoute automatiquement le token JWT et la langue active. La navigation est prévue avec React Router DOM, avec un guard `ProtectedRoute` pour protéger les pages selon les rôles `ADMIN`, `MANAGER` et `USER`. Les traductions sont gérées avec i18next, avec le français comme langue principale.
