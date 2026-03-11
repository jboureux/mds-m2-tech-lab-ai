import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import "dotenv/config";
import { slugify } from "../src/lib/utils";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateWithUniqueUsername(userId: string, baseUsername: string) {
	let username = baseUsername;
	let counter = 1;
	let success = false;

	while (!success) {
		try {
			await prisma.user.update({
				where: { id: userId },
				data: { username },
			});
			console.log(`✅ Updated user ${userId} with username: ${username}`);
			success = true;
		} catch (error) {
			if (
				error instanceof Error &&
				(error as { code?: string }).code === "P2002"
			) {
				// Unique constraint violation
				username = `${baseUsername}${counter}`;
				counter++;
			} else {
				console.error(`❌ Failed to update user ${userId}:`, error);
				break;
			}
		}
	}
}

async function main() {
	console.log("🚀 Starting username backfill...");

	const users = await prisma.user.findMany({
		where: {
			OR: [{ username: null }, { username: "" }],
		},
	});

	console.log(`🔍 Found ${users.length} users without username.`);

	for (const user of users) {
		const baseName = user.name || user.email.split("@")[0];
		const baseUsername = slugify(baseName) || `user-${user.id.slice(0, 5)}`;
		await updateWithUniqueUsername(user.id, baseUsername);
	}

	console.log("✨ Backfill completed!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
