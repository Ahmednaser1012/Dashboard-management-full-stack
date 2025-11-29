"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { CACHE_CONFIG } from "@/hooks/queryKeys";
import { Toaster } from "@/components/ui/sonner";
import { hydrate } from "@/store/slices/authSlice";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.STALE_TIME,
      gcTime: CACHE_CONFIG.GC_TIME,
      retry: CACHE_CONFIG.RETRY_ATTEMPTS,
      retryDelay: CACHE_CONFIG.RETRY_DELAY,
    },
  },
});

function AuthHydrator({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("authToken");
      
      if (savedUser && savedToken) {
        try {
          store.dispatch(hydrate({
            user: JSON.parse(savedUser),
            token: savedToken,
            isAuthenticated: true,
          }));
        } catch (error) {
          console.error("Failed to hydrate auth state:", error);
        }
      }
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </AuthHydrator>
    </Provider>
  );
}
