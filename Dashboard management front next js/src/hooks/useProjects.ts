"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setPagination, setFilters } from "@/store/slices/projectsSlice";
import { projectsService } from "@/services";
import { Project, ProjectFilters, PaginationParams } from "@/types";
import { toast } from "@/hooks/use-toast";
import { CACHE_CONFIG, projectsQueryKeys } from "./queryKeys";

export function useProjects() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';

  const query = useQuery({
    queryKey: isAdmin 
      ? projectsQueryKeys.listWithFilters(filters, pagination)
      : projectsQueryKeys.myProjects,
    queryFn: async () => {
      if (isAdmin) {
        return await projectsService.getAllWithFilters(filters, pagination);
      } else {
        const response = await projectsService.getMyProjects(pagination);
        if (!response.items) return response;
        
        let filtered = response.items;
        if (filters.search) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(filters.search?.toLowerCase() || '')
          );
        }
        if (filters.status) {
          filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.priority) {
          filtered = filtered.filter(p => p.priority === filters.priority);
        }
        
        return {
          ...response,
          items: filtered,
          total: filtered.length,
        };
      }
    },
    staleTime: CACHE_CONFIG.STALE_TIME,
    gcTime: CACHE_CONFIG.GC_TIME,
    retry: CACHE_CONFIG.RETRY_ATTEMPTS,
    retryDelay: CACHE_CONFIG.RETRY_DELAY,
  });

  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    dispatch(setFilters(newFilters));
  };

  const updatePagination = (newPagination: Partial<PaginationParams>) => {
    dispatch(setPagination(newPagination));
  };

  const handleSort = (column: string) => {
    const newOrder =
      pagination.sortBy === column && pagination.sortOrder === "asc" ? "desc" : "asc";
    updatePagination({ sortBy: column, sortOrder: newOrder });
  };

  return {
    projects: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    error: query.error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    handleSort,
    refetch: query.refetch,
  };
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsQueryKeys.detail(id),
    queryFn: async () => {
      const response = await projectsService.getById(id);
      return response;
    },
    enabled: id !== "",
    staleTime: 0,
    gcTime: CACHE_CONFIG.GC_TIME,
    retry: CACHE_CONFIG.RETRY_ATTEMPTS,
    retryDelay: CACHE_CONFIG.RETRY_DELAY,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const response = await projectsService.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.myProjects });
      toast({
        title: "Project created",
        description: "New project added successfully",
      });
    },
    onError: (error: any) => {
      const apiError = error?.response?.data?.errors;
      if (apiError && typeof apiError === 'object') {
        const firstError = Object.values(apiError)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        toast({
          title: "Creation failed",
          description: String(errorMessage),
          variant: "destructive",
        });
        throw error;
      } else {
        const errorMessage = 
          error?.response?.data?.message || 
          error?.response?.data?.error ||
          error?.message || 
          "An error occurred";
        toast({
          title: "Creation failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await projectsService.update(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(projectsQueryKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.myProjects });
      toast({
        title: "Project updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      const apiError = error?.response?.data?.errors;
      if (apiError && typeof apiError === 'object') {
        const firstError = Object.values(apiError)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        toast({
          title: "Update failed",
          description: String(errorMessage),
          variant: "destructive",
        });
      } else {
        const errorMessage = 
          error?.response?.data?.message || 
          error?.response?.data?.error ||
          error?.message || 
          "An error occurred";
        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await projectsService.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.myProjects });
      toast({
        title: "Project deleted",
        description: "Project removed successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "An error occurred";
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
