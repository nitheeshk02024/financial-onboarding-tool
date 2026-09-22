const db = require('../config/database');

exports.getAllDocuments = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
