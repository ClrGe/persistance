require("dotenv").config({ path: "./.env" });

const   { MongoClient }     = require("mongodb"),
        connectionString    = process.env.DB_URI,
        params              = { useNewUrlParser: true, useUnifiedTopology: true },
        PORT                = process.env.PORT || 8000,
        express             = require("express"),
        app                 = express();


async function connectToServer() {
  const mongo = new MongoClient(connectionString, params);
  try {
    await mongo.connect();
    await mongo.db("admin").command({ ping: 1 });
    db = mongo.db("logs");
    //log = db.collection(journal);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Return all documents in the collection
    app.get("/logs", async (req, res) => {
      const collection = req.params.collection || "logs";
      const apiKey = process.env.API_KEY;

      if (req.headers.api_key & (req.headers.api_key == apiKey)) {
        db.collection(collection)
          .find({})
          .toArray(function (err, result) {
            if (err) {
              res.status(400).send("error fetching logs");
            } else {
              res.json(result);
            }
          });
      } else {
        res.status(401).send("unauthorized");
      }
    });

    // Return a single document
    app.get("/logs/:id", async (req, res) => {
      const collection = req.params.collection || "logs";
      const apiKey = process.env.API_KEY;
      const documentQuery = { document_id: req.body.id };

      if (req.headers.api_key & (req.headers.api_key == apiKey)) {
        db.collection(collection).findOne(
          documentQuery,
          function (err, _result) {
            if (err) {
              res
                .status(400)
                .send(
                  `Cannot find document with id ${documentQuery.document_id}!`
                );
            } else {
              res.json(result);
            }
          }
        );
      } else {
        res.status(401).send("unauthorized");
      }
    });

    // Create a new document
    app.post("/logs/create", async (req, res) => {
      const collection = req.params.collection || "logs";
      const apiKey = process.env.API_KEY;
      const documentQuery = { document_id: req.body.id };

      const document = {
        id: req.body.id,
        last_modified: new Date(),
        origin: req.headers.origin,
      };
      if (req.headers.api_key & (req.headers.api_key == apiKey)) {
        db.collection(collection).insertOne(document, function (err, result) {
          if (err) {
            res.status(400).send("Error inserting document!");
          } else {
            console.log(`Added a new document with id ${result.insertedId}`);
            res.status(204).send();
          }
        });
      } else {
        res.status(401).send("unauthorized");
      }
    });
    // Update existing document
    app.post("/logs/update", async (req, res) => {
      const collection = req.params.collection || "logs";
      const apiKey = process.env.API_KEY;
      const documentQuery = { document_id: req.body.id };

      const updates = {
        $inc: {
          editing: 1,
        },
      };
      if (req.headers.api_key & (req.headers.api_key == apiKey)) {
        db.collection(collection).updateOne(
          documentQuery,
          updates,
          function (err, _result) {
            if (err) {
              res
                .status(400)
                .send(`Error updating document with id ${documentQuery.id}!`);
            } else {
              console.log("Document updated");
            }
          }
        );
      } else {
        res.status(401).send("unauthorized");
      }
    });
    
    app.delete("/logs/delete/:id", async (req, res) => {
      const collection = req.params.collection || "logs";
      const apiKey = process.env.API_KEY;
      const documentQuery = { document_id: req.body.id };

      if (req.headers.api_key & (req.headers.api_key == apiKey)) {
        db.collection(collection).deleteOne(
          documentQuery,
          function (err, _result) {
            if (err) {
              res
                .status(400)
                .send(
                  `Error deleting document with id ${documentQuery.document_id}!`
                );
            } else {
              console.log("Document deleted");
            }
          }
        );
      } else {
        res.status(401).send("unauthorized");
      }
    });
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render("error");
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