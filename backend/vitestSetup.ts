import { vi } from "vitest";

vi.mock("./utils/cloudinaryHelper.js", () => ({
  uploadImages: vi.fn().mockImplementation(async (images) => {
    return images.map((_: unknown, idx: number) => ({
      url: `https://fake-cloudinary.com/image${idx}.jpg`,
      cloudinaryPublicId: `fake-public-id-${idx}`,
      orderIndex: idx,
    }));
  }),
  deleteImages: vi.fn().mockResolvedValue(undefined),
}));
