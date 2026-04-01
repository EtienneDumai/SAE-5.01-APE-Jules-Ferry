#!/bin/bash

# Renouvellement silencieux
certbot renew --quiet

# Reload nginx dans le conteneur (IMPORTANT)
docker exec app_nginx_front nginx -s reload