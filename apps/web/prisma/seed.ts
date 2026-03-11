import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostStatus, PrismaClient, Role } from "@prisma/client";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Starting seeding...");

	// Cleanup
	await prisma.bannedWord.deleteMany();
	await prisma.allowedIP.deleteMany();
	await prisma.comment.deleteMany();
	await prisma.post.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();

	console.log("🧹 Database cleaned.");

	// Seed Banned Words
	const bannedWords = ["badword1", "badword2", "toxic", "spam", "abuse"];
	await prisma.bannedWord.createMany({
		data: bannedWords.map((word) => ({ word })),
	});
	console.log(`🚫 Seeded ${bannedWords.length} banned words.`);

	// Seed Allowed IPs (CIDR)
	const allowedIPs = [
		{ cidr: "127.0.0.1/32", description: "Localhost" },
		{ cidr: "192.168.1.0/24", description: "Internal Network" },
		{ cidr: "10.0.0.0/8", description: "Campus Wi-Fi" },
	];
	await prisma.allowedIP.createMany({
		data: allowedIPs,
	});
	console.log(`🌐 Seeded ${allowedIPs.length} allowed IP ranges.`);

	// Seed Admin
	const admin = await prisma.user.create({
		data: {
			email: "admin@mds.com",
			name: "Admin User",
			role: Role.ADMIN,
			emailVerified: true,
		},
	});
	console.log(`👑 Seeded admin: ${admin.email}`);

	// Seed Moderator
	const moderator = await prisma.user.create({
		data: {
			email: "mod@mds.com",
			name: "Moderator User",
			role: Role.MODERATOR,
			emailVerified: true,
		},
	});
	console.log(`🛡️ Seeded moderator: ${moderator.email}`);

	// Seed VIP
	const vip = await prisma.user.create({
		data: {
			email: "vip@mds.com",
			name: "VIP User",
			role: Role.VIP,
			emailVerified: true,
		},
	});
	console.log(`⭐ Seeded VIP: ${vip.email}`);

	// Seed Standard Users
	const users = [];
	for (let i = 0; i < 5; i++) {
		const user = await prisma.user.create({
			data: {
				email: faker.internet.email().toLowerCase(),
				name: faker.person.fullName(),
				role: Role.USER,
				emailVerified: faker.datatype.boolean(),
			},
		});
		users.push(user);
	}
	console.log(`👥 Seeded ${users.length} standard users.`);

	// Seed Posts
	const allUsers = [admin, moderator, vip, ...users];
	const posts = [];
	const now = new Date();
	for (let i = 0; i < 200; i++) {
		const author = faker.helpers.arrayElement(allUsers);
		const createdAt = new Date(now.getTime() - i * 1000 * 60 * 10); // Spaced by 10 minutes
		const post = await prisma.post.create({
			data: {
				content: faker.lorem.paragraphs(2),
				status: faker.helpers.arrayElement([
					PostStatus.PUBLISHED,
					PostStatus.PUBLISHED,
					PostStatus.PUBLISHED,
					PostStatus.FLAGGED,
					PostStatus.HIDDEN,
				]),
				isToxic: faker.datatype.boolean({ probability: 0.1 }),
				authorId: author.id,
				createdAt,
			},
		});
		posts.push(post);
	}
	console.log(`📝 Seeded ${posts.length} posts.`);

	// Seed Comments
	const comments = [];
	for (let i = 0; i < 400; i++) {
		const author = faker.helpers.arrayElement(allUsers);
		const post = faker.helpers.arrayElement(posts);
		const comment = await prisma.comment.create({
			data: {
				content: faker.lorem.sentence(),
				isToxic: faker.datatype.boolean({ probability: 0.05 }),
				postId: post.id,
				authorId: author.id,
			},
		});
		comments.push(comment);
	}

	// Seed some nested comments (Replies)
	for (let i = 0; i < 100; i++) {
		const author = faker.helpers.arrayElement(allUsers);
		const parentComment = faker.helpers.arrayElement(comments);
		await prisma.comment.create({
			data: {
				content: faker.lorem.sentence(),
				isToxic: faker.datatype.boolean({ probability: 0.05 }),
				postId: parentComment.postId,
				authorId: author.id,
				parentId: parentComment.id,
			},
		});
	}
	console.log("💬 Seeded comments and replies.");

	console.log("✅ Seeding completed!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
