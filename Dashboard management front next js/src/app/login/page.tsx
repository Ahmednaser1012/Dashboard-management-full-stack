"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button, Input, Alert } from "@/shared/components";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-info-bg p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-heading">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your ProjectHub account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-subheading mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-subheading mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium text-subheading mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <p className="font-medium text-subheading">Admin </p>
                <p>Email: <span className="font-mono">admin@admin.com</span></p>
                <p>Password: <span className="font-mono">12345678</span></p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="font-medium text-subheading">Project Manager</p>
                <p>Email: <span className="font-mono">pm@pm.com</span></p>
                <p>Password: <span className="font-mono">12345678</span></p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="font-medium text-subheading">Developer</p>
                <p>Email: <span className="font-mono">dev@dev.com</span></p>
                <p>Password: <span className="font-mono">12345678</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
