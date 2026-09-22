const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.docx', '.txt'];

    if (allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Only PDF, DOCX, and TXT files are accepted.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

function handleUpload(req, res, next) {
    upload.single('document')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size exceeds 5 MB limit. Please upload a smaller document.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message || 'Error uploading document file.'
            });
        }
        next();
    });
}

router.get('/', documentController.getDocuments);
router.post('/analyze', handleUpload, documentController.analyzeDocument);

module.exports = router;
