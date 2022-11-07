require('dotenv').config({ path: './.env'});

const { MongoClient } = require('mongodb');
const connectionString = process.env.DB_URI;
const params = { useNewUrlParser: true, useUnifiedTopology: true,};

const express = require('express');

//##############################//

const PORT = process.env.PORT || 8000;
const app = express();

async function connectToServer()  {
    const mongo = new MongoClient(connectionString, params);
    try {
        await mongo.connect();
        await mongo.db("admin").command({ ping: 1 });
        db  = mongo.db("logs");
        //log = db.collection(journal);


        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

//----- REQUÊTES -----------------------------------------------------



        // requete générique (liste)
        // app.get('/api2/infra/requete', async (req, res) =>  {
        //     var R = req.body;
        //     if (req.query.collection) { R.collection = req.query.collection} ;
        //     var collection      = R.collection;
        //     var filtre          = R.filtre ? fieldsCond(R.filtre) : {};
        //     var projection;
        //     if (R.projection) {
        //         projection      = fieldsProj(R.projection);
        //         projection._id  = false;
        //     } else {
        //         projection = {};
        //     }
        //     trace("Requête sur collection " + collection, R, true);
        //     let r = await db.collection(collection)
        //                     .find(filtre)
        //                     .project(projection)
        //                     .toArray();
        //     res.json(r);
        // });

        app.get('/logs', async (req, res) =>  {
            const collection = req.params.database || "logs";
            const apiKey = process.env.API_KEY;
        
            if(req.headers.api_key & req.headers.api_key == apiKey ){
              db.collection(collection).find({}).toArray(function (err, result) {
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

        

        //----- FIN DES REQUÊTES ---------------------------------------------

        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            next(createError(404));
        });

        // error handler
        app.use(function(err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    } catch(err) {
        console.error(err);
    }
    app.listen(PORT, () => {
        console.log(`Server Started at ${PORT}`)
    });
};

//============================================================================

connectToServer().catch(console.error);

module.exports = app;