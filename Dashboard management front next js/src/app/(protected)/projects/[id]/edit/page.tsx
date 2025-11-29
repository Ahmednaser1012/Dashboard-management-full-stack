"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProject } from "@/hooks/useProjects";
import { ProjectDetailsSkeleton, Button } from "@/shared/components";
import ProjectModal from "@/components/ProjectModal";

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(id);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (project) {
      setIsModalOpen(true);
    }
  }, [project]);

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      router.push(`/projects/${id}`);
    }
  };

  if (projectLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="link" onClick={() => router.push("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <ProjectModal
      open={isModalOpen}
      onOpenChange={handleModalClose}
      project={project}
      mode="edit"
    />
  );
}
