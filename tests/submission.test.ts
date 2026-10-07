import { test } from "node:test";
import assert from "node:assert/strict";
import { imageFileSchema, submissionSchema } from "../lib/submission-schema";

test("validation identifies each overlong field without claiming content is missing", () => {
  const invalid = submissionSchema.safeParse({
    category: "job",
    text: "A real rejection",
    company: "x".repeat(81),
    caption: "x".repeat(281),
    displayName: "x".repeat(41),
  });
  assert.equal(invalid.success, false);
  if (invalid.success) return;
  assert.deepEqual(invalid.error.issues.map((i) => i.path[0]).sort(), [
    "caption",
    "company",
    "displayName",
  ]);
  assert.ok(invalid.error.issues.every((i) => /characters/.test(i.message)));
});
test("empty content has a field-level error and WebP matches the advertised upload policy", () => {
  const empty = submissionSchema.safeParse({ category: "job", text: "  " });
  assert.equal(empty.success, false);
  if (!empty.success) assert.equal(empty.error.issues[0].path[0], "text");
  assert.equal(
    imageFileSchema.safeParse(new File(["image"], "test.webp", { type: "image/webp" }))
      .success,
    true,
  );
  assert.equal(
    imageFileSchema.safeParse(
      new File(["image"], "test.svg", { type: "image/svg+xml" }),
    ).success,
    false,
  );
});
