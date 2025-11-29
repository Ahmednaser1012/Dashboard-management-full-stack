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
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { formatDateForInput, handleFormErrors } from "@/hooks/useFormHelpers";
import { Task} from "@/types";
import { mockUsers } from "@/services/mockData";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assigned_to: z.string().min(1, "Assignee is required"),
  due_date: z.string().min(1, "Due date is required"),
  estimated_hours: z.coerce.number().min(0).max(1000).optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  task?: Task;
}

export default function TaskModal({ open, onOpenChange, projectId, task }: TaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigned_to: "",
      due_date: "",
      estimated_hours: 0,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status as any,
        priority: task.priority as any,
        assigned_to: String(task.assigned_to || ""),
        due_date: formatDateForInput(task.due_date || task.dueDate),
        estimated_hours: task.estimated_hours || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigned_to: "",
        due_date: "",
        estimated_hours: 0,
      });
    }
  }, [task, reset, open]);

  const onSubmit = (data: TaskForm) => {
    const assignee = mockUsers.find((u) => String(u.id) === data.assigned_to);
    const taskData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigned_to: data.assigned_to,
      due_date: data.due_date,
      estimated_hours: data.estimated_hours || 0,
    };

    if (isEditing && task) {
      updateTask.mutate(
        { id: task.id, projectId, data: taskData },
        { 
          onSuccess: () => onOpenChange(false),
          onError: (error: any) => {
            handleFormErrors(error, (field, options) => {
              setError(field as keyof TaskForm, options);
            });
          },
        }
      );
    } else {
      createTask.mutate(
        { projectId, data: taskData },
        { 
          onSuccess: () => onOpenChange(false),
          onError: (error: any) => {
            handleFormErrors(error, (field, options) => {
              setError(field as keyof TaskForm, options);
            });
          },
        }
      );
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-heading">
              {isEditing ? "Edit Task" : "Create Task"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {isEditing ? "Update the task details below" : "Fill in the details for the new task"}
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Title *
              </label>
              <Input
                placeholder="Task title"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Task description..."
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
                  onValueChange={(value) => setValue("status", value as any)}
                >
                  <SelectTrigger error={errors.status?.message}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="doing">Doing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Priority *
                </label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value as any)}
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

            <div>
              <label className="block text-sm font-medium text-subheading mb-1.5">
                Assignee *
              </label>
              <Select
                value={watch("assigned_to")}
                onValueChange={(value) => setValue("assigned_to", value)}
              >
                <SelectTrigger error={errors.assigned_to?.message}>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers
                    .filter((u) => u.role === "developer")
                    .map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Due Date *
                </label>
                <Input
                  type="date"
                  error={errors.due_date?.message}
                  {...register("due_date")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-subheading mb-1.5">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  min={0}
                  error={errors.estimated_hours?.message}
                  {...register("estimated_hours")}
                />
              </div>
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
                {isEditing ? "Update Task" : "Create Task"}
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
