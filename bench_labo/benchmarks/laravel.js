import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,          // nombre d'utilisateurs virtuels
  duration: '30s',  // durée du test
};

export default function () {
  // URL VUE DEPUIS LE RÉSEAU DOCKER
  const res = http.get('http://backend-laravel:8000/api/ton-endpoint'); // à adapter

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}
