const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/connect');

const saltRounds = 10;

router.post('/v1/sign-in', async (req, res) => {
    await db.connect();
    const data = req.body;
    const conn = db.getConnection();

    try {
        const selectSql = `SELECT * FROM users WHERE email = '${data.email}'`;
        const [result] = await conn.query(selectSql);
        const rowData = result[0];

        const match = await bcrypt.compare(data.pass, rowData.password);

        delete rowData.password;
        if(match){
            res.status(200).json(rowData);
        }else{
            res.status(200).json({message: "password didn't match!"});
        }

        await conn.end();
    } catch (err) {
        console.log(err);
        await conn.end();
        res.status(500).json({error: 'failed to sign in'});
        throw err;
    }
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