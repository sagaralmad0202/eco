const request = require("supertest");
const app = require("../src/app");

describe("order route authentication", () => {
  test.each([
    ["post", "/api/orders"],
    ["get", "/api/orders"],
    ["get", "/api/orders/9ec040be-c3b1-42f7-bb02-8b6dc4cb3b06"],
    ["post", "/api/orders/9ec040be-c3b1-42f7-bb02-8b6dc4cb3b06/cancel"],
  ])("rejects unauthenticated %s %s", async (method, path) => {
    const response = await request(app)[method](path);

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Missing access token",
      }),
    );
  });
});
