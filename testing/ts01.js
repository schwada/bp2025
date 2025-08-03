import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://server.bpapp.local';

export const options = {
	scenarios: {
		load_test: {
			executor: 'constant-arrival-rate',
			rate: 5,
			timeUnit: '1s', 
			duration: '5m',
			preAllocatedVUs: 50,
			maxVUs: 100,
		}
	}
};

export default function () {
	const getOrderRes = http.get(`${BASE_URL}/api/order?email=test@test.com&orderNumber=123456789`);
	check(getOrderRes, {'GET /api/order status is 200': (r) => r.status === 200,});

	const postOrderRes = http.post(`${BASE_URL}/api/request?email=test@test.com&orderNumber=123456789`, JSON.stringify({
		products: { 345: "too-small" }
	}));
	const id = postOrderRes.json().id;
	check(postOrderRes, {'POST /api/order status is 200': (r) => r.status === 200,});

	const getRequestRes = http.get(`${BASE_URL}/api/request/${id}`);
	check(getRequestRes, {'GET /api/request status is 200': (r) => r.status === 200,});

	sleep(0.1); 
}
