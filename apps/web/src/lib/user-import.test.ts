import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import db from "./prisma";
import { importUsersFromCsv } from "./user-import";

// Mock the prisma client for transactional logic
vi.mock("./prisma", () => ({
	default: {
		$transaction: vi.fn(),
	},
}));

describe("user-import.ts - importUsersFromCsv", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should correctly parse and import valid user data via a transaction", async () => {
		const csvContent = `FirstName,LastName,Email,Role
John,Doe,john@example.com,ADMIN
Jane,Smith,jane@example.com,USER`;

		// Mock the upsert logic within the transaction
		const mockUpsert = vi.fn().mockImplementation((args) => ({
			id: "test-cuid",
			email: args.where.email,
			firstName: args.create.firstName,
			lastName: args.create.lastName,
			role: args.create.role,
		}));

		const mockTx = {
			preRegisteredUser: {
				upsert: mockUpsert,
			},
		};

		// Mock db.$transaction to execute the callback with our mock transaction object
		vi.mocked(db.$transaction).mockImplementation(async (callback) => {
			return await (callback as (tx: typeof mockTx) => Promise<unknown>)(
				mockTx,
			);
		});

		const result = (await importUsersFromCsv(csvContent)) as {
			email: string;
			firstName: string;
			lastName: string;
			role: Role;
		}[];

		// Assertions
		expect(db.$transaction).toHaveBeenCalled();
		expect(mockUpsert).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(2);

		expect(result[0]).toMatchObject({
			email: "john@example.com",
			firstName: "John",
			lastName: "Doe",
			role: Role.ADMIN,
		});

		expect(result[1]).toMatchObject({
			email: "jane@example.com",
			firstName: "Jane",
			lastName: "Smith",
			role: Role.USER,
		});
	});

	it("should fail and throw an error if CSV headers are missing", async () => {
		// Missing 'Role' header
		const invalidCsv = `FirstName,LastName,Email
John,Doe,john@example.com`;

		await expect(importUsersFromCsv(invalidCsv)).rejects.toThrow(
			/Missing required headers/,
		);
		expect(db.$transaction).not.toHaveBeenCalled();
	});

	it("should fail and throw an error if an invalid role is provided", async () => {
		const invalidRoleCsv = `FirstName,LastName,Email,Role
John,Doe,john@example.com,GHOST_ROLE`;

		await expect(importUsersFromCsv(invalidRoleCsv)).rejects.toThrow(
			/Invalid role/,
		);
		expect(db.$transaction).not.toHaveBeenCalled();
	});

	it("should fail and throw an error if a row is malformed", async () => {
		const malformedCsv = `FirstName,LastName,Email,Role
John,Doe,john@example.com,ADMIN
Jane,Smith`; // Missing columns

		await expect(importUsersFromCsv(malformedCsv)).rejects.toThrow(
			/Line 3 is malformed/,
		);
		expect(db.$transaction).not.toHaveBeenCalled();
	});

	it("should be case-insensitive for headers and handle whitespace", async () => {
		const messyCsv = ` firstname , LASTNAME , email , role 
		John , Doe , JOHN@EXAMPLE.COM , admin `;

		const mockUpsert = vi.fn().mockImplementation((args) => ({
			email: args.where.email,
			firstName: args.create.firstName,
			lastName: args.create.lastName,
			role: args.create.role,
		}));

		const mockTx = {
			preRegisteredUser: {
				upsert: mockUpsert,
			},
		};

		vi.mocked(db.$transaction).mockImplementation(async (callback) => {
			return await (callback as (tx: typeof mockTx) => Promise<unknown>)(
				mockTx,
			);
		});

		const result = (await importUsersFromCsv(messyCsv)) as {
			email: string;
			firstName: string;
			lastName: string;
			role: Role;
		}[];

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			email: "john@example.com",
			firstName: "John",
			lastName: "Doe",
			role: Role.ADMIN,
		});
	});
});
