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
        const uid = req.body.uid;

        if (!uid) {
            return cb(new Error('UID is required'), false);
        }

        // Create a directory for the user if it doesn't exist
        const userDir = path.join(uploadDir, uid);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Set the destination to the user's specific folder
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-_-' + file.originalname.replaceAll(' ', '-'));
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// POST route to handle file uploads
router.post('/v1/upload', upload.array('files'), (req, res) => {
    const uid = req.body.uid;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    // Construct file URLs for the uploaded files
    const fileUrls = req.files.map(file => {
        return `${req.protocol}://${req.get('host')}/uploads/${uid}/${file.filename}`;
    });

    // If files were uploaded successfully, send a response
    res.json({ message: 'Files uploaded successfully', files: fileUrls });
});


module.exports = router