import { AxiosInstance } from "axios";
import { User } from "@/types";

export interface UsersResponse {
  data: User[];
  total: number;
}

export class UsersService {
  constructor(private apiClient: AxiosInstance) {}

  async getProjectManagers(): Promise<User[]> {
    try {
      const response = await this.apiClient.get<{ data: User[] }>(
        "/users/project-managers"
      );
      return response.data.data;
    } catch (error) {
      console.error("Get Project Managers Error:", error);
      throw error;
    }
  }
}
