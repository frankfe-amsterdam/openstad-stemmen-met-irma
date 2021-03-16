const express = require('express');

var router = express.Router();

router.get('/', (req, res) => {
    var db = req.db;
    var stmt = db.prepare('select * from elections WHERE name = ?');

    try {
        row = stmt.get('Best of Amsterdam Light Festival');
        return res.status(200).json(row);
    } catch (err) {
        console.log(`Couldn't get election : ${err}`);
        return res.status(400).json({ error: err.message });
    }
});

module.exports = router;
