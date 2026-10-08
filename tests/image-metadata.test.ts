import { test } from "node:test";
import assert from "node:assert/strict";
import { uploadPayloadSchema } from "../lib/validation";
import { responseToArchive } from "../lib/archive-adapter";

const image = {
  url: "https://example.com/screenshot.webp",
  key: "synthetic-file",
  name: "screenshot.webp",
  size: 123,
  type: "image/webp",
  width: 1200,
  height: 600,
  blurDataUrl: "data:image/webp;base64,UklGRg==",
};

test("archive display retains image metadata and supports older entries", () => {
  const record = {
    id: "synthetic-post",
    category: "job" as const,
    reactions: 0,
    reacted: false,
    createdAt: 1,
  };
  const display = responseToArchive({ ...record, image });
  assert.equal(display.image, image.url);
  assert.equal(display.imageWidth, 1200);
  assert.equal(display.imageHeight, 600);
  assert.equal(display.blurDataUrl, image.blurDataUrl);
  const older = responseToArchive({
    ...record,
    image: { ...image, width: undefined, height: undefined, blurDataUrl: undefined },
  });
  assert.equal(older.image, image.url);
  assert.equal(older.blurDataUrl, undefined);
  assert.equal(responseToArchive(record).image, undefined);
});

test("upload previews accept bounded raster data and reject remote, SVG, malformed, and oversized values", () => {
  assert.equal(uploadPayloadSchema.safeParse(image).success, true);
  for (const blurDataUrl of [
    "https://example.com/preview.png",
    "data:image/svg+xml;base64,PHN2Zz4=",
    'data:image/webp;base64,invalid"value',
    `data:image/png;base64,${"A".repeat(4096)}`,
  ]) {
    assert.equal(
      uploadPayloadSchema.safeParse({ ...image, blurDataUrl }).success,
      false,
    );
  }
  assert.equal(
    uploadPayloadSchema.safeParse({ ...image, blurDataUrl: undefined }).success,
    true,
  );
});
