const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-_-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/v1/upload', upload.array('files'), (req, res) => {
    uploadHandler(req, res, (err) => {
        if(err instanceof multer.MulterError){
            return res.status(500).json({error: err.message});
        }else if(err){
            return res.status(500).json({error: 'Upload failed'});
        }
    });
    res.json({ message: 'Files uploaded successfully' })
})

module.exports = router