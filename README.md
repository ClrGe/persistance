*CLG - novembre 2022*

**Service de persistance qui présente une API HTTP authentifiée sur une base de données.**

## Pile logicielle

- NodeJS 16.18LTS
- ExpressJS
- MongoDB 6.0.2

## Installation

- Cloner ce dépôt
- Installer les dépendances ('npm install')
- Renommer *.env.sample* en *.env* et compléter selon votre environnement
## Requêtes et fonctionnalités

L'API  expose les méthodes :
- requêtes GET: find, findOne, findById
- requêtes POST: insertOne, insertMany, updateOne, updateMany
- requêtes DELETE: deleteOne, deleteMany

Paramètres de requête :
- la requête elle-même en structure JSON;
- un champ 'dataSource' qui, dans l'implémentation MongoDB, correspond à une base de données;
- un champ 'database' qui, dans l'implémentation MongoDB, correspond à une collection.
Si 'dataSource' est manquant, renvoi sur une base de données par défaut.

## Authentification

Authentification des requêtes avec JWT via un service distinct.

## Routage et traçabilité

Le routage des API est fait par nginx

Tous les accès sont tracés dans une collection *log* en base de données. Sont enregistrés : la date/heure, l'adresse IP source (passée par nginx), l'ID d'utilisateur et la requête (paramètres de GET ou body).

Avant tout accès à la base de données, une fonction d'autorisation à laquelle on passe tous les paramètres de la requête renvoie un booléen. La première version de cette fonction ne fait rien et répond systématiquement 'true'.
 Si cette fonction répond 'false' la requête sur la base de données n'est pas exécutée et on renvoie un code 403. Cette fonction concerne uniquement les droits des clients authentifiés; la requête d'un client non authentifié aura été bloquée avant d'y arriver.

## A intégrer plus tard

Gestion des droits et autres règles de filtrage.
Tests des requêtes avec un programme en Go avec paramètres en ligne de commande.