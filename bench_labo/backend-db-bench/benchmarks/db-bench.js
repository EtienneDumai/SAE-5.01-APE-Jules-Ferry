import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

const target = __ENV.TARGET; // ex: http://db-bench-app:3000/mysql/products

export default function () {
  const offset = Math.floor(Math.random() * 5000);
  const res = http.get(`${target}?limit=20&offset=${offset}`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}
