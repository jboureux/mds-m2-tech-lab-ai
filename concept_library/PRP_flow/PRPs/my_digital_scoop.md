# My Digital Scoop (MDS) PRP

## Goal

Build an internal social network for students and staff to exchange ideas, adhering to specific network-based authentication and moderation rules.

## Why

To foster community and communication within the school ecosystem while respecting different access levels based on physical presence (On-Campus vs. Off-Campus) and user status.

## What

A mobile-responsive web application where users can view a feed, post content, and interact.

### Key Features

1.  **Network-Aware Authentication & Permissions:**
    - **On-Campus (School Wi-Fi):** Users are identified (initially via login, then persistent session). "Standard Members" can post.
    - **Off-Campus:** Users login via Magic Link (email). "Standard Members" are Read-Only. "VIP Members" can post.
    - **Dynamic IP Management:** Moderators can add/remove allowed IP addresses (Single IP or CIDR Range) via the dashboard without code changes.
2.  **User Roles:**
    - **Standard Member:** Can post _only_ when on School Wi-Fi (verified against allowed IPs).
    - **VIP Member:** Can post from anywhere.
    - **Moderator:** Can manage content, users, banned keywords, and valid IP ranges.
3.  **Content & Interaction:**
    - **Posts:** Text-only posts (Image support removed for V1).
    - **Replies:** Threaded comments on posts.
4.  **Moderation:**
    - **Automated (Local AI):** Hybrid system using a fast keyword blocklist + local AI (TensorFlow.js) to flag toxic content.

### Scope Boundaries

- **In Scope:** Feed, Posting (Text-only), Comments (Replies), User Profiles, Admin Dashboard, PWA-ready responsive design.
- **Out of Scope:** Direct Messaging (DM), Video hosting, Image hosting, Native Mobile Apps (iOS/Android), SSO/LDAP integration.

## Design Inspiration

We will utilize **shadcn/ui** as the core component library to ensure accessibility and rapid development.

### "Modern Campus" (Default)

- **Vibe:** Clean, trustworthy, accessible. "LinkedIn meets Notion".
- **Base UI:** **shadcn/ui** (Radix UI + Tailwind CSS).
- **Typography:** **Inter** (Headers & Body). Clean, legible, standardized.
- **Palette:**
  - **Primary:** Deep School Blue (`#0F172A` / Slate-900)
  - **Accent:** Brand Blue (`#3B82F6` / Blue-500)
  - **Background:** Off-white / Light Gray (`#F8FAFC` / Slate-50)
