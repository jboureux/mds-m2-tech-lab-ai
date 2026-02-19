import { afterEach, describe, expect, it, vi } from "vitest";
import { getRuntimeConfig } from "./runtime-config";

describe("getRuntimeConfig", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	it("should return value from process.env on server", () => {
		// Mock server environment (window is undefined)
		vi.stubGlobal("window", undefined);
		vi.stubEnv("TEST_VAR", "server-value");

		expect(getRuntimeConfig("TEST_VAR")).toBe("server-value");
	});

	it("should return empty string if variable not found on server", () => {
		vi.stubGlobal("window", undefined);
		expect(getRuntimeConfig("MISSING_VAR")).toBe("");
	});

	it("should return value from window._runtime_config_ on client", () => {
		// Mock client environment
		vi.stubGlobal("window", {
			_runtime_config_: {
				TEST_VAR: "client-value",
			},
		});

		expect(getRuntimeConfig("TEST_VAR")).toBe("client-value");
	});

	it("should return empty string if variable not found on client", () => {
		vi.stubGlobal("window", {
			_runtime_config_: {},
		});
		expect(getRuntimeConfig("MISSING_VAR")).toBe("");
	});

	it("should return empty string if window._runtime_config_ is missing", () => {
		vi.stubGlobal("window", {});
		expect(getRuntimeConfig("TEST_VAR")).toBe("");
	});
});
