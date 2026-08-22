import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m',  target: 500 },  // Scale up to 500 users
    { duration: '1m',  target: 1000 }, // Peak load 1,000 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of API requests must complete in < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be under 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8000/api/v1';

export function setup() {
  // Login to get bearer token
  const payload = {
    username: 'adminAcad01',
    password: 'adminAcad01',
  };
  const params = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
  const res = http.post(`${BASE_URL}/auth/login`, 'username=adminAcad01&password=adminAcad01', params);
  if (res.status === 200) {
    return { token: res.json('access_token') };
  }
  return { token: '' };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Load Documents List
  const docsRes = http.get(`${BASE_URL}/documents/`, params);
  check(docsRes, {
    'documents status is 200': (r) => r.status === 200,
    'documents response time < 500ms': (r) => r.timings.duration < 500,
  });

  // 2. Hybrid Vector Search Query
  const searchQuery = JSON.stringify({
    query: 'Database Operating Systems',
    sort_by: 'date',
  });
  const searchRes = http.post(`${BASE_URL}/search/query`, searchQuery, params);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
