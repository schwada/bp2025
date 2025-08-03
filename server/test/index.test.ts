import { describe, it, expect, beforeEach } from "bun:test";
import { getOrderHandler, getRequestHandler, getRequestsHandler, addEventHandler, getMeHandler, logoutHandler } from "../src/index";
import { createMockDb, createMockContext } from "./mock";

describe("Route Handlers", () => {
	let mockDb: any;
	let mockSessions: Map<string, string>;

	beforeEach(() => {
		mockDb = createMockDb();
		mockSessions = new Map();
	});

	describe("getOrderHandler", () => {
		it("should return error when missing email parameter", async () => {
			const context = createMockContext({ query: { orderNumber: "123" } });
			const result = await getOrderHandler(mockDb, context);
			expect(result._data).toEqual({ error: "Missing required parameters" });
			expect(result._status).toBe(400);
		});

		it("should return error when missing orderNumber parameter", async () => {
			const context = createMockContext({ query: { email: "test@example.com" } });
			const result = await getOrderHandler(mockDb, context);
			expect(result._data).toEqual({ error: "Missing required parameters" });
			expect(result._status).toBe(400);
		});

		it("should return order when found", async () => {
			const mockOrder: any = [{ 
				id: 1, 
				email: "test@example.com", 
				orderNumber: "123",
				paidAt: "2024-01-01",
				createdAt: "2024-01-01",
				orderStatus: "PAID",
				products: []
			}];
			const dbWithOrder = createMockDb({ selectResult: mockOrder });
			const context = createMockContext({ 
				query: { email: "test@example.com", orderNumber: "123" } 
			});
			const result = await getOrderHandler(dbWithOrder, context);
			expect(result._data).toEqual(mockOrder);
		});

		it("should return error when order not found", async () => {
			const dbWithNoOrder = createMockDb({ selectResult: [] });
			const context = createMockContext({ 
				query: { email: "test@example.com", orderNumber: "123" } 
			});
			const result = await getOrderHandler(dbWithNoOrder, context);
			expect(result._data).toEqual({ error: "Could not find matching order" });
			expect(result._status).toBe(500);
		});
	});

	describe("getRequestHandler", () => {
		it("should return error when missing id parameter", async () => {
			const context = createMockContext({ param: {} });
			const result = await getRequestHandler(mockDb, context);
			expect(result._data).toEqual({ error: "Missing required parameters" });
			expect(result._status).toBe(400);
		});

		it("should return request when found", async () => {
			const mockRequest = { 
				id: 1, 
				orderNumber: "123", 
				email: "test@example.com",
				createdAt: "2024-01-01",
				products: [],
				events: []
			};
			const dbWithRequest = createMockDb({ selectResult: mockRequest });
			const context = createMockContext({ param: { id: "1" } });
			
			const result = await getRequestHandler(dbWithRequest, context);
			expect(result._data).toEqual(mockRequest);
		});

		it("should return error when request not found", async () => {
			const dbWithNoRequest = createMockDb({ selectResult: [] });
			const context = createMockContext({ param: { id: "1" } });
			
			const result = await getRequestHandler(dbWithNoRequest, context);
			expect(result._data).toEqual({ error: "Could not find matching request" });
			expect(result._status).toBe(404);
		});
	});

	describe("getRequestsHandler", () => {
		// it("should return all requests", async () => {
		// 	const mockRequests = [
		// 		{ id: 1, orderNumber: "123", email: "test@example.com", createdAt: "2024-01-01", products: [], events: [] },
		// 		{ id: 2, orderNumber: "456", email: "test@example.com", createdAt: "2024-01-01", products: [], events: [] }
		// 	];
		// 	const dbWithRequests = createMockDb({ selectAllResult: mockRequests });
		// 	const context = createMockContext();
			
		// 	const result = await getRequestsHandler(dbWithRequests, context);
		// 	expect(result._data).toEqual(mockRequests);
		// });

		it("should return error when database fails", async () => {
			const failingDb = {
				select: () => ({
					from: () => ({
						orderBy: () => Promise.reject(new Error("DB Error"))
					})
				})
			};
			const context = createMockContext();
			
			const result = await getRequestsHandler(failingDb, context);
			expect(result._data).toEqual({ error: "Could not find matching requests" });
			expect(result._status).toBe(500);
		});
	});

	describe("getMeHandler", () => {
		it("should return user when authenticated", () => {
			const mockUser = { email: "test@example.com", id: 1 };
			const context = createMockContext({ user: mockUser });
			
			const result = getMeHandler(context);
			expect(result._data).toEqual({ email: mockUser.email, id: mockUser.id });
		});

		it("should return error when not authenticated", () => {
			const context = createMockContext({ user: null });
			
			const result = getMeHandler(context);
			expect(result._data).toEqual({ error: "Not authenticated" });
			expect(result._status).toBe(401);
		});
	});

	describe("addEventHandler", () => {
		it("should return 400 when missing id parameter", async () => {
			const context = createMockContext({ 
				param: {},  body: { eventType: "COMPLETED" } 
			});
			
			await addEventHandler(mockDb, context);
			expect((context as any).getResponseStatus()).toBe(400);
		});

		it("should return 400 when missing eventType", async () => {
			const context = createMockContext({ 
				param: { id: "1" }, 
				body: {} 
			});
			
			await addEventHandler(mockDb, context);
			expect((context as any).getResponseStatus()).toBe(400);
		});

		it("should return 204 when event added successfully", async () => {
			const mockRequest = { 
				id: 1, 
				events: [{ date: "2024-01-01", type: "WAITING_FOR_PACKAGE" }] 
			};
			const dbWithRequest = createMockDb({ selectResult: mockRequest });
			const context = createMockContext({ 
				param: { id: "1" }, 
				body: { eventType: "COMPLETED" } 
			});
			
			await addEventHandler(dbWithRequest, context);
			expect((context as any).getResponseStatus()).toBe(204);
		});
	});
});
