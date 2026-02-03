import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { info } from "common/utils/logger";
import { success, badRequest, errorResponse } from "common/utils/response";
import { validateCreateItemBody, parseJson } from "common/utils/validator";
import { createItem } from "common/services/dynamodb";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext?.requestId;
  info("Create item requested", { requestId });

  const body = parseJson<Record<string, unknown>>(event.body);
  const validation = validateCreateItemBody(body);
  if (!validation.valid) {
    return badRequest(validation.error ?? "Invalid request");
  }

  try {
    const item = await createItem({
      name: validation.name!,
      description: validation.description,
    });
    info("Item created", { requestId, id: item.id });
    return success(item, 201);
  } catch (err) {
    info("Create item failed", { requestId, error: String(err) });
    return errorResponse("Failed to create item", 500, {
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
