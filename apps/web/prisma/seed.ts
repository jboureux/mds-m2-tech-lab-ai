import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostStatus, PrismaClient, Role } from "@prisma/client";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w ]+/g, "")
		.replace(/ +/g, "-");
}

async function main() {
	console.log("🌱 Starting seeding...");

	// Cleanup in reverse order of dependencies
	await prisma.follow.deleteMany();
	await prisma.comment.deleteMany();
	await prisma.hashtag.deleteMany();
	await prisma.post.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();
	await prisma.bannedWord.deleteMany();
	await prisma.allowedIP.deleteMany();

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
			username: "debug-admin",
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
			username: "debug-mod",
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
			username: "debug-vip",
			role: Role.VIP,
			emailVerified: true,
		},
	});
	console.log(`⭐ Seeded VIP: ${vip.email}`);

	// Seed Standard Users
	const users = [];
	for (let i = 0; i < 8; i++) {
		const name = faker.person.fullName();
		const user = await prisma.user.create({
			data: {
				email: faker.internet.email().toLowerCase(),
				name,
				username: `${slugify(name)}-${faker.number.int(999)}`,
				role: Role.USER,
				emailVerified: faker.datatype.boolean(),
				bio: faker.lorem.sentence(),
			},
		});
		users.push(user);
	}
	console.log(`👥 Seeded ${users.length} standard users.`);

	const allUsers = [admin, moderator, vip, ...users];

	// Seed Follows
	for (const user of allUsers) {
		const toFollow = faker.helpers.arrayElements(
			allUsers.filter((u) => u.id !== user.id),
			{ min: 1, max: 3 }
		);
		
		for (const target of toFollow) {
			await prisma.follow.create({
				data: {
					followerId: user.id,
					followingId: target.id,
				}
			}).catch(() => {}); // Ignore duplicate follows
		}
	}
	console.log("🔗 Seeded social graph (follows).");

	// Seed Hashtags
	const hashtagNames = ["school", "tech", "homework", "party", "science", "sports", "coding", "nextjs"];
	const hashtags = [];
	for (const name of hashtagNames) {
		const tag = await prisma.hashtag.create({
			data: { name },
		});
		hashtags.push(tag);
	}
	console.log(`🏷️ Seeded ${hashtags.length} hashtags.`);

	// Seed Posts
	const posts = [];
	const now = new Date();
	for (let i = 0; i < 40; i++) {
		const author = faker.helpers.arrayElement(allUsers);
		const createdAt = new Date(now.getTime() - i * 1000 * 60 * 60); // Spaced by 60 minutes
		
		// Randomly pick 0-2 hashtags
		const postHashtags = faker.helpers.arrayElements(hashtags, { min: 0, max: 2 });
		
		const post = await prisma.post.create({
			data: {
				content: faker.lorem.paragraphs(1) + (postHashtags.length > 0 ? "\n\n" + postHashtags.map(h => `#${h.name}`).join(" ") : ""),
				status: faker.helpers.arrayElement([
					PostStatus.PUBLISHED,
					PostStatus.PUBLISHED,
					PostStatus.PUBLISHED,
					PostStatus.FLAGGED,
				]),
				isToxic: faker.datatype.boolean({ probability: 0.05 }),
				authorId: author.id,
				createdAt,
				hashtags: {
					connect: postHashtags.map(h => ({ id: h.id })),
				}
			},
		});
		posts.push(post);
	}
	console.log(`📝 Seeded ${posts.length} posts with hashtags.`);

	// Seed Comments
	const comments = [];
	for (let i = 0; i < 60; i++) {
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
	for (let i = 0; i < 15; i++) {
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
