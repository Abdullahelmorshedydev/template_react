import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/lib/react-query";

// eslint-disable-next-line react/prop-types
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
