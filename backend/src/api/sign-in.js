const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/connect');

const saltRounds = 10;

router.post('/v1/sign-in', (req, res) => {
    console.log(req.body)
    res.status(200).json('successfull');
});

router.post('/v1/sign-up', async (req, res) => {
    const userData = req.body;
    const password = await bcrypt.hash(userData.password, saltRounds);
    const modified = {
        modified: new Date().getTime()
    }

    try {
        await db.connect();
        const conn = db.getConnection();
        const updateSql = `UPDATE users SET username = '${userData.username}', email = '${userData.email}', password = '${password}', metadata = '${JSON.stringify(modified)}' WHERE id = '${userData.uid}'`;
        const getData = `SELECT * FROM users WHERE id = '${userData.uid}'`;

        await conn.query(updateSql);
        const [result] = await conn.query(getData);
        
        delete result[0].password;
        await conn.end();
        res.status(200).json(result[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'failed to update user data'});
        throw err;
    }
})

module.exports = router