const db = require('../config/database');
const { extractTextFromBuffer, parseDocumentText } = require('../utils/documentParser');

exports.getAllDocuments = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

/**
 * Analyzes an uploaded employment document buffer
 */
exports.analyzeDocument = async ({ buffer, originalname, mimetype }) => {
    const rawText = await extractTextFromBuffer(buffer, originalname, mimetype);
    const parsedData = parseDocumentText(rawText);

    return {
        success: true,
        data: parsedData
    };
};
