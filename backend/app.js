const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = require('./src/db/connect');

require('dotenv').config();

const PORT = process.env.PORT;


app.use(cors({
    origin: '*', // Allow all origins (replace with specific URL if needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// importing api routes
const uploadFile = require('./src/api/upload-file');
const signIn = require('./src/api/sign-in');
const patreonToken = require('./src/api/patreon-token');


// using api routes
app.use('/api', uploadFile);
app.use('/api', signIn);
app.use('/api', patreonToken);



app.get('/', (req, res) => {
    res.send('hello world');
});



(async () => {
    await db.connect();
    console.log("logging thread id from app.js file " + db.getConnection().threadId);
    await db.getConnection().end();
})();

app.listen(PORT, () => {
    console.log('server running on port: ' + PORT);
});