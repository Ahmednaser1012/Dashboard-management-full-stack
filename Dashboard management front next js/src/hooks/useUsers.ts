import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services";
import { User } from "@/types";
import { CACHE_CONFIG, usersQueryKeys } from "./queryKeys";

export function useProjectManagers() {
  return useQuery<User[], Error>({
    queryKey: usersQueryKeys.list,
    queryFn: () => usersService.getProjectManagers(),
    staleTime: CACHE_CONFIG.STALE_TIME,
    gcTime: CACHE_CONFIG.GC_TIME,
    retry: CACHE_CONFIG.RETRY_ATTEMPTS,
    retryDelay: CACHE_CONFIG.RETRY_DELAY,
  });
}

export function useDevelopers() {
  return useQuery<User[], Error>({
    queryKey: ["developers"],
    queryFn: async () => {
      // This would need to be implemented in the backend
      // For now, we'll filter from project managers
      const managers = await usersService.getProjectManagers();
      return managers.filter(u => u.role === 'developer');
    },
    staleTime: CACHE_CONFIG.STALE_TIME,
    gcTime: CACHE_CONFIG.GC_TIME,
    retry: CACHE_CONFIG.RETRY_ATTEMPTS,
    retryDelay: CACHE_CONFIG.RETRY_DELAY,
  });
}
