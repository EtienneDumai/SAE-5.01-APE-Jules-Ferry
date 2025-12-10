import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50,          // nb d'utilisateurs virtuels
    duration: '30s',  // durée du test
    // tu peux ajouter des thresholds ici si tu veux
};

const target = __ENV.TARGET; // on passera l'URL en variable d'env

export default function () {
    const res = http.get(target);

    check(res, {
        'status 200': (r) => r.status === 200,
    });

    sleep(1);
}