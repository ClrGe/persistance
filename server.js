/*===============================================================================
----------- Microservice providing a secure access to a data source -------------
----------------------------- V1 - CLG 2022-11-28 -------------------------------
================================================================================*/

import  swaggerUi   from "swagger-ui-express"
import  express     from "express"
import  MongoClient from "mongodb"
import  dotenv      from "dotenv"

const   dataParams          = {useNewUrlParser: true, useUnifiedTopology: true},
        dataSource          = process.env.DB_URI    || "mongodb://localhost:27017",
        apiKey              = process.env.API_KEY,
        PORT                = process.env.PORT      || 8000;

let     database,
        collection,
        db,
        trace,
        comment,
        serverStatus,
        document;

//--------------------------------------------------------------------------------

const app = express();

// Environment variables
dotenv.config({ path: "./.env" });

// OpenAPI 3.0 documentation (SwaggerUI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup("./docs/swagger.json"));


//---------------------------------- FUNCTIONS ------------------------------------

// Defining the 'log' object
async function traceDbAccess(req, res, next) {

    req.log = {
        date        : new Date(),
        authorized  : false,
        origin      : req.ip,
        req         : req.method + " " + req.url,
        status      : res.statusCode,
        server      : req.serverStatus,
        comment     : "",
    }

    next();
}

//---------------------------------- SERVER ------------------------------------

