import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  requestCsrfCookie,
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "./auth.js";
import { writeToken } from "../lib/storage.js";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(status, body = {}) {
  const response = new Response(
    status === 204 ? null : JSON.stringify(body),
    { status },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => response),
  );
  return response;
}

describe("requestCsrfCookie", () => {
  it("hits the sanctum csrf-cookie endpoint with credentials", async () => {
    stubFetch(204);
    await requestCsrfCookie();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/sanctum/csrf-cookie",
      { credentials: "include" },
    );
  });

  it("throws when the response is not ok", async () => {
    stubFetch(500);
    await expect(requestCsrfCookie()).rejects.toThrow(
      "Could not get CSRF cookie.",
    );
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

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/login");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      email: "a@b.c",
      password: "secret",
    });
  });

  it("returns empty data when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not json", { status: 200 })),
    );

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

    const [, options] = fetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
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

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/logout");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer tok-7");
  });

  it("fetchCurrentUser GETs /user", async () => {
    stubFetch(200, { id: 1 });
    await fetchCurrentUser();

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/user");
    expect(options.method).toBeUndefined();
  });
});
