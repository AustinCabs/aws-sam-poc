/**
 * Type declarations for the common Lambda layer (resolved at runtime from the layer).
 */
declare module "common/utils/logger" {
  export function debug(message: string, context?: Record<string, unknown>): void;
  export function info(message: string, context?: Record<string, unknown>): void;
  export function warn(message: string, context?: Record<string, unknown>): void;
  export function error(message: string, context?: Record<string, unknown>): void;
}

declare module "common/utils/response" {
  export interface ApiResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }
  export function success(body: unknown, statusCode?: number): ApiResponse;
  export function errorResponse(message: string, statusCode?: number, details?: unknown): ApiResponse;
  export function notFound(message?: string): ApiResponse;
  export function badRequest(message: string, details?: unknown): ApiResponse;
}

declare module "common/utils/validator" {
  export function isNonEmptyString(value: unknown): value is string;
  export function parseJson<T>(body: string | null | undefined): T | null;
  export function validateCreateItemBody(body: unknown): {
    valid: boolean;
    name?: string;
    description?: string;
    error?: string;
  };
}

declare module "common/models/item" {
  export interface Item {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
  }
  export interface CreateItemInput {
    name: string;
    description?: string;
  }
}

declare module "common/services/dynamodb" {
  import type { Item, CreateItemInput } from "common/models/item";
  export function getItemById(id: string): Promise<Item | null>;
  export function putItem(item: Item): Promise<void>;
  export function createItem(input: CreateItemInput): Promise<Item>;
  export function listItems(): Promise<Item[]>;
}
