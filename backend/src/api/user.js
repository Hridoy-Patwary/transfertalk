const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/connect');



const createUserTable = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
)`;

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};

const getFilesInFolder = (userId, callback) => {
    const folderPath = path.join(__dirname, '../uploads', userId.toString());
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading directory: such no directory");
            callback('');
            return;
        }

        const fileDetails = [];
        let processedCount = 0; // To track how many files have been processed

        files.forEach(file => {
            // Skip hidden files (those starting with a dot)
            if (file.startsWith('.')) {
                processedCount++;
                return; // Skip the rest of the loop for hidden files
            }

            const filePath = path.join(folderPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error("Error getting file stats:", err);
                    return;
                }

                if (stats.isFile()) {
                    const lastModified = formatDate(stats.mtime);

                    fileDetails.push({
                        filename: file,
                        size: stats.size,
                        lastModified: lastModified
                    });
                }

                processedCount++;

                // If all files are processed, call the callback
                if (processedCount === files.length) {
                    callback(fileDetails); // Pass fileDetails to the callback function
                }
            });
        });
    });
};

router.post('/v1/auto-user', async (req, res) => {
    try {
        await db.connect();
        const connection = db.getConnection();
        const username = '';
        const metadata = JSON.stringify({ modified: false });
        const insertUserQuery = `
            INSERT INTO users (username, metadata)
            VALUES (?, ?)
        `;
        
        await connection.query(createUserTable);
        
        const [result] = await connection.query(insertUserQuery, [username, metadata]);
        const newUserId = result.insertId;
        
        connection.end();
        res.json({id: newUserId});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'auto user create error'});
        throw err;
    }
});

router.post('/v1/get-user-data', async (req, res) => {
    const reqData = req.body;
    
    try {
        await db.connect();

        const conn = db.getConnection();
        const getDataQuery = `SELECT * FROM users WHERE id = '${reqData.id}'`;
        const result = await conn.query(getDataQuery);
        const data = result[0][0];

        conn.end();
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'failed to get user data'});
        throw err;
    }
});

router.post('/v1/get-user-files', async (req, res) => {
    const uid = req.body.uid;

    getFilesInFolder(uid, (fileDetails) => {
        res.json(fileDetails);
    });
});

module.exports = router