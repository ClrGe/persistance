// CLG - 24/11/2022

const express = require("express");
const router = express.Router();

const   express             = require("express"),
        { MongoClient }     = require("mongodb"),
        traceDbAccess       = require("./middleware/logging.js"),
        swaggerUi           = require("swagger-ui-express"),
        swaggerJsdoc        = require("swagger-jsdoc"),
        swaggerSpec         = require("./swagger.json"),
        dataParams          = {useNewUrlParser: true, useUnifiedTopology: true},
        dataSource          = process.env.DB_URI    || "mongodb://localhost:27017",
        apiKey              = process.env.API_KEY   || "123",
        PORT                = process.env.PORT      || 8000;

let     database,
        collection,
        db,
        trace,
        comment,
        document;

router.post("/api/find/all", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            db              = mongo.db(database);
            req.log.comment = comment;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findResult = await db.collection(collection).find({}).toArray();
                res.status(200).json(findResult);
                comment = `Display all documents of collection ${collection} in database ${database}`;
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);
        });

        // Return a single document (first match)
        router.post("/api/find", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            db              = mongo.db(database);
            req.log.comment = comment;
            queryFilter     = req.body.filter;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findOneResult = await db.collection(collection).findOne(queryFilter)
                res.json(findOneResult);
                comment = `Display document matching filter ${queryFilter} in collection ${collection} of database ${database}`;
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });

        // Return a document by id
        router.post("/api/find/:id", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "persistance";
            document        = { id: req.params.id };
            db              = mongo.db(database);
            req.log.comment = comment;
            //filter        = req.body.filter.id;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findIdResult = await db.collection(collection).find({}).toArray();
                res.json(findIdResult);
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });

        // Create a new document
        router.post("/api/insert", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            document        = req.body;
            req.log.comment = comment;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let insertResult = await db.collection(collection).insertOne(document)
                if(insertResult.acknowledged) {
                    comment = `Added a new document with id ${insertResult.insertedId} in database ${database}, collection ${collection}`;
                } else {
                    comment = `Error : could not insert document in database ${database}, collection ${collection}`;
                }
                res.status(200).send(insertResult);
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            req.log.deletedCount
            trace.insertOne(req.log);

        });

        // Update existing document by id
        router.post("/api/update/:id", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            document        = { id: req.params.id };
            req.log.comment = comment;
            updates         = {$set: { last_modified: new Date(), data: req.body.data},};
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let updateResult = await db.collection(collection).updateOne(document, updates);
                res.status(200).json(updateResult);
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });


        // Update * documents matching the query
        router.post("/api/update", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            filter          = req.body.filter;
            req.log.comment = comment;
            updates         = {$set: { last_modified: new Date(), data: req.body.data},};
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let updateResult = await db.collection(collection).updateMany(filter, updates);
                res.status(200).json(updateResult);
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });

        // Delete * documents matching the query
        router.post("/api/delete", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            filter          = req.body.filter;
            req.log.comment = comment;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let deleteResult = await db.collection(collection).deleteMany(filter);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    comment = `${deleteResult.deletedCount} document(s) deleted in database ${database}, collection ${collection}`;
                } else {
                    comment = `No document matching filter ${filter}. Nothing was deleted in database ${database}, collection ${collection}`;
                }
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });

        // Delete document by id

        router.post("/api/delete/:id", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            document        = { "id": req.params.id };
            req.log.comment = comment;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let deleteResult = await db.collection(collection).deleteOne(document);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    comment = `Document with id ${req.params.id} was deleted in database ${database}, collection  ${collection}`;
                } else {
                    comment = `No document with id ${req.params.id}. No deletion in database ${database}, collection : ${collection}`;
                }
            } else {
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);
            }

            trace.insertOne(req.log);

        });

module.exports = router;