// Connect to data source + requests
async function connectDataSource() {

    const mongo = new MongoClient(dataSource, dataParams);

    try {

        await mongo.connect();
        db  = mongo.db(database);
        trace = db.collection("logs");

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.set("trust proxy", true);
        app.use(traceDbAccess);

        serverStatus = await db.admin().serverStatus();

        //--------------------------- SUPERVISION -----------------------------

        app.get("/api/status", async (req, res) => {

            comment = 'New connection to server ' + serverStatus.host + ' version ' + serverStatus.version;

            console.log(comment);

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                res.status(200).send(comment);

            } else {

                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

        });

        //-------------------------- CRUD OPERATIONS --------------------------

        // Return all documents in the collection
        app.get("/api/find/all", async (req, res) => {

            database        = req.query.database;
            collection      = req.query.collection;
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findResult = await db.collection(collection).find({}).toArray();
                comment = `Display all documents of collection ${collection} in database ${database}`;

                res.status(200).json(findResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            server = serverStatus;
            trace.insertOne(req.log);

        });

        app.post("/api/find/all", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server= serverStatus.host;
            trace           = db.collection("logs");


            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findResult = await db.collection(collection).find({}).toArray();
                comment = `Display all documents of collection ${collection} in database ${database}`;

                res.status(200).json(findResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);
        });

        // Return a single document (first match)
        app.get("/api/find", async (req, res) => {

            database        = req.query.database     || "persistance";
            collection      = req.query.collection   || "logs";
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            queryFilter     = req.body.filter;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findOneResult = await db.collection(collection).findOne(queryFilter);
                comment = `Display document matching filter ${queryFilter} in collection ${collection} of database ${database}`;

                res.json(findOneResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        app.post("/api/find", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            queryFilter     = req.body.filter;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findOneResult = await db.collection(collection).findOne(queryFilter);
                comment = `Display document matching filter ${queryFilter} in collection ${collection} of database ${database}`;

                res.json(findOneResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        // Return a document by id
        app.get("/api/find/:id", async (req, res) => {

            database        = req.query.database     || "persistance";
            collection      = req.query.collection   || "persistance";
            document        = { id: req.query.id };
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findIdResult = await db.collection(collection).find({}).toArray();

                res.json(findIdResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        app.post("/api/find/:id", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "persistance";
            document        = { id: req.params.id };
            db              = mongo.db(database);
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let findIdResult = await db.collection(collection).find({}).toArray();

                res.json(findIdResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        // Insert a new document
        app.post("/api/insert", async (req, res) => {

            database        = req.body.database     || "persistance";
            collection      = req.body.collection   || "logs";
            document        = req.body;
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let insertResult = await db.collection(collection).insertOne(document)

                if(insertResult.acknowledged) {
                    comment = `Added a new document with id ${insertResult.insertedId} in database ${database}, collection ${collection}`;
                } else {
                    comment = `Error : could not insert document in database ${database}, collection ${collection}`;
                }

                res.status(200).send(insertResult);

            } else {

                req.authorized = false;
                req.log.comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            req.log.deletedCount
            trace.insertOne(req.log);

        });

        // Update existing document by id
        app.post("/api/update/:id", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            document        = { id: req.params.id };
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            updates         = {$set: { last_modified: new Date(), data: req.body.data},};
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let updateResult = await db.collection(collection).updateOne(document, updates);

                res.status(200).json(updateResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        // Update * documents matching query
        app.post("/api/update", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            filter          = req.body.filter;
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            updates         = {$set: { last_modified: new Date(), data: req.body.data},};
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let updateResult = await db.collection(collection).updateMany(filter, updates);

                res.status(200).json(updateResult);

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        // Delete * documents matching query
        app.delete("/api/delete", async (req, res) => {

            database        = req.query.database   || "persistance";
            collection      = req.query.collection || "logs";
            filter          = req.query.filter;
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let deleteResult = await db.collection(collection).deleteMany(filter);

                res.status(200).send(deleteResult);

                if(deleteResult.deletedCount >= 1){
                    comment = `${deleteResult.deletedCount} document(s) deleted in database ${database}, collection ${collection}`;
                } else {
                    comment = `No document matching filter ${filter}. Nothing was deleted in database ${database}, collection ${collection}`;
                }

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;

                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        app.post("/api/delete", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            filter          = req.body.filter;
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let deleteResult = await db.collection(collection).deleteMany(filter);
                res.status(200).send(deleteResult);

                if(deleteResult.deletedCount >= 1){
                    comment = `${deleteResult.deletedCount} document(s) deleted in database ${database}, collection ${collection}`;
                } else {
                    comment = `No document matching filter ${filter}. Nothing was deleted in database ${database}, collection ${collection}`;
                }

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        // Delete document by id
        app.delete("/api/delete/:id", async (req, res) => {

            database        = req.query.database   || "persistance";
            collection      = req.query.collection || "logs";
            document        = { "id": req.query.id };
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let deleteResult = await db.collection(collection).deleteOne(document);
                res.status(200).send(deleteResult);

                if(deleteResult.deletedCount >= 1){
                    comment = `Document with id ${req.params.id} was deleted in database ${database}, collection  ${collection}`;
                } else {
                    comment = `No document with id ${req.params.id}. No deletion in database ${database}, collection : ${collection}`;
                }

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

        app.post("/api/delete/:id", async (req, res) => {

            database        = req.body.database   || "persistance";
            collection      = req.body.collection || "logs";
            document        = { "id": req.params.id };
            req.log.comment = comment;
            req.log.server  = serverStatus.host;
            db              = mongo.db(database);
            trace           = db.collection("logs");

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {

                req.authorized = true;
                let deleteResult = await db.collection(collection).deleteOne(document);
                res.status(200).send(deleteResult);
                if(deleteResult.deletedCount >= 1){
                    comment = `Document with id ${req.params.id} was deleted in database ${database}, collection  ${collection}`;
                } else {
                    comment = `No document with id ${req.params.id}. No deletion in database ${database}, collection : ${collection}`;
                }

            } else {

                req.authorized = false;
                comment = `Unauthorized: missing API key`;
                res.status(401).send(comment);

            }

            trace.insertOne(req.log);

        });

    } catch (err) {

        console.error(err);

    }

    // Server setup
    const server = app.listen(PORT, () => {

        console.log(`===================== \nServer listening on port ${PORT} \n=====================`);
        console.log(`Now connected to MongoDB instance \n===================== `);

    });

    //-------------------------- PROCESS MANAGEMENT ---------------------------

    // Process termination
    process.on('SIGINT', function() {

        mongo.close(function () {
          console.log('Mongo disconnected on app termination');
          process.exit(0);
        });

    });

    process.on('SIGTERM', shutDown);
    process.on('SIGINT', shutDown);

    let connections = [];

    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    });

    // Close MongoDB connection
    async  function mongoClose() {

        mongo.close(function() {console.log('Mongo disconnected on app termination');});

    };

    // Kill process
    async function shutDown() {

        console.log("Received kill signal, shutting down gracefully");

        server.close(() => {
            console.log("Closed out remaining connections");
            process.exit(0);
        });

        setTimeout(() => {
            console.error("Could not close connections in time, forcefully shutting down");
            process.exit(1);
        }, 10000);

       connections.forEach((curr) => curr.end());
       setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);

    }

    server.on("connection", (connection) => {

        connections.push(connection);
        connection.on("close", () => (connections = connections.filter((curr) => curr !== connection)));

    });

    // Authenticated endpoint for process termination
    app.get("/api/stop", async (req, res) => {

        if (req.headers.api_key & (req.headers.api_key == apiKey)) {

            res.status(200).json("Stopping persistance service...");
            await mongoClose().then(shutDown());

        } else {

            req.authorized = false;
            comment = `Unauthorized: missing API key`;
            res.status(401).send(comment);

        }

    });
}

connectDataSource().catch(console.error);