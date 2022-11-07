const express = require('express');
const app = express.Router();
const dbo = require('../db/conn');

// Return all documents in the collection (find)
app.route("/logs").get(async function (req, res) {
    const db = dbo.getDb();

    db.collection('logs')
      .find({}).toArray(function (err, result) {
        if (err) {
        res.status(400).send("error fetching logs");
        } else {
          res.json(result);
        }
      });
});

// Return a single document (findOne using id)
app.route("/logs/:id").get(async function (req, res) {
  const db = dbo.getDb();
  const documentQuery = { document_id: req.body.id };

      db.collection("logs")
      .findOne(documentQuery, function (err, _result) {
        if (err) {
          res.status(400).send(`Cannot find document with id ${documentQuery.document_id}!`);
        } else {
          res.json(result);
        }
      });

});

// Create a new document (insertOne)
app.route("/logs/create").post(function (req, res) {
    const db = dbo.getDb();
    const document = {
        id: req.body.id,
        last_modified : new Date(),
        origin : req.headers.origin
    };

    db
        .collection('logs')
        .insertOne(document, function (err, result) {
            if (err) {
            res.status(400).send("Error inserting document!");
            } else {
            console.log(`Added a new document with id ${result.insertedId}`);
            res.status(204).send();
            }
        });
});

// Update existing document (updateOne using id)
app.route("/logs/update").post(function (req, res) {
    const db = dbo.getDb();
    const listingQuery = { _id: req.body.id };
    const updates = {
      $inc: {
        likes: 1
      }
    };

    db
      .collection("logs")
      .updateOne(listingQuery, updates, function (err, _result) {
        if (err) {
          res.status(400).send(`Error updating document with id ${listingQuery.id}!`);
        } else {
          console.log("Document updated");
        }
      });
  });

// Delete a single document (deleteOne using id)
app.route("/logs/delete/:id").delete((req, res) => {
    const db = dbo.getDb();
    const documentQuery = { document_id: req.body.id };

    db
      .collection("logs")
      .deleteOne(documentQuery, function (err, _result) {
        if (err) {
          res.status(400).send(`Error deleting document with id ${documentQuery.document_id}!`);
        } else {
          console.log("Document deleted");
        }
      });
  });

  module.exports = app;