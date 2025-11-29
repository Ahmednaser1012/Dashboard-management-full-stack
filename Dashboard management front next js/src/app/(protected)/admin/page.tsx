"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { PageHeader, Button } from "@/shared/components";
import { ArrowLeft} from "lucide-react";
 
export default function AdminPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You don&apos;t have permission to access this page</p>
        <Button variant="link" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Admin Panel"
        description="Manage system settings, users, and permissions"
        actions={
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

    

      {/* Admin Features */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-heading mb-4">Available Features</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-subheading">User Management</p>
              <p className="text-sm text-muted-foreground">Create, edit, and delete users</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-subheading">Role Assignment</p>
              <p className="text-sm text-muted-foreground">Assign and manage user roles (Admin, Project Manager, Developer)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-subheading">Project Management</p>
              <p className="text-sm text-muted-foreground">View and manage all projects in the system</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-subheading">Audit Logging</p>
              <p className="text-sm text-muted-foreground">Track all system activities and changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-heading mb-4">Your Account</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name:</span>
            <span className="text-sm font-medium text-subheading">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium text-subheading">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Role:</span>
            <span className="text-sm font-medium text-subheading capitalize">{user?.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
