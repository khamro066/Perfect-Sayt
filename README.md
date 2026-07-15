# Perfect Shoes — Oyoq kiyim onlayn do'koni

Production build of the Perfect Shoes e-commerce site (customer storefront + admin panel).
Design/spec handoff lives in [`design-reference/`](./design-reference) — read-only reference,
not copied directly into the app.

## Stack

- Next.js 14 (App Router) + TypeScript — frontend and API routes
- PostgreSQL (Neon) + Prisma — database and ORM
- Tailwind CSS — styling, mapped to the design tokens in the spec
- NextAuth.js — admin auth (Step 4)
- Cloudflare R2 — product image storage (Step 4)

## Getting started

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` with a real Postgres
   connection string (e.g. from a free [Neon](https://neon.tech) project).
2. Install dependencies:
   ```
   npm install
   ```
3. Apply the database schema:
   ```
   npm run db:migrate
   ```
4. Seed sample data (a few products, categories, one delivered test order):
   ```
   npm run db:seed
   ```
5. Start the dev server:
   ```
   npm run dev
   ```

Useful scripts:

- `npm run db:studio` — open Prisma Studio to browse the database
- `npm run db:reset` — drop and re-apply all migrations, then re-seed
