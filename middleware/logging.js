let app = require("../server.js");
module.exports = async function traceDbAccess(req, res, next) {
    let trace; 
    req.log = {
        date    : new Date(),
        origin  : req.ip,
        req     : req.method + " " + req.url,
        status  : req.statusCode
    }

    //await trace.insertOne(log);

    next();
}