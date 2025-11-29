"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Filter, X, Edit, Trash2, Eye, Check, XCircle } from "lucide-react";
import {
  PageHeader,
  Button,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  StatusBadge,
  PriorityBadge,
  Pagination,
  ActionsMenu,
  DeleteConfirmationModal,
  TableSkeleton,
  actionIcons,
  Input,
} from "@/shared/components";
import { useProjects, useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ProjectStatus, Priority, Project } from "@/types";
import { format } from "date-fns";
import ProjectModal from "@/components/ProjectModal";
import { PermissionGuard } from "@/components/PermissionGuard";

interface EditingState {
  projectId: string | null;
  status: ProjectStatus | null;
  priority: Priority | null;
  progress: number | null;
}

export default function Projects() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageProjects } = useAuth();
  const {
    projects,
    totalPages,
    isLoading,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    handleSort,
  } = useProjects();
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const [showFilters, setShowFilters] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [editingState, setEditingState] = useState<EditingState>({
    projectId: null,
    status: null,
    priority: null,
    progress: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchValue });
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue, updateFilters]);

  const handleViewProject = (projectId: string) => {
    // Invalidate the project detail cache to ensure fresh data
    queryClient.invalidateQueries({
      queryKey: ["projects", "detail", projectId],
    });
    
    // Navigate to project detail page
    router.push(`/projects/${projectId}`);
  };

  const handleDelete = () => {
    deleteProject.mutate(deleteModal.id, {
      onSuccess: () => setDeleteModal({ open: false, id: "", name: "" }),
    });
  };

  const startEditing = (project: Project) => {
    setEditingState({
      projectId: project.id,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
    });
  };

  const cancelEditing = () => {
    setEditingState({
      projectId: null,
      status: null,
      priority: null,
      progress: null,
    });
  };

  const saveEditing = async () => {
    if (!editingState.projectId) return;

    setIsSaving(true);
    updateProject.mutate(
      {
        id: editingState.projectId,
        data: {
          status: editingState.status!,
          priority: editingState.priority!,
          progress: editingState.progress!,
        },
      },
      {
        onSuccess: () => {
          setIsSaving(false);
          cancelEditing();
        },
        onError: () => {
          setIsSaving(false);
        },
      }
    );
  };

  const isEditing = (projectId: string) => editingState.projectId === projectId;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Projects"
        description="Manage and track all your projects"
        actions={
          canManageProjects && (
            <Button onClick={() => setProjectModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search projects..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(filters.status || filters.priority) && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {[filters.status, filters.priority].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card rounded-xl border border-border p-4 animate-slideInUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-subheading">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateFilters({ status: "", priority: "" });
              }}
            >
              Clear all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Status
              </label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  updateFilters({ status: value === "all" ? "" : (value as ProjectStatus) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="in_progress">in progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Priority
              </label>
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  updateFilters({ priority: value === "all" ? "" : (value as Priority) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : projects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
          {canManageProjects && (
            <Button className="mt-4" onClick={() => setProjectModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <>
          <Table
            sortBy={pagination.sortBy}
            sortOrder={pagination.sortOrder}
            onSort={handleSort}
          >
            <TableHeader>
              <TableRow>
                <TableHead sortable sortKey="name">Name</TableHead>
                <TableHead sortable sortKey="status">Status</TableHead>
                <TableHead sortable sortKey="priority">Priority</TableHead>
                <TableHead sortable sortKey="startDate">Start Date</TableHead>
                <TableHead sortable sortKey="endDate">End Date</TableHead>
                <TableHead sortable sortKey="progress">Progress</TableHead>
                <TableHead sortable sortKey="budget">Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className={isEditing(project.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-subheading">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.manager_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing(project.id) ? (
                      <Select
                        value={editingState.status || ""}
                        onValueChange={(value) =>
                          setEditingState({ ...editingState, status: value as ProjectStatus })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={project.status} />
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing(project.id) ? (
                      <Select
                        value={editingState.priority || ""}
                        onValueChange={(value) =>
                          setEditingState({ ...editingState, priority: value as Priority })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <PriorityBadge priority={project.priority} />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(project.start_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(project.end_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {isEditing(project.id) ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={editingState.progress || 0}
                          onChange={(e) =>
                            setEditingState({
                              ...editingState,
                              progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                            })
                          }
                          className="w-16 h-8"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ${project.budget.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {isEditing(project.id) ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <ActionsMenu
                        items={[
                          {
                            label: "View",
                            icon: actionIcons.view,
                            onClick: () => handleViewProject(project.id),
                          },
                          ...(canManageProjects
                            ? [
                                {
                                  label: "Quick Edit",
                                  icon: <Edit className="h-4 w-4" />,
                                  onClick: () => startEditing(project),
                                },
                                {
                                  label: "Full Edit",
                                  icon: actionIcons.edit,
                                  onClick: () => router.push(`/projects/${project.id}/edit`),
                                },
                                {
                                  label: "Delete",
                                  icon: actionIcons.delete,
                                  onClick: () =>
                                    setDeleteModal({
                                      open: true,
                                      id: project.id,
                                      name: project.name,
                                    }),
                                  variant: "destructive" as const,
                                },
                              ]
                            : []),
                        ]}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, projects.length)} of {projects.length}{" "}
              results
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={(page) => updatePagination({ page })}
            />
          </div>
        </>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        title="Delete Project"
        itemName={deleteModal.name}
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
      />

      {/* Project Modal */}
      <ProjectModal
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
      />
    </div>
  );
}
