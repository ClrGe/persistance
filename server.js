// CLG - 08/11/2022

require("dotenv").config({ path: "./.env" });

const   express             = require("express"),
        { MongoClient }     = require("mongodb"),
        cors                = require("cors"),
        httpErrors          = require("http-errors"),
        logger              = require('morgan'),
        dataParams          = {useNewUrlParser: true, useUnifiedTopology: true},
        dataSource          = process.env.DB_URI    || "mongodb://localhost:27017",
        apiKey              = process.env.API_KEY   || "123",
        PORT                = process.env.PORT      || 8000;

let     database,
        collection,
        db,
        document,
        trace;

// Log access / query to the database

  function traceDbAccess(a, b, c, d, e) {

    let log = {
        date    : new Date(),
        comment : a,
        origin  : b,
        req     : c,
        status  : d,
        auth    : e
    }

    await trace.insertOne(log);
}

// Server and DB ops

const app = express();

async function connectToServer() {

    const mongo = new MongoClient(dataSource, dataParams);

    try {

        await mongo.connect();

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.set("trust proxy", true);

        // Return all documents in the collection
        app.post("/api/find", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Display all docs in database ${database}, collection ${collection}`, req.ip, req.body, res.status, true);
                let findResult = await db.collection(collection).find({}).toArray();
                res.status(200).json(findResult);
                console.log(`Database : ${database}`);
                console.log(`Client origin : ${req.ip}`);
            } else {
                traceDbAccess(`Unauthorized call to /api/insert and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send(`Origin : ${req.ip}`);
                console.log(req.ip);
            }

        });

        // Return a single document (first match)
        app.post("/api/find/:id", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "persistance";
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Displayed first matching doc in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let findOneResult = await db.collection(collection).findOne()
                res.json(findOneResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/find, database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("unauthorized");
            }

        });

        // Return a document by id
        app.post("/api/find/:id", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "persistance";
            document    = { id: req.body.id };
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Displayed doc with id ${req.body.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let findOneResult = await db.collection(collection).findOne(document)
                res.json(findOneResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/find, database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("unauthorized");
            }

        });

        // Create a new document
        app.post("/api/insert", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "persistance";
            document    = req.body;
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Created doc in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let insertResult = await db.collection(collection).insertOne(document)
                console.log(`Added a new document with id ${insertResult.insertedId}`);
                res.status(200).send(insertResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/insert database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("unauthorized");
            }

        });

        // Update existing document
        app.post("/api/update/:id", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "persistance";
            document    = { id: req.params.id };
            updates     = {$set: { last_modified: new Date(), data: req.body.data},};
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Updated doc with id ${req.params.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let updateResult = await db.collection(collection).updateOne(document, updates);
                res.status(200).json(updateResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/update database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("unauthorized");
            }
        });

        app.post("/api/delete/:id", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "persistance";
            document    = { id: req.params.id };
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Deleted doc with id ${req.params.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let deleteResult = await db.collection(collection).deleteMany(document);
                res.status(200).send(deleteResult);
                console.log("Document deleted");
            } else {
                traceDbAccess(`Unauthorized call to /api/delete database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("unauthorized");
            }

        });

    } catch (err) {
        console.error(err);
    }

    app.listen(PORT, () => {
        console.log(`Server Started at ${PORT}`);
    });

}

connectToServer().catch(console.error);

module.exports = app;