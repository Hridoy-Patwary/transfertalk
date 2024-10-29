const express = require('express');
const app = express();
const db = require('./src/db/connect');

require('dotenv').config();


const PORT = process.env.PORT;

(async () => {
    await db.connect();
    console.log("logging thread id from app.js file " + db.getConnection().threadId);
})();



app.get('/v/1', (req, res) => {
    res.send('hello world');
});


app.listen(PORT, () => {
    console.log('server running on port: ' + PORT);
});