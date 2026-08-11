const {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
} = require("../src/modules/orders/order.validators");

describe("order validators", () => {
  test("accepts a valid create payload and normalises coupon code", () => {
    expect(
      createOrderSchema.parse({
        addressId: "6260e191-dbb1-44a5-a204-ac8347a21ba5",
        couponCode: " save10 ",
      }),
    ).toEqual({
      addressId: "6260e191-dbb1-44a5-a204-ac8347a21ba5",
      couponCode: "SAVE10",
    });
  });

  test("rejects invalid address and order ids", () => {
    expect(() => createOrderSchema.parse({ addressId: "bad" })).toThrow();
    expect(() => orderIdParamSchema.parse({ id: "bad" })).toThrow();
  });

  test("coerces and bounds pagination", () => {
    expect(listOrdersSchema.parse({ page: "2", limit: "20" })).toEqual({
      page: 2,
      limit: 20,
    });
    expect(() => listOrdersSchema.parse({ limit: "51" })).toThrow();
  });
});
