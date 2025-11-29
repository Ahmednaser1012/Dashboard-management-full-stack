import { AxiosInstance, AxiosError } from "axios";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class BaseCrudApi<T = any> {
  constructor(
    protected apiClient: AxiosInstance,
    protected endpoint: string
  ) {}

  async getAll(params: PaginationParams = {}): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.apiClient.get<any>(
        this.endpoint,
        { params }
      );
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data) && data.pagination) {
        return {
          items: data.data,
          total: data.pagination.total,
          page: data.pagination.current_page || 1,
          pageSize: data.pagination.per_page || 15,
          totalPages: data.pagination.last_page || 1,
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getById(id: string | number): Promise<T> {
    try {
      const response = await this.apiClient.get<any>(
        `${this.endpoint}/${id}`
      );
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await this.apiClient.post<any>(
        this.endpoint,
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const response = await this.apiClient.patch<any>(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      await this.apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || data?.error || error.message;
      
      console.error(`API Error [${status}]:`, {
        endpoint: this.endpoint,
        status,
        message,
        data,
        errors: data?.errors,
      });
      
      // Log specific error details
      if (data?.errors) {
        console.error("Validation Errors:", data.errors);
      }
    } else {
      console.error("Unexpected Error:", {
        message: error?.message,
        error,
        stack: error?.stack,
      });
    }
  }
}
