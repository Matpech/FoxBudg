# FoxBudg
Application web de gestion de notes de frais, développée par Matpech

## Installation
L'application peut être déployée en mode "Standalone" (tous les services sur la même machine) en quelques étapes grâce à Docker.

1. Télécharger le code source de l'application via la commande `git clone https://github.com/Matpech/FoxBudg.git` ou en téléchargeant le dépôt dans une archive ZIP (bouton vert "Code", puis "Download ZIP" sur la page Github du projet).
2. Renommer `.env.example` en `.env` et paramétrer les variables d'environnement de l'application. Cette étape n'est pas indispensable, mais est recommandée pour un déploiement en production sécurisé.
3. Installer Docker Compose en suivant les instructions officielles (si vous n'avez pas encore installé Docker). Vous pouvez installer Docker Desktop si vous souhaitez lancer le projet sur une machine de développement au lieu d'un serveur.
4. Dans le répertoire du projet, exécuter la commande `docker compose up -d` pour démarrer l'application.

## Configuration
Cette section explique les variables d'environnement configurables : à quoi elles servent, lesquelles peuvent être modifiées et les recommandations.

### Base de données
- `POSTGRES_HOST`: ne pas changer (sauf si vous savez ce que vous faites).
- `POSTGRES_USER`: nom d'utilisateur du compte dans la base de données, utilisé par l'application pour s'y connecter.
- `POSTGRES_PASSWORD`: mot de passe utilisé pour accéder à la base de données depuis l'API. **Il est fortement recommandé de le modifier avant de démarrer le projet pour la première fois**.
- `POSTGRES_DB`: nom de la base de données stockant les données de l'application.

### Authentification
- `JWT_SECRET`: le secret JWT utilisé pour signer les tokens d'authentification à l'API. **Il est fortement recommandé de le modifier**, car ce secret permettrait à un attaquant de falsifier un JWT et de s'identifier comme n'importe quel utilisateur de l'application.
- `JWT_LIFESPAN`: durée de vie d'un token JWT. Si cette variable n'est pas définie, une durée de vie de 10 minutes est utilisée. Une fois cette durée de vie dépassée, le client devra régénérer le JWT en utilisant son identifiant de session.

Vous pouvez utiliser une de ces deux commandes pour générer un secret JWT solide et aléatoire :
- `openssl rand -hex 32` (si vous êtes sous Linux)
- `node --eval
"console.log(require(‘crypto’).randomBytes(32).toHex()` (avec NodeJS)

## Déploiement en production
Ces instructions permettent de déployer l'application sur un environnement de développement. Si vous souhaitez la déployer sur un serveur (dans un environnement de production), voici quelques recommandations :

- Utiliser la commande `docker compose -f docker-compose.prod.yaml up -d` est préférable par rapport à la commande classique : elle déploie un build statique de la partie frontend dans un conteneur Nginx au lieu d'un serveur de développement et active l'option Secure pour les cookies d'authentification. À noter que les cookies Secure ne fonctionnent qu'en HTTPS.
- La mise en place d'HTTPS est fortement recommandé, surtout si le serveur utilisé pour l'hébergement est sur internet au lieu d'un réseau interne. Cela peut être mis en place si l'application est déployée derrière un reverse proxy (Nginx avec Certbot, Cloudflare Tunnel) agissant comme point de terminaison HTTPS.
- La configuration Nginx par défaut (présente dans le répertoire `Nginx/`) n'inclut aucun rate limiting. Il est recommandé de modifier la configuration pour limiter le nombre de requêtes sur un déploiement en production, notamment pour éviter les attaques par bruteforce, etc.