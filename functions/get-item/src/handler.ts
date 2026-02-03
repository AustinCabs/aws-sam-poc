import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { info } from "common/utils/logger";
import { success, notFound, errorResponse } from "common/utils/response";
import { getItemById } from "common/services/dynamodb";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  const requestId = event.requestContext?.requestId;
  info("Get item requested", { requestId, id });

  if (!id) {
    return errorResponse("Missing item id", 400);
  }

  try {
    const item = await getItemById(id);
    if (!item) {
      return notFound(`Item with id ${id} not found`);
    }
    return success(item);
  } catch (err) {
    info("Get item failed", { requestId, id, error: String(err) });
    return errorResponse("Failed to get item", 500, {
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
