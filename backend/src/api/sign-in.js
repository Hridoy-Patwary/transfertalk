const express = require('express');
const router = express.Router();

router.post('/v1/sign-in', (req, res) => {
    console.log(req.body)
    res.status(200).json('successfull');
});

module.exports = router