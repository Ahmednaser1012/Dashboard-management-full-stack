import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionsMenuProps {
  items: ActionItem[];
  className?: string;
}

export function ActionsMenu({ items, className }: ActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[160px] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          align="end"
          sideOffset={5}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              disabled={item.disabled}
              className={cn(
                "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                item.variant === "destructive" && "text-destructive focus:bg-destructive/10 focus:text-destructive"
              )}
              onClick={item.onClick}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const actionIcons = {
  view: <Eye className="h-4 w-4" />,
  edit: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  copy: <Copy className="h-4 w-4" />,
};
