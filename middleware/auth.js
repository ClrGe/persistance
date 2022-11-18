


if (req.headers.api_key & (req.headers.api_key == apiKey)) {
    traceDbAccess(`Display all docs in database ${database}, collection ${collection}`, req.ip, req.body, res.status, true);
    let findResult = await db.collection(collection).find({}).toArray();
    res.status(200).json(findResult);
    console.log(`Display all documents \n Database: ${database} \n Collection: ${collection}\n ${new Date}\n=====================`);
} else {
    traceDbAccess(`Unauthorized call to /api/insert and collection ${collection}`, req.ip, req.body, res.status, false);
    res.status(401).send(`Unauthorized: missing API key`);
    console.log(req.ip);
}