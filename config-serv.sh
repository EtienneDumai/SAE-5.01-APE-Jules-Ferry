#!/bin/bash
apt-get update 
apt-get upgrade

set -e
echo "Ajout cronjob"
apt install cron
export EDITOR=nano
echo "Suppression des anciennes versions éventuelles..."
apt remove -y docker docker-engine docker.io containerd runc || true

echo "Installation des dépendances..."
apt update
apt install -y ca-certificates curl gnupg

echo "Ajout de la clé GPG Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "Ajout du dépôt Docker..."
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installation de Docker..."
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Activation du service..."
systemctl enable docker
systemctl start docker

echo "Ajout de l'utilisateur au groupe docker..."
usermod -aG docker $USER

echo "Ajout de cert-bot"
apt update
apt install snapd
snap install core
snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot
echo "Installation terminée. Déconnecte-toi/reconnecte-toi pour utiliser Docker sans sudo."


