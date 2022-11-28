// Log * access / queries to the database

module.exports = async function traceDbAccess(req, res, next) {

    req.log = {
        date        : new Date(),
        authorized  : false,
        origin      : req.ip,
        req         : req.method + " " + req.url,
        status      : res.statusCode,
        comment     : "",
    }

    next();
}