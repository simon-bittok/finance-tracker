import { prisma } from "@utils/prisma.js";
import { auth } from "@/utils/auth.js";

export async function seed() {
	console.log("Seeding test data...");

	const user = await prisma.user.create({
		data: {
			name: "Test Finance",
			email: "test_user1@mail.com",
			id: "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg",
		},
	});

	await prisma.account.create({
		data: {
			password:
				"35f1c0ffcd495fbba34560c1334316d5:136156863d3ed3df2c55a444b73fd516f83ed4ee0eb6b812d7bc6a74dd516dea06225453ad6b3cfb1071c232b8bd6c25b796e941b3abb7f9736f31e891957cdf",
			providerId: "credential",
			userId: "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg",
			accountId: "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg",
			id: "jDDQKhn3JOhvXqJwZZXXq9vfxWWnDsGZ",
		},
	});

	await prisma.category.createMany({
		data: [
			{
				id: "cmhorgpet000034ucpgfadrkj",
				name: "Food & Dining",
				icon: "beef-steak",
				type: "EXPENSE",
				userId: user.id,
			},
			{
				id: "cmhorgpet000134uc0y6x2phj",
				name: "Bills & Utilities",
				icon: "credit-card",
				type: "EXPENSE",
				userId: user.id,
			},
			{
				id: "cmhorgpet000234ucpgpk6k78",
				name: "Salary",
				icon: "money-bag",
				type: "INCOME",
				userId: user.id,
			},
			{
				id: "cmhorgpet000334ucyllo6vhh",
				name: "Freelancing",
				icon: "cable",
				type: "INCOME",
				userId: user.id,
			},
		],
	});

	console.log("Seeding completed");
}

seed()
	.then(() => {
		console.log("Seeding success");
	})
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
