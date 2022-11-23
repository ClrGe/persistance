module.exports = async function traceDbAccess(req, res, next) {
    let trace; 
    let log = {
        date    : new Date(),
        origin  : req.ip,
        req     : req.method + " " + req.url,
        status  : req.statusCode,
    }

    await trace.insertOne(log);

    next();
}