import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://server.bpapp.local';

export const options = {
    scenarios: {
        stress_test: {
            executor: 'ramping-arrival-rate',
            startRate: 1,
            timeUnit: '1s',
            preAllocatedVUs: 50, 
            maxVUs: 500,
            stages: [
                { target: 5, duration: '1m' },
                { target: 10, duration: '1m' },
                { target: 25, duration: '1m' },
                { target: 50, duration: '1m' },
                { target: 0, duration: '1m' },
            ],
        },
    }
};


export default function () {
    sleep(0.1);
	const getOrderRes = http.get(`${BASE_URL}/api/order?email=test@test.com&orderNumber=123456789`);
	check(getOrderRes, {'GET /api/order status is 200': (r) => r.status === 200,});

    sleep(0.1);
	const postOrderRes = http.post(`${BASE_URL}/api/request?email=test@test.com&orderNumber=123456789`, JSON.stringify({
		products: { 345: "too-small" }
	}));
	const id = postOrderRes.json().id;
	check(postOrderRes, {'POST /api/order status is 200': (r) => r.status === 200,});

	sleep(0.1); 
    const getRequestRes = http.get(`${BASE_URL}/api/request/${id}`);
	check(getRequestRes, {'GET /api/request status is 200': (r) => r.status === 200,});

}
