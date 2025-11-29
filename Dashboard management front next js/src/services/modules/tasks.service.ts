import { AxiosInstance } from "axios";
import { Task } from "@/types";
import { BaseCrudApi, PaginationParams, PaginatedResponse } from "../base/BaseCrudApi";

export class TasksService extends BaseCrudApi<Task> {
  constructor(apiClient: AxiosInstance) {
    super(apiClient, "/tasks");
  }

  async getByProject(
    projectId: string | number,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Task>> {
    try {
      const response = await this.apiClient.get<PaginatedResponse<Task>>(
        `/projects/${projectId}/tasks`,
        { params: pagination }
      );
      return response.data;
    } catch (error) {
      console.error("Get Project Tasks Error:", error);
      throw error;
    }
  }

  async createInProject(
    projectId: string | number,
    data: Partial<Task>
  ): Promise<Task> {
    try {
      const response = await this.apiClient.post<Task>(
        `/projects/${projectId}/tasks`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Create Task Error:", error);
      throw error;
    }
  }

  async bulkUpdate(
    items: Array<{ id: string | number; data: Partial<Task> }>
  ): Promise<Task[]> {
    try {
      const taskIds = items.map(item => item.id);
      const status = items[0]?.data?.status;

      const response = await this.apiClient.post<Task[]>(
        `${this.endpoint}/bulk-update`,
        { task_ids: taskIds, status }
      );
      return response.data;
    } catch (error) {
      console.error("Bulk Update Error:", error);
      throw error;
    }
  }
}
