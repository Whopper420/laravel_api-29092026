import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  requestCsrfCookie,
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "./auth";
import { writeToken } from "../lib/storage";

type FetchArgs = [input: string, init?: RequestInit];

let fetchMock: ReturnType<typeof vi.fn<(...args: FetchArgs) => Promise<Response>>>;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(status: number, body: unknown = {}): void {
  const text = status === 204 ? null : JSON.stringify(body);
  fetchMock = vi.fn(async () => new Response(text, { status }));
  vi.stubGlobal("fetch", fetchMock);
}

function lastCall(): { url: string; init: RequestInit } {
  const calls = fetchMock.mock.calls;
  const last = calls[calls.length - 1];
  if (!last) {
    throw new Error("fetch was never called");
  }
  return { url: String(last[0]), init: last[1] ?? {} };
}

describe("requestCsrfCookie", () => {
  it("hits the sanctum csrf-cookie endpoint with credentials", async () => {
    stubFetch(204);
    await requestCsrfCookie();
    const { url, init } = lastCall();
    expect(url).toBe("http://localhost:8000/sanctum/csrf-cookie");
    expect(init.credentials).toBe("include");
  });

  it("throws when the response is not ok", async () => {
    stubFetch(500);
    await expect(requestCsrfCookie()).rejects.toThrow("Could not get CSRF cookie.");
  });
});

describe("loginUser", () => {
  it("POSTs credentials and returns response + parsed data", async () => {
    stubFetch(200, { token: "tok-1", message: "welcome" });

    const { response, data } = await loginUser({
      email: "a@b.c",
      password: "secret",
    });

    expect(response.status).toBe(200);
    expect(data).toEqual({ token: "tok-1", message: "welcome" });

    const { url, init } = lastCall();
    expect(url).toBe("http://localhost:8000/api/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      email: "a@b.c",
      password: "secret",
    });
  });

  it("returns empty data when the body is not JSON", async () => {
    fetchMock = vi.fn(async () => new Response("not json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { data } = await loginUser({ email: "a@b.c", password: "x" });
    expect(data).toEqual({});
  });
});

describe("registerUser", () => {
  it("sends snake_case password_confirmation", async () => {
    stubFetch(201, { message: "created" });

    const { data } = await registerUser({
      name: "Ann",
      email: "ann@b.c",
      password: "pw",
      passwordConfirmation: "pw",
    });

    expect(data).toEqual({ message: "created" });

    const { init } = lastCall();
    expect(JSON.parse(String(init.body))).toEqual({
      name: "Ann",
      email: "ann@b.c",
      password: "pw",
      password_confirmation: "pw",
    });
  });
});

describe("logoutUser / fetchCurrentUser", () => {
  it("logoutUser POSTs to /logout with the stored token", async () => {
    stubFetch(200);
    writeToken("tok-7");
    await logoutUser();

    const { url, init } = lastCall();
    expect(url).toBe("http://localhost:8000/api/logout");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-7");
  });

  it("fetchCurrentUser GETs /user", async () => {
    stubFetch(200, { id: 1 });
    await fetchCurrentUser();

    const { url, init } = lastCall();
    expect(url).toBe("http://localhost:8000/api/user");
    expect(init.method).toBeUndefined();
  });
});
