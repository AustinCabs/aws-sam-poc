/**
 * Integration tests for the API.
 * Run against a deployed stack or use sam local start-api for local testing.
 *
 * Example (after sam build && sam local start-api):
 *   API_BASE_URL=http://127.0.0.1:3000 npm run test:integration
 */

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:3000";

describe("Items API", () => {
  it("should list items (GET /items)", async () => {
    const res = await fetch(`${BASE_URL}/items`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("items");
    expect(Array.isArray(data.items)).toBe(true);
    expect(data).toHaveProperty("count");
  });

  it("should create and get item (POST /items, GET /items/:id)", async () => {
    const createRes = await fetch(`${BASE_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Item", description: "Integration test" }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created).toHaveProperty("id");
    expect(created.name).toBe("Test Item");

    const getRes = await fetch(`${BASE_URL}/items/${created.id}`);
    expect(getRes.status).toBe(200);
    const item = await getRes.json();
    expect(item.id).toBe(created.id);
    expect(item.name).toBe("Test Item");
  });

  it("should return 404 for missing item (GET /items/:id)", async () => {
    const res = await fetch(`${BASE_URL}/items/nonexistent-id-12345`);
    expect(res.status).toBe(404);
  });
});
