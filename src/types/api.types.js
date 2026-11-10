/** @typedef {{ success: boolean, data: unknown, message?: string }} ApiResponse */
/** @typedef {{ success: false, message: string, errors?: Record<string, string[]> }} ApiError */
export function isApiResponse(value) {
  return Boolean(value && typeof value === "object" && "success" in value);
}
