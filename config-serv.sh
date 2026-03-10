#!/bin/bash
apt-get update 
apt-get upgrade

set -e

echo "Suppression des anciennes versions éventuelles..."
sudo apt remove -y docker docker-engine docker.io containerd runc || true

echo "Installation des dépendances..."
sudo apt update
sudo apt install -y ca-certificates curl gnupg

echo "Ajout de la clé GPG Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "Ajout du dépôt Docker..."
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installation de Docker..."
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Activation du service..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Ajout de l'utilisateur au groupe docker..."
sudo usermod -aG docker $USER

echo "Installation terminée. Déconnecte-toi/reconnecte-toi pour utiliser Docker sans sudo."


