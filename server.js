require("dotenv").config({ path: "./.env" });

const   { MongoClient }     = require("mongodb"),
        connectionString    = process.env.DB_URI,
        params              = { useNewUrlParser: true, useUnifiedTopology: true },
        PORT                = process.env.PORT || 8000,
        express             = require("express"),
        app                 = express(),
        apiKey              = process.env.API_KEY;


async function connectToServer() {

    const mongo = new MongoClient(connectionString, params);

    try {

        await mongo.connect();
        db = mongo.db("logs");

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.set("trust proxy", true);

        // Return all documents in the collection
        app.post("/api/find", async (req, res) => {

            const collection = req.body.collection || "logs";

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                await db.collection(collection).find({}).toArray(function (err, result) {
                    if (err) {
                        res.status(400).send("error fetching logs");
                    } else {
                        res.json(result);
                        console.log(`Origin : ${req.ip}`);
                    }
                });
            } else {
                res.status(401).send(`Origin : ${req.ip}`);
                console.log(req.ip);
            }

        });

        // Return a single document
        app.post("/api/find/:id", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { _id: req.body.id };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                await db.collection(collection).findOne(document, function (err, _result) {
                    if (err) {
                    res.status(400).send(`Cannot find document with id ${document._id}!`);
                    } else {
                    res.json(result);
                    }
                });
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
                await db.collection(collection).insertOne(document, function (err, result) {
                    if (err) {
                        res.status(400).send("Error inserting document!");
                    } else {
                        console.log(`Added a new document with id ${result.insertedId}`);
                        res.status(204).send(result);
                    }
                });
            } else {
                res.status(401).send("unauthorized");
            }

        });

        // Update existing document
        app.post("/api/update", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { id: req.body.id };
            const updates = {
                $inc: {
                editing: 1,
                },
            };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                await db.collection(collection).updateOne(document, updates, function (err, _result) {
                    if (err) {
                        res.status(400).send(`Error updating document with id ${document.id}!`);
                    } else {
                        console.log("Document updated");
                    }
                });
            } else {
                res.status(401).send("unauthorized");
            }
        });

        app.post("/api/delete/:id", async (req, res) => {

            const collection = req.body.collection || "logs";
            const document = { _id: req.query.id };

            if (req.headers.api_key & (req.headers.api_key == apiKey)) {
                await db.collection(collection).deleteOne(document, function (err, _result) {
                    if (err) {
                        res.status(400).send(`Error deleting document with id ${document._id}!`);
                    } else {
                        res.status(200);
                        console.log("Document deleted");
                    }
                });
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