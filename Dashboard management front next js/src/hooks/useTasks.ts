"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { tasksService } from "@/services";
import { Task } from "@/types";
import { toast } from "@/hooks/use-toast";
import { CACHE_CONFIG, tasksQueryKeys } from "./queryKeys";

export function useTasks(projectId: string) {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isProjectManager = user?.role === 'project_manager';

  return useQuery({
    queryKey: tasksQueryKeys.byProject(projectId),
    queryFn: async () => {
      const response = await tasksService.getByProject(projectId);
      if (!response.items) return response;
      
      let filtered = response.items;
      if (!isAdmin && !isProjectManager) {
        filtered = filtered.filter(task => 
          task.assigned_to === user?.id || 
          task.assignee?.id === user?.id
        );
      }
      
      return {
        ...response,
        items: filtered,
        total: filtered.length,
      };
    },
    enabled: projectId !== "",
    staleTime: CACHE_CONFIG.STALE_TIME,
    gcTime: CACHE_CONFIG.GC_TIME,
    retry: CACHE_CONFIG.RETRY_ATTEMPTS,
    retryDelay: CACHE_CONFIG.RETRY_DELAY,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: Partial<Task> }) => {
      const response = await tasksService.createInProject(projectId, data);
      return { response, projectId };
    },
    onSuccess: ({ response, projectId }) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.byProject(projectId) });
      
      toast({
        title: "Task created",
        description: "New task added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, data }: { id: string; projectId: string; data: Partial<Task> }) => {
      const response = await tasksService.update(id, data);
      return { response, projectId };
    },
    onSuccess: ({ response, projectId }) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.byProject(projectId) });
      toast({
        title: "Task updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      await tasksService.delete(id);
      return { id, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.byProject(projectId) });
      toast({
        title: "Task deleted",
        description: "Task removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Array<{ id: string; data: Partial<Task> }> }) => {
      const response = await tasksService.bulkUpdate(updates);
      return { response, projectId };
    },
    onSuccess: ({ response, projectId }) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.byProject(projectId) });
      
      toast({
        title: "Tasks updated",
        description: "Bulk update completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}
