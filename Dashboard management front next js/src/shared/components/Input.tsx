import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        leftIcon={<Search className="h-4 w-4" />}
        className={className}
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";

export { Input, SearchInput };
