const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = require('./src/db/connect');

require('dotenv').config();

const PORT = 4050;


app.use(cors({
    origin: '*', // Allow all origins (replace with specific URL if needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// importing api routes
const uploadFile = require('./src/api/upload-file');
const signIn = require('./src/api/sign-in');
const patreonToken = require('./src/api/patreon-token');

const userRoute = require('./src/api/user');

// using api routes
app.use('/api', uploadFile);
app.use('/api', signIn);
app.use('/api', patreonToken);

app.use('/api', userRoute);


app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(PORT, () => {
    console.log('server running on port: ' + PORT);
});