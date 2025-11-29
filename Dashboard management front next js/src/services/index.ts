/**
 * API Services Index
 * ============================================
 * نقطة الدخول الرئيسية لجميع خدمات API
 */

import { apiClient } from "./config/axios.config";
import { AuthService } from "./modules/auth.service";
import { ProjectsService } from "./modules/projects.service";
import { TasksService } from "./modules/tasks.service";
import { UsersService } from "./modules/users.service";

// ============================================
// INITIALIZE SERVICES
// ============================================

export const authService = new AuthService(apiClient);
export const projectsService = new ProjectsService(apiClient);
export const tasksService = new TasksService(apiClient);
export const usersService = new UsersService(apiClient);

// ============================================
// EXPORTS
// ============================================

export { apiClient } from "./config/axios.config";
export { AuthService } from "./modules/auth.service";
export { ProjectsService } from "./modules/projects.service";
export { TasksService } from "./modules/tasks.service";
export { UsersService } from "./modules/users.service";
export { BaseCrudApi, type PaginationParams, type PaginatedResponse } from "./base/BaseCrudApi";

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * استخدام الخدمات:
 *
 * // Auth
 * const loginResponse = await authService.login({ email: "user@example.com", password: "password" });
 * const user = await authService.getMe();
 * await authService.logout();
 *
 * // Projects
 * const projects = await projectsService.getAll({ page: 1, pageSize: 10 });
 * const project = await projectsService.getById("project-id");
 * const newProject = await projectsService.create({ name: "New Project" });
 * const updated = await projectsService.update("project-id", { name: "Updated" });
 * await projectsService.delete("project-id");
 *
 * // Tasks
 * const tasks = await tasksService.getByProject("project-id");
 * const task = await tasksService.getById("task-id");
 * const newTask = await tasksService.createInProject("project-id", { title: "New Task" });
 * await tasksService.changeStatus("task-id", "completed");
 * await tasksService.assignTo("task-id", "user-id");
 */
