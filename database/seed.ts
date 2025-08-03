import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

export const db = drizzle(String(Bun.env.DATABASE_URL));
await db.insert(schema.ordersTable).values([
	{
		orderNumber: "234567890",
		email: "test@test.com",
		paidAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		orderStatus: "paid",
		products: [
			{ id: "123", name: "Test", quantity: 1, price: 100 },
			{ id: "234", name: "Test2", quantity: 2, price: 450 }
		]
	},
	{
		orderNumber: "123456789",
		email: "test@test.com",
		paidAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		orderStatus: "paid",
		products: [
			{ id: "345", name: "Test3", quantity: 1, price: 100 },
			{ id: "234", name: "Test2", quantity: 2, price: 450 }
		]
	}
]);

await db.insert(schema.usersTable).values([
	{
		email: "test@test.com",
		password: await Bun.password.hash("test")
	}
]);
console.log(`Seeding complete...`);