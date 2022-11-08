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
        trace;

// Log access / query to the database

async function traceDbAccess(a, b, c, d, e) {

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

            database = req.body.database || "persistance";
            db = mongo.db(database);
            trace = db.collection("logs");

            collection = req.body.collection || "logs";

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess("Display all docs in collection " + collection, req.ip, req.body, res.status, true);
                let findResult = await db.collection(collection).find({}).toArray();
                res.status(200).json(findResult);
                console.log(`Database : ${database}`);
                console.log(`Client origin : ${req.ip}`);
            } else {
                res.status(401).send(`Origin : ${req.ip}`);
                console.log(req.ip);
            }

        });

        // Return a single document
        app.post("/api/find/:id", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { id: req.body.id };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let findOneResult = await db.collection(collection).findOne(document)
                res.json(findOneResult);
            } else {
                res.status(401).send("unauthorized");
            }

        });

        // Create a new document
        app.post("/api/insert", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = {
                id: req.body.id,
                last_modified: new Date(),
                origin: req.ip,
            };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let insertResult = await db.collection(collection).insertOne(document)
                console.log(`Added a new document with id ${insertResult.insertedId}`);
                res.status(200).send(insertResult);
            } else {
                res.status(401).send("unauthorized");
            }

        });

        // Update existing document
        app.post("/api/update/:id", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { id: req.params.id };
            const updates = {
                $set: {
                id: 1,
                },
            };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let updateResult = await db.collection(collection).updateOne(document, updates);
                res.status(200).json(updateResult);
            } else {
                res.status(401).send("unauthorized");
            }
        });

        app.post("/api/delete/:id", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { id: req.params.id };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                let deleteResult = await db.collection(collection).deleteMany(document);
                res.status(200).send(deleteResult);
                console.log("Document deleted");
            } else {
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