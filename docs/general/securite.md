# Sécurité du serveur de production

## Ports ouverts

Le serveur est configuré de sorte que seulement les ports utiles soit ouverts à l'exterieur, les ports utiles etant : 
- le port 80 (protocol HTTP)📡
- le port 443 (protocol HTTPS)🔐 
- le port 22 (protocol SSH )🔧
Cette ouverture de port est faite avec un firewall plus particulierement ufw qui est une smplification des iptables. 
Tous les autres ports refuse l'accès depuis l'exterieur.

## Fail2ban
Le serveur sur le port 22 est prtotégé par un fail2ban permettant de bannir une ip qui tente de se connecter au serveur via le port ssh.

Fail2ban a une configuration simple : 
- 5 essais sur une période de 10 minutes
- Bannissement d'une durée d'une heure

Pour voir les statistique sur le port ssh : 
```bash
    fail2ban-client status sshd
```
Pour voir la configuration faite : 
```bash
    cat /etc/fail2ban/jail.local
```
## Connexion par clé SSH

La connexion au serveur se fait par clé ssh, pour la configurer il faut qu'un ordinateur qui a déjà accès au serveur mette votre clé générée.

### Générer une clé ssh

Si vous n'avez pas encore de clé ssh générée sur votre ordinateur il faut en générée une.

#### Génération de clé ssh sur Windows : 

```bash
ssh-keygen -t ed25519 -C "votre_email@example.com"
```
La clé qui sera générée sera à l'emplacement : 
```bash
C:\Users\VotreUser\.ssh\id_ed25519
```
Une clé ssh fonctionne par paire, le contenu du fichier id_ed25519 ne doit **jamais être divulgué** car il s'agit la clé privée. A l'inverse le fichier id_ed25519.pub contient votre clé publique qui sera à renseigner sur le serveur et peut être divulguée car elle ne fontionnera jamais sans la clé privée.

#### Génération d'une clé ssh sur Linux

```bash
ssh-keygen -t ed25519 -C "votre_email@example.com"
```
La clé qui sera générée sera à l'emplacement : 
```bash
~/.ssh/id_ed25519
```
Une clé ssh fonctionne par paire, le contenu du fichier id_ed25519 ne doit **jamais être divulgué** car il s'agit la clé privée. A l'inverse le fichier id_ed25519.pub contient votre clé publique qui sera à renseigner sur le serveur et peut être divulguée car elle ne fontionnera jamais sans la clé privée.

L'email renseigné avec la clé n'affecte pas la connexion il s'agit simplement d'un commentaire permettant d'identifier à qui appartient la clé.

### Copier la clé ssh sur le serveur

Pour pouvoir copier la clé ssh sur le serveur il faut un ordinateur ayant déjà accès au serveur via ssh.

Il faut ensuite copier la clé publique générée auparavant dans le fichier répértoriant les clé ssh, accessible ici : 
```bash
~/.ssh/authorized_keys
```
### Redemarrer le service ssh
Pour que les modifications faites dans le fichier des clés ssh, il faut redémarrer le service ssh avec cette commande : 
```bash
systemctl restart ssh
```