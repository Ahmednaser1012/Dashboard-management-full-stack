"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const perms = usePermissions();
  let hasAccess = false;

  if (permission) {
    hasAccess = perms.check(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? perms.checkAll(permissions) : perms.checkAny(permissions);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

export function useHasAccess(
  permission?: Permission,
  permissions?: Permission[],
  requireAll?: boolean
): boolean {
  const perms = usePermissions();

  if (permission) {
    return perms.check(permission);
  }

  if (permissions && permissions.length > 0) {
    return requireAll ? perms.checkAll(permissions) : perms.checkAny(permissions);
  }

  return false;
}

// Alias for backward compatibility
export const useCanAccess = useHasAccess;
