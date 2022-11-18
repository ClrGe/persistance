*CLG - november 2022*

**Microservice serving an authenticated REST API to access a database**

---

## 📚 Stack

---
## Stack

- NodeJS
- ExpressJS
- Any database (currently developing with MongoDB 6.0.2 but will be extended to any db)

## ⚙ Run

---

- Clone the repository
- cd to the app directory and run 'npm install'
- Rename *.env.sample* to *.env* and complete it according to your environment
- Run 'node server.js'
- If no conf is provided, the app listens to port 8000 and queries the 'logs' collection of the 'persistance' db of a local mongodb instance

## 🔄 Requests, methods, endpoints

---

This section is a temporary memo until the creation of a proper Swagger / OpenAPI documentation

- POST /api/find/all
- POST /api/find/:id
- POST /api/find

- POST /api/insert

- POST /api/update/:id
- POST /api/update

- POST /api/delete
- POST /api/delete/:id

The API  exposes the following methods :
- GET   : find, findOne, findById
- POST  : insertOne, insertMany, updateOne, updateMany
- DELETE: deleteOne, deleteMany

Parameters :
- JSON request structure;
- 'dataSource' field;
- 'database' field;

If dataSource and database are not specified, redirect to default source and db.

## 🔐 Authentication

 ---

Database access is only possible if the client provides a valid api key.


## 📄 Routing and logs

---
API routing is configured through Nginx. Any unidentified request is blocked.

Every action, access and query are logged to the database (date, origin, user,request parameters and / or body).

An authorization function is called before any database access. It receives every request parameters and returns a boolean.
If false, the request isn't executed and a 403 status code is sent.
---
## ⏭ To do next

- Roles / Privileges and filtering
- Tests requests with a CLI program in Golang
- Swagger / OpenAPI documentation
