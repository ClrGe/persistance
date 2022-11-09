*CLG - november 2022*

**Microservice serving an authenticated REST API to access a database**
---
**Architecture reference : MongoDB Data Api (for Atlas)**
## Stack

- NodeJS 16.18LTS
- ExpressJS
- Any database (currently developing with MongoDB 6 but it will be extended to any paradigm)

## Run

- Clone the repository
- Install dependencies ('npm install')
- Rename *.env.sample* to *.env* and complete it according to your environment
## Requests, methods, endpoints

The API  exposes the following methods :
- GET   : find, findOne, findById
- POST  : insertOne, insertMany, updateOne, updateMany
- DELETE: deleteOne, deleteMany

Parameters :
- JSON request structure;
- 'dataSource' field;
- 'database' field;

If dataSource and database are not specified, redirect to default source and db.
## Authentication

Database access is only possible if the client provides a valid api key.
## Routing and logs

API routing is configured through Nginx. Any unidentified request is blocked.

Every action, access and query are logged to the database (date, origin, user,request parameters and / or body).

An authorization function is called before any database access. It receives every request parameters and returns a boolean.
If false, the request isn't executed and a 403 status code is sent.

## To do

Roles / Privileges and filtering
Tests requests with a CLI program in Golang