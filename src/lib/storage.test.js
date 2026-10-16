import { describe, it, expect, beforeEach } from "vitest";
import { readToken, writeToken, eraseToken } from "./storage.js";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("returns null when no token is stored", () => {
    expect(readToken()).toBeNull();
  });

  it("round-trips a token through write and read", () => {
    writeToken("abc123");
    expect(readToken()).toBe("abc123");
  });

  it("erases the stored token", () => {
    writeToken("abc123");
    eraseToken();
    expect(readToken()).toBeNull();
  });

  it("overwrites an existing token", () => {
    writeToken("first");
    writeToken("second");
    expect(readToken()).toBe("second");
  });
});
