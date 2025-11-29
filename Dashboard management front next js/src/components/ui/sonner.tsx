"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      position="top-center"
    />
  );
}

export { toast } from "sonner";
