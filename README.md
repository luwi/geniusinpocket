# Genius In Pocket Monorepo

This repository is organised as a Turborepo powered monorepo managed by `pnpm`. It contains two primary applications and shared packages:

- `apps/web` ? Astro static marketing site for www.geniusinpocket.com
- `apps/app` ? Next.js 15 application for authenticated product surface, APIs, and AI orchestration
- `packages/db` ? Shared Prisma client + schema for Supabase/Neon Postgres with pgvector

## Prerequisites

- Node.js 20+
- pnpm 9+

## Getting Started

```bash
pnpm install
pnpm dev
```

The Turbo pipeline will start both the Astro and Next.js apps in parallel.

## Useful Scripts

- `pnpm build` ? Builds every workspace package/app
- `pnpm lint` ? Runs linting across the monorepo
- `pnpm test` ? Placeholder for future test suites

## Environment Variables

Copy `.env.example` to `.env` in the repository root and populate:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
EMAIL_SERVER=smtp://...
EMAIL_FROM=...
STRIPE_KEY=...
STRIPE_WEBHOOK_SECRET=...
POSTHOG_KEY=...
POSTHOG_HOST=https://app.posthog.com
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
AI_WORKER_URL=https://...
```

Additional application-specific variables can be set per app in their own `.env` files.

## Deployment Notes

- Astro build artefacts (`apps/web/dist`) can be uploaded to cPanel static hosting.
- The Next.js app is configured for Passenger (Node.js) deployments with `next start` and a standalone output bundle.
- Prisma migrations should be executed through CI (`pnpm --filter @genius/db run generate` then `prisma migrate deploy`).
- Stripe, Sentry, PostHog, and Vercel AI SDK integrations are stubbed and ready to be wired into runtime logic.

## CI/CD

Set up GitHub Actions to:

1. Install dependencies with `pnpm install`.
2. Run `pnpm lint && pnpm build`.
3. Deploy Astro via cPanel FTP/API.
4. Upload the Next.js standalone bundle to the Passenger app directory and trigger a restart.

---

Welcome to the new Genius In Pocket platform stack!
