import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://server.bpapp.local';

export const options = {
    scenarios: {
        spike_test: {
            executor: 'ramping-arrival-rate',
            timeUnit: '1s',
            preAllocatedVUs: 100,
            maxVUs: 500, 
            stages: [
                { target: 5, duration: '20s' },
                { target: 50, duration: '50s' },
                { target: 5, duration: '20s' },
                { target: 0, duration: '30s' },
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
