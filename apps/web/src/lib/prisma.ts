import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const prismaClientSingleton = () => {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is not defined in environment variables");
	}

	const pool = new pg.Pool({ connectionString: databaseUrl });
	const adapter = new PrismaPg(pool);

	return new PrismaClient({ adapter });
};

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
