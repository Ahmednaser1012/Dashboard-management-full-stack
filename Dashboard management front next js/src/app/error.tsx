"use client";

import { useEffect } from "react";
import { Button, Alert } from "@/shared/components";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full items-center">
        <div className="flex items-center justify-center w-full order-2 lg:order-1">
          <div className="w-full max-w-md">
            <svg
              className="w-full h-auto"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="200" cy="200" r="180" fill="#FEE2E2" opacity="0.6" />
              <circle cx="200" cy="150" r="50" fill="#DC2626" />
              <text
                x="200"
                y="165"
                fontSize="60"
                fontWeight="bold"
                textAnchor="middle"
                fill="white"
              >
                !
              </text>
              <text
                x="200"
                y="280"
                fontSize="28"
                fontWeight="bold"
                textAnchor="middle"
                fill="#7F1D1D"
              >
                Error
              </text>
              <text
                x="200"
                y="320"
                fontSize="16"
                textAnchor="middle"
                fill="#991B1B"
              >
                Something went wrong
              </text>
            </svg>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-4 order-1 lg:order-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-900">
            Oops!
          </h1>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
            Something went wrong
          </h2>

          <p className="text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed">
            We encountered an unexpected error. Our team has been notified and is
            working to fix it.
            <br />
            Please try again later or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <Alert variant="destructive" className="mt-4">
              <span className="font-bold">Error:</span> {error.message}
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => reset()}
              variant="destructive"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Try Again</span>
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>Go to Dashboard</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
