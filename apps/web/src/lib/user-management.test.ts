import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import db from "./prisma";
import { preRegisterUser } from "./user-management";

// Mock the prisma client
vi.mock("./prisma", () => ({
	default: {
		preRegisteredUser: {
			upsert: vi.fn(),
		},
	},
}));

describe("user-management.ts - preRegisterUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should correctly upsert a new pre-registered user with a provided role", async () => {
		const userData = {
			email: "TEST@EXAMPLE.COM",
			firstName: "John",
			lastName: "Doe",
			role: Role.ADMIN,
		};

		const mockUpsert = vi.fn().mockImplementation((args) => ({
			id: "cuid-test",
			email: args.where.email,
			firstName: args.create.firstName,
			lastName: args.create.lastName,
			role: args.create.role,
		}));

		vi.mocked(db.preRegisteredUser.upsert).mockImplementation(mockUpsert);

		const result = await preRegisterUser(userData);

		expect(db.preRegisteredUser.upsert).toHaveBeenCalledWith({
			where: { email: "test@example.com" },
			update: {
				firstName: "John",
				lastName: "Doe",
				role: Role.ADMIN,
			},
			create: {
				email: "test@example.com",
				firstName: "John",
				lastName: "Doe",
				role: Role.ADMIN,
			},
		});

		expect(result).toMatchObject({
			email: "test@example.com",
			firstName: "John",
			lastName: "Doe",
			role: Role.ADMIN,
		});
	});

	it("should default to Role.USER if no role is provided", async () => {
		const userData = {
			email: "jane@example.com",
			firstName: "Jane",
			lastName: "Smith",
		};

		const mockUpsert = vi.fn().mockImplementation((args) => ({
			id: "cuid-test",
			email: args.where.email,
			firstName: args.create.firstName,
			lastName: args.create.lastName,
			role: args.create.role,
		}));

		vi.mocked(db.preRegisteredUser.upsert).mockImplementation(mockUpsert);

		const result = await preRegisterUser(userData);

		expect(db.preRegisteredUser.upsert).toHaveBeenCalledWith({
			where: { email: "jane@example.com" },
			update: {
				firstName: "Jane",
				lastName: "Smith",
				role: Role.USER,
			},
			create: {
				email: "jane@example.com",
				firstName: "Jane",
				lastName: "Smith",
				role: Role.USER,
			},
		});

		expect(result.role).toBe(Role.USER);
	});
});
