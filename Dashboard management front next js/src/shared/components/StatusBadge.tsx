import { cn } from "@/lib/utils";
import { ProjectStatus, TaskStatus, Priority } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus | TaskStatus | string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success-bg text-success" },
  completed: { label: "Completed", className: "bg-info-bg text-info" },
  on_hold: { label: "On Hold", className: "bg-warning-bg text-warning" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  doing: { label: "Doing", className: "bg-warning-bg text-warning" },
  done: { label: "Done", className: "bg-success-bg text-success" },
  pending: { label: "Pending", className: "bg-warning-bg text-warning" },
  in_progress: { label: "In Progress", className: "bg-info-bg text-info" },
  review: { label: "Review", className: "bg-warning-bg text-warning" },
  planned: { label: "Planned", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground", className)}>Unknown</span>;
  }
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-info-bg text-info" },
  high: { label: "High", className: "bg-warning-bg text-warning" },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  if (!config) {
    return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground", className)}>Unknown</span>;
  }
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
