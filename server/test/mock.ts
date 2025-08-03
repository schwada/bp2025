import type { Context } from "hono";

export const createMockContext = (overrides: any = {}) => {
	let responseData: any = null;
	let responseStatus: number = 200;  
	const mockContext = {
	  req: {
		query: () => overrides.query || {},
		param: () => overrides.param || {},
		json: async () => overrides.body || {},
		raw: async () => overrides.raw || {}
	  },
	  json: (data: any, status?: number) => {
		responseData = data;
		responseStatus = status || 200;
		return { _data: data, _status: status };
	  },
	  status: (code: number) => {
		responseStatus = code;
		return { _status: code };
	  },
	  get: (key: string) => overrides.user || null,
	  set: () => {},
	  getResponseData: () => responseData,
	  getResponseStatus: () => responseStatus
	} as any as Context;
	return mockContext;
  };
  
export const createMockDb = (overrides: any = {}) => {
	return {
	  select: () => ({
		from: () => ({
		  where: () => ({
			then: (callback: any) => Promise.resolve(overrides.selectResult || [])
		  })
		}),
		orderBy: () => Promise.resolve(overrides.selectAllResult || [])
	  }),
	  insert: () => ({
		values: () => ({
		  returning: () => Promise.resolve(overrides.insertResult || [])
		})
	  }),
	  update: () => ({
		set: () => ({
		  where: () => Promise.resolve(overrides.updateResult || [])
		})
	  })
	};
  };
  