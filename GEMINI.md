# GEMINI.md - My Digital Scoop (MDS) Implementation Guide

This document defines the foundational mandates, architectural patterns, and development conventions for the **My Digital Scoop (MDS)** project. It is based on the [My Digital Scoop PRP](PRP_flow/PRPs/my_digital_scoop.md) and subsequent design interviews.

## 🚀 Project Overview

MDS is an internal school social network designed for students and staff. It features **Network-Aware Authentication**, where posting permissions are dynamically adjusted based on the user's physical presence (On-Campus via School Wi-Fi vs. Off-Campus).

## 🏗 Architecture & Stack

### Core Stack

- **Framework**: Next.js 16+ (App Router)
- **Runtime**: Node.js (Dockerized)
- **Database**: PostgreSQL with **Prisma ORM**
- **Auth**: **Better-Auth** with Magic Link (Resend provider)
- **UI**: **shadcn/ui** (Tailwind CSS + Radix UI)
- **State Management**: **TanStack Query v5** (Server & Client) + **Zustand**
- **Moderation**: Local AI (**TensorFlow.js**) + `bad-words` blocklist
- **Quality**: **Biome.js** (Linting/Formatting) + **Vitest** (Testing)

### Workspace Structure

The project uses a **pnpm workspace** architecture:

- `apps/web`: The primary Next.js application.
- `docker/`: Docker configuration files.
- `apps/web/prisma/`: Database schema and migrations.
- `apps/web/prisma/data-migrations/`: Custom TS scripts for data-only migrations.

## 🛠 Development Commands (Taskfile)

Developer operations are orchestrated via a `Taskfile.yml`:

- `task up`: Start the Docker development environment (App + DB).
- `task down`: Stop all containers.
- `task sh`: Open a shell inside the app container.
- `task logs`: Follow container logs.
- `task migrate:data`: Execute pending data migrations.

## 🔐 Core Logic Mandates

### 1. Network-Aware Middleware

- **Critical**: `src/middleware.ts` must detect client IPs and verify them against allowed CIDR ranges stored in the database.
- **Caching**: Implement an in-memory cache with a short TTL (5-10m) for CIDR ranges to minimize DB load.
- **Headers**: Inject `x-network-location: on-campus | off-campus` into request headers.

### 2. Permissions Matrix

- **Standard User**: Can post **only** when `on-campus`. Read-only when `off-campus`.
- **VIP/Moderator**: Can post from any network location.
- **Registration**: Admin-only via manual entry or CSV import. No self-service registration.

### 3. Moderation Pipeline

- **Pre-Submit**: Reject posts immediately if they contain words from the `bad-words` list.
- **Post-Submit (Async)**: Trigger `@tensorflow-models/toxicity`. If toxicity exceeds the hardcoded threshold (0.8), set status to `FLAGGED`.

## 📐 Coding Conventions

- **Naming**: Use camelCase for variables/functions, PascalCase for components/types.
- **Types**: Strict TypeScript mode is mandatory. Use JSDoc for complex logic.
- **Validation**:
  - Build: Must pass `pnpm build`.
  - Quality: Must pass `biome check .`.
  - Testing: **Vitest** coverage is required for business logic (Permissions, IP Utilities, Moderation).
- **Architecture**: Nest logic in clean abstractions; avoid spreading state across unrelated layers.

## 📚 Documentation via MCP Context7

Context7 est le MCP configuré pour rechercher de la documentation à jour directement depuis les sources officielles. Il doit être utilisé **systématiquement** avant d'implémenter ou de répondre à une question sur une librairie du projet.

### Outils disponibles

| Outil                | Usage                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| `resolve-library-id` | Résoudre le nom d'une librairie en identifiant Context7 (toujours appeler en premier). |
| `query-docs`         | Interroger la documentation d'une librairie à partir de son identifiant Context7.      |

### Workflow obligatoire

