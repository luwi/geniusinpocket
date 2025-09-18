import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  experimental: {
    typedRoutes: true,
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  output: "standalone"
};

export default withSentryConfig(nextConfig, {
  silent: true
});
