# PRP - Documentation System (Nextra)

## 🎯 Objectif
Mettre en place un système de documentation robuste, lisible par des non-techniciens ("moldus"), et parfaitement intégré au workflow **Agentic Coding**. Ce système servira à documenter la stratégie de création de l'application MDS de A à Z.

## 🏗️ Architecture Technique
- **Framework** : Nextra v4 (basé sur Next.js 15+ App Router).
- **Emplacement** : Nouveau package dans le workspace pnpm : `apps/docs`.
- **Source de contenu** : Dossier `apps/docs/content/` (isolation du Markdown par rapport à la structure de l'application).
- **Thème** : `nextra-theme-docs`.
- **Docker** : Intégration dans le `docker-compose.yml` via un service `docs` dédié (port 3001).

## 📋 Spécifications Fonctionnelles
1.  **Support Markdown/MDX** : Capacité à écrire des guides riches avec des composants React.
2.  **Navigation Intuitive** : Table des matières générée automatiquement à partir de la structure du dossier `content/`.
3.  **Documentation de l'Agentic Coding** :
    *   Explication des cycles Plan-Act-Validate.
    *   Gestion de la `concept_library` et des PRPs.
    *   Usage des Skills Gemini CLI.
4.  **Isolation du Contenu** : Utilisation de la configuration `contentDirBasePath` pour séparer les fichiers `.mdx` de la logique Next.js.
5.  **Recherche full-text** : Moteur de recherche intégré pour naviguer facilement dans la stratégie.

## 🛠️ Plan d'Implémentation
1.  Initialiser le package `apps/docs` avec `pnpm init`.
2.  Installer les dépendances : `next`, `react`, `react-dom`, `nextra`, `nextra-theme-docs`.
3.  Configurer `next.config.mjs` avec `contentDirBasePath: 'content'`.
4.  Créer la structure `app/[[...mdxPath]]/page.tsx` pour le rendu dynamique.
5.  Mettre en place le `RootLayout` avec le thème de doc.
6.  Ajouter le service `docs` dans `docker-compose.yml`.
7.  Rédiger la page d'introduction à l'Agentic Coding.

## ✅ Critères d'Acceptation
- [ ] La doc est accessible sur `http://localhost:3001`.
- [ ] Les fichiers Markdown sont stockés exclusivement dans `apps/docs/content/`.
- [ ] La documentation est lisible, responsive et possède un mode sombre.
- [ ] Le build du monorepo inclut le nouveau package sans erreur.
