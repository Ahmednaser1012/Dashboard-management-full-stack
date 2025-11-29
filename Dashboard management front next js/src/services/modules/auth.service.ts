import { AxiosInstance } from "axios";
import { User } from "@/types";

// ============================================
// AUTH SERVICE
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export class AuthService {
  constructor(private apiClient: AxiosInstance) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post("/auth/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await this.apiClient.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get Me Error:", error);
      throw error;
    }
  }
}
