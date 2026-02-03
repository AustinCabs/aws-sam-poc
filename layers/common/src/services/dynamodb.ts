import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Item, CreateItemInput } from "../models/item";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME ?? "";

function getTableName(): string {
  if (!TABLE_NAME) {
    throw new Error("TABLE_NAME environment variable is not set");
  }
  return TABLE_NAME;
}

export async function getItemById(id: string): Promise<Item | null> {
  const tableName = getTableName();
  const result = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id,
      },
    })
  );
  return (result.Item as Item) ?? null;
}

export async function putItem(item: Item): Promise<void> {
  const tableName = getTableName();
  const now = new Date().toISOString();
  const record = {
    ...item,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: record,
    })
  );
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item: Item = {
    id,
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
  await putItem(item);
  return item;
}

export async function listItems(): Promise<Item[]> {
  const tableName = getTableName();
  const result = await docClient.send(
    new ScanCommand({
      TableName: tableName,
    })
  );
  const items = (result.Items ?? []) as Item[];
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
