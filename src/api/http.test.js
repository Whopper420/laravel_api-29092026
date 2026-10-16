import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiRequest } from "./http.js";
import { writeToken } from "../lib/storage.js";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("always sends credentials: include", async () => {
    await apiRequest("/api/posts");
    expect(fetch).toHaveBeenCalledWith(
      "/api/posts",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("omits method when none is given", async () => {
    await apiRequest("/api/posts");
    const options = fetch.mock.calls[0][1];
    expect(options.method).toBeUndefined();
  });

  it("passes through an explicit method", async () => {
    await apiRequest("/api/posts", { method: "DELETE" });
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
  });

  it("JSON-encodes the body when provided", async () => {
    await apiRequest("/api/posts", {
      method: "POST",
      json: true,
      body: { title: "hi" },
    });
    const options = fetch.mock.calls[0][1];
    expect(options.body).toBe(JSON.stringify({ title: "hi" }));
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("leaves body undefined when not provided", async () => {
    await apiRequest("/api/posts");
    expect(fetch.mock.calls[0][1].body).toBeUndefined();
  });

  it("attaches the stored token to headers", async () => {
    writeToken("tok-9");
    await apiRequest("/api/posts");
    const options = fetch.mock.calls[0][1];
    expect(options.headers.Authorization).toBe("Bearer tok-9");
  });

  it("returns the raw fetch response", async () => {
    const response = await apiRequest("/api/posts");
    expect(response).toBeInstanceOf(Response);
  });
});
