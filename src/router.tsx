import "./i18n";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DEFAULT_LANGUAGE } from "./lib/language";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, language: DEFAULT_LANGUAGE },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
