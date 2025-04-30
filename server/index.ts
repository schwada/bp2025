import { z, createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { Hono, type TypedResponse } from 'hono';

const ParamsSchema = z.object({
  id: z.string().min(3).openapi({
    param: { name: 'id', in: 'path' },
    example: '1212121',
  }),
})

const UserSchema = z
  .object({
    id: z.string().openapi({ example: '123' }),
    name: z.string().openapi({ example: 'John Doe' }),
    age: z.number().openapi({ example: 42 }),
}).openapi('User');


const route = createRoute({
	method: 'get', path: '/users/{id}',
	request: { params: ParamsSchema },
	responses: {
	  200: { content: { 'application/json': { schema: UserSchema } }, description: 'Retrieve the user' },
	},
})

const app = new OpenAPIHono();

app.openapi(route, (c): TypedResponse<{ id: string; name: string; age: number }, 200, 'json'> => {
	
  const { id } = c.req.valid('param')
  return c.json({ id, age: 20, name: 'Ultra-man' }, 200)
})

app.doc('/doc', {
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'My API' },
})

app.get('/', (c) => {
	return c.json(app.getOpenAPIDocument({
		openapi: '3.0.0',
		info: { version: '1.0.0', title: 'My API' },
	}));
})

export default app;