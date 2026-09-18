import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};

export function createQueryClient(
  config: QueryClientConfig = defaultQueryClientConfig,
): QueryClient {
  return new QueryClient(config);
}