"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full items-center">
        <div className="flex flex-col justify-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
            Oops....
          </h1>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
            Page not found
          </h2>

          <p className="text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed">
            This Page doesn&apos;t exist or was removed
            <br />
            We suggest you back to home.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="flex items-center gap-2"
            >
              <span>←</span>
              <span>Go to Dashboard</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-md">
            <svg
              className="w-full h-auto"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="200" cy="200" r="180" fill="#E0F2FE" opacity="0.5" />
              <text
                x="200"
                y="220"
                fontSize="120"
                fontWeight="bold"
                textAnchor="middle"
                fill="#0369A1"
              >
                404
              </text>
              <text
                x="200"
                y="280"
                fontSize="24"
                textAnchor="middle"
                fill="#475569"
              >
                Not Found
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
