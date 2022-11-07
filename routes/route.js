// TODO : findById ; updateMany ; deleteMany
// TODO : paramètres de requête dataSource / database
require('dotenv').config({ path: './.env'});

const express = require('express');
const app = express.Router();
const bodyParser = require('body-parser');
const dbo = require('../db/conn');


// Return all documents in the collection (find)
app.route("/logs").get(async function (req, res) {
    const db = dbo.getDb();
    const collection = req.params.database || "logs";
    const apiKey = process.env.API_KEY;

    if(req.headers.api_key & req.headers.api_key == apiKey ){
      db.collection(collection)
        .find({}).toArray(function (err, result) {
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

// Return a single document (findOne using id)
app.route("/logs/:id").get(async function (req, res) {
  const db = dbo.getDb();
  const documentQuery = { document_id: req.body.id };
  const collection = req.params.database || "logs";

    if(req.headers.api_key & req.headers.api_key == apiKey ){
        db.collection("logs")
        .findOne(documentQuery, function (err, _result) {
          if (err) {
            res.status(400).send(`Cannot find document with id ${documentQuery.document_id}!`);
          } else {
            res.json(result);
          }
        });
      } else {
        res.status(401).send("unauthorized");
      }

});

// Create a new document (insertOne)
app.route("/logs/create").post(function (req, res) {
    const db = req.body.dataSource || dbo.getDb();
    const collection = req.body.database || "logs";

    const document = {
        id: req.body.id,
        last_modified : new Date(),
        origin : req.headers.origin
    };
    if(req.headers.api_key & req.headers.api_key == apiKey ){
      db
          .collection(collection)
          .insertOne(document, function (err, result) {
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

// Update existing document (updateOne using id)
app.route("/logs/update").post(function (req, res) {
    const db = dbo.getDb();
    const collection = req.body.database || "logs";

    const documentQuery = { _id: req.body.id };
    const updates = {
      $inc: {
        editing: 1
      }
    };
    if(req.headers.api_key & req.headers.api_key == apiKey ){
      db
        .collection(collection)
        .updateOne(documentQuery, updates, function (err, _result) {
          if (err) {
            res.status(400).send(`Error updating document with id ${documentQuery.id}!`);
          } else {
            console.log("Document updated");
          }
        });
    } else {
      res.status(401).send("unauthorized");
    }
  });

// Delete a single document (deleteOne using id)
app.route("/logs/delete/:id").delete((req, res) => {
    const db = dbo.getDb();
    const collection = req.params.database || "logs";

    const documentQuery = { document_id: req.body.id };
    if(req.headers.api_key & req.headers.api_key == apiKey ){
      db
      .collection(collection)
      .deleteOne(documentQuery, function (err, _result) {
        if (err) {
          res.status(400).send(`Error deleting document with id ${documentQuery.document_id}!`);
        } else {
          console.log("Document deleted");
        }
      });
    } else {
      res.status(401).send("unauthorized");
    }
  });

// Delete several documents

module.exports = app;