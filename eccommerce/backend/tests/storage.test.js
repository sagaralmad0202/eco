const {
  getPublicUrl,
  uploadObject,
  objectExists,
  deleteObject,
  _setStorageClientForTesting,
} = require("../src/lib/storage");
const env = require("../src/config/env");

describe("Object Storage Service (S3 / Neon Compatible)", () => {
  let mockS3Client;

  beforeEach(() => {
    mockS3Client = {
      send: jest.fn(),
    };
    _setStorageClientForTesting(mockS3Client);
  });

  describe("getPublicUrl", () => {
    test("derives correct public URL when STORAGE_PUBLIC_URL is configured", () => {
      env.STORAGE_PUBLIC_URL = "https://storage.neon.tech/ecommerce";
      const url = getPublicUrl("products/leather-tote-bag.webp");
      expect(url).toBe(
        "https://storage.neon.tech/ecommerce/products/leather-tote-bag.webp",
      );
    });

    test("handles leading slashes gracefully", () => {
      env.STORAGE_PUBLIC_URL = "https://storage.neon.tech/ecommerce";
      const url = getPublicUrl("/products/linen-blazer.webp");
      expect(url).toBe(
        "https://storage.neon.tech/ecommerce/products/linen-blazer.webp",
      );
    });
  });

  describe("uploadObject", () => {
    test("sends PutObjectCommand and returns public bucket URL and metadata", async () => {
      env.STORAGE_BUCKET = "ecommerce";
      env.STORAGE_PUBLIC_URL = "https://storage.neon.tech/ecommerce";
      mockS3Client.send.mockResolvedValueOnce({});

      const buffer = Buffer.from("fake-image-bytes");
      const result = await uploadObject({
        key: "products/test.webp",
        body: buffer,
        contentType: "image/webp",
        isPublic: true,
      });

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(result.key).toBe("products/test.webp");
      expect(result.url).toBe(
        "https://storage.neon.tech/ecommerce/products/test.webp",
      );
      expect(result.size).toBe(buffer.length);
      expect(result.contentType).toBe("image/webp");
    });
  });

  describe("objectExists", () => {
    test("returns true when HeadObject succeeds", async () => {
      env.STORAGE_BUCKET = "ecommerce";
      mockS3Client.send.mockResolvedValueOnce({
        ContentLength: 1024,
        ContentType: "image/webp",
      });

      const exists = await objectExists("products/test.webp");
      expect(exists).toBe(true);
    });

    test("returns false when HeadObject throws NotFound", async () => {
      env.STORAGE_BUCKET = "ecommerce";
      const notFoundErr = new Error("Not Found");
      notFoundErr.name = "NotFound";
      notFoundErr.$metadata = { httpStatusCode: 404 };
      mockS3Client.send.mockRejectedValueOnce(notFoundErr);

      const exists = await objectExists("products/missing.webp");
      expect(exists).toBe(false);
    });
  });

  describe("deleteObject", () => {
    test("sends DeleteObjectCommand with bucket and key", async () => {
      env.STORAGE_BUCKET = "ecommerce";
      mockS3Client.send.mockResolvedValueOnce({});

      await deleteObject("products/old.webp");
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });
  });
});
