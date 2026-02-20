import middy from "@middy/core";
import type {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Context,
} from "aws-lambda";
import { CORS_HEADERS, HttpError } from "./response";
import { error as logError, info } from "./logger";

// ─── Types ───────────────────────────────────────────────────────────────────

type LambdaHandler = (
    event: APIGatewayProxyEventV2,
    context: Context
) => Promise<APIGatewayProxyResultV2 | Record<string, unknown>>;

// ─── CORS Middleware ─────────────────────────────────────────────────────────
// Attaches CORS headers to every response (both success and error paths).

const corsMiddleware = (): middy.MiddlewareObj<
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2
> => {
    const applyHeaders = (
        response: APIGatewayProxyResultV2 | undefined
    ): APIGatewayProxyResultV2 => {
        if (typeof response === "object" && response !== null) {
            const res = response as Record<string, unknown>;
            res.headers = { ...(res.headers as Record<string, string>), ...CORS_HEADERS };
            return res as APIGatewayProxyResultV2;
        }
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    };

    return {
        after: (request) => {
            request.response = applyHeaders(request.response ?? undefined);
        },
        onError: (request) => {
            request.response = applyHeaders(request.response ?? undefined);
        },
    };
};

// ─── HTTP Error Handler Middleware ───────────────────────────────────────────
// Catches thrown errors and converts them into structured JSON responses.
// Recognizes `HttpError` for typed status codes; defaults to 500.

const httpErrorHandlerMiddleware = (): middy.MiddlewareObj<
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2
> => ({
    onError: (request) => {
        const err = request.error;

        if (!err) return;

        const isHttpError = err instanceof HttpError;
        const statusCode = isHttpError ? err.statusCode : 500;
        const message = err.message || "Internal server error";
        const details = isHttpError ? err.details : undefined;

        logError(message, {
            requestId: request.event?.requestContext?.requestId,
            statusCode: String(statusCode),
            ...(details !== undefined && details !== null ? { details: String(details) } : {}),
        });

        request.response = {
            statusCode,
            body: JSON.stringify({
                error: message,
                ...(details !== undefined && details !== null ? { details } : {}),
            }),
        };
    },
});

// ─── JSON Body Parser Middleware ─────────────────────────────────────────────
// Parses event.body from a JSON string into an object.
// Throws HttpError(400) if the body is present but contains invalid JSON.

const jsonBodyParserMiddleware = (): middy.MiddlewareObj<
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2
> => ({
    before: (request) => {
        const { body } = request.event;

        if (!body) return;

        const contentType =
            request.event.headers?.["content-type"] ||
            request.event.headers?.["Content-Type"] ||
            "";

        // Only parse JSON content types (skip multipart, form-urlencoded, etc.)
        if (contentType && !contentType.includes("application/json")) return;

        try {
            request.event.body = JSON.parse(body);
        } catch {
            throw new HttpError(400, "Invalid JSON in request body");
        }
    },
});

// ─── Response Serializer Middleware ──────────────────────────────────────────
// Serializes response body to a JSON string if it isn't already a string.
// Sets statusCode to 200 if not explicitly set.

const responseSerializerMiddleware = (): middy.MiddlewareObj<
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2
> => ({
    after: (request) => {
        const response = request.response;

        if (response === undefined || response === null) {
            request.response = { statusCode: 204 };
            return;
        }

        // If the handler already returned a fully-formed API Gateway response, just serialize the body
        if (
            typeof response === "object" &&
            "statusCode" in response &&
            typeof (response as Record<string, unknown>).statusCode === "number"
        ) {
            const res = response as Record<string, unknown>;
            if (res.body !== undefined && typeof res.body !== "string") {
                res.body = JSON.stringify(res.body);
            }
            return;
        }

        // Handler returned a plain object/value — wrap it in a proper response
        request.response = {
            statusCode: 200,
            body: typeof response === "string" ? response : JSON.stringify(response),
        };
    },
});

// ─── Middify ─────────────────────────────────────────────────────────────────
// Convenience wrapper: wraps a handler with all standard middleware.
//
// Middy runs `before` hooks in registration order, but `after` and `onError`
// hooks in REVERSE registration order. So the registration below produces:
//
//   before:  jsonBodyParser → (handler)
//   after:   responseSerializer → cors          (reverse: cors last = headers always applied)
//   onError: httpErrorHandler → cors            (reverse: error formatted first, then CORS added)

export const middify = (handler: LambdaHandler) => {
    return middy(handler)
        .use(corsMiddleware())                // registered 1st → runs LAST  in after/onError
        .use(responseSerializerMiddleware())   // registered 2nd → runs 3rd   in after
        .use(httpErrorHandlerMiddleware())     // registered 3rd → runs 2nd   in onError
        .use(jsonBodyParserMiddleware());      // registered 4th → runs 1st   in before
};
