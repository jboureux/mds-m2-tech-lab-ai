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

## ✅ Verification Checklist

- [ ] User login via Magic Link works correctly.
- [ ] IP spoofing tests verify `x-network-location` injection.
- [ ] Forbidden posts are blocked at the Middleware/API level.
- [ ] Admin dashboard allows real-time CIDR range updates.
- [ ] Docker environment starts cleanly with `task up`.