Avant toute implémentation impliquant une dépendance du projet, suivre ce workflow :

```
1. resolve-library-id  →  obtenir l'ID Context7 de la librairie
2. query-docs          →  récupérer la documentation pertinente
3. Implémenter         →  en se basant sur la doc récupérée, pas sur des connaissances potentiellement obsolètes
```

### Librairies prioritaires à documenter via Context7

| Librairie                     | Quand consulter                                       |
| ----------------------------- | ----------------------------------------------------- |
| `next` / `next.js`            | Middleware, App Router, RSC, Route Handlers, metadata |
| `better-auth`                 | Configuration auth, Magic Link, sessions, providers   |
| `prisma`                      | Schéma, migrations, queries, relations                |
| `@tanstack/react-query`       | Queries, mutations, cache, server state               |
| `zustand`                     | Stores, slices, actions, middleware                   |
| `@tensorflow-models/toxicity` | Chargement du modèle, inférence, seuils               |
| `shadcn/ui`                   | Composants, variants, personnalisation                |
| `resend`                      | Envoi d'emails, templates, Magic Link                 |
| `tailwindcss`                 | Utilitaires, configuration, thème                     |

> **Règle** : Ne jamais deviner l'API d'une librairie. Si un doute existe, appeler `resolve-library-id` puis `query-docs` avant de coder.

## 🤖 Agent Skills

The following skills are available and must be used proactively in the relevant contexts. Do not attempt to solve problems covered by a skill without first loading it.

| Skill                         | When to use                                                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture-patterns`       | Architecting or refactoring backend modules (middleware, moderation pipeline, permissions, repositories). Apply Clean Architecture / Hexagonal Architecture / DDD principles. |
| `conventional-commit`         | Writing or formatting commit messages. Always produce conventional commit messages.                                                                                           |
| `docker-expert`               | Any work touching `docker/`, `Dockerfile`, `docker-compose`, image optimization, container security, or networking. Use **proactively**.                                      |
| `find-skills`                 | When a task requires a capability not obviously covered by existing skills — discover and suggest installable skills.                                                         |
| `git-commit`                  | Executing git commits, staging files, or when the user writes `/commit`. Auto-detects type/scope from the diff.                                                               |
| `next-best-practices`         | Writing or reviewing any Next.js code: file conventions, RSC boundaries, data fetching, route handlers, metadata, error handling, image/font optimization.                    |
| `ui-ux-pro-max`               | Building or reviewing UI components, pages, and layouts with **shadcn/ui** / Tailwind. Covers design, accessibility, responsiveness, and component patterns.                  |
| `vercel-react-best-practices` | Performance review or optimization of React/Next.js code: bundle size, data fetching patterns, component architecture.                                                        |
| `zustand`                     | All work inside `src/store/**` or any Zustand store — creating slices, actions, and state management patterns.                                                                |

### Skill × Feature Matrix

| Feature / Area                                 | Skills to activate                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Network-Aware Middleware                       | `architecture-patterns`, `next-best-practices`                        |
| Permissions logic                              | `architecture-patterns`, `next-best-practices`                        |
| Moderation pipeline (TensorFlow.js, bad-words) | `architecture-patterns`                                               |
| UI components & Admin dashboard                | `ui-ux-pro-max`, `vercel-react-best-practices`, `next-best-practices` |
| Zustand stores                                 | `zustand`, `vercel-react-best-practices`                              |
| Docker / Containerization                      | `docker-expert`                                                       |
| Git workflow & commits                         | `git-commit`, `conventional-commit`                                   |
| Unknown capability needed                      | `find-skills`                                                         |

## ✅ Verification Checklist

- [ ] User login via Magic Link works correctly.
- [ ] IP spoofing tests verify `x-network-location` injection.
- [ ] Forbidden posts are blocked at the Middleware/API level.
- [ ] Admin dashboard allows real-time CIDR range updates.
- [ ] Docker environment starts cleanly with `task up`.
