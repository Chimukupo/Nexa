/**
 * Form utilities for React Hook Form
 */

import { UseFormReturn } from "react-hook-form";

/**
 * Helper to check if form has errors
 */
export function hasFormErrors<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
): boolean {
  return Object.keys(form.formState.errors).length > 0;
}

/**
 * Helper to get first form error message
 */
export function getFirstFormError<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
): string | undefined {
  const errors = form.formState.errors;
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey) return undefined;

  const error = errors[firstErrorKey];
  if (!error) return undefined;

  return typeof error.message === "string" ? error.message : undefined;
}

