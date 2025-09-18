import Link from "next/link";

export default function IndexPage() {
  return (
    <main>
      <section>
        <h1>Genius In Pocket Control Center</h1>
        <p>
          This Next.js application powers authenticated experiences, billing flows, and AI
          orchestration for Genius In Pocket. Use the navigation below to reach the primary
          modules or continue building dedicated routes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/dashboard">Go to dashboard</Link>
          <Link href="/billing">Manage billing</Link>
          <Link href="/api-docs">Read API docs</Link>
        </div>
      </section>
      <section>
        <h2>What is wired up?</h2>
        <ul>
          <li>Prisma client factory is shared via <code>@/lib/db</code>.</li>
          <li>Auth.js (NextAuth) placeholder is ready for configuration.</li>
          <li>Stripe server actions live under <code>/src/app/api/billing</code>.</li>
          <li>Sentry and PostHog SDK hooks are ready for instrumentation.</li>
          <li>Vercel AI SDK wrapper configured for Cloudflare Workers AI inference.</li>
        </ul>
      </section>
    </main>
  );
}
