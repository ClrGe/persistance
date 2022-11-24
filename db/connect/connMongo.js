require("dotenv").config({ path: "./.env" });

const { MongoClient }       = require("mongodb"),
        dataSource    = process.env.DB_URI    || "mongodb://localhost:27017",
        dataParams          = {useNewUrlParser: true, useUnifiedTopology: true},
        mongo              = new MongoClient(dataSource, dataParams);

let dbConnection;

module.exports = async function connectToServer() {

    const mongo = new MongoClient(dataSource, dataParams);

    try {

        await mongo.connect();
        dbConnection = db.db("persistance");







    } catch (err) {
        console.error(err);
    }


}
;


connectToServer: function (callback) {
    mongo.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db("sample_airbnb");
      console.log("Successfully connected to MongoDB.");

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },