import { describe, it, expect, beforeEach, vi } from "vitest";
import { getHeaders } from "./headers.js";
import { readToken, writeToken } from "../lib/storage.js";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("getHeaders", () => {
  it("always sends the JSON accept header", () => {
    expect(getHeaders()).toMatchObject({ Accept: "application/json" });
  });

  it("omits Content-Type when not sending a body", () => {
    expect(getHeaders(false)).not.toHaveProperty("Content-Type");
  });

  it("adds Content-Type when json is true", () => {
    expect(getHeaders(true)).toHaveProperty(
      "Content-Type",
      "application/json",
    );
  });

  it("omits Authorization when no token is stored", () => {
    expect(getHeaders()).not.toHaveProperty("Authorization");
  });

  it("adds a Bearer token when one is stored", () => {
    writeToken("tok-1");
    expect(getHeaders()).toHaveProperty("Authorization", "Bearer tok-1");
  });

  it("reads the token from storage at call time", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem");
    getHeaders();
    expect(spy).toHaveBeenCalledWith("token");
    expect(readToken()).toBeNull();
  });
});
