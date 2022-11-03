const express = require('express');

const app = express.Router();

// GET (READ)
app.route("/logs").get(async function (req, res) {
    const db = dbo.getDb();

    db.collection('logs')
      .find({}).limit(50)
      .toarray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching logs");
            } else {
                res.json(result);
            }
      });
});

// POST (CREATE)

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

// POST (UPDATE)

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
          res.status(400).send(`Error updating likes on listing with id ${listingQuery.id}!`);
        } else {
          console.log("1 document updated");
        }
      });
  });

// DELETE

app.route("/logs/delete/:id").delete((req, res) => {
    const db = dbo.getDb();
    const listingQuery = { listing_id: req.body.id };
  
    db
      .collection("logs")
      .deleteOne(listingQuery, function (err, _result) {
        if (err) {
          res.status(400).send(`Error deleting listing with id ${listingQuery.listing_id}!`);
        } else {
          console.log("1 document deleted");
        }
      });
  });