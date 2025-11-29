"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
} from "lucide-react";
import {
  PageHeader,
  Button,
  StatusBadge,
  PriorityBadge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  ActionsMenu,
  DeleteConfirmationModal,
  ProjectDetailsSkeleton,
  Skeleton,
  actionIcons,
} from "@/shared/components";
import { useProject } from "@/hooks/useProjects";
import { useTasks, useDeleteTask, useBulkUpdateTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Task, TaskStatus } from "@/types";

export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { canManageProjects } = useAuth();
  
  const { data: project, isLoading: projectLoading, refetch: refetchProject } = useProject(id);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id);
  const deleteTask = useDeleteTask();
  const bulkUpdate = useBulkUpdateTasks();

  const [projectModal, setProjectModal] = useState<{ open: boolean }>({ open: false });
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: "",
  });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.items ?? [];

  const handleDeleteTask = () => {
    deleteTask.mutate(
      { id: deleteModal.id, projectId: id },
      { onSuccess: () => setDeleteModal({ open: false, id: "", title: "" }) }
    );
  };

  const handleBulkStatusUpdate = (status: TaskStatus) => {
    if (selectedTasks.length === 0) return;
    
    bulkUpdate.mutate(
      {
        projectId: id,
        updates: selectedTasks.map((taskId) => ({ id: taskId, data: { status } })),
      },
      { onSuccess: () => setSelectedTasks([]) }
    );
  };

  const toggleTaskSelection = (taskId: string | number) => {
    const taskIdStr = String(taskId);
    setSelectedTasks((prev) =>
      prev.includes(taskIdStr) ? prev.filter((id) => id !== taskIdStr) : [...prev, taskIdStr]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => String(t.id)));
    }
  };

  if (projectLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="link" onClick={() => router.push("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  // Safe number formatting helper
  const formatNumber = (value: any) => {
    try {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    } catch {
      return 0;
    }
  };

  const spentBudget = formatNumber(project.spent_budget);
  const totalBudget = formatNumber(project.budget);
  const budgetUtilization = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

  // Safe date formatting helper
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {canManageProjects && (
              <Button onClick={() => setProjectModal({ open: true })}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        }
      />

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Timeline</span>
          </div>
          <p className="text-sm text-subheading">
            {formatDate(project.start_date).split(",")[0]} -{" "}
            {formatDate(project.end_date)}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-subheading">{project.progress}%</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Budget</span>
          </div>
          <p className="text-lg font-semibold text-subheading">
            ${spentBudget.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / ${totalBudget.toLocaleString()}
            </span>
          </p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budgetUtilization > 90 ? "bg-destructive" : budgetUtilization > 75 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${budgetUtilization}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Team</span>
          </div>
          <p className="text-sm text-subheading">{project.manager_name || project.creator?.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">
            +{(project.team_members?.length ?? 0)} team members
          </p>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <PriorityBadge priority={project.priority} />
        </div>
      </div>

     
      {/* Tasks Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-heading">Tasks ({tasks.length})</h2>
          <div className="flex items-center gap-2">
            {selectedTasks.length > 0 && canManageProjects && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate("done")}
                  isLoading={bulkUpdate.isPending}
                >
                  Mark Complete
                </Button>
              </div>
            )}
            {canManageProjects && (
              <Button onClick={() => setTaskModal({ open: true })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </div>

        {tasksLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No tasks yet</p>
            {canManageProjects && (
              <Button className="mt-4" onClick={() => setTaskModal({ open: true })}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first task
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {canManageProjects && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === tasks.length}
                      onChange={toggleAllTasks}
                      className="h-4 w-4 rounded border-input"
                    />
                  </TableHead>
                )}
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Estimated Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  {canManageProjects && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(String(task.id))}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <p className="font-medium text-subheading">{task.title}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.assignee?.name || task.assigneeName || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(task.due_date || task.dueDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.estimated_hours || task.estimatedHours || 0} hrs
                  </TableCell>
                  <TableCell>
                    <ActionsMenu
                      items={[
                        {
                          label: "Edit",
                          icon: actionIcons.edit,
                          onClick: () => setTaskModal({ open: true, task }),
                          disabled: !canManageProjects,
                        },
                        {
                          label: "Delete",
                          icon: actionIcons.delete,
                          onClick: () =>
                            setDeleteModal({ open: true, id: String(task.id), title: task.title }),
                          variant: "destructive",
                          disabled: !canManageProjects,
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={taskModal.open}
        onOpenChange={(open) => setTaskModal({ open })}
        projectId={id}
        task={taskModal.task}
      />

      {/* Delete Task Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        title="Delete Task"
        itemName={deleteModal.title}
        onConfirm={handleDeleteTask}
        isLoading={deleteTask.isPending}
      />

      {/* Project Modal */}
      <ProjectModal
        open={projectModal.open}
        onOpenChange={(open) => setProjectModal({ open })}
        project={project}
        mode="edit"
        onRefetch={refetchProject}
      />
    </div>
  );
}
