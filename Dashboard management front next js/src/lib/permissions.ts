import { UserRole } from '@/types';

export type Permission = 
  | 'admin:manage_users'
  | 'admin:manage_roles'
  | 'admin:view_all_projects'
  | 'admin:manage_all_projects'
  | 'admin:view_audit_logs'
  | 'pm:create_project'
  | 'pm:edit_own_project'
  | 'pm:delete_own_project'
  | 'pm:manage_team_members'
  | 'pm:manage_tasks'
  | 'pm:assign_tasks'
  | 'dev:view_assigned_projects'
  | 'dev:update_task_status'
  | 'dev:add_comments'
  | 'dev:view_tasks';

export type PermissionConfig = {
  [key in UserRole]: Permission[];
};

export const ROLE_PERMISSIONS: PermissionConfig = {
  admin: [
    'admin:manage_users',
    'admin:manage_roles',
    'admin:view_all_projects',
    'admin:manage_all_projects',
    'admin:view_audit_logs',
    'pm:create_project',
    'pm:edit_own_project',
    'pm:delete_own_project',
    'pm:manage_team_members',
    'pm:manage_tasks',
    'pm:assign_tasks',
    'dev:view_assigned_projects',
    'dev:update_task_status',
    'dev:add_comments',
    'dev:view_tasks',
  ],
  project_manager: [
    'pm:create_project',
    'pm:edit_own_project',
    'pm:delete_own_project',
    'pm:manage_team_members',
    'pm:manage_tasks',
    'pm:assign_tasks',
    'dev:view_tasks',
  ],
  developer: [
    'dev:view_assigned_projects',
    'dev:update_task_status',
    'dev:add_comments',
    'dev:view_tasks',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

export function canManageProject(
  userRole: UserRole,
  userId: string,
  projectCreatorId: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager' && userId === projectCreatorId) return true;
  return false;
}

export function canDeleteProject(
  userRole: UserRole,
  userId: string,
  projectCreatorId: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager' && userId === projectCreatorId) return true;
  return false;
}

export function canManageTasks(
  userRole: UserRole,
  userId: string,
  projectCreatorId: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager' && userId === projectCreatorId) return true;
  return false;
}

export function canUpdateTaskStatus(
  userRole: UserRole,
  userId: string,
  taskAssignedTo: string,
  projectCreatorId: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager' && userId === projectCreatorId) return true;
  if (userRole === 'developer' && userId === taskAssignedTo) return true;
  return false;
}

export function canViewProject(
  userRole: UserRole,
  userId: string,
  projectCreatorId: string,
  projectTeamMembers?: string[]
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager') {
    return userId === projectCreatorId || projectTeamMembers?.includes(userId);
  }
  if (userRole === 'developer') {
    return projectTeamMembers?.includes(userId);
  }
  return false;
}

export function canAddComments(
  userRole: UserRole,
  userId: string,
  taskAssignedTo: string,
  projectCreatorId: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'project_manager' && userId === projectCreatorId) return true;
  if (userRole === 'developer' && userId === taskAssignedTo) return true;
  return false;
}
