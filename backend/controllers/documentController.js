const documentService = require('../services/documentService');

exports.getDocuments = async (req, res) => {
    try {
        const docs = await documentService.getAllDocuments();
        res.json({ status: 'success', data: docs });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.analyzeDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No document file uploaded. Please attach a PDF, DOCX, or TXT file under the "document" field.'
            });
        }

        const { buffer, originalname, mimetype } = req.file;

        const result = await documentService.analyzeDocument({ buffer, originalname, mimetype });
        return res.status(200).json(result);
    } catch (err) {
        if (err.message && err.message.includes('Unsupported file format')) {
            return res.status(400).json({
                success: false,
                error: 'Unsupported file format. Only PDF, DOCX, and TXT files are accepted.'
            });
        }

        return res.status(400).json({
            success: false,
            error: 'Failed to parse document. The file may be corrupted, password protected, or unreadable.'
        });
    }
};
