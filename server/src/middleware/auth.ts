import { eq } from "../../../database/node_modules/drizzle-orm";
import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { usersTable, type User } from "../../../database/schema";


export const createAuthMiddleware = (db: any, sessions: Map<string, string>) => {
	return async (c: Context, next: Next) => {
		const sessionId = getCookie(c, 'sessionId');
		if (!sessionId || !sessions.has(sessionId)) return c.json({ error: 'Unauthorized' }, 401);
		const user = (await db.select().from(usersTable).where(
			eq(usersTable.id, Number(sessions.get(sessionId)))
		).then((rows: User[]) => rows[0] as User | undefined));
		if (!user) return c.json({ error: 'Unauthorized' }, 401);
		c.set("user", user); 
		await next();
	};
};
