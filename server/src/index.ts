import { Hono, type Context, type TypedResponse } from 'hono';
import { cors } from 'hono/cors';
import { EventType, type Order, ordersTable, type Product, requestsTable, type ReturnRequest, type User, usersTable } from '../../database/schema';
import { drizzle } from '../../database/node_modules/drizzle-orm/bun-sql';
import { eq, and, desc } from '../../database/node_modules/drizzle-orm';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { createAuthMiddleware } from './middleware/auth';

export const database = drizzle(String(Bun.env.DATABASE_URL));
export const inMemorySessions = new Map<string, string>();

export const getOrderHandler = async (db: any, c: Context): Promise<TypedResponse<Order | { error: string }>> => {
	const { email, orderNumber }: Record<string, string> = c.req.query();
	if (!email || !orderNumber) return c.json({ error: 'Missing required parameters' }, 400);
	let order: Order | undefined;
	try {
		order = (await db.select().from(ordersTable).where(and(
			eq(ordersTable.email, email),
			eq(ordersTable.orderNumber, orderNumber))
		).then((rows: Order[]) => rows[0] as Order | undefined));
		if(Array.isArray(order) && order.length === 0) throw new Error();
		if (!order) throw new Error();
	} catch (error) {
		return c.json({ error: 'Could not find matching order' }, 500);
	}
	return c.json(order);
};

export const createRequestHandler = async (db: any, c: Context): Promise<TypedResponse<{ id: number } | { error: string }>> => {
	const { email, orderNumber }: Record<string, string> = c.req.query();
	if (!email || !orderNumber) return c.json({ error: 'Missing required parameters' }, 400);
	const { products }: Record<string, string[]> = await c.req.json();
	let createdReturnRequestId: number | undefined;
	try {
		const order: Order | undefined = (await db.select().from(ordersTable).where(and(
			eq(ordersTable.orderNumber, orderNumber),
			eq(ordersTable.email, email)
		)))[0] ?? undefined;
		if (!order) throw new Error();

		if (!products || products.length === 0) throw new Error();
		const productIds = Object.keys(products);
		const returningProducts = (order.products as Product[])
			.filter((product: Product) => productIds.includes(product.id.toString()));
		if (returningProducts.length !== productIds.length) throw new Error();

		createdReturnRequestId = (await db.insert(requestsTable).values({
			orderNumber: orderNumber,
			email: email,
			createdAt: new Date().toISOString(),
			products: returningProducts,
			events: [ { date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE } ],
		}).returning({ id: requestsTable.id }))[0]?.id ?? undefined;
		if (!createdReturnRequestId) throw new Error();
	} catch (error) {
		return c.json({ error: 'Could not create the return request' }, 500);
	}
	return c.json({ id: createdReturnRequestId });
};

export const getRequestHandler = async (db: any, c: Context): Promise<TypedResponse<ReturnRequest | { error: string }>> => {
	const { id }: Record<string, string> = c.req.param();
	if (!id) return c.json({ error: 'Missing required parameters' }, 400);
	let returnRequest: ReturnRequest | undefined;
	try {
		returnRequest = (await db.select().from(requestsTable).where(
			eq(requestsTable.id, Number(id))
		).then((rows: ReturnRequest[]) => rows[0] as ReturnRequest | undefined));
		if(Array.isArray(returnRequest) && returnRequest.length === 0) throw new Error();
		if (!returnRequest) throw new Error();
	} catch (error) {
		return c.json({ error: 'Could not find matching request' }, 404);
	}
	return c.json(returnRequest);
};

export const getRequestsHandler = async (db: any, c: Context): Promise<TypedResponse<ReturnRequest[] | { error: string }>> => {
	let returnRequests: ReturnRequest[];
	try {
		returnRequests = await db.select().from(requestsTable).orderBy(desc(requestsTable.createdAt));
	} catch (error) {
		return c.json({ error: 'Could not find matching requests' }, 500);
	}
	return c.json(returnRequests);
};

export const addEventHandler = async (db: any, c: Context) => {
	const { id }: Record<string, string> = c.req.param();
	const { eventType }: Record<string, string> = await c.req.json();
	if (!id || !eventType) return c.status(400);
	try {
		const request: ReturnRequest | undefined = await db.select().from(requestsTable).where(
			eq(requestsTable.id, Number(id))
		).then((rows: ReturnRequest[]) => rows[0] as ReturnRequest | undefined);
		if (!request) throw new Error();
		await db.update(requestsTable).set({
			events: [...request.events, { date: new Date().toISOString(), type: eventType }]
		}).where(eq(requestsTable.id, Number(id)));
	} catch (error) {
		return c.status(500);
	}
	return c.status(204);
};

export const loginHandler = async (db: any, sessions: Map<string, string>, c: Context) => {
	const { email, password } = await c.req.json();
	try {
		const user: User | undefined = (await db.select().from(usersTable).where(
			eq(usersTable.email, email)
		))[0] ?? undefined;
		if (!user || !await Bun.password.verify(password, user.password)) throw new Error();
		const sessionId = (crypto as any).randomUUID();
		sessions.set(sessionId, user.id.toString());
		setCookie(c, 'sessionId', sessionId, { path: '/', httpOnly: true, sameSite: 'Lax', maxAge: 60 * 60 * 24 });
		return c.json({ message: 'Login successful', user: { email } });
	} catch (error) {
		return c.json({ error: 'Login failed' }, 500);
	}
};

export const getMeHandler = (c: Context) => {
	const user = c.get('user');
	if (user) return c.json({ email: user.email, id: user.id });
	return c.json({ error: 'Not authenticated' }, 401);
};

export const logoutHandler = (sessions: Map<string, string>, c: Context) => {
	const sessionId = getCookie(c, 'sessionId');
	if (sessionId && sessions.has(sessionId)) sessions.delete(sessionId);
	deleteCookie(c, 'sessionId', { path: '/', httpOnly: true, sameSite: 'Lax' });
	return c.json({ message: 'Logout successful' });
};

function createApp(db: any, sessions: Map<string, string>) {
	const app = new Hono();
	const authMiddleware = createAuthMiddleware(db, sessions);

	app.use('*', cors({ 
		origin: [ 'http://localhost:5173', 'http://admin.bpapp.local', 'http://zakaznik.bpapp.local' ],
		credentials: true
	}))

	app.get('/api/order', (c) => getOrderHandler(db, c));
	app.post('/api/request', (c) => createRequestHandler(db, c));
	app.get('/api/request/:id', (c) => getRequestHandler(db, c));
	app.use('/api/requests', authMiddleware);
	app.get('/api/requests', (c) => getRequestsHandler(db, c));
	app.use('/api/requests/:id/event', authMiddleware);
	app.post('/api/requests/:id/event', (c) => addEventHandler(db, c));
	app.post('/api/auth/login', (c) => loginHandler(db, sessions, c));
	app.use('/api/auth/me', authMiddleware);
	app.get('/api/auth/me', getMeHandler);
	app.use('/api/auth/logout', authMiddleware);
	app.post('/api/auth/logout', (c) => logoutHandler(sessions, c));

	app.notFound((c) => c.json({ message: 'Not Found' }, 404));
	app.onError((err, c) => c.json({ message: 'Internal Server Error' }, 500));
}

export default createApp(database, inMemorySessions);