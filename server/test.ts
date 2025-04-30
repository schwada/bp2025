import { Hono, type Next, type Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors'
import { EventType } from '../database/schema';
import { drizzle } from 'drizzle-orm/bun-sql';

const app = new Hono();
const sessions = new Map<string, string>();

const DEMO_USER = {
    email: 'test@test.com',
    password: 'test',
};

app.use(
	'/api/*',
	cors({ origin: 'http://localhost:5173', credentials: true })
)


const db = drizzle(String(Bun.env.DATABASE_URL));


const authMiddleware = async (c: Context, next: Next) => {
	const sessionId = getCookie(c, 'sessionId');
	if (!sessionId || !sessions.has(sessionId)) {
		console.log('Middleware: Unauthorized');
		return c.json({ error: 'Unauthorized' }, 401);
	}
	const username = sessions.get(sessionId);
	c.set("user", { username }); // Make user info available via c.get('user')
	console.log('Middleware: Authorized user:', username);
	await next(); // Proceed to the protected route handler
}



app.get('/', (c) => c.json({ message: 'Hello World' }));

app.get('/api/order', (c) => {
	const { email, orderNumber } = c.req.query();
	console.log(email, orderNumber);

	return c.json({ 
		orderNumber: orderNumber,
		email: email,
		createdAt: new Date().toISOString(),
		paidAt: new Date().toISOString(),
		products: [
			{id: 555, name: "hello", "desc": "", price: 444.7 },
			{id: 575, name: "hello", "desc": "", price: 444.7 },
			{id: 5665, name: "hello", "desc": "", price: 444.7 },
		]
	});
});

app.post('/api/order', async (c) => {
	const { email, orderNumber } = c.req.query();
	const { products } = await c.req.json();
	console.log(email, orderNumber, products);

	const returnrequestid = "1234567890";

	// return empty status
	c.status(200);
	return c.json({ id: returnrequestid });
});


app.get('/api/request/:id', (c) => {
	const { id } = c.req.param();

	const returnrequest = {
		id: id,
		orderNumber: "1234567890",
		email: "test@test.com",
		createdAt: new Date().toISOString(),
		products: [
			{id: 555, name: "hello", "desc": "", price: 444.7 },
			{id: 575, name: "hello", "desc": "", price: 444.7 },
			{id: 5665, name: "hello", "desc": "", price: 444.7 },
		],
		events: [
			{ date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE },
			{ date: new Date().toISOString(), type: EventType.PACKAGE_RECEIVED },
		]
	};
	return c.json(returnrequest);
});

app.get('/api/requests', (c) => {
    const mockRequests = [
        {
            id: "req_001",
            orderNumber: "ORD123456",
            email: "customer1@example.com",
            createdAt: new Date().toISOString(),
            products: [
                {id: 555, name: "Product A", desc: "Description for Product A", price: 99.99},
                {id: 556, name: "Product B", desc: "Description for Product B", price: 149.99}
            ],
            events: [
                { date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE },
                { date: new Date().toISOString(), type: EventType.PACKAGE_RECEIVED }
            ]
        },
        {
            id: "req_002",
            orderNumber: "ORD789012",
            email: "customer2@example.com",
            createdAt: new Date().toISOString(),
            products: [
                {id: 557, name: "Product C", desc: "Description for Product C", price: 199.99}
            ],
            events: [
                { date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE }
            ]
        },
        {
            id: "req_003",
            orderNumber: "ORD345678",
            email: "customer3@example.com",
            createdAt: new Date().toISOString(),
            products: [
                {id: 558, name: "Product D", desc: "Description for Product D", price: 299.99},
                {id: 559, name: "Product E", desc: "Description for Product E", price: 399.99}
            ],
            events: [
                { date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE },
                { date: new Date().toISOString(), type: EventType.PACKAGE_RECEIVED },
                { date: new Date().toISOString(), type: EventType.WAITING_FOR_REFUND }
            ]
        }
    ];
    return c.json(mockRequests);
});


// POST /api/requests/:id/event
app.use('/api/requests/:id/event', authMiddleware);
app.post('/api/requests/:id/event', async (c: Context) => {
	const { id } = c.req.param();
	const { eventType } = await c.req.json();
	console.log(id, eventType);
	return c.json({ message: 'Event added' });
});


// GET /api/requests/:id
app.use('/api/requests/:id', authMiddleware);
app.get('/api/requests/:id', async (c: Context) => {
	const { id } = c.req.param();
	return c.json({
        id: id,
        orderNumber: "ORD123456",
        email: "customer1@example.com",
        createdAt: new Date().toISOString(),
        products: [
            {id: 555, name: "Product A", desc: "Description for Product A", price: 99.99},
            {id: 556, name: "Product B", desc: "Description for Product B", price: 149.99}
        ],
        events: [
            { date: new Date().toISOString(), type: EventType.WAITING_FOR_PACKAGE },
            { date: new Date().toISOString(), type: EventType.PACKAGE_RECEIVED }
        ]
    });
});




// AUTH
app.post('/api/auth/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        console.log('Login attempt:', { email });
        // VERY simple credential check (replace with real logic)
		console.log(email, password);
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
            const sessionId = (crypto as any).randomUUID(); // Generate a unique session ID
            sessions.set(sessionId, email); // Store session
            console.log('Login successful, session created:', sessionId, 'for user:', email);
            setCookie(c, 'sessionId', sessionId, { path: '/', httpOnly: true, sameSite: 'Lax', maxAge: 60 * 60 * 24 });
            return c.json({ message: 'Login successful', user: { email } });
        } else {
            console.log('Login failed: Invalid credentials');
            return c.json({ error: 'Invalid credentials' }, 401);
        }
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

// POST /api/logout
app.use('/api/auth/logout', authMiddleware);
app.post('/api/auth/logout', async (c) => {
    const sessionId = getCookie(c, 'sessionId');
    console.log('Logout attempt for session:', sessionId);
    if (sessionId && sessions.has(sessionId)) sessions.delete(sessionId);
    deleteCookie(c, 'sessionId', { path: '/', httpOnly: true, sameSite: 'Lax' });
    return c.json({ message: 'Logout successful' });
});

// GET /api/me (Check authentication status) - Protected
// This endpoint relies on the middleware running first
app.use('/api/auth/me', authMiddleware);
app.get('/api/auth/me', (c: Context) => {
    const user = c.get('user'); // Get user from context (set by middleware)
    console.log('/api/auth/me called, user from context:', user);
    if (user) return c.json({ user });
    return c.json({ error: 'Not authenticated' }, 401);
});

// Example protected data endpoint
app.use('/api/protected/data', authMiddleware);
app.get('/api/protected/data', (c: Context) => {
    const user = c.get('user');
    return c.json({ data: `This is protected data for ${user?.username}`, user });
});



app.onError((err, c) => {
	console.error(err);
	return c.json({ message: 'Internal Server Error' }, 500);
});

export default app;