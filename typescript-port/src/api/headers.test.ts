import { describe, it, expect, beforeEach } from "vitest";
import { getHeaders } from "./headers";
import { writeToken } from "../lib/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("getHeaders", () => {
  it("always sends the JSON accept header", () => {
    expect(getHeaders()).toMatchObject({ Accept: "application/json" });
  });

  it("omits Content-Type when not sending a body", () => {
    expect(getHeaders(false)).not.toHaveProperty("Content-Type");
  });

  it("adds Content-Type when json is true", () => {
    expect(getHeaders(true)).toHaveProperty("Content-Type", "application/json");
  });

  it("omits Authorization when no token is stored", () => {
    expect(getHeaders()).not.toHaveProperty("Authorization");
  });

  it("adds a Bearer token when one is stored", () => {
    writeToken("tok-1");
    expect(getHeaders()).toHaveProperty("Authorization", "Bearer tok-1");
  });
});
