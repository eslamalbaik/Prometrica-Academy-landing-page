// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },

  vite: {
    // ─── Pre-bundle every heavy dependency explicitly ──────────────────────
    // Without this list Vite discovers deps lazily on the first request,
    // causing a long freeze while it transforms everything on-demand.
    // Listing them here forces pre-bundling at server startup so the first
    // page load is instant.
    optimizeDeps: {
      include: [
        // React core
        "react",
        "react-dom",
        "react-dom/client",

        // TanStack ecosystem
        "@tanstack/react-router",
        "@tanstack/react-query",

        // HTTP & utilities
        "axios",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "date-fns",
        "zod",

        // Heavy UI / animation
        "framer-motion",
        "lucide-react",
        "recharts",
        "sonner",
        "embla-carousel-react",

        // i18n
        "i18next",
        "react-i18next",

        // Forms
        "react-hook-form",
        "@hookform/resolvers/zod",

        // Radix UI – all components used in the project
        "@radix-ui/react-accordion",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-avatar",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-hover-card",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toggle",
        "@radix-ui/react-tooltip",
      ],
    },

    // ─── Pre-transform critical route files at server startup ──────────────
    // Vite will transform these files before the first browser request arrives,
    // eliminating the per-request compile stall that causes the UI freeze.
    server: {
      warmup: {
        clientFiles: [
          "./src/routes/__root.tsx",
          "./src/routes/index.tsx",
          "./src/routes/login.tsx",
          "./src/routes/register.tsx",
          "./src/routes/student/dashboard.tsx",
          "./src/routes/courses/$id.tsx",
          "./src/contexts/AuthContext.tsx",
          "./src/i18n.ts",
          "./src/lib/api.ts",
        ],
      },
    },

    // ─── esbuild: target modern browsers only ─────────────────────────────
    // Avoids unnecessary syntax down-transpilation (e.g. async/await → Promise
    // chains) which adds transform work for every file in dev mode.
    esbuild: {
      target: "esnext",
    },

    // ─── Preview server (production hosting via vite preview) ─────────────
    preview: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: [
        "prometricaacademy.org",
        "www.prometricaacademy.org",
      ],
    },
  },
});
