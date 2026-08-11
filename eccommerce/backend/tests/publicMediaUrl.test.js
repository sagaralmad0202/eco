const publicMediaUrl = require("../src/utils/publicMediaUrl");

describe("publicMediaUrl", () => {
  test("turns a backend media path into a public backend URL", () => {
    expect(publicMediaUrl("/media/products/linen-blazer.webp")).toBe(
      "http://localhost:5000/media/products/linen-blazer.webp",
    );
  });

  test("leaves an external catalogue URL unchanged", () => {
    const url = "https://images.example/product.webp";
    expect(publicMediaUrl(url)).toBe(url);
  });
});
