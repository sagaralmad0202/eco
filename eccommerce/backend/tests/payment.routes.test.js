const request = require("supertest");

const app = require("../src/app");

describe("payment route boundaries", () => {
  test.each([
    [
      "/api/payments/razorpay/create-order",
      { orderId: "a1aa64e6-67e4-4b07-80b1-da9ec83cac93" },
    ],
    [
      "/api/payments/razorpay/verify",
      {
        orderId: "a1aa64e6-67e4-4b07-80b1-da9ec83cac93",
        razorpayPaymentId: "pay_TestPayment123",
        razorpayOrderId: "order_TestOrder123",
        razorpaySignature: "0".repeat(64),
      },
    ],
  ])("requires authentication for POST %s", async (path, body) => {
    const response = await request(app).post(path).send(body);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Missing access token");
  });
});
