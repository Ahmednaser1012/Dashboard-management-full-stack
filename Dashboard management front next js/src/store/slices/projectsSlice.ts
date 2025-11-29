import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectFilters, PaginationParams } from '@/types';

interface ProjectsState {
  filters: ProjectFilters;
  pagination: PaginationParams;
  selectedProjectId: string | null;
}

const initialState: ProjectsState = {
  filters: {
    search: '',
    status: '',
    priority: '',
    assignedUser: '',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedProjectId: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProjectFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
  },
});

export const { setFilters, clearFilters, setPagination, setSelectedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
