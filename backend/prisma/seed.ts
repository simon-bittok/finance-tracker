import type { PrismaClient } from "@prisma/client/extension";
import { AccountType, type TransactionType } from "@/generated/prisma/enums.js";

export async function seed(prisma: PrismaClient) {
	console.log("Seeding test data...");

	const user = await prisma.user.upsert({
		where: {
			id: "ITU2VHecgzOmw7fftiXq3oH8RzK9zRXg",
		},
		update: {},
		create: {
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

	const financialAccounts = [
		{
			id: "cmhorgpet000034ucpgfadrkj",
			name: "KCB Account",
			type: AccountType.BANK,
			userId: user.id,
			balance: 19500,
		},
		{
			id: "cmhorgpet000134uc0y6x2phj",
			name: "Mpesa",
			type: AccountType.MOBILE_MONEY,
			userId: user.id,
			balance: 14500,
		},
		{
			id: "cmhorgpet000234ucpgpk6k78",
			name: "Stanchart Savings Account",
			balance: 6850,
			type: AccountType.SAVINGS,
			userId: user.id,
		},
		{
			id: "cmhorgpet000334ucyllo6vhh",
			name: "Paypal",
			balance: 550,
			type: AccountType.WALLET,
			userId: user.id,
			currency: "USD",
		},
	];

	for (const acc of financialAccounts) {
		await prisma.financialAccount.create({
			data: acc,
		});
	}

	const categories = [
		{
			id: "cmhorgpet000034ucpgfadrkj",
			name: "Food & Dining",
			icon: "beef-steak",
			type: "EXPENSE" as TransactionType,
			userId: user.id,
		},
		{
			id: "cmhorgpet000134uc0y6x2phj",
			name: "Bills & Utilities",
			icon: "credit-card",
			type: "EXPENSE" as TransactionType,
			userId: user.id,
		},
		{
			id: "cmhorgpet000234ucpgpk6k78",
			name: "Salary",
			icon: "money-bag",
			type: "INCOME" as TransactionType,
			userId: user.id,
		},
		{
			id: "cmhorgpet000334ucyllo6vhh",
			name: "Freelancing",
			icon: "cable",
			type: "INCOME" as TransactionType,
			userId: user.id,
		},
	];

	for (const category of categories) {
		await prisma.category.create({
			data: category,
		});
	}

	await prisma.transaction.createMany({
		data: [
			{
				id: "cmhpyr3lo0000341mkyxfllsy",
				amount: 205.0,
				description: "Breakfast, Lunch & Supper",
				date: new Date("2025-09-30"),
				categoryId: "cmhorgpet000034ucpgfadrkj",
				userId: user.id,
				accountId: "cmhorgpet000034ucpgfadrkj",
			},
			{
				id: "cmhpyr3lo0000341rkyxfllsy",
				amount: 25.0,
				description: "Breakfast",
				date: new Date("2025-10-01"),
				categoryId: "cmhorgpet000034ucpgfadrkj",
				userId: user.id,
				accountId: "cmhorgpet000034ucpgfadrkj",
			},
			{
				id: "cmhpyr3lo0001341rlkdftg1g",
				amount: 120.0,
				description: "Lunch",
				date: new Date("2025-10-01"),
				categoryId: "cmhorgpet000034ucpgfadrkj",
				userId: user.id,
				accountId: "cmhorgpet000034ucpgfadrkj",
			},
			{
				id: "cmhpyr3lo0002341riaz080ct",
				amount: 150.0,
				description: "Supper",
				date: new Date("2025-10-01"),
				categoryId: "cmhorgpet000034ucpgfadrkj",
				userId: user.id,
				accountId: "cmhorgpet000134uc0y6x2phj",
			},
			{
				id: "cmhpyr3lo0003341rp9nvtr9y",
				categoryId: "cmhorgpet000234ucpgpk6k78",
				userId: user.id,
				amount: 65000,
				date: new Date("2025-10-01"),
				description: "Salary for period ending 30th September 2025",
				accountId: "cmhorgpet000034ucpgfadrkj",
			},
			{
				id: "cmhpyr3lo0004341rys4guiql",
				categoryId: "cmhorgpet000134uc0y6x2phj",
				date: new Date("2025-10-2"),
				userId: user.id,
				description: "Rent & Bills for period starting 1st October 2025",
				amount: 6500.0,
				accountId: "cmhorgpet000134uc0y6x2phj",
			},
		],
	});

	const savingGoals = [
		{
			id: "cmi1oxut4000134xotpi39uhj",
			targetAmount: 3525.65,
			name: "Holiday to Seychelles",
			deadline: new Date("2025-12-25"),
			isActive: true,
			icon: "beach",
			userId: user.id,
		},

		{
			id: "cmi1oxut4000124xotpi39uhj",
			targetAmount: 4500.0,
			name: "Education Fund",
			deadline: new Date("2026-01-15"),
			icon: "university",
			isActive: true,
			userId: user.id,
		},
	];

	for (const goal of savingGoals) {
		await prisma.savingGoal.upsert({
			where: {
				userId_name_targetAmount_deadline: {
					userId: goal.userId,
					targetAmount: goal.targetAmount,
					deadline: goal.deadline,
					name: goal.name,
				},
			},
			update: {},
			create: {
				id: goal.id,
				name: goal.name,
				icon: goal.icon,
				deadline: goal.deadline,
				isActive: goal.isActive,
				targetAmount: goal.targetAmount,
				user: {
					connect: {
						id: goal.userId,
					},
				},
			},
		});
	}

	console.log("Seeding completed");
}

// seed()
// 	.then(() => {
// 		console.log("Seeding success");
// 	})
// 	.catch((e) => {
// 		console.error(e);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});
