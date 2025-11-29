"use client";

import { useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageProject,
  canDeleteProject,
  canManageTasks,
  canUpdateTaskStatus,
  canViewProject,
  canAddComments,
} from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuth();

  const check = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  const checkAny = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  }, [user]);

  const checkAll = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  }, [user]);

  const canManage = useCallback((projectCreatorId: string): boolean => {
    if (!user) return false;
    return canManageProject(user.role, user.id, projectCreatorId);
  }, [user]);

  const canDelete = useCallback((projectCreatorId: string): boolean => {
    if (!user) return false;
    return canDeleteProject(user.role, user.id, projectCreatorId);
  }, [user]);

  const canManageProjectTasks = useCallback((projectCreatorId: string): boolean => {
    if (!user) return false;
    return canManageTasks(user.role, user.id, projectCreatorId);
  }, [user]);

  const canUpdateStatus = useCallback((taskAssignedTo: string, projectCreatorId: string): boolean => {
    if (!user) return false;
    return canUpdateTaskStatus(user.role, user.id, taskAssignedTo, projectCreatorId);
  }, [user]);

  const canView = useCallback((projectCreatorId: string, projectTeamMembers?: string[]): boolean => {
    if (!user) return false;
    return canViewProject(user.role, user.id, projectCreatorId, projectTeamMembers);
  }, [user]);

  const canComment = useCallback((taskAssignedTo: string, projectCreatorId: string): boolean => {
    if (!user) return false;
    return canAddComments(user.role, user.id, taskAssignedTo, projectCreatorId);
  }, [user]);

  const isAdmin = user?.role === "admin";
  const isProjectManager = user?.role === "project_manager";
  const isDeveloper = user?.role === "developer";

  return {
    user,
    check,
    checkAny,
    checkAll,
    canManage,
    canDelete,
    canManageProjectTasks,
    canUpdateStatus,
    canView,
    canComment,
    isAdmin,
    isProjectManager,
    isDeveloper,
  };
}
