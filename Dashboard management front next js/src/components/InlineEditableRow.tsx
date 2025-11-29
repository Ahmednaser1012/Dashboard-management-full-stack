"use client";

import { useState } from "react";
import { Check, XCircle, Edit2 } from "lucide-react";
import {
  TableRow,
  TableCell,
  StatusBadge,
  PriorityBadge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Button,
  ActionsMenu,
  actionIcons,
} from "@/shared/components";
import { Project, ProjectStatus, Priority } from "@/types";
import { format } from "date-fns";

interface InlineEditableRowProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<void>;
  onDelete: (id: string, name: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  canManage: boolean;
  isUpdating?: boolean;
}

export default function InlineEditableRow({
  project,
  onUpdate,
  onDelete,
  onView,
  onEdit,
  canManage,
  isUpdating = false,
}: InlineEditableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: project.status,
    priority: project.priority,
    progress: project.progress,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(project.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      status: project.status,
      priority: project.priority,
      progress: project.progress,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TableRow className="bg-muted/50">
        <TableCell>
          <div>
            <p className="font-medium text-subheading">{project.name}</p>
            <p className="text-xs text-muted-foreground">{project.manager_name}</p>
          </div>
        </TableCell>
        <TableCell>
          <Select
            value={editData.status}
            onValueChange={(value) =>
              setEditData({ ...editData, status: value as ProjectStatus })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={editData.priority}
            onValueChange={(value) =>
              setEditData({ ...editData, priority: value as Priority })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {format(new Date(project.start_date), "MMM d, yyyy")}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {format(new Date(project.end_date), "MMM d, yyyy")}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={editData.progress}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                })
              }
              className="w-16 h-8"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          ${project.budget.toLocaleString()}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <XCircle className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-subheading">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.manager_name}</p>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={project.status} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={project.priority} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(project.start_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(project.end_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{project.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        ${project.budget.toLocaleString()}
      </TableCell>
      <TableCell>
        <ActionsMenu
          items={[
            {
              label: "View",
              icon: actionIcons.view,
              onClick: () => onView(project.id),
            },
            ...(canManage
              ? [
                  {
                    label: "Quick Edit",
                    icon: <Edit2 className="h-4 w-4" />,
                    onClick: () => setIsEditing(true),
                  },
                  {
                    label: "Full Edit",
                    icon: actionIcons.edit,
                    onClick: () => onEdit(project.id),
                  },
                  {
                    label: "Delete",
                    icon: actionIcons.delete,
                    onClick: () => onDelete(project.id, project.name),
                    variant: "destructive" as const,
                  },
                ]
              : []),
          ]}
        />
      </TableCell>
    </TableRow>
  );
}
