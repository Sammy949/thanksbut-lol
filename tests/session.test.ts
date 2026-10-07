import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { createSession, verifySession } from "../lib/session";
import {
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "../lib/admin-session";

describe("signed sessions", () => {
  const names = [
    "REACTION_SESSION_SECRET",
    "ADMIN_SESSION_SECRET",
    "ADMIN_PASSWORD",
  ] as const;
  const original = new Map(names.map((name) => [name, process.env[name]]));
  const now = 1_700_000_000_000;

  before(() => {
    process.env.REACTION_SESSION_SECRET = "test-only-anonymous-secret";
    process.env.ADMIN_SESSION_SECRET = "test-only-admin-secret";
    process.env.ADMIN_PASSWORD = "test-only-password";
  });

  after(() => {
    for (const name of names) {
      const value = original.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("recovers an issued anonymous session and rejects a changed identity", () => {
    const { sessionId, cookieValue } = createSession();
    assert.equal(verifySession(cookieValue), sessionId);
    assert.equal(verifySession(`changed-${cookieValue}`), null);
  });

  it("rejects missing, malformed, and incorrect anonymous signatures", () => {
    const { sessionId } = createSession();
    for (const cookie of [
      undefined,
      "",
      "missing-dot",
      ".signature",
      `${sessionId}.`,
      `${sessionId}.${"x".repeat(43)}`,
    ]) {
      assert.equal(verifySession(cookie), null);
    }
  });

  it("rejects multibyte anonymous signatures without throwing", () => {
    const { sessionId } = createSession();
    assert.equal(verifySession(`${sessionId}.${"é".repeat(43)}`), null);
  });

  it("accepts admin sessions only before expiry and rejects a changed expiry", () => {
    const { cookieValue } = createAdminSession(now);
    const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000;
    assert.equal(verifyAdminSession(cookieValue, now), true);
    assert.equal(verifyAdminSession(cookieValue, expiresAt - 1), true);
    assert.equal(verifyAdminSession(cookieValue, expiresAt), false);
    assert.equal(verifyAdminSession(cookieValue, expiresAt + 1), false);
    const signature = cookieValue.slice(cookieValue.lastIndexOf(".") + 1);
    assert.equal(verifyAdminSession(`${expiresAt + 1000}.${signature}`, now), false);
  });

  it("rejects missing, malformed, and incorrect admin signatures", () => {
    for (const cookie of [
      undefined,
      "",
      "missing-dot",
      ".signature",
      `${now}.`,
      `${now}.${"x".repeat(43)}`,
    ]) {
      assert.equal(verifyAdminSession(cookie, now), false);
    }
  });

  it("rejects multibyte admin signatures without throwing", () => {
    assert.equal(verifyAdminSession(`${now}.${"é".repeat(43)}`, now), false);
  });

  it("invalidates existing cookies when signing secrets rotate", () => {
    const anonymous = createSession();
    const admin = createAdminSession(now);
    process.env.REACTION_SESSION_SECRET = "test-only-rotated-anonymous-secret";
    process.env.ADMIN_SESSION_SECRET = "test-only-rotated-admin-secret";
    try {
      assert.equal(verifySession(anonymous.cookieValue), null);
      assert.equal(verifyAdminSession(admin.cookieValue, now), false);
    } finally {
      process.env.REACTION_SESSION_SECRET = "test-only-anonymous-secret";
      process.env.ADMIN_SESSION_SECRET = "test-only-admin-secret";
    }
  });

  it("rejects incorrect password types and denies access when unconfigured", () => {
    assert.equal(verifyAdminPassword("test-only-password"), true);
    for (const candidate of [undefined, null, 123, "", "wrong-password"]) {
      assert.equal(verifyAdminPassword(candidate), false);
    }
    delete process.env.ADMIN_PASSWORD;
    try {
      assert.equal(verifyAdminPassword("test-only-password"), false);
    } finally {
      process.env.ADMIN_PASSWORD = "test-only-password";
    }
  });
});
