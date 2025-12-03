#!/bin/bash

# Initial SSL Certificate Setup Script for ida.rw
# This script should be run once on the server to obtain the initial SSL certificate

set -e

DOMAIN="${DOMAIN_NAME:-ida.rw}"
EMAIL="${LETSENCRYPT_EMAIL:-pelmut2000@gmail.com}"
STAGING=0  # Set to 1 for testing, 0 for production

# Export environment variables needed by docker-compose.prod.yml
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-ipelino/ida-fleet}"

echo "### Initializing SSL certificate setup for $DOMAIN ###"

# Check if certificate exists and is valid (not dummy)
# We must check INSIDE the container because certbot_etc is a named volume
if docker compose -f docker-compose.prod.yml run --rm --entrypoint "test -d /etc/letsencrypt/live/$DOMAIN" certbot; then
  echo "Checking existing certificate for $DOMAIN..."
  
  # Check if it's a dummy certificate (Issuer contains "localhost")
  IS_DUMMY=$(docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -issuer" certbot | grep "localhost" || true)

  if [ -z "$IS_DUMMY" ]; then
    echo "Valid certificate for $DOMAIN already exists. Skipping initialization."
    exit 0
  else
    echo "Found dummy certificate (Issuer: localhost). Cleaning up to request real certificate..."
  fi
else
  echo "No existing certificate found for $DOMAIN."
fi

# Clean up any broken or dummy states
echo "### Cleaning up existing/broken certificates ###"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf && \
  rm -Rf /etc/letsencrypt/live/$DOMAIN-0001 && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN-0001 && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN-0001.conf" certbot

echo "### Creating directory structure for dummy certificate ###"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  mkdir -p /etc/letsencrypt/live/$DOMAIN" certbot

echo "### Creating dummy certificate for $DOMAIN ###"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Creating dummy chain.pem for SSL stapling ###"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/chain.pem" certbot

echo "### Starting nginx ###"
docker compose -f docker-compose.prod.yml up -d nginx

echo "### Waiting for nginx to start ###"
sleep 5

echo "### Deleting dummy certificate ###"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "### Requesting initial certificate from Let's Encrypt ###"
if [ $STAGING -eq 1 ]; then
  STAGING_ARG="--staging"
  echo "WARNING: Running in STAGING mode - certificate will not be trusted by browsers!"
else
  STAGING_ARG=""
fi

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --keep-until-expiring \
    -d $DOMAIN \
    -d www.$DOMAIN" certbot

echo ""
echo "### SSL certificate setup complete! ###"
echo "Certificates are ready at /etc/letsencrypt/live/$DOMAIN"
echo ""
echo "The Certbot container will automatically renew certificates every 12 hours."
echo "Certificates are valid for 90 days and will be renewed when they have 30 days or less remaining."
