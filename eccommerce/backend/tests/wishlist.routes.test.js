const request = require("supertest");
const app = require("../src/app");

describe("wishlist route authentication", () => {
  test.each([
    ["get", "/api/wishlist"],
    ["post", "/api/wishlist/items"],
    ["post", "/api/wishlist/toggle"],
    ["delete", "/api/wishlist/items/57e0d023-87fe-4c40-98c4-4b6f93ab1831"],
    ["delete", "/api/wishlist"],
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
