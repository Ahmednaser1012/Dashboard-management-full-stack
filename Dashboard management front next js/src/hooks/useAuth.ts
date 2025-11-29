"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, setLoading, logout as logoutAction } from "@/store/slices/authSlice";
import { authService } from "@/services";
import { toast } from "@/hooks/use-toast";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(setLoading(true));
      try {
        const response = await authService.login({ email, password });
        dispatch(setCredentials({ user: response.user, token: response.token }));
        
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("authToken", response.token);
        }
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.user.name}`,
        });
        
        router.push("/dashboard");
      } catch (error) {
        dispatch(setLoading(false));
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
        throw error;
      }
    },
    [dispatch, router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    dispatch(logoutAction());
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
    }
    
    router.push("/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  }, [dispatch, router]);

  const hasRole = useCallback((roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  const canManageProjects = hasRole(["admin", "project_manager"]);
  const isAdmin = hasRole("admin");
  const isProjectManager = hasRole("project_manager");
  const isDeveloper = hasRole("developer");

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    canManageProjects,
    isAdmin,
    isProjectManager,
    isDeveloper,
  };
}
