const documentService = require('../services/documentService');

exports.getDocuments = async (req, res) => {
    try {
        const docs = await documentService.getAllDocuments();
        res.json({ status: 'success', data: docs });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
