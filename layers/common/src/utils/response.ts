export const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export function success(body: unknown, statusCode = 200): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  message: string,
  statusCode = 500,
  details?: unknown
): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: message,
      ...(details !== undefined && details !== null ? { details } : {}),
    }),
  };
}

export function notFound(message = "Resource not found"): ApiResponse {
  return errorResponse(message, 404);
}

export function badRequest(message: string, details?: unknown): ApiResponse {
  return errorResponse(message, 400, details);
}
