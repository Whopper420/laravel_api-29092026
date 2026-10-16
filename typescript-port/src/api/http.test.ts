import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiRequest } from "./http";
import { writeToken } from "../lib/storage";

type FetchArgs = [input: string, init?: RequestInit];

let fetchMock: ReturnType<typeof vi.fn<(...args: FetchArgs) => Promise<Response>>>;

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Pulls the init object of the most recent fetch call.
function lastInit(): RequestInit {
  const calls = fetchMock.mock.calls;
  const last = calls[calls.length - 1];
  if (!last) {
    throw new Error("fetch was never called");
  }
  return last[1] ?? {};
}

describe("apiRequest", () => {
  it("always sends credentials: include", async () => {
    await apiRequest("/api/posts");
    expect(lastInit().credentials).toBe("include");
  });

  it("omits method when none is given", async () => {
    await apiRequest("/api/posts");
    expect(lastInit().method).toBeUndefined();
  });

  it("passes through an explicit method", async () => {
    await apiRequest("/api/posts", { method: "DELETE" });
    expect(lastInit().method).toBe("DELETE");
  });

  it("JSON-encodes the body when provided", async () => {
    await apiRequest("/api/posts", {
      method: "POST",
      json: true,
      body: { title: "hi" },
    });
    const init = lastInit();
    expect(init.body).toBe(JSON.stringify({ title: "hi" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("leaves body undefined when not provided", async () => {
    await apiRequest("/api/posts");
    expect(lastInit().body).toBeUndefined();
  });

  it("attaches the stored token to headers", async () => {
    writeToken("tok-9");
    await apiRequest("/api/posts");
    const headers = lastInit().headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-9");
  });

  it("returns the raw fetch response", async () => {
    const response = await apiRequest("/api/posts");
    expect(response).toBeInstanceOf(Response);
  });
});
