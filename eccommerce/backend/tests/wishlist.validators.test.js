const {
  addItemSchema,
  productIdParamSchema,
} = require("../src/modules/wishlist/wishlist.validators");

const PRODUCT_ID = "57e0d023-87fe-4c40-98c4-4b6f93ab1831";

describe("wishlist validators", () => {
  test("accepts a product UUID", () => {
    expect(addItemSchema.parse({ productId: PRODUCT_ID })).toEqual({
      productId: PRODUCT_ID,
    });
    expect(productIdParamSchema.parse({ productId: PRODUCT_ID })).toEqual({
      productId: PRODUCT_ID,
    });
  });

  test.each(["", "not-a-uuid", "57e0d023"])(
    "rejects invalid product id %p",
    (productId) => {
      expect(() => addItemSchema.parse({ productId })).toThrow();
      expect(() => productIdParamSchema.parse({ productId })).toThrow();
    },
  );
});
