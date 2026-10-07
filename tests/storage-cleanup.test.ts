import { test } from "node:test";
import assert from "node:assert/strict";
import { deleteUploadedFiles } from "../lib/uploadthing-admin";

test("storage cleanup distinguishes a negative acknowledgement from confirmed success", async () => {
  assert.equal(
    await deleteUploadedFiles("test-key", {
      deleteFiles: async () => ({ success: false, deletedCount: 0 }),
    }),
    false,
  );
  assert.equal(
    await deleteUploadedFiles("test-key", {
      deleteFiles: async () => ({ success: true, deletedCount: 1 }),
    }),
    true,
  );
  assert.equal(
    await deleteUploadedFiles("test-key", {
      deleteFiles: async () => {
        throw new Error("offline");
      },
    }),
    false,
  );
});
