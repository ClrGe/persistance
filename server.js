require('dotenv').config({ path: './.env'});

const express = require('express');
const cors = require('cors');
const dbo = require('./db/conn');

//##############################//

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(require('./routes/route'));

// app.use(function (err, _req, res) {
//     console.error(err.stack);
//     res.status(500).send('Error');
// });

dbo.connectToServer(function (err) {
    if (err) {
        console.error(err);
        process.exit();
    }

    app.listen(PORT, () => {
        console.log(`Server Started at ${PORT}`)
    });
});

