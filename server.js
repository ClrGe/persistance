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

// Log * access / queries to the database



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
                console.log(`Display all documents \n Database: ${database} \n Collection: ${collection}\n ${new Date}\n=====================`);
            } else {
                res.status(401).send(`Unauthorized: missing API key`);
                console.log(req.ip);
            }
            trace.insertOne(req.log);
        });

        // Return a single document (first match)
        app.post("/api/find", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            db          = mongo.db(database);
            queryFilter      = req.body.filter;
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Displayed first matching doc database: ${database} collection: ${collection}\n=====================`, req.ip, req.body, res.status, true);
                let findOneResult = await db.collection(collection).findOne(queryFilter)
                res.json(findOneResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/find database: ${database} collection: ${collection}\n=====================`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }

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
                traceDbAccess(`Displayed doc with id ${req.body.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let findIdResult = await db.collection(collection).find({}).toArray();
                res.json(findIdResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/find, database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }

        });

        // Create a new document

        app.post("/api/insert", async (req, res) => {

            database    = req.body.database     || "persistance";
            collection  = req.body.collection   || "logs";
            document    = req.body;
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Created doc in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let insertResult = await db.collection(collection).insertOne(document)
                if(insertResult.acknowledged) {
                    console.log(`Added a new document with id ${insertResult.insertedId} \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                } else {
                    console.log(`Error : could not insert document \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                }
                res.status(200).send(insertResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/insert database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }

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
                traceDbAccess(`Updated doc with id ${req.params.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let updateResult = await db.collection(collection).updateOne(document, updates);
                res.status(200).json(updateResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/update database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }
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
                traceDbAccess(`Updated all doc(s) matching filter ${filter} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let updateResult = await db.collection(collection).updateMany(filter, updates);
                res.status(200).json(updateResult);
            } else {
                traceDbAccess(`Unauthorized call to /api/update database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }
        });

        // Delete * documents matching the query

        app.post("/api/delete", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            filter      = req.body.filter;
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Deleted all doc matching filter ${filter} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let deleteResult = await db.collection(collection).deleteMany(filter);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    console.log(`${deleteResult.deletedCount} document(s) deleted \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                } else {
                    console.log(`No document matching query. Nothing was deleted \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                }
            } else {
                traceDbAccess(`Unauthorized call to /api/delete database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }

        });

        // Delete document by id

        app.post("/api/delete/:id", async (req, res) => {

            database    = req.body.database   || "persistance";
            collection  = req.body.collection || "logs";
            document    = { "id": req.params.id };
            db          = mongo.db(database);
            trace       = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                traceDbAccess(`Deleted doc with id ${req.params.id} in database ${database} and collection ${collection}`, req.ip, req.body, res.status, true);
                let deleteResult = await db.collection(collection).deleteOne(document);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    console.log(`Document with id : ${req.params.id} was deleted \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                } else {
                    console.log(`No document matching id ${req.params.id} : no deletion \n Database : ${database} \n Collection : ${collection}\n ${new Date()}\n=====================`);
                }
            } else {
                traceDbAccess(`Unauthorized call to /api/delete database ${database} and collection ${collection}`, req.ip, req.body, res.status, false);
                res.status(401).send("Unauthorized: missing API key");
            }

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