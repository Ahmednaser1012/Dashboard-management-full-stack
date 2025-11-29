export const CACHE_CONFIG = {
  STALE_TIME: 1000 * 60 * 5,
  GC_TIME: 1000 * 60 * 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const projectsQueryKeys = {
  all: ["projects"] as const,
  list: ["projects", "list"] as const,
  listWithFilters: (filters?: any, pagination?: any) =>
    ["projects", "list", { filters, pagination }] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
  myProjects: ["projects", "my-projects"] as const,
  stats: ["projects", "stats"] as const,
  archived: ["projects", "archived"] as const,
};

export const tasksQueryKeys = {
  all: ["tasks"] as const,
  list: ["tasks", "list"] as const,
  byProject: (projectId: string) => ["tasks", "by-project", projectId] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
  myTasks: ["tasks", "my-tasks"] as const,
  stats: (projectId?: string) =>
    projectId ? ["tasks", "stats", projectId] : ["tasks", "stats"] as const,
  comments: (taskId: string) => ["tasks", "comments", taskId] as const,
  attachments: (taskId: string) => ["tasks", "attachments", taskId] as const,
};

export const authQueryKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"] as const,
  profile: ["auth", "profile"] as const,
  permissions: ["auth", "permissions"] as const,
};

export const usersQueryKeys = {
  all: ["users"] as const,
  list: ["users", "list"] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  search: (query: string) => ["users", "search", query] as const,
};
