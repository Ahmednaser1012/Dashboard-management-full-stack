export type UserRole = 'admin' | 'project_manager' | 'developer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ProjectStatus = 'planned' | 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  start_date: string;
  end_date: string;
  actual_end_date?: string;
  progress: number;
  budget: number | string;
  spent_budget?: number;
  client_name?: string;
  notes?: string;
  project_manager_id?: string;
  manager_name?: string;
  team_members?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | '';
  priority?: Priority | '';
  assignedUser?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_date?: string;
  dueDate?: string;
  estimated_hours?: number;
  project_id: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigneeName?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  deleted_at?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  users?: any[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
