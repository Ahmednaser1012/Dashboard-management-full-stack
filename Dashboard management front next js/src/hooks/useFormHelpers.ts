"use client";

/**
 * Common form utilities and helpers
 */

export function formatDateForInput(dateString: string | number | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

export function parseBudget(budget: string | number | undefined): number {
  if (!budget) return 0;
  if (typeof budget === 'string') {
    return parseFloat(budget) || 0;
  }
  return budget;
}

export function handleFormErrors(
  error: any,
  setError: (field: string, options: any) => void,
  fieldType: string = "manual"
) {
  const apiError = error?.response?.data?.errors;
  if (apiError && typeof apiError === 'object') {
    Object.entries(apiError).forEach(([field, messages]: [string, any]) => {
      const errorMessage = Array.isArray(messages) ? messages[0] : messages;
      setError(field, {
        type: fieldType,
        message: String(errorMessage),
      });
    });
  }
}
