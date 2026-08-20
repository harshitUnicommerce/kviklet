import { describe, expect, it, afterEach, vi } from "vitest";
import { randomRef } from "./useLiveSession";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("randomRef", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when it is available", () => {
    const randomUUID = vi.fn(() => "11111111-1111-4111-8111-111111111111");
    vi.stubGlobal("crypto", { ...crypto, randomUUID });

    expect(randomRef()).toBe("11111111-1111-4111-8111-111111111111");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  // Regression: over plain HTTP on a non-localhost host the page is not a
  // secure context and crypto.randomUUID is undefined, which used to throw
  // "crypto.randomUUID is not a function" on every keystroke in the console.
  it("returns a v4 UUID in an insecure context", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    });

    expect(randomRef()).toMatch(UUID_V4);
  });

  it("returns distinct values in an insecure context", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    });

    const refs = new Set(Array.from({ length: 100 }, randomRef));

    expect(refs.size).toBe(100);
  });
});
