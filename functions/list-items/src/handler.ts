import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { info } from "common/utils/logger";
import { success, errorResponse } from "common/utils/response";
import { listItems } from "common/services/dynamodb";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext?.requestId;
  info("List items requested", { requestId });

  try {
    const items = await listItems();
    return success({ items, count: items.length });
  } catch (err) {
    info("List items failed", { requestId, error: String(err) });
    return errorResponse("Failed to list items", 500, {
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
