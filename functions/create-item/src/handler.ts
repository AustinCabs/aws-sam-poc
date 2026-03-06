import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { info } from "common/utils/logger";
import { success, badRequest, errorResponse, HttpError } from "common/utils/response";
import { validateCreateItemBody, parseJson } from "common/utils/validator";
import { createItem } from "common/services/dynamodb";
import middify from "common/utils/middleware";
import { ICreateItemInput } from "./types";

const baseHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext?.requestId;
  info("Create item requested", { requestId, event, body: event.body });
  // Cast through unknown since Middy parses the body at runtime
  const body = event.body as unknown as ICreateItemInput;

  try {
    const item = await createItem({
      name: body.name,
      description: body.description,
    });
    info("Item created", { requestId, id: item.id });
    return success(item, 201);
  } catch (err) {
    info("Create item failed", { requestId, error: String(err) });
    throw new HttpError("Bad Request", 400, {
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

export const handler = middify(baseHandler);
