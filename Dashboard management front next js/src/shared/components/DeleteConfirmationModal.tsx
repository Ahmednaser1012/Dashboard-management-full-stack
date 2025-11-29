import { AlertTriangle } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  title = "Delete Item",
  itemName,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      confirmText="Delete"
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="destructive"
    >
      <div className="flex items-start gap-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            {itemName ? (
              <span className="font-medium text-foreground">&quot;{itemName}&quot;</span>
            ) : (
              "this item"
            )}
            ?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </ConfirmationModal>
  );
}
