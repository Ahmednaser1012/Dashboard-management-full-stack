import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useProjectManagers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { formatDateForInput, handleFormErrors } from "@/hooks/useFormHelpers";
import { Project, ProjectStatus, Priority } from "@/types";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["planned", "pending", "in_progress", "on_hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  budget: z.coerce.number().min(0).max(999999999),
  notes: z.string().optional(),
  actual_end_date: z.string().optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  project_manager_id: z.string().optional(),
  project_manager_name: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  mode?: "create" | "edit";
  onRefetch?: () => void;
}

export default function ProjectModal({ open, onOpenChange, project, mode = "create", onRefetch }: ProjectModalProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { user, isAdmin, isProjectManager } = useAuth();
  const isEditing = mode === "edit" && !!project;
  const { data: projectManagers = [], isLoading: isLoadingManagers } = useProjectManagers();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planned",
      priority: "medium",
      start_date: "",
      end_date: "",
      budget: 0,
    },
  });

  useEffect(() => {
    if (project) {
      const budgetValue = typeof project.budget === 'string' 
        ? parseFloat(project.budget) 
        : project.budget;

      reset({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: formatDateForInput(project.start_date),
        end_date: formatDateForInput(project.end_date),
        budget: budgetValue,
        notes: project.notes || "",
        actual_end_date: formatDateForInput(project.actual_end_date),
        progress: project.progress || 0,
        project_manager_id: project.project_manager_id ? String(project.project_manager_id) : "",
      });
    } else {
      // If creating a new project and user is a project manager, auto-assign to current user
      const defaultManagerId = isProjectManager && user ? String(user.id) : "";
      
      reset({
        name: "",
        description: "",
        status: "planned",
        priority: "medium",
        start_date: "",
        end_date: "",
        budget: 0,
        notes: "",
        actual_end_date: "",
        progress: 0,
        project_manager_id: defaultManagerId,
        project_manager_name: isProjectManager && user ? user.name : "",
      });
    }
  }, [project, reset, open, isProjectManager, user]);

  const onSubmit = (data: ProjectForm) => {
    const projectData: any = {
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      start_date: data.start_date,
      end_date: data.end_date,
      budget: String(data.budget),
      notes: data.notes || "",
      actual_end_date: data.actual_end_date || "",
      progress: data.progress ? Number(data.progress) : 0,
    };

    if (data.project_manager_id) {
      projectData.project_manager_id = Number(data.project_manager_id);
    }

    if (isEditing && project) {
      updateProject.mutate(
        { id: project.id, data: projectData },
        {
          onSuccess: () => {
            onRefetch?.();
            onOpenChange(false);
          },
          onError: (error: any) => {
            handleFormErrors(error, (field, options) => {
              setError(field as keyof ProjectForm, options);
            });
          },
        }
      );
    } else {
      createProject.mutate(projectData, {
        onSuccess: () => onOpenChange(false),
        onError: (error: any) => {
          handleFormErrors(error, (field, options) => {
            setError(field as keyof ProjectForm, options);
          });
        },
      });
    }
  };

  const isLoading = createProject.isPending || updateProject.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-heading">
              {isEditing ? "Edit Project" : "Create Project"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {isEditing ? "Update the project details below" : "Fill in the details for the new project"}
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Project Name *
              </label>
              <Input
                placeholder="Enter project name"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Project description..."
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Status *
                </label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value as ProjectStatus)}
                >
                  <SelectTrigger error={errors.status?.message}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Priority *
                </label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value as Priority)}
                >
                  <SelectTrigger error={errors.priority?.message}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Start Date *
                </label>
                <Input
                  type="date"
                  error={errors.start_date?.message}
                  {...register("start_date")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  End Date *
                </label>
                <Input
                  type="date"
                  error={errors.end_date?.message}
                  {...register("end_date")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Budget
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                error={errors.budget?.message}
                {...register("budget")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Notes
              </label>
              <textarea
                className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add any notes..."
                {...register("notes")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  error={errors.progress?.message}
                  {...register("progress")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Project Manager
                </label>
                <Select
                  value={watch("project_manager_id") || ""}
                  onValueChange={(value) => {
                    const selectedManager = projectManagers.find(m => m.id === value);
                    setValue("project_manager_id", value);
                    if (selectedManager) {
                      setValue("project_manager_name", selectedManager.name);
                    }
                  }}
                >
                  <SelectTrigger error={errors.project_manager_id?.message}>
                    <SelectValue placeholder={
                      isLoadingManagers 
                        ? "Loading..." 
                        : watch("project_manager_name") || "Select a manager"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {projectManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Actual End Date
              </label>
              <Input
                type="date"
                error={errors.actual_end_date?.message}
                {...register("actual_end_date")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditing ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
