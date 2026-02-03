export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseJson<T>(body: string | null | undefined): T | null {
  if (body == null || body === "") {
    return null;
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export function validateCreateItemBody(body: unknown): {
  valid: boolean;
  name?: string;
  description?: string;
  error?: string;
} {
  if (body == null || typeof body !== "object") {
    return { valid: false, error: "Body must be a JSON object" };
  }
  const record = body as Record<string, unknown>;
  const name = record.name;
  if (name === undefined || name === null) {
    return { valid: false, error: "name is required" };
  }
  if (!isNonEmptyString(name)) {
    return { valid: false, error: "name must be a non-empty string" };
  }
  const description =
    record.description !== undefined && record.description !== null
      ? String(record.description)
      : undefined;
  return { valid: true, name: name.trim(), description };
}
