import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "./auth";
import { resend } from "./resend";

// Mock prisma and resend
vi.mock("./prisma", () => ({
  default: {
    preRegisteredUser: {
      findUnique: vi.fn(),
    },
    user: {
      create: vi.fn(),
    }
  },
}));

vi.mock("./resend", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("Auth - Better-Auth Config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have auth initialized", () => {
    expect(auth).toBeDefined();
    expect(auth.handler).toBeDefined();
    expect(auth.api).toBeDefined();
  });
});
