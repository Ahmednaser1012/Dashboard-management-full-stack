import { AxiosInstance } from "axios";
import { Project, ProjectFilters } from "@/types";
import { BaseCrudApi, PaginationParams, PaginatedResponse } from "../base/BaseCrudApi";

export class ProjectsService extends BaseCrudApi<Project> {
  constructor(apiClient: AxiosInstance) {
    super(apiClient, "/projects");
  }

  async getAllWithFilters(
    filters?: ProjectFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    const params = {
      page: pagination?.page || 1,
      per_page: pagination?.pageSize || 15,
      ...(pagination?.sortBy && { sort_by: pagination.sortBy }),
      ...(pagination?.sortOrder && { sort_order: pagination.sortOrder }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.assignedUser && { assignedUser: filters.assignedUser }),
    };

    return this.getAll(params);
  }

  async getMyProjects(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    try {
      const response = await this.apiClient.get<PaginatedResponse<Project>>(
        `${this.endpoint}/my-projects`,
        { params: pagination }
      );
      return response.data;
    } catch (error) {
      console.error("Get My Projects Error:", error);
      throw error;
    }
  }
}
