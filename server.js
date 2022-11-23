// CLG - 08/11/2022
// TODO : async traceDbAccess
// TODO : add missing operations
// TODO : accept other db paradigm

require("dotenv").config({ path: "./.env" });

const   express             = require("express"),
        { MongoClient }     = require("mongodb"),
        fs                  = require("fs"),
        traceDbAccess       = require("./middleware/logging.js"),
        dataParams          = {useNewUrlParser: true, useUnifiedTopology: true},
        traceDir            = process.env.TRACE_DIR || "~/",
        dataSource          = process.env.DB_URI    || "mongodb://localhost:27017",
        apiKey              = process.env.API_KEY   || "123",
        PORT                = process.env.PORT      || 8000;

let     database,
        collection,
        db,
        trace,
        document;

// Server and DB ops
const app = express();

async function connectToServer() {

    const mongo = new MongoClient(dataSource, dataParams);

    try {

        await mongo.connect();

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.set("trust proxy", true);
        app.use(traceDbAccess);

        // Return all documents in the collection
        app.post("/api/find/all", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findResult = await db.collection(collection).find({}).toArray();
                res.status(200).json(findResult);
                req.log.comment = `Display all documents of collection ${collection} in database ${database}`;
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);
        });

        // Return a single document (first match)
        app.post("/api/find", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            db          = mongo.db(database);
            queryFilter = req.body.filter;
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findOneResult = await db.collection(collection).findOne(queryFilter)
                res.json(findOneResult);
                req.log.comment = `Display document matching filter ${queryFilter} in collection ${collection} of database ${database}`;
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });

        // Return a document by id
        app.post("/api/find/:id", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "persistance";
            document    = { id: req.params.id };
            db          = mongo.db(database);
            //filter      = req.body.filter.id;
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findIdResult = await db.collection(collection).find({}).toArray();
                res.json(findIdResult);
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });

        // Create a new document
        app.post("/api/insert", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            document    = req.body;
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let insertResult = await db.collection(collection).insertOne(document)
                if(insertResult.acknowledged) {
                    req.log.comment = `Added a new document with id ${insertResult.insertedId} in database ${database}, collection ${collection}`;
                } else {
                    req.log.comment = `Error : could not insert document in database ${database}, collection ${collection}`;
                }
                res.status(200).send(insertResult);
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            req.log.deletedCount
            trace.insertOne(req.log);

        });

        // Update existing document by id
        app.post("/api/update/:id", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            document    = { id: req.params.id };
            updates     = {$set: { last_modified: new Date(), data: req.body.data},};
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let updateResult = await db.collection(collection).updateOne(document, updates);
                res.status(200).json(updateResult);
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });


        // Update * documents matching the query
        app.post("/api/update", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            filter      = req.body.filter;
            updates     = {$set: { last_modified: new Date(), data: req.body.data},};
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let updateResult = await db.collection(collection).updateMany(filter, updates);
                res.status(200).json(updateResult);
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });

        // Delete * documents matching the query
        app.post("/api/delete", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            filter      = req.body.filter;
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let deleteResult = await db.collection(collection).deleteMany(filter);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    req.log.comment = `${deleteResult.deletedCount} document(s) deleted in database ${database}, collection ${collection}`;
                } else {
                    req.log.comment = `No document matching filter ${filter}. Nothing was deleted in database ${database}, collection ${collection}`;
                }
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });

        // Delete document by id

        app.post("/api/delete/:id", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            document    = { "id": req.params.id };
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let deleteResult = await db.collection(collection).deleteOne(document);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    req.log.comment = `Document with id ${req.params.id} was deleted in database ${database}, collection  ${collection}`;
                } else {
                    req.log.comment = `No document with id ${req.params.id}. No deletion in database ${database}, collection : ${collection}`;
                }
            } else {
                req.log.comment = `Unauthorized: missing API key`;
                res.status(401).send(req.log.comment);
            }

            trace.insertOne(req.log);

        });

    } catch (err) {
        console.error(err);
    }

    app.listen(PORT, () => {
        console.log(`===================== \nServer listening on port ${PORT} \n=====================`);
        console.log(`Now connected to MongoDB instance \n===================== `);
    });

}

connectToServer().catch(console.error);

module.exports = app;