- **Components:**
  - **Cards:** White cards with subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`).
  - **Navigation:** Sticky top bar (desktop) / Bottom tab bar (mobile).
  - **Feedback:** Toast notifications for actions (success/error).

## Technical Context

### Tech Stack Recommendation

- **Frontend & Backend:** Next.js 16+ (App Router).
- **Language:** TypeScript.
- **UI Components:** **shadcn/ui** (Tailwind CSS + Radix UI).
- **State Management / Data Fetching:** **TanStack Query** (React Query) v5 + **Zustand**.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Authentication:** Auth.js (NextAuth) v5 with "Magic Link" (Email) provider.
- **AI/ML:** `@tensorflow-models/toxicity` (Local Node.js execution) + `bad-words` (Keyword filtering).
- **Quality & CI:** **Biome.js** (Linting & Formatting) + **Vitest** (Testing).
- **Infrastructure:** Docker & Docker Compose (Dev & Prod).

### Files to Implement

- `docker-compose.yml` - Database and App services.
- `Dockerfile` - Multi-stage build for Next.js.
- `src/middleware.ts` - **Critical:** Logic to detect School IP range and stamp requests with `x-network-location: on-campus`. Logic must fetch/cache allowed IPs.
- `prisma/seed.ts` - Database seeding logic.
- `scripts/data-migration-runner.ts` - Custom runner for data-only migrations.

### Existing Patterns to Follow

- _Mono-repo like architcture_ Even if it's an only Next.js project, nest the app in a apps folder at the root of the project. So that everything is well separated at the root (apps/..., docker/..., docs/..., etc...)
- _Greenfield Project:_ Adhere to Next.js App Router best practices.
- _Data Fetching:_ Use TanStack Query for client-side data (e.g., infinite feed, polling) and React Server Components for initial load.

## Implementation Details

### Database & Data Migration Strategy

To handle both schema changes and complex data logic (e.g., score recalculations) without locking parallel deployments:

1.  **Schema Migrations (Prisma):** Use `prisma migrate dev` for schema changes. These run automatically at startup via `prisma migrate deploy` in the entrypoint.
2.  **Data Migrations (Custom Pattern):**
    - Create a directory `prisma/data-migrations/`.
    - Each file is a TypeScript script (e.g., `20240320-recalculate-scores.ts`).
    - A custom `Migration` table tracks which data scripts have run.
    - **Execution:** A custom command `npm run migrate:data` runs pending TS scripts. This allows complex logic (like reading all users, calculating a score, and updating them) to be version-controlled and executed safely, independent of SQL schema locks.

### Quality Assurance & CI

- **Biome.js:** Enforce formatting and linting. Fails CI if `biome check` fails.
- **Testing (Vitest):**
  - Unit tests for utility logic (e.g., IP checking, moderation thresholds).
  - Integration tests for API routes.
  - **Requirement:** Maintain high coverage on "Business Logic" (Permissions, Moderation).
- **Documentation:** JSDoc for complex functions.

### Authentication & Network Logic

Since identifying a user solely via Wi-Fi without SSO is technically impossible for a web app (browser sandbox), we will use a **"Trust on First Use"** approach combined with **Dynamic IP Verification**:

1.  **First Visit:** User must log in via Magic Link (Email).
2.  **Session:** Long-lived session cookie (30 days).
3.  **Privilege Check (On Every Request/Mutation):**
    - Middleware/API Route fetches valid IP list (cached in memory/Redis to reduce DB hits).
    - Checks Client IP against the allowed list (Single IPs or CIDR ranges).
    - **Logic:**
      - `VIP`: Can post always.
      - `Standard`: Can post IF IP is in allowed range.

### Moderation Pipeline

1.  **Pre-Submit (Client/Server Sync):** Check against `bad-words` list. Block immediately.
2.  **Post-Submit (Server Async):**
    - Save post as `PUBLISHED`.
    - Run `@tensorflow-models/toxicity`.
    - If toxicity > threshold -> Update status to `FLAGGED` / `HIDDEN`.

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(MEMBER) // MEMBER, VIP, MODERATOR
  posts     Post[]
  comments  Comment[]
}

model Post {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  status    PostStatus @default(PUBLISHED) // PUBLISHED, FLAGGED, REMOVED
  isToxic   Boolean    @default(false)Alors, juste concernant l'inscription des utilisateurs, le modérateur s'occupera de fournir un document de type CSV ou autre, afin de pouvoir permettre l'inscription des différents utilisateurs définis dans le document. Un utilisateur ne peut pas s'inscrire tout seul, mais il pourra s'enregistrer tout seul en partant de cette confirmation, établi le workflow en conséquence.
  createdAt DateTime   @default(now())
  comments  Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  createdAt DateTime   @default(now())
  // Relation fields...
}

model BannedWord {
  id   String @id @default(cuid())
  word String @unique
}

model AllowedIP {
  id          String   @id @default(cuid())
  ipAddress   String   @unique // Can be single IP "192.168.1.1" or CIDR "192.168.1.0/24"
  description String?
  createdAt   DateTime @default(now())
}
```

## Validation Criteria

### Functional Requirements

- [ ] User can login via Magic Link.
- [ ] Standard User _cannot_ create a post when simulating an external IP.
- [ ] Standard User _can_ create a post when simulating a School IP.
- [ ] Moderator can add/remove an IP CIDR range (e.g., `10.0.0.0/8`) via UI.
- [ ] Changes to allowed IPs take effect immediately (or after short cache TTL).
- [ ] Post containing banned words is rejected immediately.

### Technical Requirements

- [ ] `docker-compose up` starts the full stack (App + DB) and runs schema migrations automatically.
- [ ] **Biome.js** check passes on all committed code.
- [ ] **Vitest** suite passes with coverage report generated.
- [ ] Data migration system is in place (table exists, runner script works).
- [ ] TanStack Query handles feed state and mutations.
- [ ] UI built with shadcn/ui components.
- [ ] TypeScript strict mode enabled.

### Testing Steps

1.  Start stack: `docker-compose up`.
2.  Login as Admin. Go to Dashboard. Add `127.0.0.1/32` to Allowed IPs.
3.  Login as Standard User. Try to post. _Expected: Success_.
4.  Admin: Remove `127.0.0.1/32`.
5.  Standard User: Try to post. _Expected: Forbidden_.
