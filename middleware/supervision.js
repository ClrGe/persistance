module.exports =   async function supervision(req, res, next) {

    let database ;
    let db;

        let serverStatus = await db.admin().serverStatus();
        let message = 'Connected on server ' + serverStatus.host + ' version ' + serverStatus.version;
        res.status(200).json(message);

        console.log('Connected on server ' + serverStatus.host + ' version ' + serverStatus.version);

    next();
}