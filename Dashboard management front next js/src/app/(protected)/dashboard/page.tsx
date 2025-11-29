"use client";

import Link from "next/link";
import {  FolderKanban, CheckCircle, Clock, DollarSign } from "lucide-react";
import { PageHeader, Skeleton } from "@/shared/components";
import { useProjects } from "@/hooks/useProjects";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-heading mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { projects, isLoading } = useProjects();

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    totalBudget: projects.reduce((acc, p) => acc + (typeof p.budget === 'string' ? parseFloat(p.budget) : p.budget), 0),
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Dashboard"
        description="Overview of your projects and tasks"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={<FolderKanban className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Active Projects"
          value={stats.active}
          icon={<Clock className="h-6 w-6 text-info" />}
          trend="+2 this month"
          trendUp
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="h-6 w-6 text-success" />}
        />
        <StatCard
          title="Total Budget"
          value={`$${(stats.totalBudget / 1000).toFixed(0)}k`}
          icon={<DollarSign className="h-6 w-6 text-warning" />}
        />
      </div>

      {/* Recent Projects */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-subheading truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.manager_name || project.creator?.name || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground w-10">
                    {project.progress}%
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold text-heading mb-4">Progress Overview</h2>
          <div className="space-y-4">
            {projects.slice(0, 4).map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{project.name}</span>
                  <span className="font-medium text-subheading">{project.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      project.progress >= 80
                        ? "bg-success"
                        : project.progress >= 50
                        ? "bg-primary"
                        : project.progress >= 25
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold text-heading mb-4">Budget Utilization</h2>
          <div className="space-y-4">
            {projects.slice(0, 4).map((project) => {
              const spentBudget = project.spent_budget || 0;
              const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : project.budget;
              const utilization = budget > 0 ? Math.round((spentBudget / budget) * 100) : 0;
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{project.name}</span>
                    <span className="font-medium text-subheading">
                      ${(spentBudget / 1000).toFixed(0)}k / ${(budget / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilization > 90
                          ? "bg-destructive"
                          : utilization > 75
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
